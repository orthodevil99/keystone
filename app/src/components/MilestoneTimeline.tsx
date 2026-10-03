"use client";

import { useState } from "react";
import { Grant } from "@/lib/demo";
import { deadlineLabel, formatDate, formatUSDC } from "@/lib/format";
import { useKeystone } from "@/lib/store";
import { useWallet } from "@/lib/wallet";
import Modal from "./Modal";
import { StatusPill } from "./GrantCard";

export default function MilestoneTimeline({ grant, onLiveUpdate }: { grant: Grant; onLiveUpdate?: () => void }) {
  const { wallet, role, busy, submitMilestone, approveMilestone, requestChanges, submitMilestoneLive, approveMilestoneLive, requestChangesLive } = useKeystone();
  const { address: realAddress, isConnected: realConnected } = useWallet();
  const [submitIdx, setSubmitIdx] = useState<number | null>(null);
  const [proof, setProof] = useState("");
  const [changesIdx, setChangesIdx] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const live = !!grant.live;

  // Role checks: live grants use the connected wallet address; demo grants use the role switcher.
  const sameAddr = (a?: string | null, b?: string | null) => !!a && !!b && a.toLowerCase() === b.toLowerCase();
  const isBuilder = live ? sameAddr(realAddress, grant.builder) : role === "builder";
  const isReviewer = live ? sameAddr(realAddress, grant.reviewer) : role === "reviewer";
  const walletOk = live ? realConnected : !!wallet;

  const doSubmit = async () => {
    if (submitIdx === null || !proof.trim()) return;
    try {
      if (live) {
        await submitMilestoneLive(grant.id, submitIdx, proof.trim());
        onLiveUpdate?.();
      } else {
        await submitMilestone(grant.id, submitIdx, proof.trim());
      }
      setSubmitIdx(null);
      setProof("");
    } catch { /* toast already shown */ }
  };

  const doApprove = async (i: number) => {
    try {
      if (live) {
        await approveMilestoneLive(grant.id, i);
        onLiveUpdate?.();
      } else {
        await approveMilestone(grant.id, i);
      }
    } catch { /* toast already shown */ }
  };

  const doRequestChanges = async () => {
    if (changesIdx === null || !note.trim()) return;
    try {
      if (live) {
        await requestChangesLive(grant.id, changesIdx, note.trim());
        onLiveUpdate?.();
      } else {
        await requestChanges(grant.id, changesIdx, note.trim());
      }
      setChangesIdx(null);
      setNote("");
    } catch { /* toast already shown */ }
  };

  return (
    <div>
      <div className="flex flex-col gap-0">
        {grant.milestones.map((m, i) => {
          const isLast = i === grant.milestones.length - 1;
          const canSubmit = walletOk && isBuilder && m.status === "pending" && !grant.cancelled;
          const canReview = walletOk && isReviewer && m.status === "submitted" && !grant.cancelled;
          return (
            <div key={i} className="relative flex gap-5 pb-2">
              {/* rail */}
              <div className="flex flex-col items-center">
                <div
                  className="stone flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border font-mono text-[13px] font-semibold"
                  style={{
                    borderColor:
                      m.status === "paid"
                        ? "rgba(78,154,95,0.5)"
                        : m.status === "submitted"
                          ? "rgba(127,182,217,0.5)"
                          : m.status === "cancelled"
                            ? "rgba(192,91,63,0.4)"
                            : "rgba(244,241,232,0.14)",
                    background:
                      m.status === "paid"
                        ? "rgba(78,154,95,0.12)"
                        : m.status === "submitted"
                          ? "rgba(127,182,217,0.10)"
                          : "rgba(244,241,232,0.03)",
                    color:
                      m.status === "paid" ? "#7FB685" : m.status === "submitted" ? "#9CC8E4" : "rgba(244,241,232,0.6)",
                  }}
                >
                  {m.status === "paid" ? "✓" : m.status === "cancelled" ? "✕" : `0${i + 1}`}
                </div>
                {!isLast && <div className="w-px flex-1 bg-bone-100/10" style={{ minHeight: 28 }} />}
              </div>

              {/* stone */}
              <div className="stone card flex-1 rounded-2xl p-5" style={{ marginBottom: isLast ? 0 : 18 }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-[16px] font-semibold text-bone-100">{m.title}</h4>
                    <p className="mt-1 text-[13px] leading-relaxed text-bone-100/55">{m.detail}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[17px] text-brass-300">${formatUSDC(m.amount)}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-bone-100/40">
                      due {formatDate(m.deadline)} · {deadlineLabel(m.deadline)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <StatusPill status={m.status} />
                  {m.proofURI && (
                    <a
                      href={m.proofURI.startsWith("http") ? m.proofURI : `https://${m.proofURI}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[12px] text-brass-400 hover:underline"
                    >
                      View proof ↗
                    </a>
                  )}
                  {m.paidAt > 0 && (
                    <span className="font-mono text-[11px] text-bone-100/40">settled {formatDate(m.paidAt)}</span>
                  )}
                </div>

                {(canSubmit || canReview) && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t rule pt-4">
                    {canSubmit && (
                      <button
                        onClick={() => setSubmitIdx(i)}
                        disabled={busy}
                        className="btn-brass rounded-full px-4 py-2 text-[12.5px] font-semibold disabled:opacity-50"
                      >
                        Submit proof
                      </button>
                    )}
                    {canReview && (
                      <>
                        <button
                          onClick={() => doApprove(i)}
                          disabled={busy}
                          className="rounded-full bg-moss-500 px-4 py-2 text-[12.5px] font-semibold text-ink-950 transition hover:brightness-110 disabled:opacity-50"
                        >
                          {busy ? "Settling…" : `Approve & release $${formatUSDC(m.amount)}`}
                        </button>
                        <button
                          onClick={() => setChangesIdx(i)}
                          disabled={busy}
                          className="btn-ghost rounded-full px-4 py-2 text-[12.5px] font-medium text-bone-100 disabled:opacity-50"
                        >
                          Request changes
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* submit proof modal */}
      <Modal open={submitIdx !== null} onClose={() => setSubmitIdx(null)}>
        <p className="eyebrow">Submit proof</p>
        <h3 className="display mt-2 text-[26px] text-bone-100">
          Milestone {submitIdx !== null ? submitIdx + 1 : ""} <em>delivered?</em>
        </h3>
        <p className="mt-2 text-sm text-bone-100/55">
          Share a link to the work — a release, PR, demo or deployment. The reviewer releases funds on approval.
        </p>
        <input
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          placeholder="https://github.com/…/releases/tag/v1.0"
          className="field mt-5 w-full rounded-xl px-4 py-3 font-mono text-[13px]"
        />
        <button
          onClick={doSubmit}
          disabled={busy || !proof.trim()}
          className="btn-brass mt-4 w-full rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
        >
          {busy ? "Submitting…" : "Submit for review"}
        </button>
      </Modal>

      {/* request changes modal */}
      <Modal open={changesIdx !== null} onClose={() => setChangesIdx(null)}>
        <p className="eyebrow">Request changes</p>
        <h3 className="display mt-2 text-[26px] text-bone-100">
          Send it <em>back</em>
        </h3>
        <p className="mt-2 text-sm text-bone-100/55">Tell the builder what needs another pass. Funds stay locked.</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Hooks look good, but the README example fails on a fresh install…"
          rows={4}
          className="field mt-5 w-full rounded-xl px-4 py-3 text-[13.5px]"
        />
        <button
          onClick={doRequestChanges}
          disabled={busy || !note.trim()}
          className="btn-ghost mt-4 w-full rounded-xl py-3 text-sm font-semibold text-bone-100 disabled:opacity-50"
        >
          {busy ? "Sending…" : "Request changes"}
        </button>
      </Modal>
    </div>
  );
}
