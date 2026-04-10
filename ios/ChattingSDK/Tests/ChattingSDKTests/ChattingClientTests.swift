import Foundation
import XCTest
@testable import ChattingSDK

final class ChattingClientTests: XCTestCase {
  override func tearDown() {
    MockURLProtocol.requestHandler = nil
    super.tearDown()
  }

  func testFetchConversationIfAvailableReturnsNilWithoutConversation() async throws {
    let store = MemorySessionStore()
    let client = makeClient(sessionStore: store)

    let conversation = try await client.fetchConversationIfAvailable()

    XCTAssertNil(conversation)
  }

  func testSendMessageStoresConversationIdAndEmail() async throws {
    let store = MemorySessionStore(state: ChattingSessionState(sessionId: "session_123"))
    let client = makeClient(sessionStore: store)
    MockURLProtocol.requestHandler = { request in
      XCTAssertEqual(request.url?.path, "/api/public/messages")
      XCTAssertEqual(request.httpMethod, "POST")

      let body = try XCTUnwrap(request.mockHTTPBodyData())
      let payload = try XCTUnwrap(JSONSerialization.jsonObject(with: body) as? [String: Any])
      XCTAssertEqual(payload["siteId"] as? String, "site_123")
      XCTAssertEqual(payload["sessionId"] as? String, "session_123")
      XCTAssertEqual(payload["content"] as? String, "Hello from iOS")
      XCTAssertEqual(payload["email"] as? String, "hello@example.com")
      XCTAssertEqual(payload["pageUrl"] as? String, "chatting-demo://pricing")

      return (
        HTTPURLResponse(url: try XCTUnwrap(request.url), statusCode: 200, httpVersion: nil, headerFields: nil)!,
        """
        {"ok":true,"conversationId":"conv_123","message":{"id":"msg_1","content":"Hello from iOS","createdAt":"2026-04-09T00:00:00.000Z","sender":"user","attachments":[]},"faqSuggestions":null}
        """.data(using: .utf8)!
      )
    }

    let result = try await client.sendMessage(
      "Hello from iOS",
      context: ChattingVisitorContext(pageURL: URL(string: "chatting-demo://pricing")),
      email: "hello@example.com"
    )

    XCTAssertEqual(result.conversationId, "conv_123")
    XCTAssertEqual(store.state?.conversationId, "conv_123")
    XCTAssertEqual(store.state?.email, "hello@example.com")
  }

  func testIdentifyStoresVisitorEmail() async throws {
    let store = MemorySessionStore(state: ChattingSessionState(sessionId: "session_123"))
    let client = makeClient(sessionStore: store)
    MockURLProtocol.requestHandler = { request in
      XCTAssertEqual(request.url?.path, "/api/public/identify")
      XCTAssertEqual(request.httpMethod, "POST")

      let body = try XCTUnwrap(request.mockHTTPBodyData())
      let payload = try XCTUnwrap(JSONSerialization.jsonObject(with: body) as? [String: Any])
      XCTAssertEqual(payload["email"] as? String, "alex@example.com")
      XCTAssertEqual(payload["name"] as? String, "Alex")
      XCTAssertEqual(payload["pageUrl"] as? String, "chatting-demo://profile")
      XCTAssertEqual(payload["tags"] as? [String], ["vip"])
      XCTAssertEqual((payload["customFields"] as? [String: Any])?["plan"] as? String, "growth")

      return (
        HTTPURLResponse(url: try XCTUnwrap(request.url), statusCode: 200, httpVersion: nil, headerFields: nil)!,
        #"{"ok":true}"#.data(using: .utf8)!
      )
    }

    try await client.identify(
      ChattingVisitorProfile(
        email: "alex@example.com",
        name: "Alex",
        tags: ["vip"],
        customFields: ["plan": "growth"]
      ),
      context: ChattingVisitorContext(pageURL: URL(string: "chatting-demo://profile"))
    )

    XCTAssertEqual(store.state?.email, "alex@example.com")
  }

  func testRegisterPushTokenPostsApnsMetadata() async throws {
    let store = MemorySessionStore(state: ChattingSessionState(sessionId: "session_123"))
    let client = makeClient(sessionStore: store)
    MockURLProtocol.requestHandler = { request in
      XCTAssertEqual(request.url?.path, "/api/public/mobile-device")
      XCTAssertEqual(request.httpMethod, "POST")

      let body = try XCTUnwrap(request.mockHTTPBodyData())
      let payload = try XCTUnwrap(JSONSerialization.jsonObject(with: body) as? [String: Any])
      XCTAssertEqual(payload["provider"] as? String, "apns")
      XCTAssertEqual(payload["platform"] as? String, "ios")
      XCTAssertEqual(payload["pushToken"] as? String, "device-token")
      XCTAssertEqual(payload["bundleId"] as? String, "com.usechatting.app")
      XCTAssertEqual(payload["environment"] as? String, "production")

      return (
        HTTPURLResponse(url: try XCTUnwrap(request.url), statusCode: 200, httpVersion: nil, headerFields: nil)!,
        #"{"ok":true}"#.data(using: .utf8)!
      )
    }

    try await client.registerPushToken(
      ChattingPushRegistration(
        pushToken: "device-token",
        bundleId: "com.usechatting.app",
        environment: .production
      )
    )

    XCTAssertEqual(store.state?.pushRegistration?.pushToken, "device-token")
    XCTAssertEqual(store.state?.pushTokenSyncedConversationId, nil)
  }

  func testSendMessageUploadsAttachmentsAsMultipart() async throws {
    let store = MemorySessionStore(state: ChattingSessionState(sessionId: "session_123"))
    let client = makeClient(sessionStore: store)
    MockURLProtocol.requestHandler = { request in
      XCTAssertEqual(request.url?.path, "/api/public/messages")
      XCTAssertEqual(request.httpMethod, "POST")
      XCTAssertTrue((request.value(forHTTPHeaderField: "Content-Type") ?? "").contains("multipart/form-data"))

      let body = String(decoding: try XCTUnwrap(request.mockHTTPBodyData()), as: UTF8.self)
      XCTAssertTrue(body.contains("name=\"attachments\"; filename=\"brief.pdf\""))
      XCTAssertTrue(body.contains("name=\"siteId\""))
      XCTAssertTrue(body.contains("name=\"content\""))

      return (
        HTTPURLResponse(url: try XCTUnwrap(request.url), statusCode: 200, httpVersion: nil, headerFields: nil)!,
        """
        {"ok":true,"conversationId":"conv_123","message":{"id":"msg_1","content":"","createdAt":"2026-04-09T00:00:00.000Z","sender":"user","attachments":[]},"faqSuggestions":null}
        """.data(using: .utf8)!
      )
    }

    _ = try await client.sendMessage(
      "",
      attachments: [
        ChattingAttachmentUpload(
          fileName: "brief.pdf",
          contentType: "application/pdf",
          data: Data("hello".utf8)
        )
      ]
    )

    XCTAssertEqual(store.state?.conversationId, "conv_123")
  }

  private func makeClient(sessionStore: ChattingSessionStore) -> ChattingClient {
    let configuration = URLSessionConfiguration.ephemeral
    configuration.protocolClasses = [MockURLProtocol.self]
    let session = URLSession(configuration: configuration)

    return ChattingClient(
      baseURL: URL(string: "https://example.com")!,
      siteId: "site_123",
      sessionStore: sessionStore,
      urlSession: session
    )
  }
}

private final class MemorySessionStore: ChattingSessionStore {
  var state: ChattingSessionState?

  init(state: ChattingSessionState? = nil) {
    self.state = state
  }

  func loadState() -> ChattingSessionState? {
    state
  }

  func saveState(_ state: ChattingSessionState) {
    self.state = state
  }

  func clearState() {
    state = nil
  }
}
