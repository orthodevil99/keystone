import { Grant, GrantEvent } from "@/lib/demo";
import { shortenAddress, timeAgo } from "@/lib/format";
import { explorerTx } from "@/lib/arc";

const KIND_STYLE: Record<GrantEvent["kind"], { dot: string; label: string }> = {
  created: { dot: "#DFAF5E", label: "Grant created" },
  submitted: { dot: "#7FB6D9", label: "Proof submitted" },
  approved: { dot: "#4E9A5F", label: "Milestone paid" },
  changes: { dot: "#D9A05F", label: "Changes requested" },
  reclaimed: { dot: "#C05B3F", label: "Funds reclaimed" },
  cancelled: { dot: "#C05B3F", label: "Grant cancelled" },
  note: { dot: "rgba(244,241,232,0.35)", label: "Note" },
};

export default function ActivityFeed({ grant }: { grant: Grant }) {
  const items = [...grant.activity].reverse();
  return (
    <div className="card rounded-3xl p-6 sm:p-7">
      <p className="eyebrow mb-5">Activity</p>
      <div className="flex flex-col gap-5">
        {items.map((a) => {
          const s = KIND_STYLE[a.kind];
          return (
            <div key={a.id} className="flex gap-4">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: s.dot }} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-bone-100/45">{s.label}</span>
                  <span className="font-mono text-[11px] text-bone-100/35">{timeAgo(a.at)}</span>
                </div>
                <p className="mt-1 text-[13.5px] leading-relaxed text-bone-100/75">{a.text}</p>
                <p className="mt-1 font-mono text-[11px] text-bone-100/35">
                  {shortenAddress(a.actor)}
                  {a.tx && (
                    <>
                      {" · "}
                      <a href={explorerTx(a.tx)} target="_blank" rel="noreferrer" className="text-brass-400/80 hover:underline">
                        {a.tx.slice(0, 10)}… ↗
                      </a>
                    </>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
