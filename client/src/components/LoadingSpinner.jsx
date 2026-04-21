export default function LoadingSpinner({ size = "md", message = "Loading…" }) {
  const sizes = {
    sm: "w-5 h-5 border-2",
    md: "w-10 h-10 border-[3px]",
    lg: "w-16 h-16 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${sizes[size]} rounded-full border-stone-200 border-t-amber-500 animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {message && <p className="text-sm text-stone-400 font-medium">{message}</p>}
    </div>
  );
}
