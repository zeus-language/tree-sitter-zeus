package tree_sitter_zeus_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_zeus "http://github.com/hiska999/tree-sitter-zeus/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_zeus.Language())
	if language == nil {
		t.Errorf("Error loading Zeus grammar")
	}
}
