const imageResponseMock = vi.hoisted(() => vi.fn());

vi.mock("next/og", () => ({
  ImageResponse: class extends Response {
    constructor(element: unknown, init?: Record<string, unknown>) {
      imageResponseMock(element, init);

      super("png", {
        status: 200,
        headers: {
          "content-type": "image/png",
          ...(typeof init?.headers === "object" && init.headers ? (init.headers as Record<string, string>) : {})
        }
      });
    }
  }
}));

vi.mock("@/lib/route-error-alerting", () => ({
  withRouteErrorAlerting: <T extends (...args: unknown[]) => unknown>(handler: T) => handler
}));

import { GET } from "./route";

describe("app/api/og", () => {
  beforeEach(() => {
    imageResponseMock.mockClear();
  });

  it("returns a cacheable image response without embedded fonts", async () => {
    const response = await GET(new Request("https://chatting.test/api/og?template=a&title=Hello") as never);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("cache-control")).toContain("s-maxage=86400");

    expect(imageResponseMock).toHaveBeenCalledTimes(1);
    expect(imageResponseMock.mock.calls[0]?.[1]).toMatchObject({
      width: 1200,
      height: 630
    });
    expect(imageResponseMock.mock.calls[0]?.[1]?.fonts).toBeUndefined();
  });
});
