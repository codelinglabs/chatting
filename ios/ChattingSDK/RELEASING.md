# Releasing ChattingSDK

## Current state

`ChattingSDK` still lives under:

`ios/ChattingSDK`

but the repository root now also exposes a `Package.swift` that points at those sources and tests.

That means:

- local path integration still works from `ios/ChattingSDK`
- public URL-based Swift Package Manager integration can now use the main repository URL
- GitHub Actions can validate the package from the real repo root

## Public package URL

Consumers can install the package from:

```swift
.package(url: "https://github.com/codelinglabs/chatting.git", from: "1.0.0")
```

## Release checklist

1. Make sure the package builds:

```bash
swift build --package-path .
```

2. Make sure the package tests pass:

```bash
swift test --package-path .
```

3. Create and push a semantic version tag such as:

```bash
git tag 1.0.0
git push origin 1.0.0
```

4. Verify installation from Xcode or SwiftPM using the main repo URL.

## Post-publish install experience

After tagging the main repository, consumers should be able to add it with a dependency like:

```swift
.package(url: "https://github.com/codelinglabs/chatting.git", from: "1.0.0")
```

And then depend on:

- `ChattingSDK`
- `ChattingSDKUI`

## Nice-to-have before the first public release

- add a standalone license file if the SDK should have explicit package-level licensing
- add a dedicated changelog
- add a GitHub release with install instructions and a short v1 scope note
- smoke-test package installation in a blank sample iOS app from the public URL
