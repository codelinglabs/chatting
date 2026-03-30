import { AuthForms } from "./auth-forms";

type LoginPageProps = {
  searchParams: Promise<{
    invite?: string;
    email?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return <AuthForms inviteId={params.invite ?? ""} inviteEmail={params.email ?? ""} />;
}
