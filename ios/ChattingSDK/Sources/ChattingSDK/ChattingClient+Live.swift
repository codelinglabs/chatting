import Foundation

public extension ChattingClient {
  func liveEvents() -> AsyncThrowingStream<ChattingLiveEvent, Error> {
    liveEventStream()
  }
}
