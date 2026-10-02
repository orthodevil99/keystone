"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createWalletClient, custom, type Abi, type Hash } from "viem";
import { arc } from "./arc";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WriteArgs {
  address: `0x${string}`;
  abi: Abi;
  functionName: string;
  args?: unknown[];
  value?: bigint;
}

interface WalletCtx {
  address: string | null;
  isConnected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  writeContract: (args: WriteArgs) => Promise<Hash>;
}

const Ctx = createContext<WalletCtx | null>(null);

const ARC_PARAMS = {
  chainId: "0x13B2", // 5042
  chainName: "Arc",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: ["https://rpc.mainnet.arc.io"],
  blockExplorerUrls: ["https://explorer.arc.io"],
};

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const eth = typeof window !== "undefined" ? window.ethereum : undefined;
    if (!eth?.on) return;
    const onAccounts = (accs: string[]) => setAddress(accs[0] ?? null);
    eth.on("accountsChanged", onAccounts);
    // restore existing connection silently
    eth
      .request({ method: "eth_accounts" })
      .then((accs: string[]) => accs[0] && setAddress(accs[0]))
      .catch(() => {});
    return () => eth.removeListener?.("accountsChanged", onAccounts);
  }, []);

  const connect = useCallback(async () => {
    const eth = typeof window !== "undefined" ? window.ethereum : undefined;
    if (!eth) {
      throw new Error("No injected wallet found. Install MetaMask, Rabby or Coinbase Wallet.");
    }
    setConnecting(true);
    try {
      // Connect accounts only — never force a chain switch here.
      // The Arc network switch happens lazily on the first real transaction.
      const accs: string[] = await eth.request({ method: "eth_requestAccounts" });
      setAddress(accs[0] ?? null);
    } finally {
      setConnecting(false);
    }
  }, []);

  const ensureArc = useCallback(async () => {
    const eth = typeof window !== "undefined" ? window.ethereum : undefined;
    if (!eth) throw new Error("No injected wallet found.");
    const chainId: string = await eth.request({ method: "eth_chainId" });
    if (chainId.toLowerCase() === ARC_PARAMS.chainId.toLowerCase()) return;
    try {
      await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: ARC_PARAMS.chainId }] });
    } catch (switchErr: any) {
      if (switchErr?.code === 4902) {
        await eth.request({ method: "wallet_addEthereumChain", params: [ARC_PARAMS] });
      } else {
        throw switchErr;
      }
    }
  }, []);

  const disconnect = useCallback(() => setAddress(null), []);

  const writeContract = useCallback(
    async ({ address: to, abi, functionName, args, value }: WriteArgs): Promise<Hash> => {
      const eth = window.ethereum;
      if (!eth || !address) throw new Error("Wallet not connected");
      await ensureArc();
      const client = createWalletClient({
        account: address as `0x${string}`,
        chain: arc,
        transport: custom(eth),
      });
      return client.writeContract({ address: to, abi, functionName, args, value } as any);
    },
    [address, ensureArc]
  );

  return (
    <Ctx.Provider value={{ address, isConnected: !!address, connecting, connect, disconnect, writeContract }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWallet(): WalletCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
