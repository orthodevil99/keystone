"use client";

import { useEffect, useMemo, useState } from "react";
import { grantStatus, type Grant } from "@/lib/demo";
import { useKeystone } from "@/lib/store";
import { formatUSDC } from "@/lib/format";
import { KEYSTONE_ADDRESS } from "@/lib/arc";
import { fetchLiveGrants } from "@/lib/live";
import Reveal from "@/components/Reveal";
import GrantCard from "@/components/GrantCard";
import Stat from "@/components/Stat";

const FILTERS = ["all", "funded", "in-progress", "complete"] as const;

export default function GrantsPage() {
  const { grants } = useKeystone();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [liveGrants, setLiveGrants] = useState<Grant[] | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [mode, setMode] = useState<"live" | "demo">(KEYSTONE_ADDRESS ? "live" : "demo");

  useEffect(() => {
    if (!KEYSTONE_ADDRESS) return;
    setLiveLoading(true);
    fetchLiveGrants()
      .then(setLiveGrants)
      .catch(() => setLiveGrants([]))
      .finally(() => setLiveLoading(false));
  }, []);

  const activeGrants = mode === "live" ? liveGrants ?? [] : grants;
  const visible = useMemo(
    () => (filter === "all" ? activeGrants : activeGrants.filter((g) => grantStatus(g) === filter)),
    [activeGrants, filter]
  );

  const totalLocked = activeGrants.reduce((s, g) => s + (g.totalAmount - g.releasedAmount), 0n);
  const totalPaid = activeGrants.reduce((s, g) => s + g.releasedAmount, 0n);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <Reveal>
        <p className="eyebrow">Explore</p>
        <h1 className="display mt-4 max-w-3xl text-[44px] leading-[1.03] text-bone-100 sm:text-[64px]">
          Every grant, <em>stone by stone.</em>
        </h1>
        <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-bone-100/60">
          {mode === "live" && KEYSTONE_ADDRESS
            ? "Browse on-chain escrows on Keystone. Each card is a real funding commitment — locked USDC, defined milestones, public accountability."
            : "Explore simulated escrows and try every flow freely — no wallet needed. Nothing on this page touches the chain."}
        </p>
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-8 grid max-w-2xl grid-cols-3 gap-6 border-y rule py-6">
          <div>
            <Stat value={Number(totalLocked / 1_000_000n)} prefix="$" className="text-[22px] text-bone-100" />
            <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-bone-100/40">Locked now</p>
          </div>
          <div>
            <Stat value={Number(totalPaid / 1_000_000n)} prefix="$" className="text-[22px] text-bone-100" />
            <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-bone-100/40">Released</p>
          </div>
          <div>
            <Stat value={activeGrants.length} className="text-[22px] text-bone-100" />
            <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-bone-100/40">Grants</p>
          </div>
        </div>
      </Reveal>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        {KEYSTONE_ADDRESS && (
          <div className="mr-2 inline-flex rounded-full border rule bg-ink-900/60 p-1">
            {(["live", "demo"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-mono text-[11.5px] uppercase tracking-[0.12em] transition ${
                  mode === m ? "bg-brass-500 text-ink-950" : "text-bone-100/55 hover:text-bone-100"
                }`}
              >
                {m === "live" && (
                  <span className={`h-1.5 w-1.5 rounded-full ${mode === "live" ? "bg-ink-950" : "bg-emerald-400 animate-pulse"}`} />
                )}
                {m === "live" ? "Live on Arc" : "Demo"}
              </button>
            ))}
          </div>
        )}
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.12em] transition ${
              filter === f
                ? "bg-brass-500 text-ink-950"
                : "border rule text-bone-100/55 hover:border-brass-500/40 hover:text-bone-100"
            }`}
          >
            {f.replace("-", " ")}
          </button>
        ))}
      </div>

      {mode === "live" && KEYSTONE_ADDRESS && (
        <p className="mt-6 font-mono text-[11.5px] text-bone-100/40">
          {liveLoading
            ? "Reading contract…"
            : visible.length > 0
              ? `${visible.length} on-chain grant${visible.length === 1 ? "" : "s"} · read directly from Arc mainnet`
              : "No on-chain grants yet — be the first to fund one."}
        </p>
      )}
      {mode === "demo" && (
        <p className="mt-6 font-mono text-[11.5px] text-bone-100/40">
          Simulated escrows — explore the product freely, no wallet needed.
        </p>
      )}

      <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((g, i) => (
          <Reveal key={`${mode}-${g.id}`} delay={Math.min(i, 5) * 80}>
            <GrantCard grant={g} />
          </Reveal>
        ))}
      </div>

      {visible.length === 0 && !liveLoading && (
        <p className="mt-16 text-center font-mono text-[13px] text-bone-100/40">No grants in this state yet.</p>
      )}

      <p className="mt-10 text-center font-mono text-[11.5px] text-bone-100/35">
        {mode === "live" ? "Live on-chain escrows" : "Showing demo escrows"} · ${formatUSDC(totalLocked + totalPaid)} total committed
      </p>
    </div>
  );
}
