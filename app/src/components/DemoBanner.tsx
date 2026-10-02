"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet";
import { KEYSTONE_ADDRESS } from "@/lib/arc";

/**
 * Honesty banner: shown whenever the app is not talking to the live
 * contract on Arc mainnet. Demo grants, balances and activity are
 * simulated so anyone can explore every flow instantly.
 */
export default function DemoBanner() {
  const { isConnected } = useWallet();
  const [dismissed, setDismissed] = useState(false);
  const live = isConnected && !!KEYSTONE_ADDRESS;

  if (live || dismissed) return null;

  return (
    <div className="border-b border-brass-500/25 bg-[#151310]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2.5 sm:px-8">
        <p className="font-mono text-[11.5px] leading-relaxed text-bone-100/70">
          <span className="mr-2.5 inline-block rounded-full bg-brass-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-950">
            Demo
          </span>
          All grants, balances and activity here are simulated — connect a browser wallet to use the live contract on
          Arc mainnet.
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-bone-100/40 transition hover:text-bone-100"
          aria-label="Dismiss demo notice"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
