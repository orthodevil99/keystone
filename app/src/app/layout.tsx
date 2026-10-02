import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Nav from "@/components/Nav";
import DemoBanner from "@/components/DemoBanner";
import Footer from "@/components/Footer";
import Toasts from "@/components/Toasts";

export const metadata: Metadata = {
  title: "Keystone — Milestone escrow for grants on Arc",
  description:
    "Funders lock USDC, builders deliver milestones, reviewers release funds. Trustless grant escrow on Circle's Arc — sub-second finality, USDC gas, zero protocol fees.",
  openGraph: {
    title: "Keystone — Milestone escrow for grants on Arc",
    description: "Fund the work. Release the proof. Milestone-based USDC escrow on Circle's Arc.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain">
        <Providers>
          <Nav />
          <DemoBanner />
          <main className="min-h-screen pt-[68px]">{children}</main>
          <Footer />
          <Toasts />
        </Providers>
      </body>
    </html>
  );
}
