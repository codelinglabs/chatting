import Foundation

public protocol ChattingSessionStore: AnyObject {
  func loadState() -> ChattingSessionState?
  func saveState(_ state: ChattingSessionState)
  func clearState()
}

public final class UserDefaultsChattingSessionStore: ChattingSessionStore {
  private let key: String
  private let userDefaults: UserDefaults
  private let encoder = JSONEncoder()
  private let decoder = JSONDecoder()
  private let lock = NSLock()

  public init(namespace: String, userDefaults: UserDefaults = .standard) {
    key = "chatting.ios.\(namespace).session"
    self.userDefaults = userDefaults
  }

  public func loadState() -> ChattingSessionState? {
    lock.lock()
    defer { lock.unlock() }

    guard let data = userDefaults.data(forKey: key) else {
      return nil
    }

    return try? decoder.decode(ChattingSessionState.self, from: data)
  }

  public func saveState(_ state: ChattingSessionState) {
    lock.lock()
    defer { lock.unlock() }

    guard let data = try? encoder.encode(state) else {
      return
    }

    userDefaults.set(data, forKey: key)
  }

  public func clearState() {
    lock.lock()
    defer { lock.unlock() }
    userDefaults.removeObject(forKey: key)
  }
}
