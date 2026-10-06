"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { grantProgress, grantStatus, type Grant } from "@/lib/demo";
import { formatUSDC, shortenAddress, formatDate } from "@/lib/format";
import { explorerAddress, KEYSTONE_ADDRESS } from "@/lib/arc";
import { fetchLiveGrant } from "@/lib/live";
import { useKeystone } from "@/lib/store";
import { useWallet } from "@/lib/wallet";
import Reveal from "@/components/Reveal";
import ProgressRing from "@/components/ProgressRing";
import MilestoneTimeline from "@/components/MilestoneTimeline";
import ActivityFeed from "@/components/ActivityFeed";
import { StatusPill } from "@/components/GrantCard";
import Modal from "@/components/Modal";

function RoleRow({ label, address }: { label: string; address: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-bone-100/40">{label}</span>
      <a
        href={explorerAddress(address)}
        target="_blank"
        rel="noreferrer"
        className="font-mono text-[12.5px] text-brass-400 hover:underline"
        title={address}
      >
        {shortenAddress(address)} ↗
      </a>
    </div>
  );
}

export default function GrantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = String(params.id);
  const isLive = rawId.startsWith("live-");
  const id = Number(isLive ? rawId.slice(5) : rawId);
  const { grants, wallet, role, busy, cancelGrant, cancelGrantLive } = useKeystone();
  const { address: realAddress, isConnected: realConnected } = useWallet();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [liveGrant, setLiveGrant] = useState<Grant | null>(null);
  const [liveLoading, setLiveLoading] = useState(isLive);

  const loadLive = useCallback(() => {
    if (!isLive || !KEYSTONE_ADDRESS) {
      setLiveLoading(false);
      return;
    }
    setLiveLoading(true);
    fetchLiveGrant(id)
      .then(setLiveGrant)
      .catch(() => setLiveGrant(null))
      .finally(() => setLiveLoading(false));
  }, [isLive, id]);

  useEffect(() => {
    loadLive();
  }, [loadLive]);

  const grant = isLive ? liveGrant : grants.find((g) => g.id === id);

  if (isLive && liveLoading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center sm:px-8">
        <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-bone-100/40">Reading Arc mainnet…</p>
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center sm:px-8">
        <h1 className="display text-[44px] text-bone-100">Grant not found</h1>
        <p className="mt-3 text-bone-100/55">This escrow doesn't exist in this demo.</p>
        <Link href="/grants" className="btn-brass mt-8 inline-block rounded-full px-7 py-3 text-sm font-semibold">
          Back to explore
        </Link>
      </div>
    );
  }

  const progress = grantProgress(grant);
  const status = grantStatus(grant);
  const locked = grant.totalAmount - grant.releasedAmount;
  const paidCount = grant.milestones.filter((m) => m.status === "paid").length;
  const sameAddr = (a?: string | null, b?: string | null) => !!a && !!b && a.toLowerCase() === b.toLowerCase();
  const canCancel = isLive
    ? realConnected && sameAddr(realAddress, grant.funder) && !grant.cancelled && status !== "complete"
    : wallet && role === "funder" && !grant.cancelled && status !== "complete";

  const doCancel = async () => {
    try {
      if (isLive) {
        await cancelGrantLive(grant.id);
        loadLive();
      } else {
        await cancelGrant(grant.id);
      }
      setConfirmCancel(false);
    } catch { /* toast shown */ }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <Reveal>
        <Link href="/grants" className="font-mono text-[12px] text-bone-100/45 transition hover:text-bone-100">
          ← All grants
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow">{grant.category}</p>
              <StatusPill status={status} />
              {grant.live && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Live on Arc
                </span>
              )}
              {grant.cancelled && <span className="font-mono text-[11px] text-clay-400">escrow dissolved</span>}
            </div>
            <h1 className="display mt-3 text-[46px] leading-[1.02] text-bone-100 sm:text-[62px]">{grant.title}</h1>
            <p className="mt-3 text-[16px] leading-relaxed text-bone-100/60">{grant.tagline}</p>
          </div>
          <div className="card flex items-center gap-5 rounded-3xl px-6 py-5">
            <div className="relative">
              <ProgressRing percent={progress} size={84} stroke={7} />
              <span className="absolute inset-0 flex items-center justify-center font-mono text-[13px] text-bone-100">
                {Math.round(progress)}%
              </span>
            </div>
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-bone-100/40">Released</p>
              <p className="mt-1 font-mono text-[20px] text-bone-100">${formatUSDC(grant.releasedAmount)}</p>
              <p className="font-mono text-[12px] text-bone-100/40">of ${formatUSDC(grant.totalAmount)} committed</p>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <Reveal delay={80}>
            <div className="card rounded-3xl p-6 sm:p-8">
              <div className="flex items-baseline justify-between">
                <p className="eyebrow">Milestones</p>
                <p className="font-mono text-[12px] text-bone-100/40">
                  {paidCount}/{grant.milestones.length} paid ·{" "}
                  {grant.cancelled ? (
                    <>${formatUSDC(locked)} refunded</>
                  ) : (
                    <>${formatUSDC(locked)} locked</>
                  )}
                </p>
              </div>
              <div className="mt-6">
                <MilestoneTimeline grant={grant} onLiveUpdate={loadLive} />
              </div>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="card mt-6 rounded-3xl p-6 sm:p-8">
              <p className="eyebrow mb-3">About this grant</p>
              <p className="text-[14.5px] leading-relaxed text-bone-100/65">{grant.description}</p>
              <p className="mt-4 font-mono text-[11.5px] text-bone-100/35">
                Created {formatDate(grant.createdAt)} · {grant.live ? "live escrow on Arc mainnet" : "demo escrow in USDC"}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t rule pt-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-bone-100/40">Escrow contract</span>
                {KEYSTONE_ADDRESS ? (
                  <a
                    href={explorerAddress(KEYSTONE_ADDRESS)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[12.5px] text-brass-400 hover:underline"
                    title={KEYSTONE_ADDRESS}
                  >
                    {shortenAddress(KEYSTONE_ADDRESS)} ↗
                  </a>
                ) : (
                  <span className="font-mono text-[12px] text-bone-100/40">demo mode — verify on-chain after launch</span>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col gap-6">
          <Reveal delay={120}>
            <div className="card rounded-3xl p-6">
              <p className="eyebrow mb-2">Parties</p>
              <div className="divide-y divide-bone-100/5">
                <RoleRow label="Funder" address={grant.funder} />
                <RoleRow label="Builder" address={grant.builder} />
                <RoleRow label="Reviewer" address={grant.reviewer} />
              </div>
              {!wallet && !grant.live && (
                <p className="mt-4 rounded-xl border border-brass-500/30 bg-brass-500/5 p-3 text-[12.5px] leading-relaxed text-bone-100/65">
                  Connect the demo wallet to act as funder, builder or reviewer on this grant.
                </p>
              )}
              {grant.live && (
                <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-3 text-[12.5px] leading-relaxed text-bone-100/65">
                  This is a real on-chain escrow. Connect a browser wallet on Arc mainnet to interact with it.
                </p>
              )}
              {wallet && !grant.live && (
                <p className="mt-4 font-mono text-[11.5px] leading-relaxed text-bone-100/40">
                  You are acting as <span className="text-brass-300">{role}</span>. Switch roles from the wallet menu to
                  try each flow.
                </p>
              )}
            </div>
          </Reveal>

          <Reveal delay={160}>
            <ActivityFeed grant={grant} />
          </Reveal>

          {canCancel && (
            <Reveal delay={180}>
              <button
                onClick={() => setConfirmCancel(true)}
                className="w-full rounded-2xl border border-clay-500/40 bg-clay-500/5 py-3 text-[13px] font-medium text-clay-400 transition hover:bg-clay-500/10"
              >
                Cancel grant & refund unreleased USDC
              </button>
            </Reveal>
          )}
        </div>
      </div>

      <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)}>
        <p className="eyebrow">Cancel grant</p>
        <h3 className="display mt-2 text-[28px] text-bone-100">
          Dissolve the <em>escrow?</em>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-bone-100/60">
          All unpaid milestones ({grant.milestones.filter((m) => m.status === "pending" || m.status === "submitted").length})
          will be cancelled and <span className="font-mono text-bone-100">${formatUSDC(locked)}</span> returns to the
          funder immediately. Paid milestones are unaffected.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={() => setConfirmCancel(false)} className="btn-ghost flex-1 rounded-xl py-3 text-sm text-bone-100">
            Keep grant
          </button>
          <button
            onClick={doCancel}
            disabled={busy}
            className="flex-1 rounded-xl bg-clay-500 py-3 text-sm font-semibold text-ink-950 transition hover:brightness-110 disabled:opacity-50"
          >
            {busy ? "Cancelling…" : "Yes, cancel"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
