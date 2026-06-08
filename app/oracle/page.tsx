import Navbar from "@/app/components/Navbar";

export default function OraclePage() {
  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-syne)]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 pt-20 pb-24">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Oracle</p>
        <h1 className="text-4xl font-bold text-white mb-3">Query Axiom</h1>
        <p className="text-white/40 mb-14 max-w-xl">
          Send an inference request. Pay per-query via x402. No subscription, no API key — just a MetaMask smart account.
        </p>

        {/* Query panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden mb-px">
          {/* Input */}
          <div className="bg-black p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-white/40 uppercase tracking-wider">Prompt</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/20 border border-white/10 px-2 py-0.5">text</span>
                <span className="text-xs text-white/20 border border-white/10 px-2 py-0.5">image</span>
              </div>
            </div>
            <textarea
              className="w-full bg-transparent text-white/70 text-sm resize-none outline-none placeholder:text-white/20 h-40 leading-relaxed"
              placeholder="Describe what you want Axiom to infer..."
            />
            <div className="border-t border-white/8 mt-4 pt-4 flex items-center justify-between">
              <span className="text-xs text-white/20">~0.001 USDC / query</span>
              <button className="px-5 py-2 bg-white text-black text-xs font-semibold hover:bg-white/90 transition-colors uppercase tracking-wider">
                Run Query
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="bg-black p-6 border-l border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-white/40 uppercase tracking-wider">Response</span>
              <span className="text-xs text-white/20 font-mono">—</span>
            </div>
            <div className="h-40 flex items-center justify-center">
              <p className="text-xs text-white/20">Response will appear here</p>
            </div>
            <div className="border-t border-white/8 mt-4 pt-4 flex items-center gap-4 text-xs text-white/20 font-mono">
              <span>Status: —</span>
              <span>Latency: —</span>
              <span>Gas: —</span>
            </div>
          </div>
        </div>

        {/* Wallet connect strip */}
        <div className="border border-white/10 border-t-0 bg-white/[0.02] px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-white/30">Connect a MetaMask Smart Account to enable x402 payments</span>
          <button className="text-xs text-white/60 border border-white/20 px-4 py-2 hover:border-white/40 hover:text-white transition-colors">
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
