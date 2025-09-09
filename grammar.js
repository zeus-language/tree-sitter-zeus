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

  rules: {
    source_file: ($) => repeat($._definition),

    _definition: ($) =>
      choice(
        $.function_definition,
        // TODO: other kinds of definitions
      ),

    function_definition: ($) =>
      seq("fn", $.identifier, $.parameter_list, ":", $._type, $.block),

    parameter_list: ($) => seq("(", optional(repeat($.parameter)), ")"),
    parameter: ($) => seq($.identifier, ":", $._type, ","),

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
        // TODO: other kinds of statements
      ),

    variable_declaration: ($) =>
      seq("let", $.identifier, "=", $._expression, ";"),

    return_statement: ($) => seq("return", $._expression, ";"),

    _expression: ($) =>
      choice(
        $.binary_expression,
        $.identifier,
        $.number,
        // TODO: other kinds of expressions
      ),
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

    identifier: ($) => /[a-zA-Z]+/,

    number: ($) => /\d+/,
  },
});
