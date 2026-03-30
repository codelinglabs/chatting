const mocks = vi.hoisted(() => ({
  simpleParser: vi.fn()
}));

vi.mock("mailparser", () => ({
  simpleParser: mocks.simpleParser
}));

import { parseSesInboundReply } from "@/lib/ses-inbound";

describe("ses inbound reply parsing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ignores non-received SES notifications", async () => {
    await expect(parseSesInboundReply(JSON.stringify({ notificationType: "Bounce" }))).resolves.toEqual({
      ignored: true
    });
  });

  it("extracts the conversation id, sender email, and trimmed reply body", async () => {
    mocks.simpleParser.mockResolvedValueOnce({
      text: "Thanks for the help\n\nOn Tue, Alex wrote:\n> previous thread",
      from: { value: [{ address: "alex@example.com" }] },
      to: null,
      cc: null,
      replyTo: null
    });

    const result = await parseSesInboundReply(
      JSON.stringify({
        notificationType: "Received",
        content: "raw message",
        mail: {
          source: "Alex <alex@example.com>",
          destination: ["reply+abc123-456@reply.chatting.test"]
        }
      })
    );

    expect(result).toEqual({
      ignored: false,
      conversationId: "abc123-456",
      senderEmail: "alex@example.com",
      body: "Thanks for the help"
    });
  });

  it("falls back to stripped HTML when plain text is missing", async () => {
    mocks.simpleParser.mockResolvedValueOnce({
      text: "",
      html: "<p>Hello there</p><p>Second line</p>",
      from: { value: [] },
      to: { value: [{ address: "reply+abc123-456@reply.chatting.test" }] },
      cc: null,
      replyTo: null
    });

    const result = await parseSesInboundReply(
      JSON.stringify({
        notificationType: "Received",
        content: "raw message",
        mail: { source: "alex@example.com", destination: [] }
      })
    );

    expect(result).toEqual({
      ignored: false,
      conversationId: "abc123-456",
      senderEmail: "alex@example.com",
      body: "Hello there\n\nSecond line"
    });
  });

  it("throws when the alias or reply body cannot be found", async () => {
    mocks.simpleParser.mockResolvedValueOnce({ text: "Hello", from: { value: [] }, to: null, cc: null, replyTo: null });

    await expect(
      parseSesInboundReply(JSON.stringify({ notificationType: "Received", content: "raw", mail: { destination: [] } }))
    ).rejects.toThrow("No conversation alias found.");

    mocks.simpleParser.mockResolvedValueOnce({
      text: "> quoted only",
      from: { value: [] },
      to: { value: [{ address: "reply+abc123-456@reply.chatting.test" }] },
      cc: null,
      replyTo: null
    });

    await expect(
      parseSesInboundReply(JSON.stringify({ notificationType: "Received", content: "raw", mail: { destination: [] } }))
    ).rejects.toThrow("Unable to extract reply body from inbound email.");
  });
});
