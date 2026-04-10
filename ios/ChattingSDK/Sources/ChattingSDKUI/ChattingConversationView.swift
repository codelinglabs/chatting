import SwiftUI
import UniformTypeIdentifiers

#if SWIFT_PACKAGE
import ChattingSDK
#endif

public struct ChattingConversationView: View {
  @Environment(\.scenePhase) private var scenePhase
  @StateObject var viewModel: ChattingConversationViewModel
  @State private var isImportingAttachments = false

  private let context: ChattingVisitorContext

  public init(
    viewModel: ChattingConversationViewModel,
    context: ChattingVisitorContext = .init()
  ) {
    _viewModel = StateObject(wrappedValue: viewModel)
    self.context = context
  }

  public var body: some View {
    VStack(spacing: 0) {
      header
      Divider()
      conversationBody
      Divider()
      emailBar
      pendingAttachmentsBar
      composer
    }
    .background(Color.chattingCanvas)
    .task { viewModel.start(context: context) }
    .onDisappear { viewModel.stop() }
    .onChange(of: scenePhase) { nextScenePhase in
      viewModel.handleScenePhase(nextScenePhase)
    }
    .fileImporter(
      isPresented: $isImportingAttachments,
      allowedContentTypes: [.item],
      allowsMultipleSelection: true,
      onCompletion: viewModel.importAttachments
    )
  }

  private var header: some View {
    VStack(alignment: .leading, spacing: 6) {
      Text(viewModel.siteConfig?.widgetTitle ?? "Chatting")
        .font(.headline)
      if let status = viewModel.siteStatus, viewModel.siteConfig?.showOnlineStatus != false {
        Text(status.online ? "Team is online" : "Team is away")
          .font(.subheadline)
          .foregroundStyle(.secondary)
      } else if let greeting = viewModel.siteConfig?.greetingText, viewModel.messages.isEmpty {
        Text(greeting)
          .font(.subheadline)
          .foregroundStyle(.secondary)
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding()
  }

  private var conversationBody: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 12) {
        if let errorMessage = viewModel.errorMessage {
          Text(errorMessage)
            .font(.footnote)
            .foregroundStyle(.red)
            .frame(maxWidth: .infinity, alignment: .leading)
        }

        if viewModel.isLoading {
          ProgressView()
            .frame(maxWidth: .infinity, alignment: .center)
        }

        if viewModel.messages.isEmpty, !viewModel.isLoading {
          Text("Start a conversation from your app with the same public chat APIs used by the web widget.")
            .font(.subheadline)
            .foregroundStyle(.secondary)
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.chattingSurface)
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }

        ForEach(viewModel.messages) { message in
          HStack {
            if message.sender == .team {
              bubble(for: message, fill: .chattingSurface, text: .primary)
              Spacer(minLength: 40)
            } else {
              Spacer(minLength: 40)
              bubble(for: message, fill: .chattingVisitorBubble, text: .white)
            }
          }
        }

        if viewModel.teamTyping {
          Text("Team is typing...")
            .font(.footnote)
            .foregroundStyle(.secondary)
        }

        if let suggestions = viewModel.faqSuggestions {
          VStack(alignment: .leading, spacing: 8) {
            Text("Suggested answers")
              .font(.subheadline.weight(.semibold))
            ForEach(suggestions.items) { item in
              VStack(alignment: .leading, spacing: 4) {
                Text(item.question)
                  .font(.footnote.weight(.semibold))
                Text(item.answer)
                  .font(.footnote)
                  .foregroundStyle(.secondary)
              }
              .padding(10)
              .frame(maxWidth: .infinity, alignment: .leading)
              .background(Color.chattingSurface)
              .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            Text(suggestions.fallbackMessage)
              .font(.footnote)
              .foregroundStyle(.secondary)
          }
        }
      }
      .padding()
    }
  }

  private var emailBar: some View {
    HStack(spacing: 12) {
      emailField
      Button(viewModel.isSavingEmail ? "Saving..." : "Save") {
        viewModel.saveEmail()
      }
      .disabled(viewModel.isSavingEmail)
    }
    .padding()
  }

  private var composer: some View {
    HStack(alignment: .bottom, spacing: 12) {
      Button {
        isImportingAttachments = true
      } label: {
        Image(systemName: "paperclip")
      }
      .buttonStyle(.bordered)

      TextField("Type a message", text: Binding(
        get: { viewModel.draftMessage },
        set: { viewModel.updateDraft($0) }
      ))
      .textFieldStyle(RoundedBorderTextFieldStyle())
      .onSubmit { viewModel.sendDraft() }

      Button(viewModel.isSending ? "Sending..." : "Send") {
        viewModel.sendDraft()
      }
      .buttonStyle(.borderedProminent)
      .disabled(viewModel.isSending)
    }
    .padding()
  }

  private var emailField: some View {
    let field = TextField("Email for follow-up", text: $viewModel.emailAddress)
      .textFieldStyle(RoundedBorderTextFieldStyle())
      .onSubmit { viewModel.saveEmail() }

    #if os(iOS)
    return field
      .textInputAutocapitalization(.never)
      .autocorrectionDisabled()
    #else
    return field
    #endif
  }
}
