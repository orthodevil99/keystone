"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/wallet";
import { KEYSTONE_ADDRESS, keystoneAbi } from "@/lib/arc";
import { formatUSDC, parseUSDC } from "@/lib/format";
import { useKeystone } from "@/lib/store";
import Reveal from "@/components/Reveal";

const CATEGORIES = ["Developer tools", "Payments", "Identity", "DeFi", "Gaming", "Social", "Infrastructure", "Other"];

interface DraftMilestone {
  title: string;
  detail: string;
  amount: string;
  days: string;
}

const EMPTY_M: DraftMilestone = { title: "", detail: "", amount: "", days: "14" };

function isAddr(v: string) {
  return /^0x[0-9a-fA-F]{40}$/.test(v.trim());
}

const STEPS = ["Basics", "People", "Milestones", "Review & fund"];

export default function CreatePage() {
  const router = useRouter();
  const { wallet, busy, createGrant } = useKeystone();
  const { address, isConnected, writeContract } = useWallet();

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [builder, setBuilder] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [milestones, setMilestones] = useState<DraftMilestone[]>([
    { ...EMPTY_M, title: "Milestone 1 — prototype", days: "14" },
    { ...EMPTY_M, title: "Milestone 2 — mainnet launch", days: "30" },
  ]);
  const [funding, setFunding] = useState(false);
  const [liveTx, setLiveTx] = useState<string | null>(null);

  const live = isConnected && !!KEYSTONE_ADDRESS && !!address;

  /** Demo amounts are 6-decimal micro-USDC; native USDC on Arc uses 18 decimals. */
  const toWei = (micro: bigint) => micro * 1_000_000_000_000n;

  const parsed = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    return milestones.map((m) => ({
      title: m.title.trim(),
      detail: m.detail.trim(),
      amount: parseUSDC(m.amount),
      deadline: now + Math.max(1, parseInt(m.days || "1", 10)) * 86400,
      valid: m.title.trim().length > 1 && parseUSDC(m.amount) > 0n && parseInt(m.days || "0", 10) >= 1,
    }));
  }, [milestones]);

  const total = useMemo(() => parsed.reduce((s, m) => s + m.amount, 0n), [parsed]);

  const stepValid = [
    title.trim().length > 2 && tagline.trim().length > 5 && description.trim().length > 10,
    isAddr(builder) && (reviewer.trim() === "" || isAddr(reviewer)),
    parsed.length > 0 && parsed.every((m) => m.valid),
    true,
  ][step];

  const setM = (i: number, patch: Partial<DraftMilestone>) =>
    setMilestones((prev) => prev.map((m, j) => (j === i ? { ...m, ...patch } : m)));

  const fund = async () => {
    if (live) {
      // ---- LIVE: one transaction, native USDC — no ERC-20 approval needed ----
      try {
        setFunding(true);
        const ms = parsed.map((m) => ({ title: m.title, amount: toWei(m.amount), deadline: BigInt(m.deadline) }));
        const hash = await writeContract({
          address: KEYSTONE_ADDRESS as `0x${string}`,
          abi: keystoneAbi as any,
          functionName: "createGrantNative",
          args: [
            builder.trim() as `0x${string}`,
            (reviewer.trim() || address!) as `0x${string}`,
            title.trim(),
            tagline.trim(),
            ms,
          ],
          value: toWei(total),
        });
        setLiveTx(hash);
      } catch (e) {
        console.error(e);
      } finally {
        setFunding(false);
      }
      return;
    }
    // ---- DEMO: simulated settlement ----
    if (!wallet) return;
    try {
      setFunding(true);
      const id = await createGrant({
        title: title.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        category,
        builder: builder.trim(),
        reviewer: reviewer.trim() || wallet,
        milestones: parsed.map((m) => ({ title: m.title, detail: m.detail, amount: m.amount, deadline: m.deadline })),
      });
      router.push(`/grants/${id}`);
    } catch {
      setFunding(false);
    }
  };

  const inputCls = "field w-full rounded-xl px-4 py-3 text-[14px]";
  const labelCls = "mb-1.5 block font-mono text-[11px] uppercase tracking-[0.16em] text-bone-100/45";

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <Reveal>
        <p className="eyebrow">Create grant</p>
        <h1 className="display mt-4 text-[44px] leading-[1.03] text-bone-100 sm:text-[60px]">
          Lay the first <em>stone.</em>
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-bone-100/60">
          Define the work, lock the USDC, and let the milestones do the talking.
          {live ? " You are connected live — this will move real USDC on Arc mainnet." : " Demo mode — nothing moves real funds."}
        </p>
        {live && (
          <p className="mt-3 inline-block rounded-full border border-moss-500/40 bg-moss-500/10 px-4 py-1.5 font-mono text-[11.5px] text-moss-400">
            ● Live on Arc mainnet — connected as {address?.slice(0, 6)}…{address?.slice(-4)}
          </p>
        )}
      </Reveal>

      {/* live success state */}
      {liveTx && (
        <Reveal delay={80}>
          <div className="card mt-10 rounded-3xl p-8 text-center sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-moss-500/50 bg-moss-500/10">
              <span className="text-[28px] text-moss-400">✓</span>
            </div>
            <h2 className="display mt-5 text-[38px] text-bone-100">
              Grant <em>funded</em> on Arc.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-bone-100/60">
              Your USDC is locked in the Keystone escrow contract on Arc mainnet. Milestones are live — share the
              transaction with your builder.
            </p>
            <a
              href={`https://explorer.arc.io/tx/${liveTx}`}
              target="_blank"
              rel="noreferrer"
              className="btn-brass mt-6 inline-block rounded-full px-7 py-3 text-[13.5px] font-semibold"
            >
              View transaction on Arc Explorer ↗
            </a>
            <p className="mt-4 font-mono text-[11px] text-bone-100/35">{liveTx.slice(0, 18)}…{liveTx.slice(-8)}</p>
            <button
              onClick={() => setLiveTx(null)}
              className="mt-6 font-mono text-[12px] text-bone-100/50 transition hover:text-bone-100"
            >
              ← Create another grant
            </button>
          </div>
        </Reveal>
      )}

      {!liveTx && (
      <>
      {/* stepper */}
      <Reveal delay={80}>
        <div className="mt-10 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-[12px] transition ${
                  i < step
                    ? "border-moss-500/60 bg-moss-500/15 text-moss-400"
                    : i === step
                      ? "border-brass-500 bg-brass-500 text-ink-950"
                      : "border-bone-100/15 text-bone-100/40"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </button>
              <span className={`hidden font-mono text-[11px] uppercase tracking-[0.12em] sm:block ${i === step ? "text-bone-100" : "text-bone-100/35"}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className="mx-1 h-px flex-1 bg-bone-100/10" />}
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={140}>
        <div className="card mt-8 rounded-3xl p-6 sm:p-9">
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div>
                <label className={labelCls}>Grant title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Arcline SDK" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Tagline</label>
                <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="One sentence — what does this build?" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="What will be built, and why it matters…" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`rounded-full px-4 py-2 text-[12.5px] transition ${
                        category === c ? "bg-brass-500 font-semibold text-ink-950" : "border rule text-bone-100/60 hover:text-bone-100"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <label className={labelCls}>Builder address — receives the payouts</label>
                <input value={builder} onChange={(e) => setBuilder(e.target.value)} placeholder="0x…" spellCheck={false} className={`${inputCls} font-mono text-[13px]`} />
                {builder && !isAddr(builder) && <p className="mt-1.5 font-mono text-[11.5px] text-clay-400">Enter a valid 0x address.</p>}
              </div>
              <div>
                <label className={labelCls}>Reviewer address — approves milestones <span className="normal-case tracking-normal">(optional, defaults to you)</span></label>
                <input value={reviewer} onChange={(e) => setReviewer(e.target.value)} placeholder="0x… (leave blank to self-review)" spellCheck={false} className={`${inputCls} font-mono text-[13px]`} />
                {reviewer && !isAddr(reviewer) && <p className="mt-1.5 font-mono text-[11.5px] text-clay-400">Enter a valid 0x address.</p>}
              </div>
              <p className="rounded-xl border border-brass-500/25 bg-brass-500/5 p-4 text-[13px] leading-relaxed text-bone-100/60">
                The reviewer is the only party who can release funds — choose someone both sides trust, or act as your
                own reviewer for simple bounties.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              {milestones.map((m, i) => (
                <div key={i} className="rounded-2xl border rule p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="display text-[19px] text-bone-100">Milestone {i + 1}</p>
                    {milestones.length > 1 && (
                      <button onClick={() => setMilestones((p) => p.filter((_, j) => j !== i))} className="font-mono text-[11.5px] text-bone-100/40 transition hover:text-clay-400">
                        remove
                      </button>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[1fr_130px_110px]">
                    <div className="sm:col-span-3">
                      <input value={m.title} onChange={(e) => setM(i, { title: e.target.value })} placeholder="Milestone title" className={inputCls} />
                    </div>
                    <div className="sm:col-span-3">
                      <input value={m.detail} onChange={(e) => setM(i, { detail: e.target.value })} placeholder="What counts as done? (optional)" className={inputCls} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Payout (USDC)</label>
                      <input value={m.amount} onChange={(e) => setM(i, { amount: e.target.value })} placeholder="500" inputMode="decimal" className={`${inputCls} font-mono`} />
                    </div>
                    <div>
                      <label className={labelCls}>Due in (days)</label>
                      <input value={m.days} onChange={(e) => setM(i, { days: e.target.value.replace(/\D/g, "") })} placeholder="14" inputMode="numeric" className={`${inputCls} font-mono`} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setMilestones((p) => [...p, { ...EMPTY_M }])} className="btn-ghost rounded-2xl py-3.5 text-[13.5px] font-medium text-bone-100">
                + Add milestone
              </button>
              <div className="flex items-center justify-between rounded-2xl bg-ink-950/60 px-5 py-4">
                <span className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-bone-100/45">Total escrow</span>
                <span className="font-mono text-[20px] text-brass-300">${formatUSDC(total)}</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="rounded-2xl border rule p-6">
                <p className="eyebrow mb-4">Summary</p>
                <h3 className="display text-[30px] text-bone-100">{title}</h3>
                <p className="mt-1 text-[13.5px] text-bone-100/55">{tagline}</p>
                <div className="mt-5 space-y-2.5 border-t rule pt-5">
                  {parsed.map((m, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 text-[13.5px]">
                      <span className="text-bone-100/70">
                        <span className="mr-2 font-mono text-[11px] text-bone-100/35">0{i + 1}</span>
                        {m.title}
                      </span>
                      <span className="font-mono text-bone-100">${formatUSDC(m.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t rule pt-5">
                  <span className="font-mono text-[11.5px] uppercase tracking-[0.16em] text-bone-100/45">
                    You lock now
                  </span>
                  <span className="font-mono text-[24px] text-brass-300">${formatUSDC(total)}</span>
                </div>
                <p className="mt-3 font-mono text-[11.5px] leading-relaxed text-bone-100/40">
                  Builder: {builder.slice(0, 10)}…{builder.slice(-6)} · {parsed.length} milestones · 0 protocol fees ·
                  gas ≈ $0.001 on Arc
                </p>
              </div>
              {!wallet && !live && (
                <p className="mt-4 rounded-xl border border-brass-500/30 bg-brass-500/5 p-4 text-[13px] text-bone-100/65">
                  Connect the demo wallet (top right) to fund this grant in the demo.
                </p>
              )}
              <button
                onClick={fund}
                disabled={(!wallet && !live) || funding || busy || total === 0n}
                className="btn-brass mt-5 w-full rounded-2xl py-4 text-[15px] font-semibold disabled:opacity-40"
              >
                {funding ? "Settling on Arc…" : live ? `Fund grant — 1 click, $${formatUSDC(total)} USDC` : `Fund grant — lock $${formatUSDC(total)} USDC`}
              </button>
              <p className="mt-3 text-center font-mono text-[11px] text-bone-100/35">
                {live ? "One signature — native USDC, no token approvals." : "Simulated settlement · sub-second, like the real thing."}
              </p>
            </div>
          )}

          {/* nav */}
          <div className="mt-8 flex items-center justify-between border-t rule pt-6">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="font-mono text-[12.5px] text-bone-100/50 transition hover:text-bone-100 disabled:opacity-30"
            >
              ← Back
            </button>
            {step < 3 ? (
              <button
                onClick={() => stepValid && setStep((s) => s + 1)}
                disabled={!stepValid}
                className="btn-brass rounded-full px-7 py-3 text-[13.5px] font-semibold disabled:opacity-40"
              >
                Continue →
              </button>
            ) : (
              <Link href="/grants" className="font-mono text-[12.5px] text-bone-100/50 transition hover:text-bone-100">
                or explore grants instead
              </Link>
            )}
          </div>
        </div>
      </Reveal>
      </>
      )}
    </div>
  );
}
