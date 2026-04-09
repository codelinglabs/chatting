import Foundation

struct ChattingTransport {
  let baseURL: URL
  let urlSession: URLSession
  let decoder = JSONDecoder()
  let encoder = JSONEncoder()

  func get<Response: Decodable>(path: String, queryItems: [URLQueryItem]) async throws -> Response {
    let request = try request(path: path, method: "GET", queryItems: queryItems)
    return try await send(request, as: Response.self)
  }

  func post<RequestBody: Encodable, Response: Decodable>(
    path: String,
    body: RequestBody
  ) async throws -> Response {
    var request = try request(path: path, method: "POST", queryItems: [])
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try encoder.encode(body)
    return try await send(request, as: Response.self)
  }

  func openEventStream(path: String, queryItems: [URLQueryItem]) async throws -> URLSession.AsyncBytes {
    let request = try request(path: path, method: "GET", queryItems: queryItems)
    let (bytes, response) = try await urlSession.bytes(for: request)
    try validate(response: response)
    return bytes
  }

  private func send<Response: Decodable>(
    _ request: URLRequest,
    as responseType: Response.Type
  ) async throws -> Response {
    let (data, response) = try await urlSession.data(for: request)
    try validate(response: response, data: data)
    return try decoder.decode(responseType, from: data)
  }

  private func request(path: String, method: String, queryItems: [URLQueryItem]) throws -> URLRequest {
    guard let relativeURL = URL(string: path, relativeTo: baseURL) else {
      throw ChattingClientError.invalidBaseURL
    }

    guard var components = URLComponents(url: relativeURL, resolvingAgainstBaseURL: true) else {
      throw ChattingClientError.invalidBaseURL
    }

    components.queryItems = queryItems.isEmpty ? nil : queryItems

    guard let url = components.url else {
      throw ChattingClientError.invalidBaseURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = method
    request.setValue("application/json", forHTTPHeaderField: "Accept")
    return request
  }

  private func validate(response: URLResponse, data: Data? = nil) throws {
    guard let httpResponse = response as? HTTPURLResponse else {
      throw ChattingClientError.invalidResponse(statusCode: -1, message: "The Chatting server response was invalid.")
    }

    guard (200 ... 299).contains(httpResponse.statusCode) else {
      let message = data
        .flatMap { try? decoder.decode(ChattingAPIErrorResponse.self, from: $0).error }
        ?? HTTPURLResponse.localizedString(forStatusCode: httpResponse.statusCode)
      throw ChattingClientError.invalidResponse(statusCode: httpResponse.statusCode, message: message)
    }
  }
}

struct ChattingAPIErrorResponse: Decodable {
  let error: String
}

struct ChattingSiteConfigResponse: Decodable {
  let site: ChattingSiteConfig
}

struct ChattingSiteStatusResponse: Decodable {
  let online: Bool
  let lastSeenAt: String?
}

struct ChattingOperationResponse: Decodable {
  let ok: Bool
}
