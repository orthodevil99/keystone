"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DEMO_GRANTS, type Grant } from "@/lib/demo";
import { formatUSDC } from "@/lib/format";
import { useKeystone } from "@/lib/store";
import { KEYSTONE_ADDRESS, explorerAddress } from "@/lib/arc";
import { fetchLiveGrants } from "@/lib/live";
import Reveal from "@/components/Reveal";
import Stat from "@/components/Stat";
import GrantCard from "@/components/GrantCard";

/* ---------------- hero arch artwork ---------------- */
function ArchArt() {
  return (
    <div className="drift relative mx-auto w-full max-w-[420px]">
      <svg viewBox="0 0 400 460" className="w-full" fill="none">
        <defs>
          <linearGradient id="stone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A1E22" />
            <stop offset="100%" stopColor="#101214" />
          </linearGradient>
          <linearGradient id="brassg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EBCB8B" />
            <stop offset="100%" stopColor="#C98F35" />
          </linearGradient>
        </defs>
        {/* glow */}
        <ellipse cx="200" cy="430" rx="150" ry="18" fill="#DFAF5E" opacity="0.08" />
        {/* arch stones */}
        <path d="M60 430V230C60 140 120 70 200 70s140 70 140 160v200" stroke="url(#stone)" strokeWidth="44" />
        <path d="M60 430V230C60 140 120 70 200 70s140 70 140 160v200" stroke="rgba(244,241,232,0.14)" strokeWidth="44" strokeDasharray="2 26" />
        {/* keystone */}
        <path d="M178 52h44l-8 52a14 14 0 0 1-14 12 14 14 0 0 1-14-12l-8-52Z" fill="url(#brassg)" />
        <path d="M178 52h44l-8 52a14 14 0 0 1-14 12 14 14 0 0 1-14-12l-8-52Z" stroke="#0A0B0D" strokeOpacity="0.25" />
        {/* inner arch line */}
        <path d="M104 430V238C104 164 144 112 200 112s96 52 96 126v192" stroke="rgba(223,175,94,0.28)" strokeWidth="1.5" strokeDasharray="5 7" />
        {/* milestone markers on the arch */}
        {[
          { x: 88, y: 330 },
          { x: 74, y: 250 },
          { x: 326, y: 250 },
          { x: 312, y: 330 },
        ].map((m, i) => (
          <g key={i}>
            <circle cx={m.x} cy={m.y} r="7" fill="#0A0B0D" stroke="#DFAF5E" strokeWidth="2" />
            <circle cx={m.x} cy={m.y} r="2.5" fill="#DFAF5E" />
          </g>
        ))}
        {/* base */}
        <path d="M28 430h120M252 430h120" stroke="rgba(244,241,232,0.3)" strokeWidth="3" strokeLinecap="round" />
      </svg>

      {/* floating chips */}
      <div className="absolute left-[-8px] top-[38%] card rounded-2xl px-4 py-3 shadow-xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-100/45">Milestone 2</p>
        <p className="mt-0.5 font-mono text-[15px] text-moss-400">$1,000.00 ✓ paid</p>
      </div>
      <div className="absolute right-[-6px] top-[56%] card rounded-2xl px-4 py-3 shadow-xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bone-100/45">Milestone 3</p>
        <p className="mt-0.5 font-mono text-[15px] text-[#9CC8E4]">in review…</p>
      </div>
      <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 card rounded-full px-5 py-2.5 shadow-xl">
        <p className="font-mono text-[12px] text-bone-100/80">
          settles in <span className="text-brass-300">&lt;1s</span> on Arc
        </p>
      </div>
    </div>
  );
}

/* ---------------- settlement ticker ---------------- */
const TICKER = [
  ["Arcline SDK", "M2", "$1,000.00", "paid"],
  ["GigRep", "M1", "$600.00", "paid"],
  ["Arc Widgets", "M2", "$550.00", "paid"],
  ["Arcline SDK", "M1", "$1,200.00", "paid"],
  ["Arc Widgets", "M1", "$400.00", "paid"],
  ["Payroll Rails", "escrow", "$6,000.00", "locked"],
] as const;

function Ticker() {
  const row = [...TICKER, ...TICKER];
  return (
    <div className="overflow-hidden border-y rule py-4" title="Hover to pause">
      <div className="marquee-track flex w-max gap-10">
        {row.map(([g, m, amt, s], i) => (
          <div key={i} className="flex items-center gap-3 whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: s === "paid" ? "#4E9A5F" : "#DFAF5E" }} />
            <span className="text-[13px] text-bone-100/70">{g}</span>
            <span className="font-mono text-[12px] text-bone-100/40">{m}</span>
            <span className="font-mono text-[13px] text-bone-100">{amt}</span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-bone-100/40">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- interactive how-it-works ---------------- */
const ROLES = ["Funder", "Builder", "Reviewer"] as const;

const ROLE_STEPS: Record<(typeof ROLES)[number], { t: string; d: string }[]> = {
  Funder: [
    { t: "Define", d: "Set milestones, amounts, and deadlines. Name your builder and reviewer — the rules are fixed before a cent moves." },
    { t: "Lock", d: "Fund the full grant in one USDC transaction. The money enters escrow, not someone's pocket — it can't drift or disappear." },
    { t: "Track", d: "Watch proofs arrive milestone by milestone. Every submission is timestamped on Arc for anyone to audit." },
    { t: "Reclaim", d: "Missed deadline? Unreleased funds return to you automatically. Cancel anytime for a full refund of what's unpaid." },
  ],
  Builder: [
    { t: "Accept", d: "Get named on a funded grant. The money is already locked in escrow — the commitment is real before you write a line." },
    { t: "Build", d: "Ship the work. Milestones, amounts, and deadlines were agreed up front — no scope creep, no moving goalposts." },
    { t: "Submit", d: "Post proof: a release, a PR, a deployment link. Timestamped on Arc, visible to everyone." },
    { t: "Get paid", d: "Reviewer approves and USDC lands in under a second. No invoices, no chasing, no 30-day payment terms." },
  ],
  Reviewer: [
    { t: "Verify", d: "You're the quality gate — named at creation, trusted by the funder to judge the work fairly." },
    { t: "Inspect", d: "Review each proof against the milestone spec. The builder's submission and your decision are both on record." },
    { t: "Approve", d: "One click releases that milestone's USDC to the builder. Settlement is final before you close the tab." },
    { t: "Push back", d: "Not good enough? Request changes and the funds stay locked. The builder re-submits — nothing moves until it's right." },
  ],
};

function HowItWorks() {
  const [role, setRole] = useState<(typeof ROLES)[number]>("Funder");
  return (
    <div>
      <div className="inline-flex rounded-full border rule bg-ink-900/60 p-1">
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`rounded-full px-5 py-3 font-mono text-[12px] uppercase tracking-[0.12em] transition ${
              role === r ? "bg-brass-500 text-ink-950" : "text-bone-100/55 hover:text-bone-100"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ROLE_STEPS[role].map((s, i) => (
          <Reveal key={`${role}-${i}`} delay={i * 90}>
            <div className="card card-hover h-full rounded-3xl p-6">
              <p className="display text-[36px] text-brass-500/80">0{i + 1}</p>
              <h3 className="display mt-2 text-[24px] text-bone-100">{s.t}</h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-bone-100/55">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-6 font-mono text-[11.5px] text-bone-100/35">
        Four steps, three roles, one contract — the same flow whether you're funding $50 or $50,000.
      </p>
    </div>
  );
}

/* ---------------- page ---------------- */
export default function Home() {
  const { wallet, connectDemo } = useKeystone();
  const [liveGrants, setLiveGrants] = useState<Grant[] | null>(null);

  useEffect(() => {
    if (!KEYSTONE_ADDRESS) return;
    fetchLiveGrants().then(setLiveGrants).catch(() => setLiveGrants([]));
  }, []);

  const statsGrants = liveGrants ?? DEMO_GRANTS;
  const totalLocked = statsGrants.reduce((s, g) => s + (g.totalAmount - g.releasedAmount), 0n);
  const totalPaid = statsGrants.reduce((s, g) => s + g.releasedAmount, 0n);
  const featured = DEMO_GRANTS.slice(0, 3);

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 480px at 78% 18%, rgba(223,175,94,0.10), transparent 60%), radial-gradient(700px 420px at 12% 82%, rgba(78,154,95,0.07), transparent 60%)",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pt-20">
          <div>
            <Reveal>
              <p className="eyebrow flex items-center gap-3">
                <span className="inline-block h-px w-10 bg-brass-500/70" />
                Milestone escrow · fully trustless · zero fees · on Arc
              </p>
            </Reveal>
            <Reveal delay={90}>
              <h1 className="display mt-6 text-[52px] leading-[1.02] text-bone-100 sm:text-[76px] lg:text-[84px]">
                Grants that pay for <em>proof,</em> not promises.
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-bone-100/60">
                Keystone locks grant funding in USDC escrow and releases it milestone by milestone — only when the work
                is proven. No custodian, no invoices, no trust required. Settlement is final in under a second, gas
                costs a tenth of a cent, and the protocol takes <span className="text-bone-100">nothing</span> — so
                even a <span className="text-bone-100">$5 milestone</span> makes sense.
              </p>
            </Reveal>
            <Reveal delay={260}>
              <div className="mt-8 flex flex-wrap gap-3">
                {wallet ? (
                  <Link href="/create" className="btn-brass rounded-full px-7 py-3.5 text-[14.5px] font-semibold">
                    Create a grant →
                  </Link>
                ) : (
                  <button onClick={connectDemo} className="btn-brass rounded-full px-7 py-3.5 text-[14.5px] font-semibold">
                    Try the live demo →
                  </button>
                )}
                <Link href="/grants" className="btn-ghost rounded-full px-7 py-3.5 text-[14.5px] font-medium text-bone-100">
                  How it works
                </Link>
              </div>
            </Reveal>
            <Reveal delay={340}>
              <div className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t rule pt-6">
                <div>
                  <Stat value={Number(totalLocked / 1_000_000n)} prefix="$" className="text-[24px] text-bone-100" />
                  <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-bone-100/40">
                    USDC in escrow{liveGrants ? "" : " · demo"}
                  </p>
                </div>
                <div>
                  <Stat value={Number(totalPaid / 1_000_000n)} prefix="$" className="text-[24px] text-bone-100" />
                  <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-bone-100/40">
                    Paid to builders{liveGrants ? "" : " · demo"}
                  </p>
                </div>
                <div>
                  <p className="display text-[24px] text-brass-300">&lt;1s</p>
                  <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-bone-100/40">Finality on Arc</p>
                </div>
              </div>
            </Reveal>
          </div>
          <Reveal delay={200} className="hidden lg:block">
            <ArchArt />
          </Reveal>
        </div>
      </section>

      <Ticker />

      {/* ============ HOW IT WORKS ============ */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <p className="eyebrow">How it works</p>
          <h2 className="display mt-4 max-w-2xl text-[40px] leading-[1.05] text-bone-100 sm:text-[54px]">
            Three stones. <em>One arch.</em>
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-bone-100/55">
            Pick a role — every grant runs the same four steps, enforced by one contract instead of paperwork.
          </p>
        </Reveal>
        <div className="mt-10">
          <HowItWorks />
        </div>
      </section>

      {/* ============ WHY TRUSTLESS ============ */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <Reveal>
          <div className="card overflow-hidden rounded-[32px]">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-12">
                <p className="eyebrow">Trust architecture</p>
                <h2 className="display mt-4 text-[36px] leading-[1.08] text-bone-100 sm:text-[44px]">
                  Nobody holds <em>the money.</em>
                </h2>
                <p className="mt-4 text-[14.5px] leading-relaxed text-bone-100/60">
                  Every escrow failure is a custody failure — someone held the funds and broke the promise. Keystone
                  removes the someone.
                </p>
                <ul className="mt-8 space-y-6">
                  {[
                    ["No custodian", "The contract holds the USDC — not a company, not a multisig you can't inspect, not us."],
                    ["No backend", "No server to hack, no database to quietly edit. The chain is the database; every state change is a signed transaction."],
                    ["No admin keys", "No owner, no pause switch, no upgrade path. Nobody can drain a grant, freeze a payout, or change the rules mid-flight."],
                    ["Anyone can verify", "Every lock, submission, approval, and payout is an on-chain event. Don't trust the UI — read the contract yourself."],
                  ].map(([t, d]) => (
                    <li key={t} className="flex gap-4">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brass-500" />
                      <div>
                        <p className="text-[15px] font-semibold text-bone-100">{t}</p>
                        <p className="mt-1 text-[13.5px] leading-relaxed text-bone-100/55">{d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col justify-center border-t rule bg-ink-950/70 p-8 sm:p-12 lg:border-l lg:border-t-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-bone-100/40">Escrow contract</p>
                {KEYSTONE_ADDRESS ? (
                  <a
                    href={explorerAddress(KEYSTONE_ADDRESS)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 break-all font-mono text-[15px] text-brass-300 hover:underline"
                  >
                    {KEYSTONE_ADDRESS} ↗
                  </a>
                ) : (
                  <p className="mt-3 font-mono text-[15px] text-bone-100/50">
                    Deploying to Arc mainnet — address lands here.
                  </p>
                )}
                <p className="mt-4 text-[13px] leading-relaxed text-bone-100/50">
                  KeystoneEscrow.sol · MIT licensed · verified source on the Arc explorer. One compact contract, ~9 KB
                  of bytecode, zero protocol fees.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/grants" className="btn-ghost rounded-full px-6 py-3 text-[13px] font-medium text-bone-100">
                    Explore grants →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ COMPARISON ============ */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <p className="eyebrow">Why not the old ways</p>
          <h2 className="display mt-4 max-w-2xl text-[40px] leading-[1.05] text-bone-100 sm:text-[54px]">
            The old rails <em>tax the work.</em>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b rule">
                  <th className="py-4 pr-6 font-mono text-[11px] uppercase tracking-[0.14em] text-bone-100/40" />
                  <th className="py-4 pr-6 font-mono text-[11px] uppercase tracking-[0.14em] text-brass-300">Keystone</th>
                  <th className="py-4 pr-6 font-mono text-[11px] uppercase tracking-[0.14em] text-bone-100/40">Traditional grants</th>
                  <th className="py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bone-100/40">Content paywalls</th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {[
                  ["Payment trigger", "Proof of milestone", "Invoices + trust", "Pay-per-view"],
                  ["Fees", "0% — builders keep it all", "5–15% overhead", "1–5% platform cut"],
                  ["Settlement", "Under 1 second", "Days to weeks", "Instant, platform-owned"],
                  ["Transparency", "Fully on-chain", "Quarterly reports", "None"],
                  ["Smallest viable grant", "~$5", "~$1,000+", "~$1"],
                ].map(([label, k, t, p]) => (
                  <tr key={label} className="border-b rule">
                    <td className="py-4 pr-6 font-mono text-[12px] uppercase tracking-[0.1em] text-bone-100/45">{label}</td>
                    <td className="py-4 pr-6 font-medium text-bone-100">{k}</td>
                    <td className="py-4 pr-6 text-bone-100/50">{t}</td>
                    <td className="py-4 text-bone-100/50">{p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* ============ USE CASES ============ */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <Reveal>
          <p className="eyebrow">In the wild</p>
          <h2 className="display mt-4 max-w-2xl text-[40px] leading-[1.05] text-bone-100 sm:text-[54px]">
            Built for work <em>like this.</em>
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              t: "Ship the SDK",
              d: "A protocol funds a $2,400 developer grant across four milestones. Each merged PR unlocks the next payout — no milestone, no money.",
              tag: "$2,400 · 4 milestones",
            },
            {
              t: "Translate the docs",
              d: "A $120 micro-grant for Hindi DeFi documentation. Gas costs a tenth of a cent, so funding small, vital work finally makes sense.",
              tag: "$120 · micro-grant",
            },
            {
              t: "Audit the auditors",
              d: "A DAO locks $6,000 for a security review, released section by section. A missed deadline refunds automatically — no chasing required.",
              tag: "$6,000 · deadline-enforced",
            },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 100}>
              <div className="card card-hover h-full rounded-3xl p-7">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-brass-400">{c.tag}</p>
                <h3 className="display mt-3 text-[28px] text-bone-100">{c.t}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-bone-100/55">{c.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ FEATURED GRANTS ============ */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Demo escrows</p>
              <h2 className="display mt-4 text-[40px] leading-[1.05] text-bone-100 sm:text-[54px]">
                Grants <em>under construction</em>
              </h2>
            </div>
            <Link href="/grants" className="btn-ghost rounded-full px-6 py-3 text-[13.5px] font-medium text-bone-100">
              View all →
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {featured.map((g, i) => (
            <Reveal key={g.id} delay={i * 100}>
              <GrantCard grant={g} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ WHY ARC ============ */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <Reveal>
          <p className="eyebrow">Why Arc</p>
          <h2 className="display mt-4 max-w-3xl text-[40px] leading-[1.05] text-bone-100 sm:text-[54px]">
            Escrow was always the idea. <em>Arc makes it viable.</em>
          </h2>
          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-bone-100/60">
            Milestone escrow fails on legacy chains: volatile gas tokens, $5 fees on $50 payouts, minute-long
            confirmations. Arc was designed for exactly this — programmable money, settled in the dollar itself.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { v: "~$0.001", l: "Gas per transaction", d: "Paid in USDC itself. A $10 milestone payout costs a tenth of a cent to release." },
            { v: "<1s", l: "Deterministic finality", d: "Approval to payout settles before the reviewer closes the tab." },
            { v: "0", l: "Protocol fees", d: "Keystone takes nothing. 100% of escrowed USDC reaches the builder." },
            { v: "18 / 6", l: "Native USDC decimals", d: "18-decimal native gas, 6-decimal ERC-20 view — one asset, everywhere." },
          ].map((f, i) => (
            <Reveal key={f.l} delay={i * 90}>
              <div className="card h-full rounded-3xl p-6">
                <p className="display text-[38px] text-brass-300">{f.v}</p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-bone-100/60">{f.l}</p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-bone-100/50">{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CONTRACT ============ */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <div className="card overflow-hidden rounded-3xl">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-12">
                <p className="eyebrow">The contract</p>
                <h2 className="display mt-4 text-[36px] leading-[1.08] text-bone-100 sm:text-[44px]">
                  Auditable by <em>design.</em>
                </h2>
                <p className="mt-4 text-[14.5px] leading-relaxed text-bone-100/60">
                  One compact Solidity contract holds every rule: funders can't move locked money, builders can't claim
                  unapproved milestones, reviewers can't touch the principal. Reentrancy-guarded, deadline-enforced,
                  event-emitted.
                </p>
                <ul className="mt-6 space-y-2.5 text-[13.5px] text-bone-100/65">
                  {[
                    "createGrantNative — 1-click funding in native USDC, zero approvals",
                    "submitMilestone / approveMilestone — proof-gated release",
                    "reclaimExpired — deadlines return money automatically",
                    "cancelGrant — instant refund of everything unreleased",
                  ].map((li) => (
                    <li key={li} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-500" />
                      <span className="font-mono text-[12.5px]">{li}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t rule bg-ink-950/70 p-8 sm:p-12 lg:border-l lg:border-t-0">
                <pre className="overflow-x-auto font-mono text-[12px] leading-[1.75] text-bone-100/70">
{`function approveMilestone(
  uint256 grantId,
  uint256 index
) external onlyReviewer(grantId)
  nonReentrant
{
  Milestone storage m =
    _milestones[grantId][index];
  require(
    m.status == Status.Submitted
  );

  m.status = Status.Paid;
  // USDC → builder. Final in <1s.
  token.transfer(builder, m.amount);

  emit MilestoneApproved(
    grantId, index, m.amount
  );
}`}
                </pre>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ CTA ============ */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[32px] border px-8 py-16 text-center sm:px-16 sm:py-20"
            style={{
              borderColor: "rgba(223,175,94,0.25)",
              background: "radial-gradient(700px 340px at 50% 0%, rgba(223,175,94,0.14), transparent 65%), #101214",
            }}
          >
            <p className="eyebrow">For funders & builders</p>
            <h2 className="display mx-auto mt-4 max-w-2xl text-[42px] leading-[1.05] text-bone-100 sm:text-[58px]">
              Lay the first <em>stone.</em>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-bone-100/60">
              Create a grant in under a minute. Define the milestones, lock the USDC, and let the arch hold the rest.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/create" className="btn-brass rounded-full px-8 py-3.5 text-[14.5px] font-semibold">
                Create a grant →
              </Link>
              <Link href="/dashboard" className="btn-ghost rounded-full px-8 py-3.5 text-[14.5px] font-medium text-bone-100">
                View dashboard
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
