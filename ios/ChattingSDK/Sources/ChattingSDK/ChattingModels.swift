import Foundation

public enum ChattingClientError: Error, LocalizedError, Equatable {
  case invalidBaseURL
  case invalidResponse(statusCode: Int, message: String)
  case invalidEventPayload
  case missingConversationIdentifier
  case emptyMessage

  public var errorDescription: String? {
    switch self {
    case .invalidBaseURL:
      return "The Chatting base URL is invalid."
    case let .invalidResponse(_, message):
      return message
    case .invalidEventPayload:
      return "The Chatting event stream payload was invalid."
    case .missingConversationIdentifier:
      return "No active Chatting conversation exists for this session yet."
    case .emptyMessage:
      return "Message content cannot be empty."
    }
  }
}

public struct ChattingSessionState: Codable, Equatable, Sendable {
  public var sessionId: String
  public var conversationId: String?
  public var email: String?

  public init(sessionId: String, conversationId: String? = nil, email: String? = nil) {
    self.sessionId = sessionId
    self.conversationId = conversationId
    self.email = email
  }
}

public struct ChattingVisitorContext: Equatable, Sendable {
  public var pageURL: URL?
  public var referrer: URL?
  public var timezone: String?
  public var locale: String?
  public var tags: [String]
  public var customFields: [String: String]

  public init(
    pageURL: URL? = nil,
    referrer: URL? = nil,
    timezone: String? = nil,
    locale: String? = nil,
    tags: [String] = [],
    customFields: [String: String] = [:]
  ) {
    self.pageURL = pageURL
    self.referrer = referrer
    self.timezone = timezone
    self.locale = locale
    self.tags = tags
    self.customFields = customFields
  }
}

public struct ChattingVisitorProfile: Equatable, Sendable {
  public var email: String
  public var name: String?
  public var phone: String?
  public var company: String?
  public var role: String?
  public var avatarURL: URL?
  public var status: String?
  public var tags: [String]
  public var customFields: [String: String]

  public init(
    email: String,
    name: String? = nil,
    phone: String? = nil,
    company: String? = nil,
    role: String? = nil,
    avatarURL: URL? = nil,
    status: String? = nil,
    tags: [String] = [],
    customFields: [String: String] = [:]
  ) {
    self.email = email
    self.name = name
    self.phone = phone
    self.company = company
    self.role = role
    self.avatarURL = avatarURL
    self.status = status
    self.tags = tags
    self.customFields = customFields
  }
}

public struct ChattingProactivePrompt: Decodable, Equatable, Sendable {
  public let id: String
  public let pagePath: String
  public let message: String
  public let delaySeconds: Int
  public let autoOpenWidget: Bool
}

public struct ChattingSiteConfig: Decodable, Equatable, Sendable {
  public let id: String
  public let brandColor: String?
  public let widgetTitle: String
  public let greetingText: String?
  public let launcherPosition: String?
  public let teamPhotoURL: String?
  public let showOnlineStatus: Bool?
  public let requireEmailOffline: Bool?
  public let offlineTitle: String?
  public let offlineMessage: String?
  public let awayTitle: String?
  public let awayMessage: String?
  public let responseTimeMode: String?
  public let proactivePrompts: [ChattingProactivePrompt]
  public let autoOpenPaths: [String]
  public let showBranding: Bool?
  public let brandingLabel: String?
  public let brandingURL: String?

  enum CodingKeys: String, CodingKey {
    case id
    case brandColor
    case widgetTitle
    case greetingText
    case launcherPosition
    case teamPhotoURL = "teamPhotoUrl"
    case showOnlineStatus
    case requireEmailOffline
    case offlineTitle
    case offlineMessage
    case awayTitle
    case awayMessage
    case responseTimeMode
    case proactivePrompts
    case autoOpenPaths
    case showBranding
    case brandingLabel
    case brandingURL = "brandingUrl"
  }
}

public struct ChattingSiteStatus: Decodable, Equatable, Sendable {
  public let online: Bool
  public let lastSeenAt: String?
}
