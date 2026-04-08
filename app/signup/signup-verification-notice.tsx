type SignupVerificationNoticeProps = {
  onEdit: () => void;
};

export function SignupVerificationNotice({ onEdit }: SignupVerificationNoticeProps) {
  return (
    <div className="mt-8 text-center">
      <p className="text-sm leading-6 text-slate-500">
        Wrong email?{" "}
        <button
          type="button"
          onClick={onEdit}
          className="font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Edit it
        </button>{" "}
        and send a new link.
      </p>
    </div>
  );
}
