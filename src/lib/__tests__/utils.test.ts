import {
  classNames,
  escapeHtml,
  formatFileSize,
  optionalText,
  truncate
} from "@/lib/utils";

describe("utils", () => {
  it("truncates text with an ellipsis", () => {
    expect(truncate("short", 10)).toBe("short");
    expect(truncate("This is long", 8)).toBe("This is…");
  });

  it("joins class names safely", () => {
    expect(classNames("a", false, "b", null, undefined, "c")).toBe("a b c");
  });

  it("formats file sizes", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(1024)).toBe("1.0 KB");
    expect(formatFileSize(10 * 1024 * 1024)).toBe("10 MB");
  });

  it("normalizes optional text", () => {
    expect(optionalText(" hello ")).toBe("hello");
    expect(optionalText("   ")).toBeNull();
    expect(optionalText(undefined)).toBeNull();
  });

  it("escapes html", () => {
    expect(escapeHtml(`<div class="x">'&"</div>`)).toBe(
      "&lt;div class=&quot;x&quot;&gt;&#39;&amp;&quot;&lt;/div&gt;"
    );
  });
});
