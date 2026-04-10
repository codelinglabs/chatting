import Foundation

public struct ChattingAttachmentUpload: Equatable, Sendable, Identifiable {
  public let id: String
  public let fileName: String
  public let contentType: String
  public let data: Data

  public init(
    id: String = UUID().uuidString.lowercased(),
    fileName: String,
    contentType: String,
    data: Data
  ) {
    self.id = id
    self.fileName = fileName
    self.contentType = contentType
    self.data = data
  }
}
