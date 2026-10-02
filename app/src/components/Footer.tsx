import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t rule mt-24">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Logo size={30} />
              <span className="display text-xl text-bone-100">Keystone</span>
            </div>
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-bone-100/50">
              Milestone-based escrow for grants and bounties. Funders lock USDC, builders deliver, reviewers release —
              on Circle's Arc, where gas costs cents and finality takes under a second.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="pulse-soft inline-block h-1.5 w-1.5 rounded-full bg-moss-400" />
              <span className="font-mono text-[11px] text-bone-100/50">Arc mainnet · chain 5042 · USDC gas</span>
            </div>
          </div>
          <div>
            <p className="eyebrow mb-4">Product</p>
            <ul className="space-y-2.5 text-[13.5px] text-bone-100/60">
              <li><Link href="/grants" className="transition hover:text-bone-100">Explore grants</Link></li>
              <li><Link href="/create" className="transition hover:text-bone-100">Create a grant</Link></li>
              <li><Link href="/dashboard" className="transition hover:text-bone-100">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4">Protocol</p>
            <ul className="space-y-2.5 text-[13.5px] text-bone-100/60">
              <li><a href="https://explorer.arc.io" target="_blank" rel="noreferrer" className="transition hover:text-bone-100">Arc Explorer ↗</a></li>
              <li><a href="https://www.arc.io" target="_blank" rel="noreferrer" className="transition hover:text-bone-100">Arc by Circle ↗</a></li>
              <li><a href="https://dorahacks.io/hackathon/arc-microgrants/detail" target="_blank" rel="noreferrer" className="transition hover:text-bone-100">Arc Microgrants ↗</a></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4">Contract</p>
            <p className="font-mono text-[12px] leading-relaxed text-bone-100/60">
              KeystoneEscrow.sol
              <br />
              MIT licensed · no protocol fees
              <br />
              100% of escrow goes to builders
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t rule pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] text-bone-100/35">© 2026 Keystone · Built for the Arc Microgrants program</p>
          <p className="display text-[15px] italic text-bone-100/40">“The stone the builders set first.”</p>
        </div>
      </div>
    </footer>
  );
}
