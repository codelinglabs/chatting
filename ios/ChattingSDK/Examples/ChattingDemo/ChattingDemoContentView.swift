import ChattingSDK
import ChattingSDKUI
import SwiftUI

struct ChattingDemoContentView: View {
  private let viewModel = ChattingConversationViewModel(
    client: ChattingClient(
      baseURL: URL(string: "https://usechatting.com")!,
      siteId: "replace-with-your-site-id"
    )
  )

  var body: some View {
    NavigationStack {
      ChattingConversationView(
        viewModel: viewModel,
        context: ChattingVisitorContext(pageURL: URL(string: "chatting-demo://home"))
      )
      .navigationTitle("Chatting Demo")
    }
  }
}
