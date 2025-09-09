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

    _definition: ($) =>
      choice(
        $.function_definition,
        $.comment,
        // TODO: other kinds of definitions
      ),
    comment: ($) => choice($.line_comment, $.block_comment),

    line_comment: ($) =>
      seq(
        // All line comments start with two //
        "//",
        /[.s]+/,
      ),

    block_comment: ($) => seq("/*", /[a-zA-Z]+/, "*/"),

    function_definition: ($) =>
      seq(
        "fn",
        field("name", $.identifier),
        $.parameter_list,
        optional(seq(":", field("return_type", $._type))),
        field("block", $.block),
      ),

    parameter_list: ($) => seq("(", optional(repeat($.parameter)), ")"),
    parameter: ($) =>
      seq(
        field("name", $.identifier),
        ":",
        field("type", $._type),
        optional(","),
      ),

    _type: ($) =>
      choice(
        "bool",
        "i32",
        "i64",
        "u64",
        "u32",
        "string",
        // TODO: other kinds of types
      ),

    block: ($) => seq("{", repeat($._statement), "}"),

    _statement: ($) =>
      choice(
        $.return_statement,
        $.variable_declaration,
        $.variable_assignment,
        $.comment,
        seq($.func_call, ";"),
        // TODO: other kinds of statements
      ),
    variable_assignment: ($) =>
      seq(
        field("name", $.identifier),
        field("value", seq("=", $._expression)),
        ";",
      ),
    variable_declaration: ($) =>
      seq(
        "let",
        optional("mut"),
        field("name", $.identifier),
        optional(field("value", seq("=", $._expression))),
        ";",
      ),

    return_statement: ($) => seq("return", $._expression, ";"),

    _expression: ($) =>
      choice(
        $.binary_expression,
        $.identifier,
        $.number,
        $.string,
        $.func_call,
        // TODO: other kinds of expressions
      ),
    string: ($) => seq('"', /(.s)*/, '"'),
    func_call: ($) => seq(field("name", $.identifier), $.arglist),
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
