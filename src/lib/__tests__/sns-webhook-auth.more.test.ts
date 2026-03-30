const mocks = vi.hoisted(() => ({
  createVerify: vi.fn(),
  getSesInboundTopicArnSet: vi.fn()
}));

vi.mock("node:crypto", () => ({ createVerify: mocks.createVerify }));
vi.mock("@/lib/env.server", () => ({ getSesInboundTopicArnSet: mocks.getSesInboundTopicArnSet }));

import { verifySnsWebhookPayload } from "@/lib/sns-webhook-auth";

const verify = vi.fn();

function payload(overrides: Record<string, unknown> = {}) {
  return {
    Type: "SubscriptionConfirmation",
    MessageId: "msg_1",
    TopicArn: "arn:aws:sns:eu-west-1:123456789012:ses-inbound",
    Message: '{"ok":true}',
    Timestamp: "2026-03-29T12:00:00.000Z",
    Token: "token_123",
    SubscribeURL: "https://sns.eu-west-1.amazonaws.com/confirm",
    SignatureVersion: "2",
    Signature: Buffer.from("sig").toString("base64"),
    SigningCertURL: "https://sns.eu-west-1.amazonaws.com/SimpleNotificationService-test.pem",
    ...overrides
  };
}

describe("sns webhook auth more", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verify.mockReset();
    verify.mockReturnValue(true);
    mocks.createVerify.mockReturnValue({ update: vi.fn(), end: vi.fn(), verify });
    mocks.getSesInboundTopicArnSet.mockReturnValue(new Set());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("verifies subscription confirmations with signature version 2 and reuses the cert cache", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "-----BEGIN CERTIFICATE-----\nabc\n-----END CERTIFICATE-----"
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(verifySnsWebhookPayload(payload())).resolves.toMatchObject({ ok: true });
    await expect(verifySnsWebhookPayload(payload())).resolves.toMatchObject({ ok: true });

    expect(mocks.createVerify).toHaveBeenCalledWith("RSA-SHA256");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("rejects envelopes with missing required fields or unknown signature versions", async () => {
    vi.stubGlobal("fetch", vi.fn());

    await expect(verifySnsWebhookPayload(payload({ Message: "" }))).resolves.toEqual({
      ok: false,
      status: 400,
      error: "Invalid SNS payload."
    });

    await expect(verifySnsWebhookPayload(payload({ SignatureVersion: "9" }))).resolves.toEqual({
      ok: false,
      status: 401,
      error: "Unauthorized webhook."
    });
  });

  it("rejects missing or invalid signing cert responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: true, text: async () => "not a cert" })
    );

    await expect(verifySnsWebhookPayload(payload({ SigningCertURL: "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-a.pem" }))).resolves.toEqual({
      ok: false,
      status: 401,
      error: "Unauthorized webhook."
    });
    await expect(verifySnsWebhookPayload(payload({ SigningCertURL: "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-b.pem" }))).resolves.toEqual({
      ok: false,
      status: 401,
      error: "Unauthorized webhook."
    });
  });
});
