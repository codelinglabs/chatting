import SwiftUI

#if SWIFT_PACKAGE
import ChattingSDK
#endif

extension ChattingConversationView {
  var pendingAttachmentsBar: some View {
    Group {
      if viewModel.pendingAttachments.isEmpty {
        EmptyView()
      } else {
        ScrollView(.horizontal, showsIndicators: false) {
          HStack(spacing: 8) {
            ForEach(viewModel.pendingAttachments) { attachment in
              HStack(spacing: 6) {
                Text(attachment.fileName)
                  .lineLimit(1)
                Button {
                  viewModel.removePendingAttachment(id: attachment.id)
                } label: {
                  Image(systemName: "xmark.circle.fill")
                }
                .buttonStyle(.plain)
              }
              .font(.caption)
              .padding(.horizontal, 10)
              .padding(.vertical, 8)
              .background(Color.chattingSurface)
              .clipShape(Capsule())
            }
          }
          .padding(.horizontal)
          .padding(.bottom, 8)
        }
      }
    }
  }

  func bubble(for message: ChattingMessage, fill: Color, text: Color) -> some View {
    VStack(alignment: .leading, spacing: 6) {
      Text(message.content.isEmpty ? "(attachment placeholder)" : message.content)
        .foregroundStyle(text)
      if !message.attachments.isEmpty {
        Text("\(message.attachments.count) attachment\(message.attachments.count == 1 ? "" : "s")")
          .font(.caption)
          .foregroundStyle(text.opacity(0.85))
      }
    }
    .font(.body)
    .padding(.horizontal, 14)
    .padding(.vertical, 10)
    .background(fill)
    .clipShape(RoundedRectangle(cornerRadius: 18))
  }
}
