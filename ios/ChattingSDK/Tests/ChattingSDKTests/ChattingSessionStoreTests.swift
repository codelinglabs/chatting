import Foundation
import XCTest
@testable import ChattingSDK

final class ChattingSessionStoreTests: XCTestCase {
  func testStoreRoundTripsState() {
    let suiteName = "chatting-sdk-tests-\(UUID().uuidString)"
    let defaults = UserDefaults(suiteName: suiteName)!
    let store = UserDefaultsChattingSessionStore(namespace: "site_123", userDefaults: defaults)
    let state = ChattingSessionState(sessionId: "session_1", conversationId: "conv_1", email: "hello@example.com")

    store.saveState(state)

    XCTAssertEqual(store.loadState(), state)
    store.clearState()
    XCTAssertNil(store.loadState())
  }

  func testStoreNamespacesDoNotCollide() {
    let suiteName = "chatting-sdk-tests-\(UUID().uuidString)"
    let defaults = UserDefaults(suiteName: suiteName)!
    let first = UserDefaultsChattingSessionStore(namespace: "site_a", userDefaults: defaults)
    let second = UserDefaultsChattingSessionStore(namespace: "site_b", userDefaults: defaults)

    first.saveState(ChattingSessionState(sessionId: "session_a"))
    second.saveState(ChattingSessionState(sessionId: "session_b"))

    XCTAssertEqual(first.loadState()?.sessionId, "session_a")
    XCTAssertEqual(second.loadState()?.sessionId, "session_b")
  }
}
