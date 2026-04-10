import Foundation

public extension ChattingClient {
  func registerPushToken(_ registration: ChattingPushRegistration) async throws {
    persistSessionState {
      $0.pushRegistration = registration
      $0.pushTokenSyncedConversationId = nil
    }
    try await syncPushToken()
  }

  func unregisterPushToken(_ pushToken: String? = nil) async throws {
    let state = currentSessionState()
    guard let resolvedPushToken = normalized(pushToken) ?? state.pushRegistration?.pushToken else {
      return
    }

    let _: ChattingOperationResponse = try await transport.delete(
      path: "/api/public/mobile-device",
      body: ChattingUnregisterPushBody(
        siteId: siteId,
        sessionId: state.sessionId,
        pushToken: resolvedPushToken
      )
    )

    persistSessionState {
      if $0.pushRegistration?.pushToken == resolvedPushToken {
        $0.pushRegistration = nil
      }
      $0.pushTokenSyncedConversationId = nil
    }
  }

  func syncPushToken() async throws {
    let state = currentSessionState()
    guard let registration = state.pushRegistration else {
      return
    }
    if state.pushTokenSyncedConversationId == state.conversationId {
      return
    }

    let _: ChattingOperationResponse = try await transport.post(
      path: "/api/public/mobile-device",
      body: ChattingRegisterPushBody(
        siteId: siteId,
        sessionId: state.sessionId,
        conversationId: state.conversationId,
        pushToken: registration.pushToken,
        bundleId: registration.bundleId,
        environment: registration.environment.rawValue
      )
    )

    persistSessionState {
      $0.pushTokenSyncedConversationId = $0.conversationId
    }
  }
}
