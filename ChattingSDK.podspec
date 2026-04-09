Pod::Spec.new do |spec|
  spec.name = "ChattingSDK"
  spec.version = "1.0.0"
  spec.summary = "Visitor-side iOS chat SDK for Chatting."
  spec.description = <<-DESC
  ChattingSDK lets iOS apps embed Chatting visitor chat with conversation creation,
  messaging, email capture, identify calls, typing updates, live SSE sync, and a
  lightweight SwiftUI wrapper.
  DESC
  spec.homepage = "https://github.com/codelinglabs/chatting"
  spec.license = {
    type: "Proprietary",
    text: "Copyright 2026 Codeling Labs. All rights reserved."
  }
  spec.author = { "Codeling Labs" => "hello@usechatting.com" }
  spec.source = {
    git: "https://github.com/codelinglabs/chatting.git",
    tag: spec.version.to_s
  }

  spec.swift_versions = ["5.9"]
  spec.requires_arc = true
  spec.ios.deployment_target = "15.0"
  spec.osx.deployment_target = "12.0"
  spec.default_subspecs = ["Core", "UI"]

  spec.subspec "Core" do |core|
    core.source_files = "ios/ChattingSDK/Sources/ChattingSDK/**/*.swift"
    core.frameworks = "Foundation"
  end

  spec.subspec "UI" do |ui|
    ui.dependency "ChattingSDK/Core"
    ui.source_files = "ios/ChattingSDK/Sources/ChattingSDKUI/**/*.swift"
    ui.frameworks = "SwiftUI", "Combine", "Foundation"
  end

  spec.test_spec "Tests" do |test_spec|
    test_spec.requires_app_host = false
    test_spec.source_files = "ios/ChattingSDK/Tests/ChattingSDKTests/**/*.swift"
    test_spec.dependency "ChattingSDK/Core"
  end
end
