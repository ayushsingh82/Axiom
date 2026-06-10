"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useWallet } from "./WalletProvider";

const links = [
  { href: "/playground", label: "Playground" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/docs", label: "Docs" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { address, isConnecting, isConnected, connect, disconnect } = useWallet();

  return (
    <nav className="border-b border-white/10 px-8 py-4 flex items-center justify-between font-[family-name:var(--font-syne)] sticky top-0 z-50 bg-black/90 backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative">
          <Image
            src="/logo.svg"
            alt="Axiom"
            width={28}
            height={28}
            className="transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <span className="text-sm font-semibold tracking-widest text-white/80 uppercase group-hover:text-white transition-colors">
          Axiom
        </span>
      </Link>

      <div className="flex items-center gap-1 text-sm text-white/40">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 transition-all duration-200 ${
              pathname === link.href
                ? "text-white bg-white/8 border-b border-[#3B82F6]"
                : "hover:text-white hover:bg-white/5"
            }`}
          >
            {link.label}
          </Link>
        ))}

        {isConnected ? (
          <button
            onClick={disconnect}
            className="ml-4 px-4 py-2 border border-[#3B82F6]/40 text-[#3B82F6] hover:border-[#3B82F6] hover:bg-[#3B82F6]/10 transition-all duration-200 text-xs tracking-wider uppercase font-mono flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse-dot" />
            {address?.slice(0, 6)}…{address?.slice(-4)}
          </button>
        ) : (
          <button
            onClick={connect}
            disabled={isConnecting}
            className="ml-4 px-5 py-2 border border-white/20 text-white/70 hover:border-[#3B82F6]/60 hover:text-[#3B82F6] hover:bg-[#3B82F6]/5 transition-all duration-200 text-xs tracking-wider uppercase disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isConnecting ? "Connecting…" : "Connect Wallet"}
          </button>
        )}
      </div>
    </nav>
  );
}
