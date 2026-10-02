"use client";

export default function Modal({
  open,
  onClose,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fade-in fixed inset-0 z-[95] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className={`modal-in relative card w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-3xl p-6 sm:p-8`}>
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-bone-100/40 transition hover:text-bone-100"
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
