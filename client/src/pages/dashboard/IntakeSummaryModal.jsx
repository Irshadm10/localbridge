import { X } from 'lucide-react';

export default function IntakeSummaryModal({ open, onClose, summary, menteeName }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[var(--bridge-surface)] shadow-2xl ring-1 ring-[var(--bridge-border)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--bridge-border)] px-6 py-4">
          <div>
            <h2 className="font-display text-base font-bold text-[var(--bridge-text)]">
              Pre-Session Intake Notes
            </h2>
            {menteeName && (
              <p className="mt-0.5 text-xs text-[var(--bridge-text-muted)]">{menteeName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-[var(--bridge-text-muted)] transition hover:bg-[var(--bridge-surface-muted)] hover:text-[var(--bridge-text)]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: '60vh' }}>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--bridge-text-secondary)]">
            {summary}
          </pre>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--bridge-border)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[var(--bridge-surface-muted)] px-5 py-2 text-sm font-semibold text-[var(--bridge-text-secondary)] transition hover:bg-[var(--bridge-border)] hover:text-[var(--bridge-text)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
