import Foundation

struct ChattingEventStreamDecoder {
  private let decoder = JSONDecoder()
  private var eventName: String?
  private var dataLines: [String] = []

  mutating func consume(line: String) throws -> ChattingLiveEvent? {
    if line.isEmpty {
      defer {
        eventName = nil
        dataLines.removeAll(keepingCapacity: true)
      }

      guard !dataLines.isEmpty, eventName != "ping" else {
        return nil
      }

      guard let data = dataLines.joined(separator: "\n").data(using: .utf8) else {
        throw ChattingClientError.invalidEventPayload
      }

      return try decoder.decode(ChattingLiveEvent.self, from: data)
    }

    if line.hasPrefix("event:") {
      eventName = String(line.dropFirst(6)).trimmingCharacters(in: .whitespaces)
    }

    if line.hasPrefix("data:") {
      dataLines.append(String(line.dropFirst(5)).trimmingCharacters(in: .whitespaces))
    }

    return nil
  }
}
