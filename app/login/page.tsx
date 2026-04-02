import { AuthForms } from "./auth-forms";

type LoginPageProps = {
  searchParams: Promise<{
    mode?: string;
    token?: string;
    invite?: string;
    email?: string;
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const initialMode = params.mode === "reset" ? "reset" : params.mode === "verify" ? "verify" : "signin";

  return (
    <AuthForms
      initialMode={initialMode}
      resetToken={params.token ?? ""}
      inviteId={params.invite ?? ""}
      inviteEmail={params.invite ? params.email ?? "" : ""}
      redirectTo={params.redirectTo ?? ""}
    />
  );
}
