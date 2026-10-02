"use client";

import { useKeystone } from "@/lib/store";
import { explorerTx } from "@/lib/arc";

export default function Toasts() {
  const { toasts, dismissToast } = useKeystone();
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex w-[min(92vw,380px)] flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-in card rounded-2xl p-4 shadow-2xl"
          style={{ borderColor: t.kind === "success" ? "rgba(78,154,95,0.4)" : t.kind === "warn" ? "rgba(223,175,94,0.4)" : "rgba(244,241,232,0.14)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{
                    background: t.kind === "success" ? "#4E9A5F" : t.kind === "warn" ? "#DFAF5E" : "#7FB6D9",
                  }}
                />
                <p className="text-sm font-semibold text-bone-100">{t.title}</p>
              </div>
              {t.body && <p className="mt-1 text-[13px] leading-relaxed text-bone-100/60">{t.body}</p>}
              {t.tx && (
                <a
                  href={explorerTx(t.tx)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-block font-mono text-[11px] text-brass-400 hover:underline"
                >
                  View on Arc Explorer ↗
                </a>
              )}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-bone-100/40 transition hover:text-bone-100"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
