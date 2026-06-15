"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import RailLines from "@/app/components/RailLines";
import { useWallet, type PaymentRequirement } from "@/app/components/WalletProvider";
import { logActivity } from "@/app/lib/activity";

type Mode = "text" | "image" | "audio";
type PayStep = "requesting" | "paying" | "signing" | "settling";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  model?: string;
  latency?: string;
  txHash?: string | null;
  cost?: string;
  payStep?: PayStep;
  status: "pending" | "done" | "error";
};

const TEXT_MODELS = [
  { id: "venice-uncensored", name: "Venice Uncensored", tag: "General", color: "#3B82F6" },
  { id: "llama-3.3-70b", name: "Llama 3.3 70B", tag: "Reasoning", color: "#8B5CF6" },
  { id: "qwen-2.5-coder-32b", name: "Qwen Coder 32B", tag: "Code", color: "#06B6D4" },
];
const IMAGE_MODELS = [
  { id: "grok-imagine-image", name: "Grok Imagine", tag: "Image", color: "#F59E0B" },
  { id: "venice-sd35", name: "Venice SD3.5", tag: "Diffusion", color: "#EC4899" },
];
const AUDIO_MODELS = [
  { id: "tts-kokoro", name: "Kokoro TTS", tag: "TTS", color: "#10B981" },
  { id: "tts-xai-v1", name: "xAI TTS v1", tag: "TTS", color: "#F97316" },
];

const MODE_COST: Record<Mode, string> = { text: "0.01", image: "0.04", audio: "0.005" };
const MODE_ENDPOINT: Record<Mode, string> = {
  text: "/api/infer",
  image: "/api/x402/image",
  audio: "/api/x402/audio",
};

function getModels(mode: Mode) {
  return mode === "text" ? TEXT_MODELS : mode === "image" ? IMAGE_MODELS : AUDIO_MODELS;
}

function buildBody(mode: Mode, prompt: string, model: string) {
  if (mode === "text") return { prompt, model };
  if (mode === "image") return { prompt, model, width: 512, height: 512 };
  return { input: prompt, model };
}

const PAY_STEP_LABEL: Record<PayStep, string> = {
  requesting: "Calling oracle...",
  paying: "402 · Payment required",
  signing: "Signing via ERC-7710 delegation...",
  settling: "Settling on Base Sepolia...",
};
const PAY_STEP_COLOR: Record<PayStep, string> = {
  requesting: "rgba(255,255,255,0.25)",
  paying: "#F59E0B",
  signing: "#8B5CF6",
  settling: "#10B981",
};

export default function PlaygroundPage() {
  const {
    address, isConnected, isFlask, connect,
    hasDelegation, isRequestingDelegation, delegationError, delegationMethodUnsupported,
    requestDelegation, signX402Payment, getDelegationPayment,
  } = useWallet();
  const [mode, setMode] = useState<Mode>("text");
  const [selectedModelId, setSelectedModelId] = useState(TEXT_MODELS[0].id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setSelectedModelId(getModels(mode)[0].id);
    setMessages([]);
  }, [mode]);

  const currentModels = getModels(mode);
  const selectedModel = currentModels.find((m) => m.id === selectedModelId) ?? currentModels[0];

  function updateMsg(id: string, patch: Partial<Message>) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  async function send() {
    if (!input.trim() || isRunning) return;
    if (!isConnected) {
      await connect();
      return;
    }

    const prompt = input.trim();
    setInput("");
    setIsRunning(true);

    const asstId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: prompt, status: "done" },
      { id: asstId, role: "assistant", content: "", status: "pending", payStep: "requesting", model: selectedModelId },
    ]);

    try {
      const endpoint = MODE_ENDPOINT[mode];
      const cost = MODE_COST[mode];
      const body = buildBody(mode, prompt, selectedModelId);

      // Step 1 — probe (expect 402)
      const probe = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let paymentHeader: string;
      let accepts: PaymentRequirement[] = [];

      if (probe.status === 402) {
        const probeData = await probe.json();
        accepts = probeData.accepts ?? [];

        // Step 2 — show payment required
        updateMsg(asstId, { payStep: "paying" });
        await new Promise((r) => setTimeout(r, 600));

        // Step 3 — sign payment: ERC-7710 delegation if active, else ERC-3009
        updateMsg(asstId, { payStep: "signing" });
        if (hasDelegation) {
          paymentHeader = await getDelegationPayment(accepts);
        } else {
          paymentHeader = await signX402Payment(accepts);
        }

        await new Promise((r) => setTimeout(r, 400));

        // Step 4 — submit with payment proof
        updateMsg(asstId, { payStep: "settling" });
        await new Promise((r) => setTimeout(r, 300));
      } else if (probe.ok) {
        paymentHeader = "";
      } else {
        throw new Error(`Unexpected status: ${probe.status}`);
      }

      // Paid request
      const start = Date.now();
      const paidRes =
        paymentHeader !== ""
          ? await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-PAYMENT": paymentHeader,
              },
              body: JSON.stringify(body),
            })
          : probe;

      if (!paidRes.ok) {
        const err = await paidRes.json().catch(() => ({}));
        throw new Error(err.error ?? `Request failed (${paidRes.status})`);
      }

      const latency = ((Date.now() - start) / 1000).toFixed(2) + "s";

      if (mode === "text") {
        const data = await paidRes.json();
        updateMsg(asstId, {
          content: data.result ?? "No response",
          latency: data.latency ?? latency,
          txHash: data.txHash,
          cost: `${cost} USDC`,
          status: "done",
          payStep: undefined,
        });
        logActivity({
          id: asstId.slice(0, 8),
          type: "text",
          model: selectedModelId,
          status: "settled",
          cost: parseFloat(cost),
          latency: data.latency ?? latency,
          timestamp: Date.now(),
          txHash: data.txHash,
        });
      } else if (mode === "image") {
        const data = await paidRes.json();
        // Route returns direct URL (Pollinations) or base64 fallback
        const imageUrl = data.imageUrl ?? (data.images?.[0] ? `data:image/jpeg;base64,${data.images[0]}` : null);
        if (!imageUrl) throw new Error("No image returned");
        updateMsg(asstId, {
          content: "Generated image",
          imageUrl,
          latency: data.latency ?? latency,
          txHash: data.txHash,
          cost: `${cost} USDC`,
          status: "done",
          payStep: undefined,
        });
        logActivity({
          id: asstId.slice(0, 8),
          type: "image",
          model: selectedModelId,
          status: "settled",
          cost: parseFloat(cost),
          latency: data.latency ?? latency,
          timestamp: Date.now(),
          txHash: data.txHash,
        });
      } else {
        // Audio — browser TTS
        const data = await paidRes.json();
        if (data.browserTTS && data.text) {
          const utterance = new SpeechSynthesisUtterance(data.text);
          utterance.rate = 0.95;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        }
        updateMsg(asstId, {
          content: `Speaking: "${prompt}"`,
          latency: data.latency ?? latency,
          txHash: data.txHash,
          cost: `${cost} USDC`,
          status: "done",
          payStep: undefined,
        });
        logActivity({
          id: asstId.slice(0, 8),
          type: "audio",
          model: selectedModelId,
          status: "settled",
          cost: parseFloat(cost),
          latency: data.latency ?? latency,
          timestamp: Date.now(),
          txHash: data.txHash,
        });
      }
    } catch (e) {
      updateMsg(asstId, {
        content: e instanceof Error ? e.message : "Something went wrong",
        status: "error",
        payStep: undefined,
      });
      logActivity({
        id: asstId.slice(0, 8),
        type: mode,
        model: selectedModelId,
        status: "failed",
        cost: 0,
        latency: "—",
        timestamp: Date.now(),
      });
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-syne)] flex flex-col relative overflow-hidden">
      <RailLines />
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 pt-10 pb-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Venice AI · x402</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Playground</h1>
          </div>
          <div className="flex border border-white/10 overflow-hidden">
            {(["text", "image", "audio"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 sm:px-5 py-2 text-xs font-mono uppercase tracking-widest transition-all ${
                  mode === m ? "bg-white text-black" : "bg-black text-white/40 hover:text-white/70"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Credits note for image/audio */}
        {(mode === "image" || mode === "audio") && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 border border-amber-500/20 bg-amber-500/5">
            <span className="text-amber-400/70 text-[10px]">⚠</span>
            <p className="text-[10px] font-mono text-amber-400/60">
              Real Venice AI API credits required for live {mode} generation · demo uses Pollinations{mode === "image" ? "" : " / browser TTS"}
            </p>
          </div>
        )}

        {/* Main layout */}
        <div className="flex gap-4 flex-1 min-h-0" style={{ minHeight: 500 }}>
          {/* Sidebar */}
          <div className="w-44 shrink-0 hidden sm:flex flex-col gap-3">
            {/* Model list */}
            <div className="border border-white/10 overflow-hidden">
              <p className="text-[10px] text-white/30 uppercase tracking-widest px-3 py-2 border-b border-white/10 bg-white/[0.02]">
                Model
              </p>
              {currentModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModelId(model.id)}
                  className={`w-full px-3 py-3 text-left transition-all relative border-b border-white/5 last:border-0 ${
                    selectedModelId === model.id ? "bg-white/[0.05]" : "hover:bg-white/[0.02]"
                  }`}
                >
                  {selectedModelId === model.id && (
                    <div className="absolute left-0 inset-y-0 w-[2px]" style={{ background: model.color }} />
                  )}
                  <p className="text-xs text-white font-medium pl-2 leading-snug">{model.name}</p>
                  <p className="text-[10px] pl-2 mt-0.5 font-mono" style={{ color: model.color + "90" }}>
                    {model.tag}
                  </p>
                </button>
              ))}
            </div>

            {/* Session / Delegation */}
            <div className="border border-white/10 overflow-hidden">
              <p className="text-[10px] text-white/30 uppercase tracking-widest px-3 py-2 border-b border-white/10 bg-white/[0.02]">
                Session
              </p>
              <div className="px-3 py-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: hasDelegation ? "#10B981" : "rgba(255,255,255,0.2)" }}
                  />
                  <span className="text-[10px] font-mono text-white/40">
                    {hasDelegation ? "ERC-7715 active" : "No delegation"}
                  </span>
                </div>
                {isConnected && delegationMethodUnsupported && (
                  <p className="text-[9px] font-mono text-white/30 leading-snug">
                    ERC-7715 not in this Flask build — payments still work via direct signing
                  </p>
                )}
                {isConnected && !isFlask && !hasDelegation && !delegationMethodUnsupported && (
                  <p className="text-[9px] font-mono text-[#F97316]/60 leading-snug">
                    Install MetaMask Flask for ERC-7715 session permissions
                  </p>
                )}
                {isConnected && isFlask && !hasDelegation && !delegationMethodUnsupported && (
                  <button
                    onClick={requestDelegation}
                    disabled={isRequestingDelegation}
                    className="w-full text-[10px] font-mono px-2 py-1.5 border border-[#8B5CF6]/30 text-[#8B5CF6] hover:bg-[#8B5CF6]/5 transition-all disabled:opacity-40 text-left"
                  >
                    {isRequestingDelegation ? "Requesting…" : "Grant session →"}
                  </button>
                )}
                {delegationError && !delegationMethodUnsupported && (
                  <p className="text-[9px] font-mono text-[#EF4444]/60 leading-snug break-words">
                    {delegationError}
                  </p>
                )}
                <p className="text-[9px] text-white/20 font-mono leading-snug">
                  {MODE_COST[mode]} USDC / query
                </p>
                <p className="text-[9px] text-white/15 font-mono">Base Sepolia</p>
              </div>
            </div>

            {/* Wallet */}
            <div className="border border-white/10 px-3 py-3 mt-auto">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1.5">Wallet</p>
              {isConnected ? (
                <p className="text-xs text-white/50 font-mono truncate">
                  {address?.slice(0, 6)}…{address?.slice(-4)}
                </p>
              ) : (
                <button
                  onClick={connect}
                  className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
                >
                  Connect wallet
                </button>
              )}
            </div>
          </div>

          {/* Chat panel */}
          <div className="flex-1 flex flex-col border border-white/10 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <div className="text-center space-y-2">
                    <div
                      className="w-8 h-8 border mx-auto mb-4 flex items-center justify-center"
                      style={{ borderColor: selectedModel.color + "40" }}
                    >
                      <span className="text-[10px] font-mono" style={{ color: selectedModel.color }}>
                        {mode === "text" ? "AI" : mode === "image" ? "IMG" : "TTS"}
                      </span>
                    </div>
                    <p className="text-white/25 text-sm">
                      {mode === "text" && `Chat with ${selectedModel.name}`}
                      {mode === "image" && "Describe an image to generate"}
                      {mode === "audio" && "Enter text to speak"}
                    </p>
                    <p className="text-white/15 text-xs font-mono">
                      {MODE_COST[mode]} USDC per query · x402 · ERC-7710 · Base Sepolia
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[80%] flex flex-col gap-1">
                      {msg.role === "user" ? (
                        <div className="bg-white/[0.06] border border-white/10 px-4 py-3 text-sm text-white/80 leading-relaxed">
                          {msg.content}
                        </div>
                      ) : (
                        <div className="border border-white/10 px-4 py-3">
                          {msg.status === "pending" ? (
                            <div className="space-y-2 py-1">
                              {/* x402 step indicator */}
                              {msg.payStep && (
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                                    style={{ background: PAY_STEP_COLOR[msg.payStep] }}
                                  />
                                  <span
                                    className="text-[11px] font-mono"
                                    style={{ color: PAY_STEP_COLOR[msg.payStep] }}
                                  >
                                    {PAY_STEP_LABEL[msg.payStep]}
                                  </span>
                                </div>
                              )}
                              {msg.payStep === "paying" && (
                                <div className="mt-1 px-3 py-2 border border-[#F59E0B]/20 bg-[#F59E0B]/5 space-y-1">
                                  <p className="text-[10px] font-mono text-[#F59E0B]/80">
                                    x402 · {MODE_COST[mode]} USDC required
                                  </p>
                                  <p className="text-[10px] font-mono text-white/30">
                                    network: Base Sepolia (eip155:84532)
                                  </p>
                                  <p className="text-[10px] font-mono text-white/30">
                                    method: erc7710 delegation
                                  </p>
                                </div>
                              )}
                              {msg.payStep === "signing" && (
                                <div className="mt-1 px-3 py-2 border border-[#8B5CF6]/20 bg-[#8B5CF6]/5">
                                  <p className="text-[10px] font-mono text-[#8B5CF6]/80">
                                    ERC-3009 TransferWithAuthorization
                                  </p>
                                  <p className="text-[10px] font-mono text-white/30">via ERC-7710 scoped delegation</p>
                                </div>
                              )}
                              {msg.payStep === "settling" && (
                                <div className="mt-1 px-3 py-2 border border-[#10B981]/20 bg-[#10B981]/5">
                                  <p className="text-[10px] font-mono text-[#10B981]/80">
                                    Submitting to 1Shot relayer...
                                  </p>
                                  <p className="text-[10px] font-mono text-white/30">gas paid in USDC · no ETH needed</p>
                                </div>
                              )}
                              {!msg.payStep && (
                                <div className="flex gap-1.5 items-center py-1">
                                  {[0, 1, 2].map((i) => (
                                    <span
                                      key={i}
                                      className="w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse"
                                      style={{ animationDelay: `${i * 0.2}s` }}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : msg.status === "error" ? (
                            <p className="text-sm text-[#EF4444]/80">{msg.content}</p>
                          ) : msg.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={msg.imageUrl}
                              alt="Generated"
                              className="max-w-xs rounded-sm"
                              style={{ minWidth: 120, minHeight: 80, background: "rgba(255,255,255,0.04)" }}
                              onError={(e) => { (e.target as HTMLImageElement).alt = "Image failed to load"; }}
                            />
                          ) : (
                            <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          )}

                          {msg.status === "done" && (
                            <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-white/8 text-[10px] font-mono text-white/20">
                              <span style={{ color: selectedModel.color + "70" }}>{msg.model}</span>
                              {msg.latency && <span>{msg.latency}</span>}
                              {msg.cost && <span className="text-[#F59E0B]/50">{msg.cost}</span>}
                              <span className="text-[#10B981]/60">✓ x402 settled</span>
                              {msg.txHash && (
                                <span className="text-white/15">
                                  tx:{msg.txHash.slice(0, 8)}…
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-4">
              <div className="flex gap-3 items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
                  }}
                  placeholder={
                    mode === "text"
                      ? "Ask anything…"
                      : mode === "image"
                      ? "Describe the image you want…"
                      : "Enter text to speak…"
                  }
                  disabled={isRunning}
                  rows={2}
                  className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none resize-none leading-relaxed"
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || isRunning}
                  className="shrink-0 px-5 py-2 bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-white/90 active:scale-95 disabled:bg-white/15 disabled:text-white/30 disabled:cursor-not-allowed transition-all"
                >
                  {isRunning ? (
                    <span className="w-4 h-4 border border-black/40 border-t-black rounded-full animate-spin inline-block" />
                  ) : (
                    "Send →"
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] font-mono text-white/20">
                  {MODE_COST[mode]} USDC · x402 · ERC-7710 · ⌘↵
                </span>
                {isConnected ? (
                  <span className="flex items-center gap-1.5 text-[10px] text-white/30 font-mono">
                    <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />
                    {address?.slice(0, 6)}…{address?.slice(-4)}
                  </span>
                ) : (
                  <button
                    onClick={connect}
                    className="text-[10px] text-white/30 hover:text-white/60 border border-white/10 px-2 py-1 transition-colors"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
