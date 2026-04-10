import Foundation

struct ChattingSendMessageBody: Encodable {
  let siteId: String
  let sessionId: String
  let conversationId: String?
  let content: String
  let email: String?
  let pageUrl: String?
  let referrer: String?
  let timezone: String?
  let locale: String?
  let visitorTags: [String]?
  let customFields: [String: String]?

  init(
    siteId: String,
    sessionId: String,
    conversationId: String?,
    content: String,
    email: String?,
    context: ChattingVisitorContext
  ) {
    self.siteId = siteId
    self.sessionId = sessionId
    self.conversationId = conversationId
    self.content = content
    self.email = email
    pageUrl = context.pageURL?.absoluteString
    referrer = context.referrer?.absoluteString
    timezone = context.timezone
    locale = context.locale
    visitorTags = context.tags.isEmpty ? nil : context.tags
    customFields = context.customFields.isEmpty ? nil : context.customFields
  }
}

extension ChattingSendMessageBody {
  func multipartFormData(attachments: [ChattingAttachmentUpload]) -> ChattingMultipartFormData {
    let fields = [
      ("siteId", siteId),
      ("sessionId", sessionId),
      ("conversationId", conversationId),
      ("content", content),
      ("email", email),
      ("pageUrl", pageUrl),
      ("referrer", referrer),
      ("timezone", timezone),
      ("locale", locale),
      ("visitorTags", visitorTags.flatMap { try? encodeJSONObject($0) }),
      ("customFields", customFields.flatMap { try? encodeJSONObject($0) })
    ].compactMap { key, value in
      value.map { (key, $0) }
    }

    return ChattingMultipartFormData(
      fields: fields,
      files: attachments.map { attachment in
        ChattingMultipartFile(
          fieldName: "attachments",
          fileName: attachment.fileName,
          contentType: attachment.contentType,
          data: attachment.data
        )
      }
    )
  }

  private func encodeJSONObject(_ value: some Encodable) throws -> String {
    let data = try JSONEncoder().encode(AnyEncodable(value))
    return String(decoding: data, as: UTF8.self)
  }
}

struct ChattingSaveEmailBody: Encodable {
  let siteId: String
  let sessionId: String
  let conversationId: String
  let email: String
}

struct ChattingTypingBody: Encodable {
  let siteId: String
  let sessionId: String
  let conversationId: String
  let typing: Bool
}

struct ChattingIdentifyBody: Encodable {
  let siteId: String
  let sessionId: String
  let conversationId: String?
  let email: String
  let name: String?
  let phone: String?
  let company: String?
  let role: String?
  let avatarUrl: String?
  let status: String?
  let tags: [String]?
  let customFields: [String: String]?
  let pageUrl: String?
  let referrer: String?
  let timezone: String?
  let locale: String?

  init(
    siteId: String,
    sessionId: String,
    conversationId: String?,
    profile: ChattingVisitorProfile,
    context: ChattingVisitorContext
  ) {
    self.siteId = siteId
    self.sessionId = sessionId
    self.conversationId = conversationId
    email = profile.email
    name = profile.name
    phone = profile.phone
    company = profile.company
    role = profile.role
    avatarUrl = profile.avatarURL?.absoluteString
    status = profile.status
    tags = profile.tags.isEmpty ? nil : profile.tags
    customFields = profile.customFields.isEmpty ? nil : profile.customFields
    pageUrl = context.pageURL?.absoluteString
    referrer = context.referrer?.absoluteString
    timezone = context.timezone
    locale = context.locale
  }
}

struct ChattingRegisterPushBody: Encodable {
  let siteId: String
  let sessionId: String
  let conversationId: String?
  let provider = "apns"
  let platform = "ios"
  let pushToken: String
  let bundleId: String
  let environment: String
}

struct ChattingUnregisterPushBody: Encodable {
  let siteId: String
  let sessionId: String
  let pushToken: String
}

private struct AnyEncodable: Encodable {
  private let encodeBlock: (Encoder) throws -> Void

  init(_ value: some Encodable) {
    encodeBlock = { encoder in
      try value.encode(to: encoder)
    }
  }

  func encode(to encoder: Encoder) throws {
    try encodeBlock(encoder)
  }
}
