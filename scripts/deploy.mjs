/**
 * Deploy KeystoneEscrow to Circle's Arc.
 *
 *   ARC_RPC_URL   RPC endpoint (default: Arc mainnet https://rpc.mainnet.arc.io)
 *   PRIVATE_KEY   Deployer private key (0x-prefixed). NEVER commit this.
 *   NETWORK       "mainnet" (default) or "testnet"
 *
 * Rehearse on testnet first — mainnet spends real USDC for gas:
 *   NETWORK=testnet PRIVATE_KEY=0x... node scripts/deploy.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const NETWORKS = {
  mainnet: {
    id: 5042,
    name: "Arc",
    rpc: "https://rpc.mainnet.arc.io",
    explorer: "https://explorer.arc.io",
  },
  testnet: {
    id: 5042002,
    name: "Arc Testnet",
    rpc: "https://rpc.testnet.arc.io",
    explorer: "https://explorer.testnet.arc.io",
  },
};

const networkName = process.env.NETWORK || "mainnet";
const net = NETWORKS[networkName];
if (!net) throw new Error(`Unknown NETWORK "${networkName}" (use "mainnet" or "testnet")`);

const pk = process.env.PRIVATE_KEY;
if (!pk || !/^0x[0-9a-fA-F]{64}$/.test(pk)) {
  throw new Error("Set PRIVATE_KEY=0x... (64 hex chars) in your environment.");
}

const chain = defineChain({
  id: net.id,
  name: net.name,
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: [process.env.ARC_RPC_URL || net.rpc] } },
  blockExplorers: { default: { name: "Explorer", url: net.explorer } },
});

const abi = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "contracts", "build", "KeystoneEscrow.abi.json"), "utf8"));
const bytecode = fs.readFileSync(path.join(__dirname, "..", "contracts", "build", "KeystoneEscrow.bytecode.txt"), "utf8").trim();

const account = privateKeyToAccount(pk);
const publicClient = createPublicClient({ chain, transport: http(process.env.ARC_RPC_URL || net.rpc) });
const walletClient = createWalletClient({ account, chain, transport: http(process.env.ARC_RPC_URL || net.rpc) });

const chainId = await publicClient.getChainId();
if (chainId !== net.id) throw new Error(`RPC chain id ${chainId} != expected ${net.id}. Wrong network!`);

console.log(`Deploying KeystoneEscrow to ${net.name} (chain ${net.id}) from ${account.address}…`);

const hash = await walletClient.deployContract({ abi, bytecode, account });
console.log("  deploy tx:", hash);
console.log("  explorer: ", `${net.explorer}/tx/${hash}`);

const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log("  contract: ", receipt.contractAddress);
console.log("  explorer: ", `${net.explorer}/address/${receipt.contractAddress}`);
console.log("\nNext: set NEXT_PUBLIC_KEYSTONE_ADDRESS=" + receipt.contractAddress + " in app/.env");
