import SwiftUI

#if canImport(AppKit)
import AppKit
#elseif canImport(UIKit)
import UIKit
#endif

extension Color {
  static var chattingCanvas: Color {
    #if canImport(AppKit)
    Color(nsColor: .windowBackgroundColor)
    #elseif canImport(UIKit)
    Color(uiColor: .systemBackground)
    #else
    Color.white
    #endif
  }

  static var chattingSurface: Color {
    #if canImport(AppKit)
    Color(nsColor: .controlBackgroundColor)
    #elseif canImport(UIKit)
    Color(uiColor: .secondarySystemBackground)
    #else
    Color(.sRGB, red: 0.95, green: 0.96, blue: 0.98, opacity: 1)
    #endif
  }

  static var chattingVisitorBubble: Color {
    Color(red: 37.0 / 255.0, green: 99.0 / 255.0, blue: 235.0 / 255.0)
  }
}
