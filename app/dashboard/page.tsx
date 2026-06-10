"use client";

import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import { useWallet } from "@/app/components/WalletProvider";

const mockActivity = [
  { id: "0x3a1f", type: "text", model: "venice-uncensored", status: "settled", cost: "0.010 USDC", latency: "1.2s", time: "2m ago" },
  { id: "0x9c2e", type: "image", model: "grok-imagine-image", status: "settled", cost: "0.040 USDC", latency: "3.8s", time: "7m ago" },
  { id: "0x11ab", type: "text", model: "llama-3.3-70b", status: "settled", cost: "0.010 USDC", latency: "0.9s", time: "9m ago" },
  { id: "0x77fd", type: "audio", model: "tts-kokoro", status: "settled", cost: "0.005 USDC", latency: "0.7s", time: "15m ago" },
  { id: "0x45cc", type: "text", model: "qwen-2.5-coder-32b", status: "failed", cost: "—", latency: "—", time: "21m ago" },
];

const apiBreakdown = [
  { label: "Chat Completions", endpoint: "POST /api/venice/chat", calls: 47, color: "#3B82F6" },
  { label: "Image Generate", endpoint: "POST /api/venice/image/generate", calls: 12, color: "#8B5CF6" },
  { label: "Audio Speech", endpoint: "POST /api/venice/audio/speech", calls: 8, color: "#10B981" },
  { label: "x402 Balance", endpoint: "GET /api/venice/x402/balance", calls: 23, color: "#F59E0B" },
  { label: "Transactions", endpoint: "GET /api/venice/x402/transactions", calls: 5, color: "#06B6D4" },
];

export default function DashboardPage() {
  const { address, isConnected, connect } = useWallet();
  const [balanceState, setBalanceState] = useState<"idle" | "loading" | "done">("idle");
  const [balance, setBalance] = useState<number | null>(null);

  async function fetchBalance() {
    if (!address) return;
    setBalanceState("loading");
    try {
      const res = await fetch(`/api/venice/x402/balance/${address}`, {
        headers: { "X-Sign-In-With-X": "siwx_pending" },
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.data?.balanceUsd ?? 0);
        setBalanceState("done");
      } else {
        setBalanceState("idle");
      }
    } catch {
      setBalanceState("idle");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-syne)]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 pt-20 pb-24">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Dashboard</p>
        <h1 className="text-4xl font-bold text-white mb-3">Usage &amp; Activity</h1>
        <p className="text-white/40 mb-10 max-w-xl">
          Venice AI API usage, x402 payments, and on-chain settlement history.
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 border border-white/10 overflow-hidden mb-8">
          {/* Venice balance */}
          <div className="bg-black px-6 py-6">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Venice Balance</p>
            {!isConnected ? (
              <button
                onClick={connect}
                className="text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
              >
                Connect wallet
              </button>
            ) : balanceState === "done" && balance !== null ? (
              <p className="text-2xl font-bold text-white">${balance.toFixed(2)}</p>
            ) : (
              <button
                onClick={fetchBalance}
                disabled={balanceState === "loading"}
                className="text-xs text-[#3B82F6] hover:text-[#3B82F6]/70 transition-colors disabled:opacity-40"
              >
                {balanceState === "loading" ? "Fetching…" : "Fetch Balance →"}
              </button>
            )}
          </div>
          {[
            { label: "Total Queries", value: "67" },
            { label: "Total Spent", value: "0.83 USDC" },
            { label: "Avg Latency", value: "1.6s" },
          ].map((stat) => (
            <div key={stat.label} className="bg-black px-6 py-6">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-2">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* API breakdown */}
        <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Venice API Breakdown</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 border border-white/10 overflow-hidden mb-10">
          {apiBreakdown.map((api) => (
            <div key={api.label} className="bg-black px-5 py-5 relative overflow-hidden">
              <div
                className="absolute top-0 inset-x-0 h-[1px]"
                style={{ background: `${api.color}50` }}
              />
              <p className="text-[10px] font-mono text-white/20 mb-1.5">{api.endpoint}</p>
              <p className="text-sm text-white font-semibold mb-2">{api.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold" style={{ color: api.color }}>
                  {api.calls}
                </p>
                <span className="text-xs text-white/20 mb-1">calls</span>
              </div>
            </div>
          ))}
        </div>

        {/* Activity table */}
        <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Recent Activity</p>
        <div className="border border-white/10 overflow-hidden">
          <div className="grid grid-cols-6 px-6 py-3 border-b border-white/10 bg-white/[0.02] text-xs text-white/30 uppercase tracking-wider">
            <span>Tx ID</span>
            <span>Type</span>
            <span>Model</span>
            <span>Cost</span>
            <span>Latency</span>
            <span>Status</span>
          </div>
          {mockActivity.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-6 px-6 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-white/50 font-mono text-xs">{row.id}</span>
              <span className="text-white/50 text-xs border border-white/10 w-fit px-2 py-0.5 self-center">
                {row.type}
              </span>
              <span className="text-white/30 font-mono text-[10px] self-center truncate pr-2">
                {row.model}
              </span>
              <span className="text-white/50 font-mono text-xs">{row.cost}</span>
              <span className="text-white/50 font-mono text-xs">{row.latency}</span>
              <span
                className={`text-xs font-mono ${
                  row.status === "settled"
                    ? "text-[#10B981]/70"
                    : row.status === "pending"
                    ? "text-[#F59E0B]/70"
                    : "text-[#EF4444]/70"
                }`}
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>

        {!isConnected && (
          <p className="text-xs text-white/20 mt-4">
            Connect wallet to load live Venice data &amp; x402 balance
          </p>
        )}
      </div>
    </div>
  );
}
