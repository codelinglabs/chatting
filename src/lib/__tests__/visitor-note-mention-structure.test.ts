import { buildVisitorNoteMentionResolution } from "@/lib/visitor-note-mention-structure";

function mentionRows() {
  return [
    {
      user_id: "user_sender",
      email: "sarah@example.com",
      notification_email: null,
      first_name: "Sarah",
      last_name: "Chen",
      email_notifications: true,
      mention_notifications: true
    },
    {
      user_id: "user_tina",
      email: "tina.bauer@example.com",
      notification_email: "tina@usechatting.com",
      first_name: "Tina",
      last_name: "Bauer",
      email_notifications: true,
      mention_notifications: true
    },
    {
      user_id: "user_tina_2",
      email: "tina.bauer+east@example.com",
      notification_email: null,
      first_name: "Tina",
      last_name: "Bauer",
      email_notifications: true,
      mention_notifications: true
    }
  ];
}

describe("visitor note mention structure", () => {
  it("stores exact identities for resolved handles and explicit ambiguity for legacy handles", () => {
    expect(
      buildVisitorNoteMentionResolution("@tina-bauer please pair with @tina", mentionRows(), "user_sender")
    ).toMatchObject({
      sent: ["tina-bauer"],
      ambiguous: ["tina"],
      mentions: [
        {
          rawHandle: "tina-bauer",
          status: "resolved",
          userId: "user_tina",
          canonicalHandle: "tina-bauer",
          displayName: "Tina Bauer"
        },
        {
          rawHandle: "tina",
          status: "ambiguous",
          userId: null,
          canonicalHandle: null,
          displayName: null
        }
      ]
    });
  });
});
