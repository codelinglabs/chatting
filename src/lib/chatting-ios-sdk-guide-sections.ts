import { code, cta, faq, list, paragraph, section } from "@/lib/blog-block-factories";

export const chattingIosSdkGuideSections = [
  section("before-you-start", "Before you start", [
    list([
      "An iOS app that targets iOS 15 or later",
      "Use `https://usechatting.com` as `baseURL`",
      "Use your site/workspace ID inside Chatting as `siteId`",
      "Choose Swift Package Manager or CocoaPods",
      "If you want background reply notifications, configure APNs in your app target too"
    ]),
    paragraph("That is the full default setup: `baseURL` is always `https://usechatting.com`, and `siteId` is your site/workspace ID inside Chatting."),
    paragraph("This guide is for the iOS app integrating the SDK."),
    paragraph("If you run Chatting itself, your backend-side setup is separate: deploy Chatting with `APPLE_TEAM_ID`, `APPLE_KEY_ID`, and `APPLE_PUSH_KEY_P8`. The rest of this guide is app-side iOS setup.")
  ]),
  section("install", "Install the SDK", [
    list([
      "SwiftPM: add `https://github.com/codelinglabs/chatting.git` from version `1.0.0` and include `ChattingSDK` or `ChattingSDKUI`",
      "CocoaPods: add `pod 'ChattingSDK'` or `pod 'ChattingSDK/Core'` to your Podfile"
    ], true),
    code(
      `// Swift Package Manager\n.package(url: "https://github.com/codelinglabs/chatting.git", from: "1.0.0")`,
      "swift"
    ),
    code(
      `# Podfile\npod 'ChattingSDK'`,
      "ruby"
    )
  ]),
  section("create-client", "Create the client", [
    paragraph("Create one `ChattingClient` with your Chatting URL and site ID."),
    code(
      `import ChattingSDK\n\nlet client = ChattingClient(\n  baseURL: URL(string: "https://usechatting.com")!,\n  siteId: "your-site-id"\n)`,
      "swift"
    )
  ]),
  section("support-screen", "Present the support screen", [
    paragraph("Present `ChattingConversationView` from a sheet or your support flow."),
    code(
      `import SwiftUI\nimport ChattingSDK\nimport ChattingSDKUI\n\nstruct ContentView: View {\n  @State private var isShowingSupport = false\n\n  private let client = ChattingClient(\n    baseURL: URL(string: "https://usechatting.com")!,\n    siteId: "your-site-id"\n  )\n\n  var body: some View {\n    Button("Contact support") {\n      isShowingSupport = true\n    }\n    .buttonStyle(.borderedProminent)\n    .sheet(isPresented: $isShowingSupport) {\n      SupportChatSheet(client: client)\n    }\n  }\n}\n\nprivate struct SupportChatSheet: View {\n  private let viewModel: ChattingConversationViewModel\n\n  init(client: ChattingClient) {\n    viewModel = ChattingConversationViewModel(client: client)\n  }\n\n  var body: some View {\n    NavigationStack {\n      ChattingConversationView(\n        viewModel: viewModel,\n        context: ChattingVisitorContext(pageURL: URL(string: "myapp://support"))\n      )\n      .navigationTitle("Support")\n      .navigationBarTitleDisplayMode(.inline)\n    }\n  }\n}`,
      "swift"
    ),
    paragraph("This gives you a native support screen with conversation history, sending, typing, and email capture.")
  ]),
  section("identify", "Identify signed-in users", [
    paragraph("If your app already knows the customer, identify them when the support screen opens. If not, you can save an email address only."),
    code(
      `private struct SupportChatSheet: View {\n  private let viewModel: ChattingConversationViewModel\n  private let signedInEmail: String?\n  private let signedInName: String?\n  private let draftVisitorEmail: String?\n\n  init(\n    client: ChattingClient,\n    signedInEmail: String?,\n    signedInName: String?,\n    draftVisitorEmail: String?\n  ) {\n    viewModel = ChattingConversationViewModel(client: client)\n    self.signedInEmail = signedInEmail\n    self.signedInName = signedInName\n    self.draftVisitorEmail = draftVisitorEmail\n  }\n\n  var body: some View {\n    NavigationStack {\n      ChattingConversationView(viewModel: viewModel)\n        .task {\n          if let signedInEmail {\n            viewModel.identify(\n              ChattingVisitorProfile(\n                email: signedInEmail,\n                name: signedInName\n              )\n            )\n          } else if let draftVisitorEmail {\n            viewModel.emailAddress = draftVisitorEmail\n            viewModel.saveEmail()\n          }\n        }\n    }\n  }\n}`,
      "swift"
    ),
    paragraph("Use `identify(...)` for signed-in users. Use `emailAddress` plus `saveEmail()` when you only need a follow-up email.")
  ]),
  section("push", "Register APNs push notifications", [
    list([
      "Request notification permission in your iOS app",
      "Register for remote notifications",
      "Pass the APNs device token into `ChattingClient`"
    ], true),
    code(
      `import ChattingSDK\nimport UIKit\n\nfunc registerChattingPush(client: ChattingClient, deviceToken: Data) {\n  let token = deviceToken.map { String(format: "%02x", $0) }.joined()\n  guard let bundleId = Bundle.main.bundleIdentifier else {\n    return\n  }\n\n  Task {\n    try? await client.registerPushToken(\n      ChattingPushRegistration(\n        pushToken: token,\n        bundleId: bundleId,\n        environment: .production\n      )\n    )\n  }\n}`,
      "swift"
    ),
    paragraph("Open the same support screen after a push tap. `ChattingConversationView` reconnects and reloads the current conversation when the app becomes active again.")
  ]),
  section("check-installation", "Check the installation", [
    list([
      "Open the support screen in your app",
      "Send a test message from the device",
      "Reply from the Chatting inbox",
      "Confirm the reply appears in the app while it is still open",
      "If APNs is configured, background the app, reply from the inbox, tap the push notification, and confirm the same conversation reloads"
    ], true)
  ]),
  section("what-works-today", "What works today", [
    list([
      "Foreground chat works today",
      "APNs-backed reply notifications work when your host app registers an APNs token",
      "Conversation state is persisted per visitor session",
      "The SwiftUI wrapper reconnects and reloads when the app becomes active again",
      "Attachment uploads are available through the core SDK message API"
    ]),
    paragraph("For the app integrating the SDK, the remaining iOS work is normal APNs setup: entitlements, notification permission prompts, and forwarding the APNs token into `ChattingClient`.")
  ]),
  section("faq", "FAQ", [
    faq([
      {
        question: "Do we have to use the SwiftUI wrapper?",
        answer: "No. You can use `ChattingClient` on its own and build your own UI around the core SDK models and transport methods."
      },
      {
        question: "Can we install it with CocoaPods instead of SwiftPM?",
        answer: "Yes. `pod 'ChattingSDK'` installs the full package, and `pod 'ChattingSDK/Core'` gives you the core layer without the SwiftUI surface."
      },
      {
        question: "What should I use for baseURL?",
        answer: "Use `https://usechatting.com`."
      }
    ]),
    cta(
      "Ready to add native chat?",
      "Install the SDK, add your site ID, and launch one support screen in your app first.",
      "Open Chatting",
      "/login"
    )
  ])
];
