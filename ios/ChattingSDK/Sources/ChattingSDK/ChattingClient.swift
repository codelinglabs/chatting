import Foundation

public final class ChattingClient {
  public let siteId: String

  let sessionStore: ChattingSessionStore
  let transport: ChattingTransport

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
    email: String? = nil,
    attachments: [ChattingAttachmentUpload] = []
  ) async throws -> ChattingSendMessageResult {
    try validate(attachments: attachments)

    let trimmedContent = content.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmedContent.isEmpty || !attachments.isEmpty else {
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

    let result: ChattingSendMessageResult =
      if attachments.isEmpty {
        try await transport.post(path: "/api/public/messages", body: body)
      } else {
        try await transport.postMultipart(path: "/api/public/messages", multipart: body.multipartFormData(attachments: attachments))
      }

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
}
