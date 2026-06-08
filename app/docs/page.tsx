import Navbar from "@/app/components/Navbar";

const sections = [
  {
    id: "overview",
    title: "Overview",
    content: `Axiom is a permissionless on-chain inference service. Any agent, dApp, or script can call it and pay per-query using the x402 HTTP payment protocol — no API key, no subscription, no account required.`,
  },
  {
    id: "quickstart",
    title: "Quickstart",
    content: `Send a POST to the Oracle endpoint with your prompt. If you have an ERC-7710 delegation set up via MetaMask Smart Accounts, the x402 payment is handled automatically. The response is returned once Venice has processed the inference and 1Shot has settled the payment on-chain.`,
  },
  {
    id: "x402",
    title: "x402 Payments",
    content: `x402 is an HTTP-native payment protocol. When you call the Oracle, it returns HTTP 402 with a payment requirement. Your x402-enabled client (or MetaMask Smart Account) automatically signs and broadcasts the payment — then retries the request. No manual payment flow needed.`,
  },
  {
    id: "permissions",
    title: "ERC-7710 Permissions",
    content: `Grant Axiom a scoped delegation via MetaMask's wallet_grantPermissions. You set the spend cap (e.g. 1 USDC), the time window, and the target contract. Axiom can then pull payments within those bounds without asking you to sign each time.`,
  },
  {
    id: "gas",
    title: "Gas via 1Shot",
    content: `All on-chain settlement transactions are relayed through 1Shot's permissionless mainnet relayer. Gas is paid in USDC — your smart account (upgraded via EIP-7702) never needs native ETH. 1Shot also provides webhooks for real-time transaction status.`,
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-syne)]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 pt-20 pb-24 flex gap-12">

        {/* Sidebar */}
        <aside className="hidden lg:block w-48 shrink-0">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Contents</p>
          <nav className="flex flex-col gap-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-sm text-white/40 hover:text-white py-1.5 transition-colors border-l border-white/10 pl-3 hover:border-white/30"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Docs</p>
          <h1 className="text-4xl font-bold text-white mb-3">Integration Guide</h1>
          <p className="text-white/40 mb-14 max-w-xl">
            Everything you need to call the Oracle from an agent, dApp, or script.
          </p>

          <div className="flex flex-col gap-px border border-white/10 overflow-hidden">
            {sections.map((section) => (
              <div key={section.id} id={section.id} className="bg-black px-8 py-8 border-b border-white/8 last:border-0">
                <h2 className="text-lg font-bold text-white mb-4">{section.title}</h2>
                <p className="text-sm text-white/50 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          {/* Code snippet */}
          <div className="mt-8 border border-white/10 overflow-hidden">
            <div className="bg-white/[0.03] border-b border-white/10 px-6 py-3 flex items-center justify-between">
              <span className="text-xs text-white/30 uppercase tracking-wider">Example request</span>
              <span className="text-xs text-white/20 font-mono">curl</span>
            </div>
            <div className="bg-black px-6 py-6 font-mono text-xs text-white/50 leading-relaxed overflow-x-auto">
              <p className="text-white/25"># Call the Oracle — x402 payment handled automatically</p>
              <p className="mt-2">curl -X POST https://oracle.example.com/infer \</p>
              <p className="ml-4">-H <span className="text-white/70">&quot;Content-Type: application/json&quot;</span> \</p>
              <p className="ml-4">-d <span className="text-white/70">&apos;&#123;&quot;prompt&quot;: &quot;Summarize the latest ETH gas trends&quot;, &quot;model&quot;: &quot;text&quot;&#125;&apos;</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
