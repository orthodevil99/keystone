"use client";

import { useMemo, useState } from "react";
import { grantStatus } from "@/lib/demo";
import { useKeystone } from "@/lib/store";
import { formatUSDC } from "@/lib/format";
import Reveal from "@/components/Reveal";
import GrantCard from "@/components/GrantCard";
import Stat from "@/components/Stat";

const FILTERS = ["all", "funded", "in-progress", "complete"] as const;

export default function GrantsPage() {
  const { grants } = useKeystone();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  const visible = useMemo(
    () => (filter === "all" ? grants : grants.filter((g) => grantStatus(g) === filter)),
    [grants, filter]
  );

  const totalLocked = grants.reduce((s, g) => s + (g.totalAmount - g.releasedAmount), 0n);
  const totalPaid = grants.reduce((s, g) => s + g.releasedAmount, 0n);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <Reveal>
        <p className="eyebrow">Explore</p>
        <h1 className="display mt-4 max-w-3xl text-[44px] leading-[1.03] text-bone-100 sm:text-[64px]">
          Every grant, <em>stone by stone.</em>
        </h1>
        <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-bone-100/60">
          Browse live escrows on Keystone. Each card is a real funding commitment — locked USDC, defined milestones,
          public accountability.
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
            <Stat value={grants.length} className="text-[22px] text-bone-100" />
            <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-bone-100/40">Grants</p>
          </div>
        </div>
      </Reveal>

      <div className="mt-8 flex flex-wrap gap-2">
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

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((g, i) => (
          <Reveal key={g.id} delay={Math.min(i, 5) * 80}>
            <GrantCard grant={g} />
          </Reveal>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-16 text-center font-mono text-[13px] text-bone-100/40">No grants in this state yet.</p>
      )}

      <p className="mt-10 text-center font-mono text-[11.5px] text-bone-100/35">
        Showing demo escrows · ${formatUSDC(totalLocked + totalPaid)} total committed
      </p>
    </div>
  );
}
