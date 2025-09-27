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
  closure: -1,
};

module.exports = grammar({
  name: "zeus",
  extras: ($) => [/\s/, $.line_comment, $.block_comment],
  word: ($) => $.identifier,

  rules: {
    source_file: ($) => repeat($._definition),

    use_statement: ($) =>
      seq("use", repeat(seq($.identifier, optional("::"))), ";"),

    _definition: ($) =>
      choice(
        $.function_definition,
        $.comment,
        $.use_statement,
        // TODO: other kinds of definitions
      ),
    comment: ($) => choice($.line_comment, $.block_comment),

    line_comment: ($) =>
      seq(
        // All line comments start with two //
        "//",
        choice(
          seq(token.immediate(prec(2, /\/\//)), /.*/),
          // A regular doc comment
          token.immediate(prec(1, /.*/)),
        ),
      ),

    block_comment: ($) => seq("/*", /[a-zA-Z ]+/, "*/"),

    function_definition: ($) =>
      seq(
        "fn",
        field("name", $.identifier),
        $.parameter_list,
        optional(seq(":", field("return_type", $.type))),
        field("block", $.block),
      ),

    parameter_list: ($) => seq("(", optional(repeat($.parameter)), ")"),
    parameter: ($) =>
      seq(
        field("name", $.identifier),
        ":",
        field("type", $.type),
        optional(","),
      ),

    primitive_type: ($) =>
      choice("bool", "i32", "i64", "u64", "u32", "u8", "double", "float"),
    type: ($) =>
      choice(
        $.primitive_type,
        "string",
        $.identifier,
        $.array_type,
        // TODO: other kinds of types
      ),
    array_type: ($) => seq("[", $.type, ";", $.number, "]"),
    block: ($) => seq("{", repeat($._statement), "}"),

    _statement: ($) =>
      choice(
        $.return_statement,
        $.variable_declaration,
        $.variable_assignment,
        $.array_assignment,
        $.comment,
        $.if_statement,
        $.while_statement,
        $.for_statement,
        $.break,
        $.continue,
        seq($.call_expression, ";"),
        // TODO: other kinds of statements
      ),
    if_statement: ($) =>
      seq("if", $._expression, $.block, optional(seq("else", $.block))),
    while_statement: ($) => seq("while", $._expression, $.block),
    variable_assignment: ($) =>
      seq(
        field("name", $.identifier),
        field("value", seq("=", $._expression)),
        ";",
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
      seq(
        choice($.number, $.identifier),
        "..",
        optional("="),
        choice($.number, $.identifier),
      ),
    break: ($) => seq("break", ";"),
    continue: ($) => seq("continue", ";"),
    array_assignment: ($) =>
      seq(
        field("name", $.identifier),
        "[",
        choice($.identifier, $.number),
        "]",
        field("value", seq("=", $._expression)),
        ";",
      ),
    variable_declaration: ($) =>
      seq(
        "let",
        optional("mut"),
        field("name", $.identifier),
        field("type", seq(":", $.type)),
        optional(field("value", seq("=", $._expression))),
        ";",
      ),

    return_statement: ($) => seq("return", $._expression, ";"),

    _expression: ($) =>
      choice(
        $.binary_expression,
        $.identifier,
        $.number,
        $.string_literal,
        $.char_literal,
        $.call_expression,
        // TODO: other kinds of expressions
      ),
    //string_literal: ($) => seq('"', /(.*)/, '"'),

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
    char_literal: ($) => seq("'", /./, "'"),
    call_expression: ($) => seq(field("function", $.identifier), $.arglist),
    arglist: ($) => seq("(", repeat($._expression), ")"),
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
