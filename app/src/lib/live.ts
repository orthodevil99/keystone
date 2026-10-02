import { createPublicClient, http } from "viem";
import { arc, KEYSTONE_ADDRESS, keystoneAbi } from "./arc";
import type { Grant, Milestone, MilestoneStatus } from "./demo";

const STATUS: MilestoneStatus[] = ["pending", "submitted", "paid", "cancelled"];

/** Normalize a chain amount to 6-decimal micro-USDC for display.
 *  Native grants (token == 0x0) use 18 decimals; ERC-20 USDC uses 6. */
function toMicro(amount: bigint, token: string): bigint {
  if (token === "0x0000000000000000000000000000000000000000") {
    return amount / 1_000_000_000_000n; // 18 -> 6 decimals
  }
  return amount;
}

/** Read-only: fetch one on-chain grant by id. No wallet needed. */
export async function fetchLiveGrant(id: number): Promise<Grant | null> {
  const grants = await fetchLiveGrants();
  return grants.find((g) => g.id === id) ?? null;
}
export async function fetchLiveGrants(): Promise<Grant[]> {
  if (!KEYSTONE_ADDRESS) return [];
  const client = createPublicClient({ chain: arc, transport: http() });
  const abi = keystoneAbi as any;

  const count = (await client.readContract({
    address: KEYSTONE_ADDRESS,
    abi,
    functionName: "grantCount",
  })) as bigint;

  const grants: Grant[] = [];
  for (let i = 0; i < Number(count); i++) {
    const g = (await client.readContract({
      address: KEYSTONE_ADDRESS,
      abi,
      functionName: "getGrant",
      args: [BigInt(i)],
    })) as any;
    const ms = (await client.readContract({
      address: KEYSTONE_ADDRESS,
      abi,
      functionName: "getMilestones",
      args: [BigInt(i)],
    })) as any[];

    const milestones: Milestone[] = ms.map((m) => ({
      title: m.title as string,
      detail: m.proofURI as string,
      amount: toMicro(m.amount as bigint, g.token as string),
      deadline: Number(m.deadline),
      status: STATUS[Number(m.status)] ?? "pending",
      proofURI: m.proofURI as string,
      submittedAt: Number(m.submittedAt),
      paidAt: Number(m.paidAt),
    }));

    grants.push({
      id: i,
      title: g.title as string,
      tagline: "Live on Arc mainnet",
      description: g.descriptionURI as string,
      category: "Live",
      funder: g.funder as string,
      builder: g.builder as string,
      reviewer: g.reviewer as string,
      totalAmount: toMicro(g.totalAmount as bigint, g.token as string),
      releasedAmount: toMicro(g.releasedAmount as bigint, g.token as string),
      createdAt: Number(g.createdAt),
      cancelled: g.cancelled as boolean,
      milestones,
      activity: [],
      live: true,
    });
  }
  return grants;
}
