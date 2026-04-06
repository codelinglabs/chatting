import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDashboardShellData } from "@/lib/data/dashboard-shell-data";
import { getUserOnboardingStep } from "@/lib/data";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  const onboardingStep = await getUserOnboardingStep(user.id);

  if (onboardingStep !== "done") {
    redirect(`/onboarding?step=${onboardingStep}`);
  }

  const shellData = await getDashboardShellData({
    userId: user.id,
    ownerUserId: user.workspaceOwnerId,
    workspaceRole: user.workspaceRole
  });

  return (
    <DashboardShell
      userEmail={user.email}
      unreadCount={shellData.unreadCount}
      notificationSettings={shellData.notificationSettings}
      aiAssistWarning={shellData.aiAssistWarning}
      canManageBilling={shellData.canManageBilling}
    >
      {children}
    </DashboardShell>
  );
}
