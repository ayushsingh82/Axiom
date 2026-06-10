"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import RailLines from "@/app/components/RailLines";
import { useWallet } from "@/app/components/WalletProvider";

type Mode = "text" | "image" | "audio";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  model?: string;
  latency?: string;
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

const AUDIO_VOICES = ["af_sky", "af_bella", "am_adam", "af_nova", "eve", "ara"];

function getModelsForMode(mode: Mode) {
  if (mode === "text") return TEXT_MODELS;
  if (mode === "image") return IMAGE_MODELS;
  return AUDIO_MODELS;
}

export default function PlaygroundPage() {
  const { address, isConnected, connect } = useWallet();
  const [mode, setMode] = useState<Mode>("text");
  const [selectedModelId, setSelectedModelId] = useState(TEXT_MODELS[0].id);
  const [selectedVoice, setSelectedVoice] = useState("af_sky");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setSelectedModelId(getModelsForMode(mode)[0].id);
  }, [mode]);

  const currentModels = getModelsForMode(mode);
  const selectedModel = currentModels.find((m) => m.id === selectedModelId) ?? currentModels[0];

  async function send() {
    if (!input.trim() || isRunning) return;

    const prompt = input.trim();
    setInput("");
    setIsRunning(true);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      status: "done",
    };

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      model: selectedModelId,
      status: "pending",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    try {
      if (mode === "text") {
        if (!isConnected) await connect();

        const firstRes = await fetch("/api/infer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, model: selectedModelId }),
        });

        if (firstRes.status === 402) {
          await new Promise((r) => setTimeout(r, 600));
          const paidRes = await fetch("/api/infer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-PAYMENT": JSON.stringify({
                x402Version: 2,
                scheme: "exact",
                network: "eip155:84532",
                payload: { mock: true, from: address },
              }),
            },
            body: JSON.stringify({ prompt, model: selectedModelId }),
          });
          const data = await paidRes.json();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: data.result ?? "No response", latency: data.latency, status: "done" }
                : m
            )
          );
        } else if (firstRes.ok) {
          const data = await firstRes.json();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: data.result ?? "No response", latency: data.latency, status: "done" }
                : m
            )
          );
        } else {
          throw new Error("Inference failed");
        }
      } else if (mode === "image") {
        const start = Date.now();
        const res = await fetch("/api/venice/image/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: selectedModelId, prompt, width: 512, height: 512 }),
        });
        if (!res.ok) throw new Error("Image generation failed");
        const data = await res.json();
        const imageUrl = `data:image/webp;base64,${data.images?.[0]}`;
        const latency = ((Date.now() - start) / 1000).toFixed(2) + "s";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: "Generated image", imageUrl, latency, status: "done" }
              : m
          )
        );
      } else {
        const start = Date.now();
        const res = await fetch("/api/venice/audio/speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: selectedModelId,
            input: prompt,
            voice: selectedVoice,
            response_format: "mp3",
          }),
        });
        if (!res.ok) throw new Error("Audio generation failed");
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const latency = ((Date.now() - start) / 1000).toFixed(2) + "s";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: "Generated audio", audioUrl, latency, status: "done" }
              : m
          )
        );
      }
    } catch (e) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: e instanceof Error ? e.message : "Something went wrong", status: "error" }
            : m
        )
      );
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-syne)] flex flex-col relative overflow-hidden">
      <RailLines />
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto w-full px-8 pt-10 pb-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Venice AI</p>
            <h1 className="text-3xl font-bold text-white">Playground</h1>
          </div>
          {/* Mode tabs */}
          <div className="flex border border-white/10 overflow-hidden">
            {(["text", "image", "audio"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setMessages([]);
                }}
                className={`px-5 py-2 text-xs font-mono uppercase tracking-widest transition-all ${
                  mode === m
                    ? "bg-white text-black"
                    : "bg-black text-white/40 hover:text-white/70"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Main layout */}
        <div className="flex gap-4 flex-1 min-h-0" style={{ minHeight: 520 }}>
          {/* Sidebar */}
          <div className="w-44 shrink-0 flex flex-col gap-3">
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
                    selectedModelId === model.id
                      ? "bg-white/[0.05]"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  {selectedModelId === model.id && (
                    <div
                      className="absolute left-0 inset-y-0 w-[2px]"
                      style={{ background: model.color }}
                    />
                  )}
                  <p className="text-xs text-white font-medium pl-2 leading-snug">{model.name}</p>
                  <p
                    className="text-[10px] pl-2 mt-0.5 font-mono"
                    style={{ color: model.color + "90" }}
                  >
                    {model.tag}
                  </p>
                </button>
              ))}
            </div>

            {/* Voice selector (audio mode only) */}
            {mode === "audio" && (
              <div className="border border-white/10 overflow-hidden">
                <p className="text-[10px] text-white/30 uppercase tracking-widest px-3 py-2 border-b border-white/10 bg-white/[0.02]">
                  Voice
                </p>
                {AUDIO_VOICES.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVoice(v)}
                    className={`w-full px-3 py-2 text-left text-xs font-mono transition-all border-b border-white/5 last:border-0 ${
                      selectedVoice === v
                        ? "text-white bg-white/[0.05]"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}

            {/* Venice balance */}
            <div className="border border-white/10 px-3 py-3 mt-auto">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1.5">
                Venice Balance
              </p>
              {isConnected ? (
                <p className="text-xs text-white/40 font-mono">—</p>
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
                <div className="flex items-center justify-center h-full min-h-[320px]">
                  <div className="text-center space-y-2">
                    <div
                      className="w-8 h-8 border border-white/10 mx-auto mb-4 flex items-center justify-center"
                      style={{ borderColor: selectedModel.color + "40" }}
                    >
                      <span className="text-[10px] font-mono" style={{ color: selectedModel.color }}>
                        {mode === "text" ? "AI" : mode === "image" ? "IMG" : "TTS"}
                      </span>
                    </div>
                    <p className="text-white/25 text-sm">
                      {mode === "text" && "Start a conversation with " + selectedModel.name}
                      {mode === "image" && "Describe an image to generate"}
                      {mode === "audio" && "Enter text to convert to speech"}
                    </p>
                    <p className="text-white/10 text-xs font-mono">
                      {mode === "text"
                        ? "~0.01 USDC per query · paid via x402"
                        : "Powered by Venice AI"}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[80%] flex flex-col gap-1">
                      {msg.role === "user" ? (
                        <div className="bg-white/[0.06] border border-white/10 px-4 py-3 text-sm text-white/80 leading-relaxed">
                          {msg.content}
                        </div>
                      ) : (
                        <div className="border border-white/10 px-4 py-3">
                          {msg.status === "pending" ? (
                            <div className="flex gap-1.5 items-center py-1">
                              {[0, 1, 2].map((i) => (
                                <span
                                  key={i}
                                  className="w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse-dot"
                                  style={{ animationDelay: `${i * 0.2}s` }}
                                />
                              ))}
                            </div>
                          ) : msg.status === "error" ? (
                            <p className="text-sm text-[#EF4444]/80">{msg.content}</p>
                          ) : msg.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={msg.imageUrl} alt="Generated" className="max-w-xs" />
                          ) : msg.audioUrl ? (
                            <audio controls src={msg.audioUrl} className="w-full max-w-xs" />
                          ) : (
                            <p className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          )}
                          {msg.status === "done" && (
                            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/8 text-[10px] font-mono text-white/20">
                              <span style={{ color: selectedModel.color + "70" }}>
                                {msg.model}
                              </span>
                              {msg.latency && <span>{msg.latency}</span>}
                              {mode === "text" && (
                                <span className="text-[#10B981]/50">✓ settled</span>
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
                  {mode === "text"
                    ? "~0.01 USDC · x402 · ⌘↵ to send"
                    : "Venice AI · ⌘↵ to send"}
                </span>
                <div>
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
    </div>
  );
}
