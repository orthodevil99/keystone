# Keystone — Security & Trust Model

`KeystoneEscrow.sol` holds other people's money. This document spells out exactly
who can do what, what can go wrong, and what cannot.

## No privileged admin

The contract has **no owner, no admin, no upgrade path, and no pause switch**.
There is no address anywhere in the system that can drain funds, change rules,
or freeze a grant. Once deployed, the bytecode is the entire trust model.

## Role permissions

Each grant names three roles at creation time. Roles are fixed for the life of
the grant.

| Action | Who | Notes |
|---|---|---|
| `createGrant` / `createGrantNative` | anyone (becomes funder) | Locks the full grant amount in escrow up front |
| `submitMilestone` | builder only | Moves milestone Pending → Submitted |
| `approveMilestone` | reviewer only | Moves milestone Submitted → Paid, releases USDC to builder |
| `requestChanges` | reviewer only | Moves milestone Submitted → Pending, funds stay locked |
| `reclaimExpired` | funder only | Reclaims a milestone past its deadline that was never paid |
| `cancelGrant` | funder only | Cancels grant, refunds all unreleased USDC to funder |

Every state-changing function is guarded by `nonReentrant`.

## Dispute path

There is no arbitration backdoor. Disputes resolve through the roles:

1. Builder submits proof of work (`submitMilestone`).
2. Reviewer either approves (funds release) or sends it back (`requestChanges`).
3. If a milestone sits past its deadline with no approval, the funder can
   reclaim that milestone's funds (`reclaimExpired`).
4. The funder can always cancel the grant and recover everything unpaid
   (`cancelGrant`).

The reviewer cannot steal funds — approval always pays the **builder**, never
the reviewer. The builder cannot self-approve. The funder cannot claw back
funds already paid out.

## What happens to the money

- **Zero protocol fee.** 100% of the locked amount is payable to the builder.
  The contract takes no cut on funding, approval, or refund.
- Funds move only on: milestone approval (→ builder), expiry reclaim
  (→ funder), or grant cancellation (→ funder).
- Paid milestones are final. `cancelGrant` and `reclaimExpired` only touch
  unpaid milestones.

## Known limitations

- **No external audit.** The contract is small (~9.3 KB bytecode) and written
  defensively, but it has not been professionally audited.
- **No automated test suite yet.** Manual review + local compilation only.
- Milestone deadlines and proof URIs are informational — the contract enforces
  *who* can act and *when* funds move, not the quality of the delivered work.
  Work quality is the reviewer's judgment call.
- `createGrant` (ERC-20 path) requires a separate `approve` transaction;
  `createGrantNative` funds in a single transaction using Arc's native USDC.
