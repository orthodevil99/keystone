"use client";

import { WalletProvider } from "@/lib/wallet";
import { KeystoneProvider } from "@/lib/store";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <KeystoneProvider>{children}</KeystoneProvider>
    </WalletProvider>
  );
}
