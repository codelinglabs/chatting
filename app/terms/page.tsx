export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Legal</p>
        <h1 className="display-font mt-4 text-5xl text-slate-900">Terms of Service</h1>
        <div className="mt-8 space-y-5 text-[15px] leading-8 text-slate-600">
          <p>
            By using Chatting, you agree to use the product responsibly, keep your account secure, and comply with
            applicable laws in the places where you operate.
          </p>
          <p>
            Chatting is provided for teams who want to talk with visitors in real time. We may update these terms as the
            product evolves, and continued use after an update means you accept the revised terms.
          </p>
          <p>
            Questions about these terms can be sent to your Chatting workspace email or your usual support contact.
          </p>
        </div>
      </div>
    </main>
  );
}
