import Combine
import Foundation

#if SWIFT_PACKAGE
import ChattingSDK
#endif

@MainActor
public final class ChattingConversationViewModel: ObservableObject {
  @Published public private(set) var siteConfig: ChattingSiteConfig?
  @Published public private(set) var siteStatus: ChattingSiteStatus?
  @Published public private(set) var messages: [ChattingMessage] = []
  @Published public private(set) var faqSuggestions: ChattingFAQSuggestions?
  @Published public internal(set) var teamTyping = false
  @Published public private(set) var isLoading = false
  @Published public private(set) var isSending = false
  @Published public private(set) var isSavingEmail = false
  @Published public internal(set) var errorMessage: String?
  @Published public var draftMessage = ""
  @Published public var emailAddress = ""

  public let client: ChattingClient

  private var context = ChattingVisitorContext()
  private var bootstrapTask: Task<Void, Never>?
  var liveTask: Task<Void, Never>?
  private var typingResetTask: Task<Void, Never>?
  var liveConversationId: String?
  let reconnectDelayNanoseconds: UInt64 = 1_000_000_000

  public init(client: ChattingClient) {
    self.client = client
    emailAddress = client.currentSessionState().email ?? ""
  }

  deinit {
    bootstrapTask?.cancel()
    liveTask?.cancel()
    typingResetTask?.cancel()
  }

  public func start(context: ChattingVisitorContext = .init()) {
    self.context = context
    emailAddress = client.currentSessionState().email ?? emailAddress
    bootstrapTask?.cancel()
    bootstrapTask = Task { await bootstrap() }
  }

  public func stop() {
    bootstrapTask?.cancel()
    liveTask?.cancel()
    typingResetTask?.cancel()
    liveConversationId = nil
    teamTyping = false
  }

  public func updateDraft(_ value: String) {
    draftMessage = value
    typingResetTask?.cancel()

    guard client.currentSessionState().conversationId != nil else {
      return
    }

    let shouldType = !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    Task { try? await client.updateTyping(isTyping: shouldType) }

    guard shouldType else {
      return
    }

    typingResetTask = Task {
      try? await Task.sleep(nanoseconds: 1_500_000_000)
      try? await client.updateTyping(isTyping: false)
    }
  }

  public func sendDraft() {
    let message = draftMessage.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !message.isEmpty, !isSending else {
      return
    }

    let previousDraft = draftMessage
    draftMessage = ""
    teamTyping = false
    errorMessage = nil

    Task {
      isSending = true
      defer { isSending = false }

      do {
        _ = try await client.sendMessage(
          message,
          context: context,
          email: emailAddress.trimmingCharacters(in: .whitespacesAndNewlines)
        )
        try await reloadConversation()
        startLiveEventsIfNeeded()
      } catch {
        draftMessage = previousDraft
        errorMessage = error.localizedDescription
      }
    }
  }

  public func saveEmail() {
    guard !isSavingEmail else {
      return
    }

    let email = emailAddress.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !email.isEmpty else {
      errorMessage = "Enter an email address first."
      return
    }

    Task {
      isSavingEmail = true
      defer { isSavingEmail = false }

      do {
        try await client.saveEmail(email)
      } catch {
        errorMessage = error.localizedDescription
      }
    }
  }

  public func identify(_ profile: ChattingVisitorProfile) {
    Task {
      do {
        try await client.identify(profile, context: context)
        emailAddress = profile.email
      } catch {
        errorMessage = error.localizedDescription
      }
    }
  }

  private func bootstrap() async {
    isLoading = true
    errorMessage = nil
    defer { isLoading = false }

    do {
      async let nextConfig = client.fetchSiteConfig(context: context)
      async let nextStatus = client.fetchSiteStatus(context: context)
      siteConfig = try await nextConfig
      siteStatus = try await nextStatus

      if let conversation = try await client.fetchConversationIfAvailable() {
        apply(conversation)
        startLiveEventsIfNeeded(conversationId: conversation.conversationId)
      }
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  func reloadConversation() async throws {
    let conversation = try await client.fetchConversation()
    apply(conversation)
  }

  private func apply(_ conversation: ChattingConversationState) {
    messages = conversation.messages
    faqSuggestions = conversation.faqSuggestions
  }
}
