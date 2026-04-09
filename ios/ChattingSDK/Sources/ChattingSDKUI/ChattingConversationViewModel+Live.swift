import Foundation

#if SWIFT_PACKAGE
import ChattingSDK
#endif

extension ChattingConversationViewModel {
  func startLiveEventsIfNeeded(conversationId: String? = nil) {
    let nextConversationId = conversationId ?? client.currentSessionState().conversationId
    guard let nextConversationId, liveConversationId != nextConversationId else {
      return
    }

    liveTask?.cancel()
    liveConversationId = nextConversationId
    liveTask = Task { await runLiveEvents(for: nextConversationId) }
  }

  private func runLiveEvents(for conversationId: String) async {
    while shouldKeepStreaming(conversationId: conversationId) {
      do {
        for try await event in client.liveEvents() {
          await handle(event)
        }
      } catch is CancellationError {
        return
      } catch {
        errorMessage = error.localizedDescription
      }

      guard shouldKeepStreaming(conversationId: conversationId) else {
        return
      }

      try? await Task.sleep(nanoseconds: reconnectDelayNanoseconds)
    }
  }

  private func shouldKeepStreaming(conversationId: String) -> Bool {
    !Task.isCancelled && client.currentSessionState().conversationId == conversationId
  }

  private func handle(_ event: ChattingLiveEvent) async {
    switch event.type {
    case .connected:
      errorMessage = nil
    case .typingUpdated:
      if event.actor == .team {
        teamTyping = event.typing ?? false
      }
    case .messageCreated, .conversationUpdated:
      do {
        try await reloadConversation()
      } catch {
        errorMessage = error.localizedDescription
      }
    }
  }
}
