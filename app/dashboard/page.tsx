"use client";

import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import RailLines from "@/app/components/RailLines";
import { useWallet } from "@/app/components/WalletProvider";
import { getActivity, getStats, type ActivityEntry } from "@/app/lib/activity";

export default function DashboardPage() {
  const { address, isConnected, isFlask, connect, hasDelegation, delegationError, requestDelegation, isRequestingDelegation } = useWallet();
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Load activity from localStorage
  useEffect(() => {
    setActivity(getActivity());
    const interval = setInterval(() => setActivity(getActivity()), 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-fetch Venice balance when wallet connects
  useEffect(() => {
    if (!isConnected || !address) return;
    setBalanceLoading(true);
    fetch(`/api/venice/x402/balance/${address}`, {
      headers: { "X-Sign-In-With-X": "siwx_pending" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setBalance(data.data?.balanceUsd ?? 0);
      })
      .catch(() => {})
      .finally(() => setBalanceLoading(false));
  }, [isConnected, address]);

  const stats = getStats(activity);

  const byType = [
    { label: "Chat", endpoint: "/api/infer", calls: stats.byType.text, color: "#3B82F6" },
    { label: "Image", endpoint: "/api/x402/image", calls: stats.byType.image, color: "#8B5CF6" },
    { label: "Audio", endpoint: "/api/x402/audio", calls: stats.byType.audio, color: "#10B981" },
  ];

  function timeAgo(ts: number) {
    const secs = Math.floor((Date.now() - ts) / 1000);
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ago`;
  }

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-syne)] relative overflow-hidden">
      <RailLines />
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-20 pb-24">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Dashboard</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Usage &amp; Activity</h1>
        <p className="text-white/50 mb-10 max-w-xl text-sm">
          x402 payment history, Venice AI usage, and on-chain settlement data.
        </p>

        {/* Wallet / delegation status */}
        {!isConnected ? (
          <div className="border border-white/10 px-6 py-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-white font-semibold mb-1">Connect your wallet</p>
              <p className="text-sm text-white/40">See your x402 balance, delegation status, and query history.</p>
            </div>
            <button
              onClick={connect}
              className="px-6 py-2.5 bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-95 transition-all shrink-0"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="border border-white/10 px-5 py-4 mb-8 flex flex-wrap items-center gap-6">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Wallet</p>
              <p className="text-sm font-mono text-white/80">{address}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Network</p>
              <p className="text-sm font-mono text-white/60">Base Sepolia</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">ERC-7715 Delegation</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: hasDelegation ? "#10B981" : "rgba(255,255,255,0.2)" }}
                />
                <span className="text-sm text-white/70">{hasDelegation ? "Active" : "Not granted"}</span>
                {!hasDelegation && isFlask && (
                  <button
                    onClick={requestDelegation}
                    disabled={isRequestingDelegation}
                    className="text-[10px] font-mono px-2 py-0.5 border border-[#8B5CF6]/30 text-[#8B5CF6] hover:bg-[#8B5CF6]/5 transition-all disabled:opacity-40"
                  >
                    {isRequestingDelegation ? "Requesting…" : "Grant →"}
                  </button>
                )}
                {!hasDelegation && !isFlask && (
                  <span className="text-[9px] font-mono text-[#F97316]/60">Requires MetaMask Flask</span>
                )}
              </div>
              {delegationError && (
                <p className="text-[9px] font-mono text-[#EF4444]/60 mt-1 max-w-xs leading-snug">
                  {delegationError.length > 100 ? delegationError.slice(0, 100) + "…" : delegationError}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 border border-white/10 overflow-hidden mb-8">
          <div className="bg-black px-5 sm:px-6 py-6">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Venice Balance</p>
            {!isConnected ? (
              <p className="text-white/20 text-sm">—</p>
            ) : balanceLoading ? (
              <p className="text-white/30 text-sm font-mono">Loading…</p>
            ) : balance !== null ? (
              <p className="text-2xl font-bold text-white">${balance.toFixed(4)}</p>
            ) : (
              <p className="text-white/30 text-sm">Unavailable</p>
            )}
          </div>
          <div className="bg-black px-5 sm:px-6 py-6">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Total Queries</p>
            <p className="text-2xl font-bold text-white">{stats.total || "—"}</p>
          </div>
          <div className="bg-black px-5 sm:px-6 py-6">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Total Spent</p>
            <p className="text-2xl font-bold text-white">
              {stats.totalCost > 0 ? `${stats.totalCost.toFixed(4)} USDC` : "—"}
            </p>
          </div>
          <div className="bg-black px-5 sm:px-6 py-6">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Avg Latency</p>
            <p className="text-2xl font-bold text-white">
              {stats.avgLatency !== "—" ? `${stats.avgLatency}s` : "—"}
            </p>
          </div>
        </div>

        {/* API breakdown */}
        <p className="text-xs text-white/30 uppercase tracking-widest mb-4">x402 Endpoint Usage</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 border border-white/10 overflow-hidden mb-10">
          {byType.map((api) => (
            <div key={api.label} className="bg-black px-5 py-5 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[1px]" style={{ background: `${api.color}50` }} />
              <p className="text-[10px] font-mono text-white/30 mb-1.5">{api.endpoint}</p>
              <p className="text-sm text-white font-semibold mb-2">{api.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold" style={{ color: api.color }}>
                  {api.calls || 0}
                </p>
                <span className="text-xs text-white/20 mb-1">queries</span>
              </div>
            </div>
          ))}
        </div>

        {/* Activity table */}
        <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Recent Activity</p>
        {activity.length === 0 ? (
          <div className="border border-white/10 px-6 py-12 text-center">
            <p className="text-white/30 text-sm mb-2">No activity yet</p>
            <p className="text-white/15 text-xs font-mono">
              Go to the Playground and make a query — it will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="border border-white/10 overflow-hidden overflow-x-auto">
            <div className="grid grid-cols-6 px-6 py-3 border-b border-white/10 bg-white/[0.02] text-[10px] text-white/30 uppercase tracking-wider min-w-[600px]">
              <span>ID</span>
              <span>Type</span>
              <span>Model</span>
              <span>Cost</span>
              <span>Latency</span>
              <span>Status</span>
            </div>
            {activity.map((row) => (
              <div
                key={row.id + row.timestamp}
                className="grid grid-cols-6 px-6 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors min-w-[600px]"
              >
                <span className="text-white/50 font-mono text-xs">0x{row.id}</span>
                <span className="text-white/60 text-xs border border-white/10 w-fit px-2 py-0.5 self-center">
                  {row.type}
                </span>
                <span className="text-white/30 font-mono text-[10px] self-center truncate pr-2">{row.model}</span>
                <span className="text-white/60 font-mono text-xs">
                  {row.cost > 0 ? `${row.cost} USDC` : "—"}
                </span>
                <span className="text-white/50 font-mono text-xs">{row.latency}</span>
                <span
                  className={`text-xs font-mono ${
                    row.status === "settled" ? "text-[#10B981]/70" : "text-[#EF4444]/70"
                  }`}
                >
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {activity.length > 0 && (
          <p className="text-[10px] font-mono text-white/15 mt-3">
            Showing {activity.length} recent {activity.length === 1 ? "query" : "queries"} · stored locally
          </p>
        )}
      </div>
    </div>
  );
}
