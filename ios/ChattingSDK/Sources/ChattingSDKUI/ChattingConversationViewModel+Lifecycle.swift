import SwiftUI

#if SWIFT_PACKAGE
import ChattingSDK
#endif

@MainActor
extension ChattingConversationViewModel {
  public func handleScenePhase(_ scenePhase: ScenePhase) {
    switch scenePhase {
    case .active:
      applicationDidBecomeActive()
    case .background:
      applicationDidEnterBackground()
    case .inactive:
      break
    @unknown default:
      break
    }
  }

  public func applicationDidBecomeActive() {
    Task { await resumeConversationAfterForegroundEntry() }
  }

  public func applicationDidEnterBackground() {
    liveTask?.cancel()
    liveConversationId = nil
    teamTyping = false
    typingResetTask?.cancel()
  }

  public func handlePushNotificationOpened() {
    applicationDidBecomeActive()
  }

  private func resumeConversationAfterForegroundEntry() async {
    do {
      try? await client.syncPushToken()
      siteStatus = try await client.fetchSiteStatus(context: context)

      if let conversation = try await client.fetchConversationIfAvailable() {
        apply(conversation)
        startLiveEventsIfNeeded(conversationId: conversation.conversationId)
      }
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
