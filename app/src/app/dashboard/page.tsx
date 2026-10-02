"use client";

import Link from "next/link";
import { Grant, grantProgress } from "@/lib/demo";
import { formatUSDC, shortenAddress, timeAgo } from "@/lib/format";
import { useKeystone } from "@/lib/store";
import Reveal from "@/components/Reveal";
import Stat from "@/components/Stat";
import ProgressRing from "@/components/ProgressRing";

interface QueueItem {
  grant: Grant;
  index: number;
  title: string;
  amount: bigint;
  cta: string;
}

export default function DashboardPage() {
  const { grants, role } = useKeystone();

  const totalLocked = grants.reduce((s, g) => s + (g.totalAmount - g.releasedAmount), 0n);
  const totalPaid = grants.reduce((s, g) => s + g.releasedAmount, 0n);
  const paidMilestones = grants.flatMap((g) => g.milestones).filter((m) => m.status === "paid").length;
  const totalMilestones = grants.flatMap((g) => g.milestones).length;

  const queue: QueueItem[] = grants.flatMap((grant) =>
    grant.milestones
      .map((m, index) => ({ grant, index, m }))
      .filter(({ m }) => {
        if (grant.cancelled) return false;
        if (role === "reviewer") return m.status === "submitted";
        if (role === "builder") return m.status === "pending";
        return false;
      })
      .map(({ grant, index, m }) => ({
        grant,
        index,
        title: m.title,
        amount: m.amount,
        cta: role === "reviewer" ? "Review" : "View",
      }))
  );

  const myFunded = role === "funder" ? grants.filter((g) => !g.cancelled) : [];

  const activity = grants
    .flatMap((g) => g.activity.map((a) => ({ ...a, grantTitle: g.title, grantId: g.id })))
    .sort((a, b) => b.at - a.at)
    .slice(0, 8);

  const roleCopy = {
    funder: {
      title: "Capital, deployed.",
      sub: "Track every dollar you've committed — what's locked, what's released, and what's next.",
    },
    builder: {
      title: "Work, rewarded.",
      sub: "Your milestones, their payouts, and exactly what stands between you and the next release.",
    },
    reviewer: {
      title: "Trust, verified.",
      sub: "Proofs awaiting your verdict. Approve with confidence — every submission is timestamped on Arc.",
    },
  }[role];

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <Reveal>
        <p className="eyebrow">Dashboard · acting as {role}</p>
        <h1 className="display mt-4 text-[44px] leading-[1.03] text-bone-100 sm:text-[64px]">{roleCopy.title}</h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-bone-100/60">{roleCopy.sub}</p>
      </Reveal>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "USDC locked in escrow", el: <Stat value={Number(totalLocked / 1_000_000n)} prefix="$" className="text-[26px] text-bone-100" /> },
          { label: "USDC released to builders", el: <Stat value={Number(totalPaid / 1_000_000n)} prefix="$" className="text-[26px] text-moss-400" /> },
          { label: "Milestones settled", el: <span className="font-mono text-[26px] text-bone-100"><Stat value={paidMilestones} /><span className="text-[16px] text-bone-100/40">/{totalMilestones}</span></span> },
          { label: "Active grants", el: <Stat value={grants.filter((g) => !g.cancelled).length} className="text-[26px] text-bone-100" /> },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 80}>
            <div className="card rounded-3xl p-6">
              {s.el}
              <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-bone-100/40">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <Reveal>
            <div className="flex items-baseline justify-between">
              <h2 className="display text-[30px] text-bone-100">
                {role === "reviewer" ? "Awaiting your review" : role === "builder" ? "Up next" : "Your grants"}
              </h2>
              <span className="font-mono text-[12px] text-bone-100/40">
                {role === "funder" ? `${myFunded.length} grants` : `${queue.length} items`}
              </span>
            </div>
          </Reveal>

          <div className="mt-6 flex flex-col gap-4">
            {role === "funder" &&
              myFunded.map((g, i) => (
                <Reveal key={g.id} delay={i * 70}>
                  <Link href={`/grants/${g.id}`} className="card card-hover flex items-center gap-5 rounded-2xl p-5">
                    <div className="relative shrink-0">
                      <ProgressRing percent={grantProgress(g)} size={52} stroke={5} />
                      <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] text-bone-100/70">
                        {Math.round(grantProgress(g))}%
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-bone-100">{g.title}</p>
                      <p className="mt-0.5 font-mono text-[12px] text-bone-100/45">
                        ${formatUSDC(g.releasedAmount)} released · ${formatUSDC(g.totalAmount - g.releasedAmount)} locked
                      </p>
                    </div>
                    <span className="font-mono text-[12px] text-brass-400">→</span>
                  </Link>
                </Reveal>
              ))}

            {role !== "funder" &&
              queue.map((q, i) => (
                <Reveal key={`${q.grant.id}-${q.index}`} delay={i * 70}>
                  <Link href={`/grants/${q.grant.id}`} className="card card-hover flex items-center gap-5 rounded-2xl p-5">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border font-mono text-[12px]"
                      style={{
                        borderColor: role === "reviewer" ? "rgba(127,182,217,0.45)" : "rgba(244,241,232,0.14)",
                        color: role === "reviewer" ? "#9CC8E4" : "rgba(244,241,232,0.6)",
                      }}
                    >
                      0{q.index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-bone-100">{q.title}</p>
                      <p className="mt-0.5 font-mono text-[12px] text-bone-100/45">
                        {q.grant.title} · <span className="text-brass-300">${formatUSDC(q.amount)}</span>
                      </p>
                    </div>
                    <span className={`rounded-full px-4 py-2 text-[12px] font-semibold ${role === "reviewer" ? "btn-brass" : "btn-ghost text-bone-100"}`}>
                      {q.cta} →
                    </span>
                  </Link>
                </Reveal>
              ))}

            {role !== "funder" && queue.length === 0 && (
              <div className="card rounded-2xl p-8 text-center">
                <p className="display text-[24px] text-bone-100">All clear.</p>
                <p className="mt-2 text-[13.5px] text-bone-100/55">
                  {role === "reviewer" ? "No proofs waiting — builders are hard at work." : "No pending milestones right now."}
                </p>
              </div>
            )}
          </div>
        </div>

        <Reveal delay={120}>
          <div className="card rounded-3xl p-6">
            <p className="eyebrow mb-5">Protocol activity</p>
            <div className="flex flex-col gap-4">
              {activity.map((a) => (
                <Link key={a.id + a.grantId} href={`/grants/${a.grantId}`} className="group flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-500/70" />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] text-bone-100/75 transition group-hover:text-bone-100">
                      {a.text.length > 72 ? a.text.slice(0, 72) + "…" : a.text}
                    </p>
                    <p className="mt-0.5 font-mono text-[10.5px] text-bone-100/35">
                      {a.grantTitle} · {shortenAddress(a.actor)} · {timeAgo(a.at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
