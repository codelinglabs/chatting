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
      name: "ChattingSDK"
    ),
    .target(
      name: "ChattingSDKUI",
      dependencies: ["ChattingSDK"]
    ),
    .testTarget(
      name: "ChattingSDKTests",
      dependencies: ["ChattingSDK"]
    )
  ]
)
