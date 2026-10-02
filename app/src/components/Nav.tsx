"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import WalletButton from "./WalletButton";
import { useWallet } from "@/lib/wallet";
import { KEYSTONE_ADDRESS } from "@/lib/arc";

const LINKS = [
  { href: "/grants", label: "Explore" },
  { href: "/create", label: "Create grant" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { isConnected } = useWallet();
  const live = isConnected && !!KEYSTONE_ADDRESS;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[80] transition-all duration-300 ${
        scrolled ? "border-b rule bg-ink-950/85 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={32} />
          <span className="display text-[22px] tracking-tight text-bone-100">
            Keystone
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 text-[13.5px] font-medium transition ${
                pathname === l.href || pathname.startsWith(l.href + "/")
                  ? "bg-bone-100/10 text-bone-100"
                  : "text-bone-100/55 hover:text-bone-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border rule px-3 py-1.5 lg:flex">
            <span
              className="pulse-soft inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: live ? "#4E9A5F" : "#DFAF5E" }}
            />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-bone-100/50">
              {live ? "Arc mainnet · 5042" : "Demo mode"}
            </span>
          </span>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
