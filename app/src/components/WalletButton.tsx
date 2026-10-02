"use client";

import { useState } from "react";
import { DemoRole, useKeystone } from "@/lib/store";
import { useWallet } from "@/lib/wallet";
import { shortenAddress } from "@/lib/format";
import Modal from "./Modal";

const ROLES: { id: DemoRole; label: string; hint: string }[] = [
  { id: "funder", label: "Funder", hint: "Create & fund grants, cancel" },
  { id: "builder", label: "Builder", hint: "Submit milestone proofs" },
  { id: "reviewer", label: "Reviewer", hint: "Approve & release funds" },
];

export default function WalletButton() {
  const { wallet, role, setRole, connectDemo, disconnect } = useKeystone();
  const { address, isConnected, connecting, connect, disconnect: walletDisconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");

  const doBrowserConnect = async () => {
    setErr("");
    try {
      await connect();
      setOpen(false);
    } catch (e: any) {
      setErr(e?.message || "Connection failed");
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden rounded-full border border-moss-500/40 bg-moss-500/10 px-3 py-1.5 font-mono text-[11px] text-moss-400 sm:block">
          ● live
        </span>
        <button
          onClick={walletDisconnect}
          className="btn-ghost rounded-full px-4 py-2 font-mono text-[12.5px] text-bone-100"
          title={`${address} — click to disconnect`}
        >
          {shortenAddress(address)}
        </button>
      </div>
    );
  }

  if (wallet) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1 rounded-full border rule p-1 sm:flex">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              title={r.hint}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                role === r.id ? "bg-brass-500 text-ink-950" : "text-bone-100/55 hover:text-bone-100"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button
          onClick={disconnect}
          className="btn-ghost rounded-full px-4 py-2 font-mono text-[12.5px] text-bone-100"
          title={`${wallet} — click to disconnect`}
        >
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brass-400" />
          {shortenAddress(wallet)}
        </button>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-brass rounded-full px-5 py-2.5 text-[13.5px] font-semibold">
        Connect
      </button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <p className="eyebrow">Connect wallet</p>
        <h3 className="display mt-2 text-3xl text-bone-100">
          Step into the <em>demo</em>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-bone-100/60">
          Explore every flow — funding, submitting, approving — with a demo wallet on a simulated Arc chain. Or
          connect your real wallet to use live contracts on Arc mainnet.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => {
              connectDemo();
              setOpen(false);
            }}
            className="btn-brass rounded-2xl p-4 text-left"
          >
            <p className="font-semibold">Demo wallet</p>
            <p className="mt-0.5 text-[13px] opacity-70">Instant access · switch between funder, builder & reviewer roles</p>
          </button>
          <button
            onClick={doBrowserConnect}
            disabled={connecting}
            className="btn-ghost rounded-2xl p-4 text-left disabled:opacity-60"
          >
            <p className="font-semibold text-bone-100">{connecting ? "Connecting…" : "Browser wallet"}</p>
            <p className="mt-0.5 text-[13px] text-bone-100/55">MetaMask, Rabby or Coinbase Wallet · auto-switches to Arc (5042)</p>
          </button>
        </div>
        {err && <p className="mt-4 font-mono text-[12px] text-clay-400">{err}</p>}
        <p className="mt-5 font-mono text-[11px] leading-relaxed text-bone-100/35">
          Demo mode simulates on-chain settlement. Nothing here moves real funds.
        </p>
      </Modal>
    </>
  );
}
