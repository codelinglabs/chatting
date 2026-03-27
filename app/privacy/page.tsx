export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Legal</p>
        <h1 className="display-font mt-4 text-5xl text-slate-900">Privacy Policy</h1>
        <div className="mt-8 space-y-5 text-[15px] leading-8 text-slate-600">
          <p>
            Chatting stores the account, conversation, and site information needed to run live chat, power the inbox,
            and help teams respond to visitors quickly.
          </p>
          <p>
            We only use personal and visitor data to operate the service, improve reliability, and deliver the
            product features you enable, such as notifications, transcripts, and widget verification.
          </p>
          <p>
            If you need help with data access, removal, or privacy questions, contact your Chatting workspace owner or
            your usual support contact.
          </p>
        </div>
      </div>
    </main>
  );
}
