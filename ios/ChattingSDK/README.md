# ChattingSDK

Visitor-side iOS/macOS Swift Package for Chatting live chat.

## What v1 includes

- persistent visitor session storage
- site config and online-status reads
- create/resume conversation messages
- contact identify sync
- email capture
- visitor typing updates
- live SSE conversation events
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

```swift
let client = ChattingClient(
  baseURL: URL(string: "https://usechatting.com")!,
  siteId: "your-site-id"
)

let viewModel = ChattingConversationViewModel(client: client)
let context = ChattingVisitorContext(pageURL: URL(string: "myapp://pricing"))

ChattingConversationView(viewModel: viewModel, context: context)
```

## Demo scaffold

The package includes a tiny sample under `Examples/ChattingDemo` that you can drop into a blank SwiftUI iOS app and point at your `baseURL` and `siteId`.

## Notes

- The default session store uses `UserDefaults` namespaced by `siteId`.
- The SDK talks to the existing public Chatting APIs under `/api/public/...`.
- This v1 is text-chat focused. Attachments, push notifications, and background delivery are not included yet.
