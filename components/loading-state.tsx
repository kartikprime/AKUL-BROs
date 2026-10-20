export function LoadingState({ label = "LOADING" }: { label?: string }) {
  return (
    <div className="card px-4 py-8 text-center">
      <p className="label-text">{label}...</p>
    </div>
  );
}
