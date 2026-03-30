const mocks = vi.hoisted(() => ({
  createVerify: vi.fn(),
  getSesInboundTopicArnSet: vi.fn()
}));

vi.mock("node:crypto", () => ({
  createVerify: mocks.createVerify
}));

vi.mock("@/lib/env.server", () => ({
  getSesInboundTopicArnSet: mocks.getSesInboundTopicArnSet
}));

import { verifySnsWebhookPayload } from "@/lib/sns-webhook-auth";

const verify = vi.fn();

function payload(overrides: Record<string, unknown> = {}) {
  return {
    Type: "Notification",
    MessageId: "msg_1",
    TopicArn: "arn:aws:sns:eu-west-1:123456789012:ses-inbound",
    Subject: "SES inbound",
    Message: '{"ok":true}',
    Timestamp: "2026-03-29T12:00:00.000Z",
    SignatureVersion: "1",
    Signature: Buffer.from("sig").toString("base64"),
    SigningCertURL: "https://sns.eu-west-1.amazonaws.com/SimpleNotificationService-test.pem",
    ...overrides
  };
}

describe("sns webhook auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verify.mockReset();
    verify.mockReturnValue(true);
    mocks.createVerify.mockReturnValue({ update: vi.fn(), end: vi.fn(), verify });
    mocks.getSesInboundTopicArnSet.mockReturnValue(new Set(["arn:aws:sns:eu-west-1:123456789012:ses-inbound"]));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "-----BEGIN CERTIFICATE-----\nabc\n-----END CERTIFICATE-----"
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects invalid payloads", async () => {
    await expect(verifySnsWebhookPayload({ nope: true })).resolves.toEqual({
      ok: false,
      status: 400,
      error: "Invalid SNS payload."
    });
  });

  it("rejects untrusted certificates or topic arns", async () => {
    await expect(verifySnsWebhookPayload(payload({ TopicArn: "arn:other" }))).resolves.toEqual({
      ok: false,
      status: 401,
      error: "Unauthorized webhook."
    });
    await expect(
      verifySnsWebhookPayload(payload({ SigningCertURL: "https://example.com/not-aws.pem" }))
    ).resolves.toEqual({
      ok: false,
      status: 401,
      error: "Unauthorized webhook."
    });
  });

  it("verifies a valid SNS notification envelope", async () => {
    const result = await verifySnsWebhookPayload(payload());

    expect(mocks.createVerify).toHaveBeenCalledWith("RSA-SHA1");
    expect(result).toEqual({
      ok: true,
      envelope: expect.objectContaining({
        Type: "Notification",
        TopicArn: "arn:aws:sns:eu-west-1:123456789012:ses-inbound"
      })
    });
  });

  it("rejects envelopes with an invalid signature", async () => {
    verify.mockReturnValueOnce(false);

    await expect(verifySnsWebhookPayload(payload())).resolves.toEqual({
      ok: false,
      status: 401,
      error: "Unauthorized webhook."
    });
  });
});
