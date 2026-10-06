# Keystone QA — pre-submission checklist

Run date: 2026-10-06
Build: `npm run build` in `app/` — passing.
Browser QA walkthrough completed (read-only) on https://keystone-prakhar-5e28.vercel.app/.

## Demo journey (must never break)

- [x] Landing loads, hero + stats + ticker render, no console errors
- [x] Explore shows 7 demo grants, Demo active (no contract configured)
- [x] Status filters (all / funded / in-progress / complete) filter correctly
- [x] Grant detail: milestone timeline renders, escrow contract row present
- [x] Create wizard: all 4 steps, validation, review screen (not submitted)
- [x] Dashboard loads, role switcher present in Connect modal
- [ ] Role journey end-to-end with demo wallet (not run — QA was read-only by instruction)
- [x] Cancel flow messaging correct

## Bugs found & fixed

- [x] Settled milestones showed "overdue" (deadlineLabel ignored status) — fixed: relative
      deadline label now only renders for pending/submitted milestones.
- [x] Cancelled grant showed "$2,000.00 locked" (contradicts dissolved escrow) — fixed:
      cancelled grants now show "$X refunded".

## Mobile (390px)

- [ ] NOT VERIFIED — browser tooling has no viewport-resize action. Static audit done:
      no fixed-width overflows, ArchArt hidden below lg, comparison table scrolls in its
      container, touch targets >= 44px. Verify on a real device before submission.

- [ ] Landing loads, hero + stats + ticker render, no console errors
- [ ] Explore shows 7 demo grants, Live/Demo toggle present (Demo active, no contract configured)
- [ ] Status filters (all / funded / in-progress / complete) filter correctly
- [ ] Grant detail: milestone timeline renders, escrow contract row present
- [ ] Create wizard: all 4 steps, validation, review screen (do not submit on live site)
- [ ] Dashboard loads, role switcher works (funder / builder / reviewer)
- [ ] Role journey: funder creates → builder submits proof → reviewer approves → payout shown
- [ ] Cancel flow: funder cancels, refund messaging correct

## Mobile (390px)

- [ ] No horizontal scroll on any page
- [ ] Hero stacks, ArchArt hidden, stats readable
- [ ] Comparison table scrolls horizontally within its container
- [ ] Touch targets ≥ 44px on interactive elements
- [ ] Create wizard usable on mobile

## Visual / motion

- [ ] Ticker pauses on hover
- [ ] Card hovers lift smoothly, no jank
- [ ] Scroll reveals fire once, no flicker
- [ ] `prefers-reduced-motion` disables ambient animation
- [ ] No broken images, no layout shift on load

## Integrity (judge will screenshot)

- [ ] No "real funding" claims in demo mode
- [ ] SUBMISSION.md honest about deployment status
- [ ] Contract address placeholder where applicable, never a fake address

## What's shaky

- Live on-chain lifecycle (submit/approve/changes/cancel) is wired but untested against a
  real deployment — no contract on Arc mainnet yet. Test immediately after Oct 8–9 deployment.
- OG image is generated at request time via `next/og` — verify it renders on first share.
- `fetchLiveGrants` reads grants sequentially; fine for <50 grants, revisit if the registry grows.
