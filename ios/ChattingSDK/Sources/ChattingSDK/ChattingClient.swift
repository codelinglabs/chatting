import Foundation

public final class ChattingClient {
  public let siteId: String

  private let sessionStore: ChattingSessionStore
  private let transport: ChattingTransport

  public init(
    baseURL: URL,
    siteId: String,
    sessionStore: ChattingSessionStore? = nil,
    urlSession: URLSession = .shared
  ) {
    self.siteId = siteId
    self.sessionStore = sessionStore ?? UserDefaultsChattingSessionStore(namespace: siteId)
    transport = ChattingTransport(baseURL: baseURL, urlSession: urlSession)
  }

  public func currentSessionState() -> ChattingSessionState {
    if let storedState = sessionStore.loadState() {
      return storedState
    }

    let newState = ChattingSessionState(sessionId: UUID().uuidString.lowercased())
    sessionStore.saveState(newState)
    return newState
  }

  public func clearConversation() {
    var state = currentSessionState()
    state.conversationId = nil
    sessionStore.saveState(state)
  }

  public func fetchSiteConfig(context: ChattingVisitorContext = .init()) async throws -> ChattingSiteConfig {
    let response: ChattingSiteConfigResponse = try await transport.get(
      path: "/api/public/site-config",
      queryItems: siteQueryItems(context: resolved(context), includeConversation: true)
    )
    return response.site
  }

  public func fetchSiteStatus(context: ChattingVisitorContext = .init()) async throws -> ChattingSiteStatus {
    let response: ChattingSiteStatusResponse = try await transport.get(
      path: "/api/public/site-status",
      queryItems: siteQueryItems(context: resolved(context), includeConversation: true)
    )
    return ChattingSiteStatus(online: response.online, lastSeenAt: response.lastSeenAt)
  }

  public func fetchConversationIfAvailable() async throws -> ChattingConversationState? {
    guard currentSessionState().conversationId != nil else {
      return nil
    }

    return try await fetchConversation()
  }

  public func fetchConversation() async throws -> ChattingConversationState {
    let state = currentSessionState()
    guard let conversationId = state.conversationId else {
      throw ChattingClientError.missingConversationIdentifier
    }

    return try await transport.get(
      path: "/api/public/conversation",
      queryItems: identityQueryItems(state: state, conversationId: conversationId)
    )
  }

  public func sendMessage(
    _ content: String,
    context: ChattingVisitorContext = .init(),
    email: String? = nil
  ) async throws -> ChattingSendMessageResult {
    let trimmedContent = content.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmedContent.isEmpty else {
      throw ChattingClientError.emptyMessage
    }

    let state = currentSessionState()
    let body = ChattingSendMessageBody(
      siteId: siteId,
      sessionId: state.sessionId,
      conversationId: state.conversationId,
      content: trimmedContent,
      email: normalized(email) ?? state.email,
      context: resolved(context)
    )

    let result: ChattingSendMessageResult = try await transport.post(path: "/api/public/messages", body: body)
    persistConversation(conversationId: result.conversationId, email: normalized(email) ?? state.email)
    return result
  }

  public func saveEmail(_ email: String) async throws {
    let normalizedEmail = try requiredEmail(email)
    let state = currentSessionState()
    guard let conversationId = state.conversationId else {
      throw ChattingClientError.missingConversationIdentifier
    }

    let _: ChattingOperationResponse = try await transport.post(
      path: "/api/public/conversation-email",
      body: ChattingSaveEmailBody(
        siteId: siteId,
        sessionId: state.sessionId,
        conversationId: conversationId,
        email: normalizedEmail
      )
    )

    persistConversation(conversationId: conversationId, email: normalizedEmail)
  }

  public func identify(
    _ profile: ChattingVisitorProfile,
    context: ChattingVisitorContext = .init()
  ) async throws {
    let state = currentSessionState()
    let _: ChattingOperationResponse = try await transport.post(
      path: "/api/public/identify",
      body: ChattingIdentifyBody(
        siteId: siteId,
        sessionId: state.sessionId,
        conversationId: state.conversationId,
        profile: profile,
        context: resolved(context)
      )
    )

    persistConversation(conversationId: state.conversationId, email: profile.email)
  }

  public func updateTyping(isTyping: Bool) async throws {
    let state = currentSessionState()
    guard let conversationId = state.conversationId else {
      throw ChattingClientError.missingConversationIdentifier
    }

    let _: ChattingOperationResponse = try await transport.post(
      path: "/api/public/typing",
      body: ChattingTypingBody(
        siteId: siteId,
        sessionId: state.sessionId,
        conversationId: conversationId,
        typing: isTyping
      )
    )
  }

  public func liveEvents() -> AsyncThrowingStream<ChattingLiveEvent, Error> {
    let state = currentSessionState()
    guard let conversationId = state.conversationId else {
      return AsyncThrowingStream { continuation in
        continuation.finish(throwing: ChattingClientError.missingConversationIdentifier)
      }
    }

    return AsyncThrowingStream { continuation in
      let task = Task {
        do {
          let bytes = try await transport.openEventStream(
            path: "/api/public/conversation-live",
            queryItems: identityQueryItems(state: state, conversationId: conversationId)
          )
          var decoder = ChattingEventStreamDecoder()

          for try await line in bytes.lines {
            if let event = try decoder.consume(line: line) {
              continuation.yield(event)
            }
          }

          continuation.finish()
        } catch is CancellationError {
          continuation.finish()
        } catch {
          continuation.finish(throwing: error)
        }
      }

      continuation.onTermination = { _ in
        task.cancel()
      }
    }
  }

  private func persistConversation(conversationId: String?, email: String?) {
    var state = currentSessionState()
    state.conversationId = conversationId ?? state.conversationId
    state.email = email ?? state.email
    sessionStore.saveState(state)
  }

  private func identityQueryItems(state: ChattingSessionState, conversationId: String) -> [URLQueryItem] {
    [
      URLQueryItem(name: "siteId", value: siteId),
      URLQueryItem(name: "sessionId", value: state.sessionId),
      URLQueryItem(name: "conversationId", value: conversationId)
    ]
  }

  private func siteQueryItems(context: ChattingVisitorContext, includeConversation: Bool) -> [URLQueryItem] {
    let state = currentSessionState()
    return compactQueryItems([
      ("siteId", siteId),
      ("sessionId", state.sessionId),
      ("conversationId", includeConversation ? state.conversationId : nil),
      ("email", state.email),
      ("pageUrl", context.pageURL?.absoluteString),
      ("referrer", context.referrer?.absoluteString),
      ("timezone", context.timezone),
      ("locale", context.locale)
    ])
  }

  private func resolved(_ context: ChattingVisitorContext) -> ChattingVisitorContext {
    ChattingVisitorContext(
      pageURL: context.pageURL,
      referrer: context.referrer,
      timezone: context.timezone ?? TimeZone.current.identifier,
      locale: context.locale ?? Locale.current.identifier,
      tags: context.tags,
      customFields: context.customFields
    )
  }

  private func requiredEmail(_ email: String) throws -> String {
    guard let value = normalized(email) else {
      throw ChattingClientError.invalidResponse(statusCode: 400, message: "Email is required.")
    }
    return value
  }

  private func normalized(_ value: String?) -> String? {
    guard let trimmed = value?.trimmingCharacters(in: .whitespacesAndNewlines), !trimmed.isEmpty else {
      return nil
    }
    return trimmed
  }

  private func compactQueryItems(_ values: [(String, String?)]) -> [URLQueryItem] {
    values.compactMap { key, value in
      guard let value else {
        return nil
      }
      return URLQueryItem(name: key, value: value)
    }
  }
}
