import Navbar from "@/app/components/Navbar";

const mockActivity = [
  { id: "0x3a1f", type: "text", status: "settled", cost: "0.001 USDC", latency: "1.2s", time: "2m ago" },
  { id: "0x9c2e", type: "image", status: "settled", cost: "0.004 USDC", latency: "3.8s", time: "7m ago" },
  { id: "0x11ab", type: "text", status: "pending", cost: "0.001 USDC", latency: "—", time: "9m ago" },
  { id: "0x77fd", type: "text", status: "settled", cost: "0.001 USDC", latency: "0.9s", time: "15m ago" },
  { id: "0x45cc", type: "text", status: "failed", cost: "—", latency: "—", time: "21m ago" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-syne)]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 pt-20 pb-24">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Dashboard</p>
        <h1 className="text-4xl font-bold text-white mb-3">Agent Activity</h1>
        <p className="text-white/40 mb-14 max-w-xl">
          Track queries, payments, and on-chain settlements in real time.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 border border-white/10 overflow-hidden mb-8">
          {[
            { label: "Total Queries", value: "—" },
            { label: "Total Spent", value: "—" },
            { label: "Avg Latency", value: "—" },
            { label: "Success Rate", value: "—" },
          ].map((stat) => (
            <div key={stat.label} className="bg-black px-6 py-6">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-2">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Activity table */}
        <div className="border border-white/10 overflow-hidden">
          <div className="grid grid-cols-6 px-6 py-3 border-b border-white/10 bg-white/[0.02] text-xs text-white/30 uppercase tracking-wider">
            <span>Tx ID</span>
            <span>Type</span>
            <span>Status</span>
            <span>Cost</span>
            <span>Latency</span>
            <span>Time</span>
          </div>
          {mockActivity.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-6 px-6 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors text-sm"
            >
              <span className="text-white/50 font-mono text-xs">{row.id}</span>
              <span className="text-white/50 text-xs border border-white/10 w-fit px-2 py-0.5 self-center">{row.type}</span>
              <span className={`text-xs font-mono ${
                row.status === "settled" ? "text-white/60" :
                row.status === "pending" ? "text-white/40" : "text-white/25"
              }`}>{row.status}</span>
              <span className="text-white/50 font-mono text-xs">{row.cost}</span>
              <span className="text-white/50 font-mono text-xs">{row.latency}</span>
              <span className="text-white/30 text-xs">{row.time}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-white/20 mt-4">Connect wallet to load live data</p>
      </div>
    </div>
  );
}
