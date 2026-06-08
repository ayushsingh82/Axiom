import Link from "next/link";
import Navbar from "@/app/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white font-[family-name:var(--font-syne)]">

      <Navbar />

      {/* Hero */}
      <section className="px-8 pt-28 pb-24 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 border border-white/15 px-4 py-1.5 text-xs text-white/50 mb-10 tracking-wider uppercase">
          <span className="w-1.5 h-1.5 bg-white/40 inline-block" />
          Venice AI · x402 · ERC-7710 · 1Shot
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold leading-[1.05] tracking-tight text-white mb-6">
          Axiom<br />
          <span className="text-white/35">Permissionless AI</span>
        </h1>

        <p className="text-lg text-white/50 max-w-2xl leading-relaxed mb-12">
          An on-chain AI inference service. Any agent or dApp calls it, pays
          per-query via <span className="text-white/75">x402</span>, Venice runs
          the AI, and <span className="text-white/75">1Shot</span> settles gas in
          USDC — no native ETH required, no backend needed.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/oracle"
            className="px-7 py-3 bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            Try the Oracle
          </Link>
          <Link
            href="/docs"
            className="px-7 py-3 border border-white/20 text-white/70 text-sm hover:border-white/40 hover:text-white transition-colors"
          >
            Read the Docs
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-white/8 mx-8" />

      {/* Flow */}
      <section className="px-8 py-24 max-w-5xl mx-auto">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-4">How it works</p>
        <h2 className="text-3xl font-bold text-white mb-14">
          One query. Four steps. Fully autonomous.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-px bg-white/10 border border-white/10 overflow-hidden">
          {[
            {
              step: "01",
              title: "Call",
              desc: "Agent or dApp sends an inference request to the Oracle endpoint",
            },
            {
              step: "02",
              title: "Pay",
              desc: "x402 HTTP payment header triggers a micro-payment via ERC-7710 delegated permission",
            },
            {
              step: "03",
              title: "Infer",
              desc: "Venice AI runs the query — text, image, or multimodal — with permissionless intelligence",
            },
            {
              step: "04",
              title: "Settle",
              desc: "1Shot relayer executes the on-chain transaction, gas paid in USDC via 7702 smart account",
            },
          ].map((item) => (
            <div key={item.step} className="bg-black px-6 py-8">
              <span className="text-xs text-white/20 font-mono mb-4 block">{item.step}</span>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-white/8 mx-8" />

      {/* Stack */}
      <section className="px-8 py-24 max-w-5xl mx-auto">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Tech stack</p>
        <h2 className="text-3xl font-bold text-white mb-14">
          Built on open standards.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 border border-white/10 overflow-hidden">
          {[
            {
              name: "Venice AI",
              tag: "Inference",
              desc: "Permissionless text, image, audio, and multimodal AI. Powers all inference inside the Oracle.",
            },
            {
              name: "x402 Protocol",
              tag: "Payments",
              desc: "HTTP 402 payment-required standard. Agents pay per-query with no pre-approval or subscription.",
            },
            {
              name: "ERC-7710",
              tag: "Delegation",
              desc: "Smart account delegations with caveats. Agents get scoped spend permissions — no private keys shared.",
            },
            {
              name: "ERC-7715",
              tag: "Permissions",
              desc: "Fine-grained permission requests. Users approve exact spend limits, time windows, and target contracts.",
            },
            {
              name: "1Shot Relayer",
              tag: "Gas Abstraction",
              desc: "Executes 7710 delegated transactions on mainnet with gas paid in USDC, USDT, or USDG.",
            },
            {
              name: "MetaMask Smart Accounts",
              tag: "Wallet",
              desc: "EIP-7702 upgrades regular EOAs to smart accounts. Enables delegation and advanced permission flows.",
            },
          ].map((item) => (
            <div key={item.name} className="bg-black px-6 py-8 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-semibold text-sm">{item.name}</span>
                <span className="text-xs text-white/30 border border-white/10 px-2 py-0.5">
                  {item.tag}
                </span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 py-8 flex items-center justify-between text-xs text-white/20">
        <span>Axiom — MetaMask Hackathon 2026</span>
        <span>Venice · x402 · ERC-7710 · 1Shot</span>
      </footer>

    </main>
  );
}
