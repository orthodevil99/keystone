# DoraHacks submission — Keystone

## Project name
**Keystone — Milestone escrow for grants on Arc**

## One-liner
Funders lock USDC, builders deliver milestones, reviewers release funds — trustless grant escrow where settlement is final in under a second.

## What it does
Keystone turns grant funding into an enforceable on-chain agreement. A funder defines milestones and locks the full amount in USDC escrow with a single transaction. The builder ships each milestone and submits proof (a release, PR, or deployment). A reviewer approves — and USDC streams to the builder instantly. Missed deadlines let the funder reclaim unreleased tranches; one call cancels the whole grant with an instant refund. No invoices, no chasing, no trust required.

## What it uses Arc for
- **1-click native-USDC funding**: grants are created and funded in a single transaction with zero ERC-20 approvals — possible because USDC *is* Arc's gas token. Releasing a tranche costs ~$0.001 in gas, so milestone payouts as small as a few dollars stay viable.
- **Sub-second deterministic finality**: approval → payout settles before the reviewer closes the tab.
- **EVM compatibility**: the whole protocol is one compact Solidity contract (KeystoneEscrow.sol), deployed on Arc mainnet (chain 5042).

## Links
- Live app: _(your Vercel URL)_
- Repo: _(your GitHub URL)_
- Contract: `contracts/KeystoneEscrow.sol` (MIT, zero protocol fees, reentrancy-guarded)

## Demo
Open the live app → **Connect** → **Demo wallet** → use the role switcher (funder / builder / reviewer) to run every flow: fund a grant, submit proof, approve and release. With a browser wallet on Arc mainnet and the deployed contract address configured, the Create flow executes real `approve` + `createGrant` transactions.

## Why it should win
Grant programs — including this one — run on trust and spreadsheets. Keystone is the infrastructure that makes milestone funding enforceable, and it's only economically possible on a chain like Arc. It's a real contract, a complete product, and a love letter to the program funding it.
