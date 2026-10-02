# Keystone — Milestone escrow for grants on Arc

**Fund the work. Release the proof.**

Keystone is a milestone-based escrow protocol for grants and bounties, built natively for Circle's **Arc** (chain 5042). Funders lock USDC up front; builders submit proof per milestone; reviewers release each tranche on approval. Unreleased funds are always reclaimable — by deadline expiry or instant cancellation.

Why Arc makes this work: gas is paid in **USDC itself** (~$0.001/tx), finality is **sub-second and deterministic**, and the chain is EVM-compatible — so even a $5 milestone payout is economically sensible. On legacy chains, escrow mechanics like this drown in fees.

> Built for the [Arc Microgrants](https://dorahacks.io/hackathon/arc-microgrants/detail) program on DoraHacks. This project is 100% original — designed and built from scratch for this submission.

---

## Architecture

```
keystone/
├── contracts/
│   ├── KeystoneEscrow.sol      # The escrow protocol (Solidity 0.8.28, MIT)
│   ├── compile.js              # solc-js build → build/KeystoneEscrow.{abi.json,bytecode.txt}
│   └── build/                  # Compiled artifacts (ABI + bytecode)
├── scripts/
│   └── deploy.mjs              # Deploy to Arc mainnet / testnet via viem
└── app/                        # Next.js 14 frontend (TypeScript + Tailwind)
    ├── src/app/                # / (landing) · /grants · /grants/[id] · /create · /dashboard
    ├── src/components/         # Design system: arch motif, progress rings, timelines…
    ├── src/lib/                # Arc chain config, demo engine, wallet, formatting
                          # Type: Instrument Serif, Inter, JetBrains Mono via Google Fonts
```

### The contract — `KeystoneEscrow.sol`

One compact, dependency-free contract (≈7.8 kb bytecode):

| Function | Who | What |
|---|---|---|
| `createGrantNative(builder, reviewer, title, descriptionURI, milestones[])` 💰 | funder | **1-click funding in native USDC** — one transaction, zero ERC-20 approvals (payable) |
| `createGrant(builder, reviewer, token, title, descriptionURI, milestones[])` | funder | Locks the full grant in one call for any ERC-20 (after `approve`) |
| `submitMilestone(grantId, index, proofURI)` | builder | Submits proof of completion |
| `approveMilestone(grantId, index)` | reviewer | Releases the tranche to the builder |
| `requestChanges(grantId, index, note)` | reviewer | Sends the milestone back for revision |
| `reclaimExpired(grantId, index)` | funder | Reclaims an unpaid milestone past its deadline |
| `cancelGrant(grantId)` | funder | Cancels everything unpaid; instant refund |

Safety: reentrancy guards on all fund-moving paths, checks-effects-interactions, role modifiers, deadline validation, full event log (`GrantCreated`, `MilestoneSubmitted`, `MilestoneApproved`, …). **Zero protocol fees** — 100% of escrow reaches builders.

**The Arc-native path:** `createGrantNative` escrows USDC directly as Arc's native gas token (18 decimals) — funding a grant is a single 1-click transaction with no ERC-20 approvals at all. The ERC-20 path (e.g. the canonical 6-decimal USDC view at `0x3600…0000`) remains available for integrations that prefer it.

### The frontend

A high-craft, dark editorial UI (no template): Instrument Serif display type, brass-on-ink palette, keystone/arch motif, animated settlement ticker, progress rings, milestone "stone" timelines, and a **demo wallet with a funder / builder / reviewer role switcher** so anyone can experience every flow in seconds — no funds needed.

When `NEXT_PUBLIC_KEYSTONE_ADDRESS` is set and a browser wallet (MetaMask / Rabby / Coinbase) is connected on Arc mainnet, the **Create flow executes real transactions**: a single `createGrantNative` call that escrows native USDC — no ERC-20 approvals needed.

---

## Run it

```bash
cd app
npm install
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

## Deploy the contract

```bash
cd contracts && npm install && node compile.js   # rebuild artifacts (optional — committed)
```

Rehearse on testnet first (faucet: https://faucet.circle.com), then mainnet:

```bash
# testnet rehearsal
NETWORK=testnet PRIVATE_KEY=0x... node scripts/deploy.mjs

# Arc mainnet — spends real USDC for gas
NETWORK=mainnet PRIVATE_KEY=0x... node scripts/deploy.mjs
```

Then point the app at it:

```bash
# app/.env
NEXT_PUBLIC_KEYSTONE_ADDRESS=0xYourDeployedAddress
```

Verify the contract on the explorer (judges check this):

```bash
CONTRACT=0xYourDeployedAddress node scripts/verify.mjs
```

Deploy the app to Vercel (`vercel` CLI or dashboard import — it's a standard Next.js app), submit the live URL + this repo to the DoraHacks page.

## Demo script (60 seconds)

1. Open the site → **Connect** → **Demo wallet**.
2. As **reviewer**: open *Arcline SDK* → approve milestone 3 → watch USDC release.
3. Switch to **builder**: submit proof on another milestone.
4. Switch to **funder**: **Create a grant** → define milestones → fund → see it live in Explore.
5. **Dashboard** shows the role-aware action queue and protocol stats.

## Tech

Solidity 0.8.28 · Next.js 14 · TypeScript · Tailwind · viem · Arc mainnet (5042) · USDC gas
