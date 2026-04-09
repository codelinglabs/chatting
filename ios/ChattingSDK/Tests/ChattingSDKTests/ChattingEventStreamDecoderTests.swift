import XCTest
@testable import ChattingSDK

final class ChattingEventStreamDecoderTests: XCTestCase {
  func testDecoderEmitsConnectedEventOnBlankLine() throws {
    var decoder = ChattingEventStreamDecoder()

    XCTAssertNil(try decoder.consume(line: "data: {\"type\":\"connected\",\"conversationId\":\"conv_1\"}"))
    let event = try decoder.consume(line: "")

    XCTAssertEqual(event?.type, .connected)
    XCTAssertEqual(event?.conversationId, "conv_1")
  }

  func testDecoderIgnoresPingEvents() throws {
    var decoder = ChattingEventStreamDecoder()

    XCTAssertNil(try decoder.consume(line: "event: ping"))
    XCTAssertNil(try decoder.consume(line: "data: {}"))
    XCTAssertNil(try decoder.consume(line: ""))
  }
}
