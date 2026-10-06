export type MilestoneStatus = "pending" | "submitted" | "paid" | "cancelled";

export interface Milestone {
  title: string;
  detail: string;
  amount: bigint; // micro-USDC (6 decimals)
  deadline: number; // unix seconds
  status: MilestoneStatus;
  proofURI: string;
  submittedAt: number;
  paidAt: number;
}

export type EventKind =
  | "created"
  | "submitted"
  | "approved"
  | "changes"
  | "reclaimed"
  | "cancelled"
  | "note";

export interface GrantEvent {
  id: string;
  at: number;
  kind: EventKind;
  actor: string;
  text: string;
  tx?: string;
}

export interface Grant {
  id: number;
  title: string;
  tagline: string;
  description: string;
  category: string;
  funder: string;
  builder: string;
  reviewer: string;
  totalAmount: bigint;
  releasedAmount: bigint;
  createdAt: number;
  cancelled: boolean;
  milestones: Milestone[];
  activity: GrantEvent[];
  live?: boolean; // true = read from the on-chain contract, not demo data
}

export const DEMO_WALLET = "0x7A3f1cE9bD24a6F05c8E37d2A9F4b1C6d8E5a0F3";

const now = Math.floor(Date.now() / 1000);
const D = 86400;
const M = (usdc: number) => BigInt(Math.round(usdc * 1_000_000));

const A = {
  maya: "0x8f3A2cD1e4B5a69780B1c2D3e4F5a6B7c8D9e0F1",
  ren: "0x3B7d2A9F4b1C6d8E5a0F37A3f1cE9bD24a6F05c8",
  theo: "0xC6d8E5a0F37A3f1cE9bD24a6F05c8E37d2A9F4b1",
  june: "0x1cE9bD24a6F05c8E37d2A9F4b1C6d8E5a0F37A3f",
  priya: "0xE37d2A9F4b1C6d8E5a0F37A3f1cE9bD24a6F05c8",
};

function ev(id: string, at: number, kind: EventKind, actor: string, text: string, tx?: string): GrantEvent {
  return { id, at, kind, actor, text, tx };
}

export const DEMO_GRANTS: Grant[] = [
  {
    id: 0,
    title: "Arcline SDK",
    tagline: "A TypeScript toolkit that makes building on Arc feel like building on the web.",
    description:
      "Arcline is an open-source TypeScript SDK for Circle's Arc: typed USDC transfers, one-line wallet onboarding, gas estimation in dollars instead of gwei, and ready-made React hooks. Milestones ship as audited npm releases with docs and examples.",
    category: "Developer tools",
    funder: DEMO_WALLET,
    builder: A.maya,
    reviewer: A.ren,
    totalAmount: M(4000),
    releasedAmount: M(2200),
    createdAt: now - 34 * D,
    cancelled: false,
    milestones: [
      {
        title: "Core transfers & wallet connect",
        detail: "Typed transfer(), batch transfers, and a drop-in <ConnectArc/> React component.",
        amount: M(1200),
        deadline: now - 20 * D,
        status: "paid",
        proofURI: "https://github.com/arcline/sdk/releases/tag/v0.1.0",
        submittedAt: now - 22 * D,
        paidAt: now - 21 * D,
      },
      {
        title: "Gas-in-dollars estimator",
        detail: "Realtime fee quotes denominated in USDC with sub-second finality hints.",
        amount: M(1000),
        deadline: now - 10 * D,
        status: "paid",
        proofURI: "https://github.com/arcline/sdk/releases/tag/v0.2.0",
        submittedAt: now - 12 * D,
        paidAt: now - 11 * D,
      },
      {
        title: "React hooks & examples",
        detail: "useArcBalance, useUSDCSend, and five copy-paste example apps.",
        amount: M(1000),
        deadline: now + 6 * D,
        status: "submitted",
        proofURI: "https://github.com/arcline/sdk/pull/48",
        submittedAt: now - 1 * D,
        paidAt: 0,
      },
      {
        title: "Docs site & audit pass",
        detail: "Full docs, migration guides, and an external review of the release.",
        amount: M(800),
        deadline: now + 20 * D,
        status: "pending",
        proofURI: "",
        submittedAt: 0,
        paidAt: 0,
      },
    ],
    activity: [
      ev("0-a1", now - 34 * D, "created", DEMO_WALLET, "Grant created and funded with 4,000.00 USDC locked in escrow."),
      ev("0-a2", now - 22 * D, "submitted", A.maya, "Submitted proof for “Core transfers & wallet connect”."),
      ev("0-a3", now - 21 * D, "approved", A.ren, "Approved milestone 1 — 1,200.00 USDC released to builder."),
      ev("0-a4", now - 12 * D, "submitted", A.maya, "Submitted proof for “Gas-in-dollars estimator”."),
      ev("0-a5", now - 11 * D, "approved", A.ren, "Approved milestone 2 — 1,000.00 USDC released to builder."),
      ev("0-a6", now - 1 * D, "submitted", A.maya, "Submitted proof for “React hooks & examples”."),
      ev("0-a7", now - 20 * 3600, "note", A.ren, "Reviewing PR #48 — hooks look clean, running the example apps now."),
    ],
  },
  {
    id: 1,
    title: "GigRep",
    tagline: "Portable onchain reputation for gig workers, settled in USDC.",
    description:
      "GigRep lets independent workers carry verified job history across platforms. Completed gigs mint non-transferable attestations; clients stake USDC that releases on delivery. This grant funds the attestation contracts and a worker-facing profile page.",
    category: "Identity",
    funder: A.theo,
    builder: A.june,
    reviewer: DEMO_WALLET,
    totalAmount: M(1800),
    releasedAmount: M(600),
    createdAt: now - 21 * D,
    cancelled: false,
    milestones: [
      {
        title: "Attestation contracts",
        detail: "Non-transferable work attestations with revocation by issuer.",
        amount: M(600),
        deadline: now - 7 * D,
        status: "paid",
        proofURI: "https://explorer.arc.io/address/0x91c2…44ab",
        submittedAt: now - 9 * D,
        paidAt: now - 8 * D,
      },
      {
        title: "Worker profiles",
        detail: "Public profile pages rendering attestation history.",
        amount: M(700),
        deadline: now + 9 * D,
        status: "pending",
        proofURI: "",
        submittedAt: 0,
        paidAt: 0,
      },
      {
        title: "Client staking flow",
        detail: "USDC stake on gig start, auto-release on worker confirmation.",
        amount: M(500),
        deadline: now + 23 * D,
        status: "pending",
        proofURI: "",
        submittedAt: 0,
        paidAt: 0,
      },
    ],
    activity: [
      ev("1-a1", now - 21 * D, "created", A.theo, "Grant created and funded with 1,800.00 USDC locked in escrow."),
      ev("1-a2", now - 9 * D, "submitted", A.june, "Submitted proof for “Attestation contracts”."),
      ev("1-a3", now - 8 * D, "approved", DEMO_WALLET, "Approved milestone 1 — 600.00 USDC released to builder."),
      ev("1-a4", now - 2 * D, "note", A.june, "Profiles are 70% done — sharing a preview link with the reviewer tomorrow."),
    ],
  },
  {
    id: 2,
    title: "Payroll Rails",
    tagline: "Recurring USDC payroll for DAOs and remote teams on Arc.",
    description:
      "Payroll Rails turns a DAO treasury into a payroll department: define roles and salaries once, and the contract streams USDC to contributors every epoch. Sub-second finality means payday settles before the standup ends.",
    category: "Payments",
    funder: A.priya,
    builder: A.theo,
    reviewer: A.maya,
    totalAmount: M(6000),
    releasedAmount: M(0),
    createdAt: now - 3 * D,
    cancelled: false,
    milestones: [
      {
        title: "Streaming engine",
        detail: "Per-epoch USDC distribution with pro-rata joins and exits.",
        amount: M(2500),
        deadline: now + 18 * D,
        status: "pending",
        proofURI: "",
        submittedAt: 0,
        paidAt: 0,
      },
      {
        title: "Treasury dashboard",
        detail: "Role management, salary bands, and payroll history exports.",
        amount: M(2000),
        deadline: now + 32 * D,
        status: "pending",
        proofURI: "",
        submittedAt: 0,
        paidAt: 0,
      },
      {
        title: "Mainnet pilot",
        detail: "Two real DAOs run a full payroll cycle on Arc mainnet.",
        amount: M(1500),
        deadline: now + 46 * D,
        status: "pending",
        proofURI: "",
        submittedAt: 0,
        paidAt: 0,
      },
    ],
    activity: [
      ev("2-a1", now - 3 * D, "created", A.priya, "Grant created and funded with 6,000.00 USDC locked in escrow."),
      ev("2-a2", now - 3 * D + 3600, "note", A.theo, "Kicking off the streaming engine — targeting the first internal testnet run next week."),
    ],
  },
  {
    id: 3,
    title: "Arc Widgets",
    tagline: "Embeddable balance & payment widgets for any website.",
    description:
      "Arc Widgets is a 12kb embeddable script: drop two lines of HTML on any site and get a working USDC balance display and pay button wired to Arc. This grant is complete — all milestones were delivered and paid.",
    category: "Developer tools",
    funder: A.ren,
    builder: A.priya,
    reviewer: A.june,
    totalAmount: M(950),
    releasedAmount: M(950),
    createdAt: now - 60 * D,
    cancelled: false,
    milestones: [
      {
        title: "Balance widget",
        detail: "Embeddable USDC balance with auto-refresh on new blocks.",
        amount: M(400),
        deadline: now - 40 * D,
        status: "paid",
        proofURI: "https://arc-widgets.dev/demo/balance",
        submittedAt: now - 44 * D,
        paidAt: now - 43 * D,
      },
      {
        title: "Pay button",
        detail: "One-click USDC pay button with success callbacks.",
        amount: M(550),
        deadline: now - 25 * D,
        status: "paid",
        proofURI: "https://arc-widgets.dev/demo/pay",
        submittedAt: now - 28 * D,
        paidAt: now - 27 * D,
      },
    ],
    activity: [
      ev("3-a1", now - 60 * D, "created", A.ren, "Grant created and funded with 950.00 USDC locked in escrow."),
      ev("3-a2", now - 44 * D, "submitted", A.priya, "Submitted proof for “Balance widget”."),
      ev("3-a3", now - 43 * D, "approved", A.june, "Approved milestone 1 — 400.00 USDC released to builder."),
      ev("3-a4", now - 28 * D, "submitted", A.priya, "Submitted proof for “Pay button”."),
      ev("3-a5", now - 27 * D, "approved", A.june, "Approved milestone 2 — 550.00 USDC released to builder."),
    ],
  },
  {
    id: 4,
    title: "DocSprint: Arc Handbook",
    tagline: "A weekend documentation sprint — proof that micro-grants work.",
    description:
      "Two technical writers, one weekend, one complete handbook chapter set for Arc: USDC transfer guides, wallet onboarding walkthroughs, and a troubleshooting FAQ. Funded as a micro-grant to prove that even a $60 milestone clears escrow cleanly.",
    category: "Education",
    funder: A.maya,
    builder: A.ren,
    reviewer: DEMO_WALLET,
    totalAmount: M(120),
    releasedAmount: M(120),
    createdAt: now - 12 * D,
    cancelled: false,
    milestones: [
      {
        title: "Transfer & wallet guides",
        detail: "Five illustrated guides covering transfers, onboarding, and common pitfalls.",
        amount: M(60),
        deadline: now - 9 * D,
        status: "paid",
        proofURI: "https://arc-handbook.dev/guides",
        submittedAt: now - 10 * D,
        paidAt: now - 10 * D + 3600,
      },
      {
        title: "Troubleshooting FAQ",
        detail: "Twenty answered questions sourced from the developer Discord.",
        amount: M(60),
        deadline: now - 5 * D,
        status: "paid",
        proofURI: "https://arc-handbook.dev/faq",
        submittedAt: now - 6 * D,
        paidAt: now - 6 * D + 1800,
      },
    ],
    activity: [
      ev("4-a1", now - 12 * D, "created", A.maya, "Grant created and funded with 120.00 USDC locked in escrow."),
      ev("4-a2", now - 10 * D, "submitted", A.ren, "Submitted proof for “Transfer & wallet guides”."),
      ev("4-a3", now - 10 * D + 3600, "approved", DEMO_WALLET, "Approved milestone 1 — 60.00 USDC released to builder."),
      ev("4-a4", now - 6 * D, "submitted", A.ren, "Submitted proof for “Troubleshooting FAQ”."),
      ev("4-a5", now - 6 * D + 1800, "approved", DEMO_WALLET, "Approved milestone 2 — 60.00 USDC released to builder."),
    ],
  },
  {
    id: 5,
    title: "ForumGate pilot",
    tagline: "A token-gated forum experiment — cancelled, funds returned.",
    description:
      "ForumGate proposed a token-gated discussion forum for Arc builders. After the first milestone missed its deadline twice with no communication, the funder dissolved the escrow. Every unreleased dollar returned automatically — this is the protection working as designed.",
    category: "Developer tools",
    funder: A.june,
    builder: A.theo,
    reviewer: A.priya,
    totalAmount: M(2000),
    releasedAmount: M(0),
    createdAt: now - 45 * D,
    cancelled: true,
    milestones: [
      {
        title: "Forum contracts",
        detail: "Gating logic and membership passes.",
        amount: M(800),
        deadline: now - 25 * D,
        status: "cancelled",
        proofURI: "",
        submittedAt: 0,
        paidAt: 0,
      },
      {
        title: "Moderation UI",
        detail: "Thread views and moderator tooling.",
        amount: M(1200),
        deadline: now - 10 * D,
        status: "cancelled",
        proofURI: "",
        submittedAt: 0,
        paidAt: 0,
      },
    ],
    activity: [
      ev("5-a1", now - 45 * D, "created", A.june, "Grant created and funded with 2,000.00 USDC locked in escrow."),
      ev("5-a2", now - 24 * D, "note", A.priya, "Milestone 1 is 5 days overdue with no update from the builder."),
      ev("5-a3", now - 20 * D, "cancelled", A.june, "Grant cancelled — 2,000.00 USDC refunded to funder. No milestones were paid."),
    ],
  },
  {
    id: 6,
    title: "Hindi DeFi Course",
    tagline: "A free Hindi-first DeFi course, funded milestone by milestone.",
    description:
      "A 12-video Hindi course taking first-time users from zero to confident DeFi participants on Arc: wallets, USDC, swaps, and safety. Each module ships as a milestone with the videos as proof — the reviewer is a native Hindi speaker from the community.",
    category: "Education",
    funder: DEMO_WALLET,
    builder: A.priya,
    reviewer: A.june,
    totalAmount: M(900),
    releasedAmount: M(300),
    createdAt: now - 16 * D,
    cancelled: false,
    milestones: [
      {
        title: "Modules 1–4: Wallets & USDC",
        detail: "Wallet setup, receiving USDC, and first transfer — all in Hindi.",
        amount: M(300),
        deadline: now - 4 * D,
        status: "paid",
        proofURI: "https://hindi-defi.course/modules-1-4",
        submittedAt: now - 6 * D,
        paidAt: now - 5 * D,
      },
      {
        title: "Modules 5–8: Swaps & safety",
        detail: "Swapping, slippage, and the five scams every beginner must know.",
        amount: M(300),
        deadline: now + 8 * D,
        status: "submitted",
        proofURI: "https://hindi-defi.course/modules-5-8",
        submittedAt: now - 12 * 3600,
        paidAt: 0,
      },
      {
        title: "Modules 9–12: Advanced & exam",
        detail: "Yield basics, portfolio tracking, and a final quiz with onchain certificate.",
        amount: M(300),
        deadline: now + 22 * D,
        status: "pending",
        proofURI: "",
        submittedAt: 0,
        paidAt: 0,
      },
    ],
    activity: [
      ev("6-a1", now - 16 * D, "created", DEMO_WALLET, "Grant created and funded with 900.00 USDC locked in escrow."),
      ev("6-a2", now - 6 * D, "submitted", A.priya, "Submitted proof for “Modules 1–4: Wallets & USDC”."),
      ev("6-a3", now - 5 * D, "approved", A.june, "Approved milestone 1 — 300.00 USDC released to builder."),
      ev("6-a4", now - 12 * 3600, "submitted", A.priya, "Submitted proof for “Modules 5–8: Swaps & safety”."),
    ],
  },
];

export function grantProgress(g: Grant): number {
  if (g.totalAmount === 0n) return 0;
  return Number((g.releasedAmount * 10000n) / g.totalAmount) / 100;
}

export function grantStatus(g: Grant): "funded" | "in-progress" | "complete" | "cancelled" {
  if (g.cancelled) return "cancelled";
  if (g.releasedAmount === g.totalAmount) return "complete";
  if (g.releasedAmount > 0n) return "in-progress";
  return "funded";
}
