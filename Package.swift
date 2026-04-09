// swift-tools-version: 5.9

import PackageDescription

let package = Package(
  name: "ChattingSDK",
  platforms: [
    .iOS(.v15),
    .macOS(.v12)
  ],
  products: [
    .library(
      name: "ChattingSDK",
      targets: ["ChattingSDK"]
    ),
    .library(
      name: "ChattingSDKUI",
      targets: ["ChattingSDKUI"]
    )
  ],
  targets: [
    .target(
      name: "ChattingSDK",
      path: "ios/ChattingSDK/Sources/ChattingSDK"
    ),
    .target(
      name: "ChattingSDKUI",
      dependencies: ["ChattingSDK"],
      path: "ios/ChattingSDK/Sources/ChattingSDKUI"
    ),
    .testTarget(
      name: "ChattingSDKTests",
      dependencies: ["ChattingSDK"],
      path: "ios/ChattingSDK/Tests/ChattingSDKTests"
    )
  ]
)
