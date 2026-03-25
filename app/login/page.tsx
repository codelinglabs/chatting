import { AuthForms } from "./auth-forms";

export default function LoginPage() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="glass-panel rounded-[2rem] p-8 shadow-glow">
          <p className="text-sm uppercase tracking-[0.28em] text-tide">Chatly SaaS</p>
          <h1 className="display-font mt-3 max-w-3xl text-4xl leading-tight text-ink sm:text-5xl">
            Create an account, get a site ID, and embed the widget on your product.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            Each account owns its own sites, inbox, replies, and insights. Visitors still use the
            widget without login.
          </p>
        </div>

        <AuthForms />
      </div>
    </main>
  );
}
