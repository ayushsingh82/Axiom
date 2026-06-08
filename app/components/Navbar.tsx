"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/oracle", label: "Oracle" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/docs", label: "Docs" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-white/10 px-8 py-5 flex items-center justify-between font-[family-name:var(--font-syne)]">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-7 h-7 border border-white/30 bg-white/5 flex items-center justify-center">
          <span className="text-xs font-bold text-white/70">AX</span>
        </div>
        <span className="text-sm font-semibold tracking-widest text-white/80 uppercase">
          Axiom
        </span>
      </Link>

      <div className="flex items-center gap-1 text-sm text-white/40">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 transition-colors ${
              pathname === link.href
                ? "text-white bg-white/8"
                : "hover:text-white hover:bg-white/5"
            }`}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/oracle"
          className="ml-4 px-5 py-2 border border-white/20 text-white/70 hover:border-white/50 hover:text-white transition-colors text-xs tracking-wider uppercase"
        >
          Launch App
        </Link>
      </div>
    </nav>
  );
}
