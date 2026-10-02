import { defineChain } from "viem";
import escrowAbi from "./KeystoneEscrow.abi.json";

/** Circle's Arc mainnet — USDC is the native gas token. */
export const arc = defineChain({
  id: 5042,
  name: "Arc",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.arc.io"] },
    public: { http: ["https://rpc.mainnet.arc.io"] },
  },
  blockExplorers: {
    default: { name: "Arc Explorer", url: "https://explorer.arc.io" },
  },
});

/** Arc Testnet (for rehearsal before mainnet). */
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.io"] },
    public: { http: ["https://rpc.testnet.arc.io"] },
  },
  blockExplorers: {
    default: { name: "Arc Testnet Explorer", url: "https://explorer.testnet.arc.io" },
  },
});

/** Canonical USDC ERC-20 view on Arc (6 decimals). */
export const USDC_ERC20 = "0x3600000000000000000000000000000000000000" as const;

/** Minimal ERC-20 ABI for approve/allowance/decimals. */
export const erc20Abi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/** Deployed KeystoneEscrow address (set after `scripts/deploy`). Empty = demo mode. */
export const KEYSTONE_ADDRESS = (process.env.NEXT_PUBLIC_KEYSTONE_ADDRESS || "") as `0x${string}` | "";

export const keystoneAbi = escrowAbi as unknown as readonly unknown[];

export const explorerTx = (hash: string) => `https://explorer.arc.io/tx/${hash}`;
export const explorerAddress = (addr: string) => `https://explorer.arc.io/address/${addr}`;
