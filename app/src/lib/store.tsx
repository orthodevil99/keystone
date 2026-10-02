"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { DEMO_GRANTS, DEMO_WALLET, Grant, GrantEvent, Milestone } from "./demo";
import { fakeTxHash } from "./format";

export interface Toast {
  id: number;
  title: string;
  body?: string;
  kind: "success" | "info" | "warn";
  tx?: string;
}

export interface CreateGrantInput {
  title: string;
  tagline: string;
  description: string;
  category: string;
  builder: string;
  reviewer: string;
  milestones: { title: string; detail: string; amount: bigint; deadline: number }[];
}

export type DemoRole = "funder" | "builder" | "reviewer";

interface KeystoneCtx {
  grants: Grant[];
  wallet: string | null;
  role: DemoRole;
  setRole: (r: DemoRole) => void;
  toasts: Toast[];
  busy: boolean;
  connectDemo: () => void;
  disconnect: () => void;
  dismissToast: (id: number) => void;
  createGrant: (input: CreateGrantInput) => Promise<number>;
  submitMilestone: (grantId: number, index: number, proofURI: string) => Promise<void>;
  approveMilestone: (grantId: number, index: number) => Promise<bigint>;
  requestChanges: (grantId: number, index: number, note: string) => Promise<void>;
  cancelGrant: (grantId: number) => Promise<void>;
}

const Ctx = createContext<KeystoneCtx | null>(null);

const nowSec = () => Math.floor(Date.now() / 1000);

export function KeystoneProvider({ children }: { children: React.ReactNode }) {
  const [grants, setGrants] = useState<Grant[]>(DEMO_GRANTS);
  const [wallet, setWallet] = useState<string | null>(null);
  const [role, setRole] = useState<DemoRole>("reviewer");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [busy, setBusy] = useState(false);
  const toastId = useRef(0);
  const evCounter = useRef(0);

  const pushToast = useCallback((t: Omit<Toast, "id">) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev.slice(-3), { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 5200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const mutateGrant = useCallback((grantId: number, fn: (g: Grant) => Grant) => {
    setGrants((prev) => prev.map((g) => (g.id === grantId ? fn(g) : g)));
  }, []);

  const addEvent = (g: Grant, kind: GrantEvent["kind"], actor: string, text: string): GrantEvent[] => {
    const seed = `${g.id}-${kind}-${++evCounter.current}-${Date.now()}`;
    return [
      ...g.activity,
      { id: seed, at: nowSec(), kind, actor, text, tx: fakeTxHash(seed) },
    ];
  };

  /** Simulate Arc's sub-second finality with a short, elegant delay. */
  const settle = () => new Promise<void>((r) => setTimeout(r, 1100));

  const requireWallet = () => {
    if (!wallet) {
      pushToast({
        title: "Connect a wallet first",
        body: "Use the demo wallet to try every flow end-to-end.",
        kind: "warn",
      });
      throw new Error("no-wallet");
    }
    return wallet;
  };

  const connectDemo = useCallback(() => {
    setWallet(DEMO_WALLET);
    pushToast({
      title: "Demo wallet connected",
      body: "You are now acting as the funder & reviewer in this demo.",
      kind: "success",
    });
  }, [pushToast]);

  const disconnect = useCallback(() => {
    setWallet(null);
  }, []);

  const createGrant = useCallback(
    async (input: CreateGrantInput): Promise<number> => {
      const me = requireWallet();
      setBusy(true);
      await settle();
      const total = input.milestones.reduce((s, m) => s + m.amount, 0n);
      const id = Math.max(...grants.map((g) => g.id)) + 1;
      const seed = `create-${id}-${Date.now()}`;
      const g: Grant = {
        id,
        title: input.title,
        tagline: input.tagline,
        description: input.description,
        category: input.category,
        funder: me,
        builder: input.builder,
        reviewer: input.reviewer || me,
        totalAmount: total,
        releasedAmount: 0n,
        createdAt: nowSec(),
        cancelled: false,
        milestones: input.milestones.map((m) => ({
          title: m.title,
          detail: m.detail,
          amount: m.amount,
          deadline: m.deadline,
          status: "pending" as const,
          proofURI: "",
          submittedAt: 0,
          paidAt: 0,
        })),
        activity: [
          {
            id: seed,
            at: nowSec(),
            kind: "created",
            actor: me,
            text: `Grant created and funded — escrow locked in KeystoneEscrow.`,
            tx: fakeTxHash(seed),
          },
        ],
      };
      setGrants((prev) => [g, ...prev]);
      setBusy(false);
      pushToast({
        title: "Grant funded on Arc",
        body: "USDC locked in escrow. Milestones are now live.",
        kind: "success",
        tx: fakeTxHash(seed),
      });
      return id;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grants, wallet, pushToast]
  );

  const submitMilestone = useCallback(
    async (grantId: number, index: number, proofURI: string) => {
      requireWallet();
      setBusy(true);
      await settle();
      mutateGrant(grantId, (g) => {
        const milestones = g.milestones.map((m, i) =>
          i === index
            ? { ...m, status: "submitted" as const, proofURI, submittedAt: nowSec() }
            : m
        );
        return {
          ...g,
          milestones,
          activity: addEvent(g, "submitted", g.builder, `Submitted proof for “${g.milestones[index].title}”.`),
        };
      });
      setBusy(false);
      pushToast({ title: "Proof submitted", body: "The reviewer has been notified.", kind: "success", tx: fakeTxHash(`sub-${grantId}-${index}-${Date.now()}`) });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutateGrant, wallet, pushToast]
  );

  const approveMilestone = useCallback(
    async (grantId: number, index: number) => {
      requireWallet();
      setBusy(true);
      await settle();
      let amount = 0n;
      mutateGrant(grantId, (g) => {
        const m = g.milestones[index];
        amount = m.amount;
        const milestones = g.milestones.map((mi, i) =>
          i === index ? { ...mi, status: "paid" as const, paidAt: nowSec() } : mi
        );
        return {
          ...g,
          milestones,
          releasedAmount: g.releasedAmount + m.amount,
          activity: addEvent(g, "approved", g.reviewer, `Approved milestone ${index + 1} — funds released to builder.`),
        };
      });
      setBusy(false);
      pushToast({
        title: "Milestone paid",
        body: "USDC released to the builder — settled in under a second on Arc.",
        kind: "success",
        tx: fakeTxHash(`pay-${grantId}-${index}-${Date.now()}`),
      });
      return amount;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutateGrant, wallet, pushToast]
  );

  const requestChanges = useCallback(
    async (grantId: number, index: number, note: string) => {
      requireWallet();
      setBusy(true);
      await settle();
      mutateGrant(grantId, (g) => ({
        ...g,
        milestones: g.milestones.map((mi, i) =>
          i === index ? { ...mi, status: "pending" as const, proofURI: "" } : mi
        ),
        activity: addEvent(g, "changes", g.reviewer, `Requested changes on milestone ${index + 1}: ${note}`),
      }));
      setBusy(false);
      pushToast({ title: "Sent back for revision", body: note, kind: "info" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutateGrant, wallet, pushToast]
  );

  const cancelGrant = useCallback(
    async (grantId: number) => {
      requireWallet();
      setBusy(true);
      await settle();
      mutateGrant(grantId, (g) => ({
        ...g,
        cancelled: true,
        milestones: g.milestones.map((m) =>
          m.status === "pending" || m.status === "submitted" ? { ...m, status: "cancelled" as const } : m
        ),
        activity: addEvent(g, "cancelled", g.funder, "Grant cancelled — all unreleased USDC refunded to funder."),
      }));
      setBusy(false);
      pushToast({ title: "Grant cancelled", body: "Unreleased funds returned to the funder.", kind: "warn" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutateGrant, wallet, pushToast]
  );

  const value = useMemo(
    () => ({
      grants,
      wallet,
      role,
      setRole,
      toasts,
      busy,
      connectDemo,
      disconnect,
      dismissToast,
      createGrant,
      submitMilestone,
      approveMilestone,
      requestChanges,
      cancelGrant,
    }),
    [grants, wallet, role, toasts, busy, connectDemo, disconnect, dismissToast, createGrant, submitMilestone, approveMilestone, requestChanges, cancelGrant]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useKeystone(): KeystoneCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useKeystone must be used inside KeystoneProvider");
  return ctx;
}
