import { renderToStaticMarkup } from "react-dom/server";
import { ContactConversationsTab } from "./dashboard-contact-conversations-tab";

describe("dashboard contact conversations tab", () => {
  it("shows the conversation list in the dedicated tab", () => {
    const html = renderToStaticMarkup(
      <ContactConversationsTab
        conversations={[
          {
            id: "conv_1",
            title: "Question about enterprise pricing",
            status: "open",
            createdAt: "2026-04-05T10:00:00.000Z",
            assignedUserId: null,
            messageCount: 4
          }
        ]}
        loading={false}
        onNavigateConversation={vi.fn()}
      />
    );

    expect(html).toContain("Question about enterprise pricing");
    expect(html).toContain("Conversations");
    expect(html).not.toContain("Custom fields");
  });
});
