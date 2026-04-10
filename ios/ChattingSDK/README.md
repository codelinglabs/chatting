# ChattingSDK

Visitor-side iOS/macOS Swift Package for Chatting live chat.

## What v1 includes

- persistent visitor session storage
- site config and online-status reads
- create/resume conversation messages
- attachment uploads through the public Chatting message API
- contact identify sync
- email capture
- visitor typing updates
- live SSE conversation events
- APNs push-token registration for native iOS apps
- automatic reconnect and conversation refresh when the app returns to the foreground
- a lightweight SwiftUI wrapper target: `ChattingSDKUI`

## Install

### Local development

Add the local package from this repository:

`ios/ChattingSDK`

Then import:

```swift
import ChattingSDK
import ChattingSDKUI
```

### CocoaPods

```ruby
pod 'ChattingSDK'
```

If you only want the core networking/session layer without the SwiftUI wrapper:

```ruby
pod 'ChattingSDK/Core'
```

### Public Swift Package release

This package can now be consumed directly from the main Chatting repository because the repo root exposes a Swift package manifest that points at `ios/ChattingSDK`.

Example dependency:

```swift
.package(url: "https://github.com/codelinglabs/chatting.git", from: "1.0.0")
```

Then depend on:

```swift
.product(name: "ChattingSDK", package: "ChattingSDK")
.product(name: "ChattingSDKUI", package: "ChattingSDK")
```

See [RELEASING.md](RELEASING.md) for the release flow.

## Basic usage

### Required configuration

You need two values before the SDK can connect:

- `baseURL`: use `https://usechatting.com`
- `siteId`: your site/workspace ID inside Chatting

### Role split

- This README is mainly for the iOS app developer integrating Chatting into an app.
- If you run Chatting itself, your backend-side APNs setup is smaller than the app-side setup below.

If you run Chatting itself, your job is only:

- deploy Chatting with `APPLE_TEAM_ID`
- deploy Chatting with `APPLE_KEY_ID`
- deploy Chatting with `APPLE_PUSH_KEY_P8`

Everything below about notification permission, APNs device tokens, and `registerPushToken(...)` belongs to the iOS app that is integrating the SDK.

### Present chat from your app

```swift
import SwiftUI
import ChattingSDK
import ChattingSDKUI

struct ContentView: View {
  @State private var isShowingSupport = false

  private let client = ChattingClient(
    baseURL: URL(string: "https://usechatting.com")!,
    siteId: "your-site-id"
  )

  var body: some View {
    Button("Contact support") {
      isShowingSupport = true
    }
    .buttonStyle(.borderedProminent)
    .sheet(isPresented: $isShowingSupport) {
      SupportChatSheet(client: client)
    }
  }
}

private struct SupportChatSheet: View {
  private let viewModel: ChattingConversationViewModel

  init(client: ChattingClient) {
    viewModel = ChattingConversationViewModel(client: client)
  }

  var body: some View {
    NavigationStack {
      ChattingConversationView(
        viewModel: viewModel,
        context: ChattingVisitorContext(pageURL: URL(string: "myapp://support"))
      )
      .navigationTitle("Support")
      .navigationBarTitleDisplayMode(.inline)
    }
  }
}
```

### Identify a signed-in visitor or save an email-only visitor

Put your visitor identity logic in the same sheet you present for support:

```swift
private struct SupportChatSheet: View {
  private let viewModel: ChattingConversationViewModel
  private let signedInEmail: String?
  private let signedInName: String?
  private let draftVisitorEmail: String?

  init(
    client: ChattingClient,
    signedInEmail: String?,
    signedInName: String?,
    draftVisitorEmail: String?
  ) {
    viewModel = ChattingConversationViewModel(client: client)
    self.signedInEmail = signedInEmail
    self.signedInName = signedInName
    self.draftVisitorEmail = draftVisitorEmail
  }

  var body: some View {
    NavigationStack {
      ChattingConversationView(viewModel: viewModel)
        .task {
          if let signedInEmail {
            viewModel.identify(
              ChattingVisitorProfile(
                email: signedInEmail,
                name: signedInName
              )
            )
          } else if let draftVisitorEmail {
            viewModel.emailAddress = draftVisitorEmail
            viewModel.saveEmail()
          }
        }
    }
  }
}
```

Use `identify` when you already know who the customer is. Use `emailAddress` plus `saveEmail()` when you only want a follow-up email without a full signed-in profile.

### Register APNs push notifications

Do this in the iOS app:

- request notification permission
- register for remote notifications
- forward the APNs device token into `ChattingClient`

```swift
import ChattingSDK
import UIKit

func registerChattingPush(client: ChattingClient, deviceToken: Data) {
  let token = deviceToken.map { String(format: "%02x", $0) }.joined()
  guard let bundleId = Bundle.main.bundleIdentifier else {
    return
  }

  Task {
    try? await client.registerPushToken(
      ChattingPushRegistration(
        pushToken: token,
        bundleId: bundleId,
        environment: .production
      )
    )
  }
}
```

When you use `ChattingConversationView`, the wrapper reconnects and refreshes automatically when the app returns to the foreground. If a user opens the app from a push notification, present the same support screen and the conversation reloads from current server state.

### Current scope

- Foreground live chat works now, including live conversation sync while the app is open.
- APNs-backed push notifications work for native iOS apps once the host app forwards the APNs token into `ChattingClient`.
- The SwiftUI wrapper reconnects and refreshes the conversation when the app becomes active again.

## Demo scaffold

The package includes a tiny sample under `Examples/ChattingDemo` that now mirrors the same app-level pattern:

- a button in your app UI
- a presented support sheet
- a configured `ChattingClient`
- a simple identify call inside the sheet

## Notes

- The default session store uses `UserDefaults` namespaced by `siteId`.
- The SDK talks to the existing public Chatting APIs under `/api/public/...`.
- Attachment uploads are supported through `ChattingClient.sendMessage(...attachments:)`.
- Native iOS push delivery still depends on normal app-side APNs entitlements, permission prompts, and token registration in the integrating app.
