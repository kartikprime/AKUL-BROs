export function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-[14px] border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-[13px] font-semibold text-[var(--color-negative)]"
    >
      {message}
    </div>
  );
}
