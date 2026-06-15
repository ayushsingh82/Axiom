import Link from "next/link";
import Navbar from "@/app/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white font-[family-name:var(--font-syne)] relative overflow-hidden">

      {/* Rail line decorations — hidden below lg (1024px) */}
      <div className="pointer-events-none fixed inset-0 z-0 hidden lg:block" aria-hidden>

        {/* LEFT RAIL */}
        <div className="absolute top-0 w-px" style={{ left: "8%", height: "128px", background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.55) 60%, rgba(255,255,255,0.35))" }} />
        <div className="absolute w-px overflow-hidden" style={{ left: "8%", top: "calc(128px + 24px)", bottom: 0, background: "rgba(255,255,255,0.18)" }}>
          <div className="absolute inset-x-0 h-32" style={{ background: "linear-gradient(to bottom, transparent, rgba(59,130,246,0.7), rgba(255,255,255,0.3), transparent)", animation: "scan-line 2.8s linear infinite" }} />
        </div>
        <div className="absolute" style={{ left: "calc(8% - 20px)", top: "120px" }}>
          <div className="absolute h-px" style={{ width: "20px", top: "8px", left: 0, background: "rgba(255,255,255,0.6)" }} />
          <div className="absolute w-px" style={{ height: "18px", left: "20px", top: 0, background: "rgba(255,255,255,0.6)" }} />
          <div className="absolute w-2 h-2 rounded-full" style={{ left: "20px", top: "8px", marginLeft: "-4px", marginTop: "-4px", background: "#fff", boxShadow: "0 0 8px rgba(59,130,246,0.9), 0 0 2px #fff" }} />
        </div>
        {[200, 320, 460, 600, 760].map((top, i) => (
          <div key={i} className="absolute h-px" style={{ left: "calc(8% - 12px)", top, width: "12px", background: i % 2 === 0 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)" }} />
        ))}
        <div className="absolute text-[9px] font-mono tracking-widest select-none" style={{ left: "calc(8% - 52px)", top: "220px", color: "rgba(255,255,255,0.30)", writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)", letterSpacing: "0.15em" }}>
          AXIOM · BASE · EIP-7702
        </div>
        <div className="absolute w-px overflow-hidden" style={{ left: "calc(8% - 1px)", top: "calc(128px + 24px)", bottom: 0 }}>
          <div className="absolute w-1 h-8 rounded-full" style={{ left: "-2px", background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.6), transparent)", animation: "scan-line 4s linear infinite", animationDelay: "0.7s" }} />
        </div>

        {/* RIGHT RAIL */}
        <div className="absolute top-0 w-px" style={{ right: "8%", height: "128px", background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.55) 60%, rgba(255,255,255,0.35))" }} />
        <div className="absolute w-px overflow-hidden" style={{ right: "8%", top: "calc(128px + 24px)", bottom: 0, background: "rgba(255,255,255,0.18)" }}>
          <div className="absolute inset-x-0 h-32" style={{ background: "linear-gradient(to bottom, transparent, rgba(139,92,246,0.7), rgba(255,255,255,0.3), transparent)", animation: "scan-line 2.8s linear infinite", animationDelay: "1.4s" }} />
        </div>
        <div className="absolute" style={{ right: "calc(8% - 20px)", top: "120px" }}>
          <div className="absolute h-px" style={{ width: "20px", top: "8px", right: 0, background: "rgba(255,255,255,0.6)" }} />
          <div className="absolute w-px" style={{ height: "18px", right: "20px", top: 0, background: "rgba(255,255,255,0.6)" }} />
          <div className="absolute w-2 h-2 rounded-full" style={{ right: "20px", top: "8px", marginRight: "-4px", marginTop: "-4px", background: "#fff", boxShadow: "0 0 8px rgba(139,92,246,0.9), 0 0 2px #fff" }} />
        </div>
        {[200, 320, 460, 600, 760].map((top, i) => (
          <div key={i} className="absolute h-px" style={{ right: "calc(8% - 12px)", top, width: "12px", background: i % 2 === 0 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)" }} />
        ))}
        <div className="absolute text-[9px] font-mono tracking-widest select-none" style={{ right: "calc(8% - 52px)", top: "220px", color: "rgba(255,255,255,0.30)", writingMode: "vertical-rl", textOrientation: "mixed", letterSpacing: "0.15em" }}>
          VENICE · X402 · 1SHOT
        </div>
        <div className="absolute w-px overflow-hidden" style={{ right: "calc(8% - 1px)", top: "calc(128px + 24px)", bottom: 0 }}>
          <div className="absolute w-1 h-8 rounded-full" style={{ left: "-2px", background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.6), transparent)", animation: "scan-line 4s linear infinite", animationDelay: "2.1s" }} />
        </div>

      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <section className="px-4 sm:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 items-center">

            {/* Left — copy */}
            <div>
              <div className="inline-flex items-center gap-2 border border-white/15 px-4 py-1.5 text-xs text-white/50 mb-6 sm:mb-10 tracking-wider uppercase">
                <span className="w-1.5 h-1.5 bg-[#3B82F6]/80 inline-block animate-pulse-dot" />
                Venice AI · x402 · ERC-7710 · 1Shot
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white mb-5 sm:mb-6">
                Axiom<br />
                <span className="text-white">Permissionless AI</span>
              </h1>

              <p className="text-base sm:text-lg text-white/50 max-w-xl leading-relaxed mb-8 sm:mb-12">
                An on-chain AI inference service. Any agent or dApp calls it, pays
                per-query via <span className="text-[#3B82F6]">x402</span>, Venice runs
                the AI, and <span className="text-[#8B5CF6]">1Shot</span> settles gas in
                USDC — no native ETH required, no backend needed.
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href="/oracle"
                  className="px-6 sm:px-7 py-3 bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-95 transition-all"
                >
                  Try the Oracle
                </Link>
                <Link
                  href="/docs"
                  className="px-6 sm:px-7 py-3 border border-white/20 text-white/70 text-sm hover:border-[#3B82F6]/50 hover:text-[#3B82F6] transition-all"
                >
                  Read the Docs
                </Link>
              </div>
            </div>

            {/* Right — oracle visualisation — hidden on mobile */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-72 h-72">
                <div className="absolute inset-0" style={{ animation: "spin 18s linear infinite" }}>
                  <svg viewBox="0 0 288 288" fill="none" className="w-full h-full">
                    <path d="M144 8L280 144L144 280L8 144Z" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
                  </svg>
                </div>
                <div className="absolute inset-8" style={{ animation: "spin 12s linear infinite reverse" }}>
                  <svg viewBox="0 0 224 224" fill="none" className="w-full h-full">
                    <path d="M112 6L218 112L112 218L6 112Z" stroke="rgba(59,130,246,0.35)" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div className="absolute inset-16">
                  <svg viewBox="0 0 160 160" fill="none" className="w-full h-full">
                    <path d="M80 4L156 80L80 156L4 80Z" stroke="rgba(139,92,246,0.5)" strokeWidth="1.5" fill="rgba(139,92,246,0.04)"/>
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-full h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.08), rgba(59,130,246,0.2), rgba(255,255,255,0.08), transparent)" }} />
                  <div className="absolute h-full w-px" style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), rgba(139,92,246,0.2), rgba(255,255,255,0.08), transparent)" }} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute w-10 h-10 rounded-full" style={{ top: "-20px", left: "-20px", background: "radial-gradient(circle, rgba(59,130,246,0.2), transparent)", animation: "pulse-dot 2s ease-in-out infinite" }} />
                    <div className="w-3 h-3 bg-white rounded-full" style={{ boxShadow: "0 0 12px rgba(59,130,246,0.8), 0 0 4px #fff" }} />
                  </div>
                </div>
                {[
                  { top: "8px", left: "50%", transform: "translateX(-50%)" },
                  { bottom: "8px", left: "50%", transform: "translateX(-50%)" },
                  { left: "8px", top: "50%", transform: "translateY(-50%)" },
                  { right: "8px", top: "50%", transform: "translateY(-50%)" },
                ].map((s, i) => (
                  <div key={i} className="absolute w-1 h-1 bg-white/40 rounded-full" style={s} />
                ))}
                <div className="absolute -top-4 -right-2 text-[10px] font-mono px-2 py-1 border border-[#3B82F6]/30 text-[#3B82F6] bg-black/80" style={{ animation: "fade-in-up 0.6s ease-out forwards" }}>x402</div>
                <div className="absolute -bottom-4 -left-2 text-[10px] font-mono px-2 py-1 border border-[#8B5CF6]/30 text-[#8B5CF6] bg-black/80" style={{ animation: "fade-in-up 0.8s ease-out forwards" }}>ERC-7710</div>
                <div className="absolute top-1/2 -right-8 text-[10px] font-mono px-2 py-1 border border-[#06B6D4]/30 text-[#06B6D4] bg-black/80 -translate-y-1/2" style={{ animation: "fade-in-up 1s ease-out forwards" }}>1Shot</div>
              </div>
            </div>

          </div>
        </section>

        {/* Stats */}
        <section className="px-4 sm:px-8 py-12 sm:py-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 border border-white/10 overflow-hidden">
            {[
              { value: "0.01", unit: "USDC", label: "Per query cost" },
              { value: "<2", unit: "sec", label: "Avg inference latency" },
              { value: "0", unit: "ETH", label: "Native gas required" },
              { value: "11", unit: "chains", label: "Networks supported" },
            ].map((stat) => (
              <div key={stat.label} className="bg-black px-4 sm:px-6 py-6 sm:py-7 group hover:bg-white/[0.02] transition-colors">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</span>
                  <span className="text-xs sm:text-sm text-[#3B82F6] font-mono">{stat.unit}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-white/30 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Flow */}
        <section className="px-4 sm:px-8 py-16 sm:py-24 max-w-5xl mx-auto">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-4">How it works</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10 sm:mb-14">
            One query. Four steps. Fully autonomous.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10 overflow-hidden">
            {[
              { step: "01", title: "Call", desc: "Agent or dApp sends an inference request to the Oracle endpoint", color: "#3B82F6" },
              { step: "02", title: "Pay", desc: "x402 HTTP payment header triggers a micro-payment via ERC-7710 delegated permission", color: "#8B5CF6" },
              { step: "03", title: "Infer", desc: "Venice AI runs the query — text, image, or multimodal — with permissionless intelligence", color: "#06B6D4" },
              { step: "04", title: "Settle", desc: "1Shot relayer executes the on-chain transaction, gas paid in USDC via 7702 smart account", color: "#10B981" },
            ].map((item) => (
              <div key={item.step} className="bg-black px-5 sm:px-6 py-7 sm:py-8 hover:bg-white/[0.02] transition-colors group relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: item.color }} />
                <span className="text-xs text-white/20 font-mono mb-4 block">{item.step}</span>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Target audience */}
        <section className="px-4 sm:px-8 py-16 sm:py-24 max-w-5xl mx-auto">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Who it&apos;s for</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10 sm:mb-14">
            Built for builders who move fast.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 border border-white/10 overflow-hidden">
            {[
              {
                icon: "◈",
                title: "AI Agents",
                color: "#3B82F6",
                items: [
                  "Pay per call with no pre-auth",
                  "ERC-7710 delegation for recurring spend",
                  "No API keys to rotate or store",
                  "Works with any agent framework",
                ],
              },
              {
                icon: "◉",
                title: "dApp Developers",
                color: "#8B5CF6",
                items: [
                  "Drop-in AI endpoint for your dApp",
                  "Onchain payment — no Stripe, no subscriptions",
                  "USDC settlement on 11 EVM chains",
                  "Open-source, self-hostable",
                ],
              },
              {
                icon: "◎",
                title: "Protocol Builders",
                color: "#06B6D4",
                items: [
                  "Reference implementation of x402 + 7710",
                  "Venice AI as a censorship-resistant backend",
                  "1Shot for gasless UX without ETH",
                  "Composable with any ERC-4337 stack",
                ],
              },
            ].map((card) => (
              <div key={card.title} className="bg-black px-5 sm:px-6 py-7 sm:py-8 hover:bg-white/[0.02] transition-colors group relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: card.color }} />
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-lg" style={{ color: card.color }}>{card.icon}</span>
                  <span className="text-white font-semibold">{card.title}</span>
                </div>
                <ul className="space-y-2">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-white/45">
                      <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: card.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Stack */}
        <section className="px-4 sm:px-8 py-16 sm:py-24 max-w-5xl mx-auto">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Tech stack</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10 sm:mb-14">
            Built on open standards.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10 overflow-hidden">
            {[
              { name: "Venice AI", tag: "Inference", desc: "Permissionless text, image, audio, and multimodal AI. Powers all inference inside the Oracle.", color: "#3B82F6" },
              { name: "x402 Protocol", tag: "Payments", desc: "HTTP 402 payment-required standard. Agents pay per-query with no pre-approval or subscription.", color: "#8B5CF6" },
              { name: "ERC-7710", tag: "Delegation", desc: "Smart account delegations with caveats. Agents get scoped spend permissions — no private keys shared.", color: "#06B6D4" },
              { name: "ERC-7715", tag: "Permissions", desc: "Fine-grained permission requests. Users approve exact spend limits, time windows, and target contracts.", color: "#F59E0B" },
              { name: "1Shot Relayer", tag: "Gas Abstraction", desc: "Executes 7710 delegated transactions on mainnet with gas paid in USDC, USDT, or USDG.", color: "#10B981" },
              { name: "MetaMask Smart Accounts", tag: "Wallet", desc: "EIP-7702 upgrades regular EOAs to smart accounts. Enables delegation and advanced permission flows.", color: "#EF4444" },
            ].map((item) => (
              <div key={item.name} className="bg-black px-5 sm:px-6 py-7 sm:py-8 hover:bg-white/[0.02] transition-colors group relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: item.color }} />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-semibold text-sm">{item.name}</span>
                  <span className="text-[10px] border px-2 py-0.5 font-mono shrink-0 ml-2" style={{ color: item.color, borderColor: `${item.color}30` }}>{item.tag}</span>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-8 pb-16 sm:pb-24 max-w-5xl mx-auto">
          <div className="border border-white/10 bg-white/[0.02] px-6 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#06B6D4]" />
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Start inferring in 60 seconds</h3>
              <p className="text-sm text-white/40 max-w-md">
                Connect your MetaMask, fund with 1 USDC on Base, and run your first permissionless AI query.
              </p>
            </div>
            <Link
              href="/oracle"
              className="flex-shrink-0 px-6 sm:px-7 py-3 bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-95 transition-all"
            >
              Open the Oracle →
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>Axiom — MetaMask Hackathon 2026</span>
          <span className="font-mono">Venice · x402 · ERC-7710 · 1Shot</span>
        </footer>
      </div>
    </main>
  );
}
