/**
 * @file Zeus Programming Language
 * @author Stefan Lüdtke <hisoka999@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check
const PREC = {
  call: 15,
  field: 14,
  try: 13,
  unary: 12,
  cast: 11,
  multiplicative: 10,
  additive: 9,
  shift: 8,
  bitand: 7,
  bitxor: 6,
  bitor: 5,
  comparative: 4,
  and: 3,
  or: 2,
  range: 1,
  assign: 0,
  COMMENT: 0,
  closure: -1,
};

module.exports = grammar({
  name: "zeus",
  extras: ($) => [/\s/, $.line_comment, $.block_comment],
  word: ($) => $.identifier,
  conflicts: ($) => [
    [$.primary_expression, $.call_expression],
    //[$.field_access, $.call_expression],
  ],

  rules: {
    source_file: ($) => repeat($._definition),

    use_statement: ($) =>
      seq("use", repeat(seq($.identifier, optional("::"))), ";"),

    struct_definition: ($) =>
      seq(
        "struct",
        field("name", seq($.identifier, optional($.generic))),
        "{",
        repeat($.parameter),
        repeat(choice($.function_definition, $.comment)),
        "}",
      ),

    struct_initialization: ($) =>
      prec.left(
        PREC.field,
        seq($.identifier, optional($.generic), "{", repeat($.field_init), "}"),
      ),
    field_init: ($) =>
      seq(field("name", $.identifier), ":", $._expression, optional(";")),
    _definition: ($) =>
      choice(
        $.function_definition,
        $.extern_function_definition,
        $.comment,
        $.use_statement,
        $.struct_definition,
        // TODO: other kinds of definitions
      ),
    comment: ($) => choice($.line_comment, $.block_comment),

    line_comment: ($) => token(prec(PREC.COMMENT, seq("//", /[^\n]*/))),

    block_comment: ($) => seq("/*", /[a-zA-Z ]+/, "*/"),

    extern_function_definition: ($) =>
      seq(
        "extern",
        "fn",
        field("name", $.identifier),
        $.parameter_list,
        optional(seq(":", field("return_type", $.type))),
        ";",
      ),
    function_definition: ($) =>
      seq(
        "fn",
        field("name", $.identifier),
        optional($.generic),
        $.parameter_list,
        optional(seq(":", field("return_type", $.type))),
        field("func_block", $.block),
      ),

    parameter_list: ($) => seq("(", optional(repeat($.parameter)), ")"),
    parameter: ($) =>
      seq(
        field("name", $.identifier),
        ":",
        field("mut", optional($.mut)),
        field("type", $.type),
        optional(","),
      ),
    mut: ($) => "mut",
    primitive_type: ($) =>
      choice(
        "bool",
        "i32",
        "i64",
        "u64",
        "u32",
        "u8",
        "double",
        "float",
        "void",
      ),
    non_generic_type: ($) =>
      choice($.primitive_type, "string", $.identifier, $.array_type),
    type: ($) =>
      choice(
        prec(3, $.primitive_type),
        prec(3, "string"),
        prec(3, $.identifier),
        prec(3, $.array_type),
        prec(2, $.pointer_type),
        prec(2, $.ref_type),
        prec(1, $.generic_type),
        // TODO: other kinds of types
      ),
    pointer_type: ($) => seq("*", $.type),
    ref_type: ($) => seq("&", $.type),
    generic: ($) => seq("<", $.non_generic_type, ">"),
    generic_type: ($) => seq($.identifier, $.generic),
    array_type: ($) => seq("[", $.type, ";", $.number, "]"),
    block: ($) => seq("{", repeat($._statement), "}"),

    _statement: ($) =>
      choice(
        $.return_statement,
        $.variable_declaration,
        $.variable_assignment,
        $.field_assignment,
        $.array_assignment,
        $.comment,
        $.if_statement,
        $.while_statement,
        $.for_statement,
        $.break,
        $.continue,
        seq($.call_expression, ";"),
        seq($.match_expression, ";"),
        // TODO: other kinds of statements
      ),
    if_statement: ($) =>
      seq(
        "if",
        $._expression,
        field("if_block", $.block),
        field("else_block", optional(seq("else", $.block))),
      ),
    while_statement: ($) => seq("while", $._expression, $.block),
    variable_assignment: ($) =>
      seq(
        field("name", $.identifier),
        field("value", seq("=", $._expression)),
        ";",
      ),
    field_assignment: ($) =>
      seq(
        field("object", $.identifier),
        ".",
        field("name", choice($.identifier, $.array_access)),
        field("value", seq("=", $._expression)),
        ";",
      ),

    match_expression: ($) => seq("match", $._expression, $.match_block),
    match_block: ($) =>
      seq("{", repeat(seq($.match_key, "=>", $._expression, ",")), "}"),
    match_key: ($) =>
      choice($.identifier, $.constant_list, $.number, $.char_literal, $.range),
    constant_list: ($) =>
      prec.left(
        PREC.additive,
        seq($.number, "|", repeat(seq($.number, optional("|")))),
      ),
    for_statement: ($) =>
      seq(
        "for",
        optional("let"),
        $.identifier,
        "in",
        choice($.identifier, $.range),
        $.block,
      ),
    range: ($) =>
      prec.left(
        PREC.range,
        seq($._expression, "..", optional("="), $._expression),
      ),
    break: ($) => seq("break", ";"),
    continue: ($) => seq("continue", ";"),
    array_assignment: ($) =>
      seq(
        field("name", $.primary_expression),
        "[",
        $.primary_expression,
        "]",
        field("value", seq("=", $._expression)),
        ";",
      ),
    array_access: ($) =>
      prec.left(PREC.field, seq($.identifier, "[", $.primary_expression, "]")),
    variable_declaration: ($) =>
      seq(
        "let",
        optional("mut"),
        field("name", $.identifier),
        field("type", seq(":", $.type)),
        optional(field("value", seq("=", $._initializer_expression))),
        ";",
      ),

    return_statement: ($) => seq("return", $._expression, ";"),
    field_access: ($) =>
      prec.left(PREC.field, seq($.identifier, ".", $.primary_expression)),
    typecast: ($) => seq($._expression, "as", $.type),
    primary_expression: ($) =>
      choice(
        $.number,
        $.char_literal,
        $.string_literal,
        $.null,
        $.true,
        $.false,
        $.call_expression,
        $.field_access,
        $.identifier,
        $.match_expression,
        $.typecast,
        $.array_access,
      ),
    _initializer_expression: ($) =>
      choice($.struct_initialization, $._expression),
    _expression: ($) =>
      choice(
        $.binary_expression,
        $.primary_expression,

        // TODO: other kinds of expressions
      ),
    //string_literal: ($) => seq('"', /(.*)/, '"'),
    null: ($) => "null",
    true: ($) => "true",
    false: ($) => "false",
    string_literal: ($) =>
      seq(
        '"',
        repeat(
          choice(
            alias(token.immediate(prec(1, /[^\\"\n]+/)), $.string_content),
            $.escape_sequence,
          ),
        ),
        '"',
      ),
    escape_sequence: (_) =>
      token(
        prec(
          1,
          seq(
            "\\",
            choice(
              /[^xuU]/,
              /\d{2,3}/,
              /x[0-9a-fA-F]{2,}/,
              /u\{[0-9a-fA-F]{1,6}\}/,
            ),
          ),
        ),
      ),
    char_literal: ($) =>
      seq(
        "'",
        choice(
          alias(token.immediate(prec(1, /[^\\'\n]+/)), $.string_content),
          $.escape_sequence,
        ),
        "'",
      ),

    call_expression: ($) =>
      seq(
        field("function", $.identifier),
        prec.dynamic(10, optional($.generic)),
        $.arglist,
      ),
    method_call: ($) =>
      seq(field("object", $.identifier), ".", $.call_expression),
    arglist: ($) => seq("(", commaSep($._expression), ")"),
    binary_expression: ($) => {
      const table = [
        [PREC.and, "&&"],
        [PREC.or, "||"],
        [PREC.bitand, "&"],
        [PREC.bitor, "|"],
        [PREC.bitxor, "^"],
        [PREC.comparative, choice("==", "!=", "<", "<=", ">", ">=")],
        [PREC.shift, choice("<<", ">>")],
        [PREC.additive, choice("+", "-")],
        [PREC.multiplicative, choice("*", "/", "%")],
      ];

      // @ts-ignore
      return choice(
        ...table.map(([precedence, operator]) =>
          prec.left(
            precedence,
            seq(
              field("left", $._expression),
              // @ts-ignore
              field("operator", operator),
              field("right", $._expression),
            ),
          ),
        ),
      );
    },

    identifier: ($) => /[_\p{XID_Start}][_\p{XID_Continue}]*/,

    number: ($) => /\d+/,
  },
});
/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {RuleOrLiteral} rule
 *
 * @returns {SeqRule}
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma
 *
 * @param {RuleOrLiteral} rule
 *
 * @returns {ChoiceRule}
 */
function commaSep(rule) {
  return optional(commaSep1(rule));
}
