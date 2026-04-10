const mocks = vi.hoisted(() => ({
  listConversationMobilePushTokensRow: vi.fn(),
  disableMobilePushTokensRow: vi.fn()
}));

vi.mock("@/lib/repositories/mobile-push-repository", () => ({
  listConversationMobilePushTokensRow: mocks.listConversationMobilePushTokensRow,
  disableMobilePushTokensRow: mocks.disableMobilePushTokensRow
}));

import { sendConversationMobilePushNotifications } from "@/lib/expo-push";

describe("expo push delivery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listConversationMobilePushTokensRow.mockResolvedValue([
      "ExponentPushToken[first]",
      "ExponentPushToken[second]"
    ]);
  });

  it("sends push payloads and disables invalid device tokens", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [{ status: "ok" }, { status: "error", details: { error: "DeviceNotRegistered" } }]
        }),
        { status: 200 }
      )
    );

    const result = await sendConversationMobilePushNotifications({
      ownerUserId: "owner_1",
      conversationId: "conv_1",
      content: "We can help with billing.",
      attachmentsCount: 0
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://exp.host/--/api/v2/push/send",
      expect.objectContaining({ method: "POST" })
    );
    expect(mocks.disableMobilePushTokensRow).toHaveBeenCalledWith(["ExponentPushToken[second]"]);
    expect(result).toEqual({ sent: 1, disabled: 1 });
    fetchMock.mockRestore();
  });

  it("skips delivery when no tokens are registered", async () => {
    mocks.listConversationMobilePushTokensRow.mockResolvedValueOnce([]);

    await expect(
      sendConversationMobilePushNotifications({
        ownerUserId: "owner_1",
        conversationId: "conv_1",
        content: "Hello",
        attachmentsCount: 0
      })
    ).resolves.toEqual({ sent: 0, disabled: 0 });
  });
});
