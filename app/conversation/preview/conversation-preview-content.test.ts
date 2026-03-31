import {
  buildConversationPreviewContent,
  buildConversationPreviewIdentityFromSearchParams
} from "./conversation-preview-content";

describe("conversation preview content", () => {
  it("builds the default preview thread", () => {
    const preview = buildConversationPreviewContent({
      companyName: "Chatting",
      teamName: "Chatting Team",
      agentName: "Tina"
    });

    expect(preview.teamName).toBe("Chatting Team");
    expect(preview.agentName).toBe("Tina");
    expect(preview.initialMessages).toHaveLength(3);
    expect(preview.initialMessages[0]).toMatchObject({
      id: "preview-1",
      sender: "user"
    });
    expect(preview.initialMessages[1]).toMatchObject({
      id: "preview-2",
      sender: "team"
    });
  });

  it("reads preview identity overrides from query params", () => {
    const identity = buildConversationPreviewIdentityFromSearchParams({
      company: "Acme",
      team: "Acme Support",
      agent: "Sarah"
    });
    const preview = buildConversationPreviewContent(identity);

    expect(identity.teamName).toBe("Acme Support");
    expect(preview.widgetTitle).toBe("Acme Support");
    expect(identity.agentName).toBe("Sarah");
  });
});
