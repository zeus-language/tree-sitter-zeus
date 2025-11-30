; -- Keywords
[
  "return"
  "let"
  "mut"
  "use"
  "in"
  "struct"
  "as"
  "extern"
] @keyword

; -- Punctuation & operators

"(" @punctuation.bracket
")" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket

[
	";"
	","
	":"
	"::"
	".."
] @punctuation.delimiter


(primitive_type) @type.builtin
(type) @type
;(return_type) @type

(identifier)      @identifier

; -- Builtin constants

((identifier) @constant
 (#match? @constant "^[A-Z][A-Z\\d_]+$'"))
(call_expression
  function: (identifier) @function)

; arguably a constant, but we highlight it as a keyword
"fn" @keyword.function


[
  "if"
  "else"
  "match"
;  "switch"
] @keyword.conditional

[
  "for"
  "while"
  "break"
  "continue"
] @keyword.repeat

;[
;  "["
;  "]"
;  "("
;  ")"
;  "{"
;  "}"
;] @punctuation.bracket
;
;[
;  ";"
;  "."
;  ","
;  ":"
;  "=>"
;  "->"
;] @punctuation.delimiter

; -- Literals
[
  (true)
  (false)
  (null)
] @constant.builtin

(number)   @number
(string_literal)   @string
(char_literal)     @string
; -- Comments
(line_comment) @comment
(block_comment) @comment
;(pp)              @keyword


; -- Type usage

;(type) @type
;(return_type) @type

; -- Constant usage

;[
;	(caseLabel)
;	(label)
;] @constant;
