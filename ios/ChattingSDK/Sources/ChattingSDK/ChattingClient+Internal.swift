import Foundation

extension ChattingClient {
  func liveEventStream() -> AsyncThrowingStream<ChattingLiveEvent, Error> {
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

  func persistConversation(conversationId: String?, email: String?) {
    var state = currentSessionState()
    state.conversationId = conversationId ?? state.conversationId
    state.email = email ?? state.email
    sessionStore.saveState(state)
  }

  func persistSessionState(_ update: (inout ChattingSessionState) -> Void) {
    var state = currentSessionState()
    update(&state)
    sessionStore.saveState(state)
  }

  func identityQueryItems(state: ChattingSessionState, conversationId: String) -> [URLQueryItem] {
    [
      URLQueryItem(name: "siteId", value: siteId),
      URLQueryItem(name: "sessionId", value: state.sessionId),
      URLQueryItem(name: "conversationId", value: conversationId)
    ]
  }

  func siteQueryItems(context: ChattingVisitorContext, includeConversation: Bool) -> [URLQueryItem] {
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

  func resolved(_ context: ChattingVisitorContext) -> ChattingVisitorContext {
    ChattingVisitorContext(
      pageURL: context.pageURL,
      referrer: context.referrer,
      timezone: context.timezone ?? TimeZone.current.identifier,
      locale: context.locale ?? Locale.current.identifier,
      tags: context.tags,
      customFields: context.customFields
    )
  }

  func requiredEmail(_ email: String) throws -> String {
    guard let value = normalized(email) else {
      throw ChattingClientError.invalidResponse(statusCode: 400, message: "Email is required.")
    }
    return value
  }

  func normalized(_ value: String?) -> String? {
    guard let trimmed = value?.trimmingCharacters(in: .whitespacesAndNewlines), !trimmed.isEmpty else {
      return nil
    }
    return trimmed
  }

  func compactQueryItems(_ values: [(String, String?)]) -> [URLQueryItem] {
    values.compactMap { key, value in
      value.map { URLQueryItem(name: key, value: $0) }
    }
  }

  func validate(attachments: [ChattingAttachmentUpload]) throws {
    if attachments.count > 3 {
      throw ChattingClientError.attachmentLimitExceeded
    }
    if attachments.contains(where: { $0.data.count > 4 * 1024 * 1024 }) {
      throw ChattingClientError.attachmentTooLarge
    }
  }
}
