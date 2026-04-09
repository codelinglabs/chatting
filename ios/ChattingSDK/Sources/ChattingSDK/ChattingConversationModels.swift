import Foundation

public enum ChattingSender: String, Decodable, Equatable, Sendable {
  case user
  case team
}

public struct ChattingMessageAttachment: Decodable, Equatable, Sendable, Identifiable {
  public let id: String
  public let fileName: String
  public let contentType: String
  public let sizeBytes: Int
  public let url: String
  public let isImage: Bool
}

public struct ChattingMessage: Decodable, Equatable, Sendable, Identifiable {
  public let id: String
  public let content: String
  public let createdAt: String
  public let sender: ChattingSender
  public let attachments: [ChattingMessageAttachment]
}

public struct ChattingFAQItem: Decodable, Equatable, Sendable, Identifiable {
  public let id: String
  public let question: String
  public let answer: String
  public let link: String?
}

public struct ChattingFAQSuggestions: Decodable, Equatable, Sendable {
  public let fallbackMessage: String
  public let items: [ChattingFAQItem]
}

public struct ChattingConversationState: Decodable, Equatable, Sendable {
  public let conversationId: String
  public let messages: [ChattingMessage]
  public let faqSuggestions: ChattingFAQSuggestions?
}

public struct ChattingSendMessageResult: Decodable, Equatable, Sendable {
  public let conversationId: String
  public let message: ChattingMessage
  public let faqSuggestions: ChattingFAQSuggestions?
}

public enum ChattingLiveEventType: String, Decodable, Equatable, Sendable {
  case connected
  case messageCreated = "message.created"
  case typingUpdated = "typing.updated"
  case conversationUpdated = "conversation.updated"
}

public enum ChattingTypingActor: String, Decodable, Equatable, Sendable {
  case team
  case visitor
}

public struct ChattingLiveEvent: Decodable, Equatable, Sendable {
  public let type: ChattingLiveEventType
  public let conversationId: String?
  public let sender: ChattingSender?
  public let actor: ChattingTypingActor?
  public let typing: Bool?
  public let status: String?
  public let createdAt: String?
  public let updatedAt: String?
}
