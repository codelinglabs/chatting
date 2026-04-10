import Foundation
import UniformTypeIdentifiers

#if SWIFT_PACKAGE
import ChattingSDK
#endif

@MainActor
extension ChattingConversationViewModel {
  public func removePendingAttachment(id: String) {
    pendingAttachments.removeAll { $0.id == id }
  }

  public func importAttachments(_ result: Result<[URL], Error>) {
    switch result {
    case let .success(urls):
      Task { await loadAttachments(urls) }
    case let .failure(error):
      errorMessage = error.localizedDescription
    }
  }

  private func loadAttachments(_ urls: [URL]) async {
    do {
      var nextAttachments = pendingAttachments

      for url in urls {
        if nextAttachments.count >= 3 {
          throw ChattingClientError.attachmentLimitExceeded
        }

        let didAccessSecurityScopedResource = url.startAccessingSecurityScopedResource()
        defer {
          if didAccessSecurityScopedResource {
            url.stopAccessingSecurityScopedResource()
          }
        }

        let fileData = try Data(contentsOf: url)
        if fileData.count > 4 * 1024 * 1024 {
          throw ChattingClientError.attachmentTooLarge
        }

        let resourceValues = try url.resourceValues(forKeys: [.contentTypeKey, .nameKey])
        nextAttachments.append(
          ChattingAttachmentUpload(
            fileName: resourceValues.name ?? url.lastPathComponent,
            contentType: resourceValues.contentType?.preferredMIMEType ?? "application/octet-stream",
            data: fileData
          )
        )
      }

      pendingAttachments = nextAttachments
    } catch {
      errorMessage = error.localizedDescription
    }
  }
}
