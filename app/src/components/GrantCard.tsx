import Link from "next/link";
import { Grant, grantProgress, grantStatus } from "@/lib/demo";
import { formatUSDC, shortenAddress } from "@/lib/format";
import ProgressRing from "./ProgressRing";

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    funded: "border-brass-500/40 bg-brass-500/10 text-brass-300",
    "in-progress": "border-[#7FB6D9]/40 bg-[#7FB6D9]/10 text-[#9CC8E4]",
    complete: "border-moss-500/40 bg-moss-500/10 text-moss-400",
    cancelled: "border-clay-500/40 bg-clay-500/10 text-clay-400",
    pending: "border-bone-100/20 bg-bone-100/5 text-bone-100/60",
    submitted: "border-[#7FB6D9]/40 bg-[#7FB6D9]/10 text-[#9CC8E4]",
    paid: "border-moss-500/40 bg-moss-500/10 text-moss-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] ${styles[status] || styles.pending}`}>
      {status.replace("-", " ")}
    </span>
  );
}

export default function GrantCard({ grant }: { grant: Grant }) {
  const progress = grantProgress(grant);
  const status = grantStatus(grant);
  const paidCount = grant.milestones.filter((m) => m.status === "paid").length;

  return (
    <Link href={`/grants/${grant.id}`} className="card card-hover group flex flex-col rounded-3xl p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{grant.category}</p>
          <h3 className="display mt-2 text-[26px] leading-tight text-bone-100 transition group-hover:text-brass-300">
            {grant.title}
          </h3>
        </div>
        <div className="relative shrink-0">
          <ProgressRing percent={progress} size={58} stroke={5} />
          <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-bone-100/70">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-[13.5px] leading-relaxed text-bone-100/55">{grant.tagline}</p>

      <div className="mt-5 flex items-end justify-between border-t rule pt-5">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-bone-100/40">Released</p>
          <p className="mt-1 font-mono text-[19px] text-bone-100">
            ${formatUSDC(grant.releasedAmount)}
            <span className="text-[13px] text-bone-100/40"> / ${formatUSDC(grant.totalAmount)}</span>
          </p>
        </div>
        <StatusPill status={status} />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {grant.milestones.map((m, i) => (
            <span
              key={i}
              title={m.title}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: m.status === "paid" ? 26 : 14,
                background:
                  m.status === "paid"
                    ? "#4E9A5F"
                    : m.status === "submitted"
                      ? "#7FB6D9"
                      : m.status === "cancelled"
                        ? "#C05B3F"
                        : "rgba(244,241,232,0.18)",
              }}
            />
          ))}
          <span className="ml-2 font-mono text-[11px] text-bone-100/40">
            {paidCount}/{grant.milestones.length} paid
          </span>
        </div>
        <span className="font-mono text-[11px] text-bone-100/40" title={`Builder ${grant.builder}`}>
          {shortenAddress(grant.builder)}
        </span>
      </div>
    </Link>
  );
}
