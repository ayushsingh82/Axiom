"use client";

import { useState, useRef } from "react";
import Navbar from "@/app/components/Navbar";
import { useWallet } from "@/app/components/WalletProvider";

const MODELS = [
  {
    id: "venice-uncensored",
    name: "Venice Uncensored",
    tag: "General",
    desc: "Default uncensored model — broad knowledge, no restrictions.",
    color: "#3B82F6",
  },
  {
    id: "llama-3.3-70b",
    name: "Llama 3.3 70B",
    tag: "Reasoning",
    desc: "Meta's flagship model — strong at logic, analysis, and structured outputs.",
    color: "#8B5CF6",
  },
  {
    id: "qwen-2.5-coder-32b",
    name: "Qwen 2.5 Coder",
    tag: "Code",
    desc: "Optimized for code generation, debugging, and technical tasks.",
    color: "#06B6D4",
  },
];

type Status = "idle" | "connecting" | "paying" | "inferring" | "settling" | "done" | "error";

const STATUS_LABELS: Record<Status, string> = {
  idle: "—",
  connecting: "Connecting wallet…",
  paying: "Processing x402 payment…",
  inferring: "Venice AI inferring…",
  settling: "Settling on-chain via 1Shot…",
  done: "Settled",
  error: "Error",
};

const STATUS_COLORS: Record<Status, string> = {
  idle: "text-white/20",
  connecting: "text-[#F59E0B]",
  paying: "text-[#3B82F6]",
  inferring: "text-[#8B5CF6]",
  settling: "text-[#06B6D4]",
  done: "text-[#10B981]",
  error: "text-[#EF4444]",
};

export default function OraclePage() {
  const { address, isConnected, connect } = useWallet();
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [latency, setLatency] = useState<string>("—");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isRunning = ["connecting", "paying", "inferring", "settling"].includes(status);

  async function handleQuery() {
    if (!prompt.trim() || isRunning) return;

    setResponse(null);
    setError(null);
    setTxHash(null);
    setLatency("—");

    if (!isConnected) {
      setStatus("connecting");
      await connect();
      if (!address) {
        setStatus("error");
        setError("Wallet connection required.");
        return;
      }
    }

    setStatus("paying");

    try {
      // First request — expect 402
      const firstRes = await fetch("/api/infer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), model: selectedModel.id }),
      });

      if (firstRes.status === 402) {
        // In production: parse requirements, create delegation via x402Erc7710Client,
        // then retry with X-PAYMENT header. For demo we show the payment flow.
        const paymentData = await firstRes.json();
        console.log("[x402] Payment required:", paymentData);

        // Simulate payment processing delay
        await new Promise((r) => setTimeout(r, 800));

        setStatus("inferring");

        // Retry with a mock payment header (replace with real x402 client in production)
        const paidRes = await fetch("/api/infer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-PAYMENT": JSON.stringify({
              x402Version: 2,
              scheme: "exact",
              network: "eip155:8453",
              payload: { mock: true, from: address },
            }),
          },
          body: JSON.stringify({ prompt: prompt.trim(), model: selectedModel.id }),
        });

        if (!paidRes.ok) {
          throw new Error(`Inference failed: ${paidRes.status}`);
        }

        setStatus("settling");
        const data = await paidRes.json();
        await new Promise((r) => setTimeout(r, 400));

        setResponse(data.result ?? "No response");
        setLatency(data.latency ?? "—");
        setTxHash(data.txHash ?? null);
        setStatus("done");
      } else if (firstRes.ok) {
        // Payment header already present (shouldn't happen on first request)
        setStatus("inferring");
        const data = await firstRes.json();
        setResponse(data.result ?? "No response");
        setLatency(data.latency ?? "—");
        setTxHash(data.txHash ?? null);
        setStatus("done");
      } else {
        throw new Error(`Unexpected status: ${firstRes.status}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-syne)]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 pt-16 pb-24">
        {/* Header */}
        <div className="animate-fade-in-up mb-12">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Oracle</p>
          <h1 className="text-4xl font-bold text-white mb-3">Query Axiom</h1>
          <p className="text-white/40 max-w-xl text-sm leading-relaxed">
            Send an inference request. Pay per-query via{" "}
            <span className="text-[#3B82F6]">x402</span>. No subscription — just a{" "}
            <span className="text-[#8B5CF6]">MetaMask smart account</span>.
          </p>
        </div>

        {/* Model Selector */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Model</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 border border-white/10 overflow-hidden">
            {MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`bg-black px-5 py-4 text-left transition-all duration-200 relative overflow-hidden group ${
                  selectedModel.id === model.id
                    ? "bg-white/[0.04]"
                    : "hover:bg-white/[0.02]"
                }`}
              >
                {selectedModel.id === model.id && (
                  <div
                    className="absolute inset-x-0 top-0 h-[2px]"
                    style={{ background: model.color }}
                  />
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-semibold">{model.name}</span>
                  <span
                    className="text-[10px] px-2 py-0.5 border font-mono"
                    style={{
                      color: selectedModel.id === model.id ? model.color : "rgba(255,255,255,0.25)",
                      borderColor:
                        selectedModel.id === model.id
                          ? `${model.color}40`
                          : "rgba(255,255,255,0.1)",
                    }}
                  >
                    {model.tag}
                  </span>
                </div>
                <p className="text-xs text-white/35 leading-relaxed">{model.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Query Panel */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div
            className={`grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border overflow-hidden transition-all duration-300 ${
              status === "done"
                ? "border-[#10B981]/30"
                : status === "error"
                ? "border-[#EF4444]/30"
                : isRunning
                ? `border-[${selectedModel.color}]/30`
                : "border-white/10"
            }`}
          >
            {/* Input */}
            <div className="bg-black p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-white/40 uppercase tracking-wider">Prompt</span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-0.5 border font-mono"
                    style={{ color: selectedModel.color, borderColor: `${selectedModel.color}30` }}
                  >
                    {selectedModel.tag.toLowerCase()}
                  </span>
                </div>
              </div>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleQuery();
                }}
                className="w-full bg-transparent text-white/80 text-sm resize-none outline-none placeholder:text-white/20 h-44 leading-relaxed"
                placeholder="Describe what you want Axiom to infer…"
                disabled={isRunning}
              />
              <div className="border-t border-white/8 mt-4 pt-4 flex items-center justify-between">
                <span className="text-xs text-white/20 font-mono">~0.01 USDC · ⌘↵ to run</span>
                <button
                  onClick={handleQuery}
                  disabled={!prompt.trim() || isRunning}
                  className={`px-5 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 relative overflow-hidden ${
                    isRunning
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : "bg-white text-black hover:bg-white/90 active:scale-95"
                  }`}
                >
                  {isRunning ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border border-white/40 border-t-white/80 rounded-full animate-spin inline-block" />
                      Running
                    </span>
                  ) : (
                    "Run Query"
                  )}
                </button>
              </div>
            </div>

            {/* Output */}
            <div className="bg-black p-6 border-l border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-white/40 uppercase tracking-wider">Response</span>
                {status !== "idle" && (
                  <span className={`text-xs font-mono transition-colors ${STATUS_COLORS[status]}`}>
                    {isRunning && (
                      <span className="mr-1 inline-block w-1.5 h-1.5 bg-current rounded-full animate-pulse-dot" />
                    )}
                    {STATUS_LABELS[status]}
                  </span>
                )}
              </div>

              <div className="h-44 overflow-y-auto">
                {response ? (
                  <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap animate-fade-in">
                    {response}
                  </p>
                ) : error ? (
                  <div className="flex items-start gap-2 animate-fade-in">
                    <span className="text-[#EF4444] text-xs mt-0.5">✕</span>
                    <p className="text-sm text-[#EF4444]/80 leading-relaxed">{error}</p>
                  </div>
                ) : isRunning ? (
                  <div className="space-y-2 animate-fade-in">
                    {[60, 45, 70, 30].map((w, i) => (
                      <div
                        key={i}
                        className="h-3 bg-white/5 animate-shimmer"
                        style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xs text-white/20">Response will appear here</p>
                  </div>
                )}
              </div>

              <div className="border-t border-white/8 mt-4 pt-4 flex items-center gap-4 text-xs font-mono">
                <span className={status === "done" ? "text-[#10B981]" : "text-white/20"}>
                  Status: {STATUS_LABELS[status]}
                </span>
                <span className="text-white/30">Latency: {latency}</span>
                <span className="text-white/20">
                  {txHash ? (
                    <span className="text-[#06B6D4]">
                      Tx: {txHash.slice(0, 8)}…
                    </span>
                  ) : (
                    "Gas: —"
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Wallet strip */}
          <div className="border border-white/10 border-t-0 bg-white/[0.02] px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-white/30">
              {isConnected ? (
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse-dot" />
                  Connected via MetaMask Smart Account ·{" "}
                  <span className="font-mono text-white/50">
                    {address?.slice(0, 8)}…{address?.slice(-6)}
                  </span>
                </span>
              ) : (
                "Connect a MetaMask Smart Account to enable x402 payments"
              )}
            </span>
            {!isConnected && (
              <button
                onClick={connect}
                className="text-xs border border-white/20 px-4 py-2 hover:border-[#3B82F6]/50 hover:text-[#3B82F6] text-white/60 transition-all duration-200"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Protocol flow indicator */}
        {(isRunning || status === "done") && (
          <div className="mt-6 border border-white/8 bg-white/[0.01] px-6 py-4 animate-fade-in-up">
            <p className="text-xs text-white/20 uppercase tracking-widest mb-3">Payment flow</p>
            <div className="flex items-center gap-0">
              {[
                { label: "Request", active: isRunning || status === "done" },
                { label: "x402 Pay", active: ["paying", "inferring", "settling", "done"].includes(status) },
                { label: "Venice Infer", active: ["inferring", "settling", "done"].includes(status) },
                { label: "1Shot Settle", active: ["settling", "done"].includes(status) },
              ].map((step, i) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-all duration-500 ${
                      step.active ? "text-white" : "text-white/20"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                        step.active ? "bg-[#3B82F6]" : "bg-white/15"
                      }`}
                    />
                    {step.label}
                  </div>
                  {i < 3 && (
                    <span
                      className={`text-xs mx-1 transition-colors duration-500 ${
                        step.active ? "text-white/30" : "text-white/10"
                      }`}
                    >
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
