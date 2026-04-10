import Foundation

struct ChattingMultipartFile {
  let fieldName: String
  let fileName: String
  let contentType: String
  let data: Data
}

struct ChattingMultipartFormData {
  let fields: [(String, String)]
  let files: [ChattingMultipartFile]

  func encoded() -> (contentType: String, body: Data) {
    let boundary = "chatting-\(UUID().uuidString.lowercased())"
    var body = Data()

    for (name, value) in fields {
      append("--\(boundary)\r\n", to: &body)
      append("Content-Disposition: form-data; name=\"\(name)\"\r\n\r\n", to: &body)
      append("\(value)\r\n", to: &body)
    }

    for file in files {
      append("--\(boundary)\r\n", to: &body)
      append(
        "Content-Disposition: form-data; name=\"\(file.fieldName)\"; filename=\"\(file.fileName)\"\r\n",
        to: &body
      )
      append("Content-Type: \(file.contentType)\r\n\r\n", to: &body)
      body.append(file.data)
      append("\r\n", to: &body)
    }

    append("--\(boundary)--\r\n", to: &body)
    return ("multipart/form-data; boundary=\(boundary)", body)
  }

  private func append(_ string: String, to data: inout Data) {
    data.append(Data(string.utf8))
  }
}
