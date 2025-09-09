; -- Keywords
[
  "return"
  "let"
  "mut"
] @keyword

; -- Punctuation & operators

"(" @punctuation.bracket
")" @punctuation.bracket
;"[" @punctuation.bracket
;"]" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket

[
	";"
	","
	":"
;	".."
] @punctuation.delimiter



; technically operators, but better to render as reserved words
;[

;] @keyword

; -- Builtin constants

;[

;] @constant;
(call_expression
  function: (identifier) @function)

; arguably a constant, but we highlight it as a keyword
"fn" @keyword.function


[
  "if"
  "else"
;  "switch"
] @keyword.conditional

;[
;  "for"
;  "while"
;  "break"
;  "continue"
;] @keyword.repeat

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

(number)   @number
(string)   @string

; -- Comments
(comment)         @comment
;(pp)              @keyword


; -- Type usage

;(type) @type
;(return_type) @type

; -- Constant usage

;[
;	(caseLabel)
;	(label)
;] @constant;


(identifier)      @identifier
