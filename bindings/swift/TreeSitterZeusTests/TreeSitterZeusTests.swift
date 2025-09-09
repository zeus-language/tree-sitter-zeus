import XCTest
import SwiftTreeSitter
import TreeSitterZeus

final class TreeSitterZeusTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_zeus())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Zeus grammar")
    }
}
