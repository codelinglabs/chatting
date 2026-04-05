const mocks = vi.hoisted(() => ({
  getWorkspaceAccess: vi.fn(),
  hasConversationAccess: vi.fn(),
  hasWorkspaceMemberRecord: vi.fn(),
  updateConversationAssignmentRecord: vi.fn()
}));

vi.mock("@/lib/workspace-access", () => ({
  getWorkspaceAccess: mocks.getWorkspaceAccess
}));

vi.mock("@/lib/data/shared", () => ({
  hasConversationAccess: mocks.hasConversationAccess
}));

vi.mock("@/lib/repositories/workspace-repository", () => ({
  hasWorkspaceMemberRecord: mocks.hasWorkspaceMemberRecord
}));

vi.mock("@/lib/repositories/conversations-repository", () => ({
  updateConversationAssignmentRecord: mocks.updateConversationAssignmentRecord
}));

import { updateConversationAssignment } from "@/lib/data/conversation-assignment";

describe("conversation assignment data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1" });
    mocks.hasConversationAccess.mockResolvedValue(true);
    mocks.hasWorkspaceMemberRecord.mockResolvedValue(true);
    mocks.updateConversationAssignmentRecord.mockResolvedValue("member_1");
  });

  it("returns null when the user cannot access the conversation", async () => {
    mocks.hasConversationAccess.mockResolvedValueOnce(false);

    await expect(updateConversationAssignment("conv_1", "member_1", "user_1")).resolves.toBeNull();
  });

  it("rejects assignees outside the active workspace", async () => {
    mocks.hasWorkspaceMemberRecord.mockResolvedValueOnce(false);

    await expect(updateConversationAssignment("conv_1", "outsider", "user_1")).rejects.toThrow(
      "INVALID_ASSIGNEE"
    );
  });

  it("assigns valid teammates and normalizes unassign requests", async () => {
    await expect(updateConversationAssignment("conv_1", " member_1 ", "user_1")).resolves.toEqual({
      assignedUserId: "member_1"
    });

    mocks.updateConversationAssignmentRecord.mockResolvedValueOnce(null);
    await expect(updateConversationAssignment("conv_1", "   ", "user_1")).resolves.toEqual({
      assignedUserId: null
    });

    expect(mocks.updateConversationAssignmentRecord).toHaveBeenNthCalledWith(1, {
      conversationId: "conv_1",
      ownerUserId: "owner_1",
      assignedUserId: "member_1"
    });
    expect(mocks.updateConversationAssignmentRecord).toHaveBeenNthCalledWith(2, {
      conversationId: "conv_1",
      ownerUserId: "owner_1",
      assignedUserId: null
    });
  });
});
