import Navbar from "@/app/components/Navbar";
import RailLines from "@/app/components/RailLines";

const navLinks = [
  { id: "what-is-axiom", label: "What is Axiom?" },
  { id: "how-it-works", label: "How it works" },
  { id: "venice-ai", label: "Venice AI" },
  { id: "x402", label: "x402 Payments" },
  { id: "integration", label: "Integration" },
  { id: "endpoints", label: "API Reference" },
];

function CodeBlock({
  lang,
  code,
  label,
}: {
  lang: string;
  code: string;
  label?: string;
}) {
  return (
    <div className="border border-white/10 overflow-hidden mt-4">
      <div className="bg-white/[0.03] border-b border-white/10 px-5 py-2.5 flex items-center justify-between">
        {label && <span className="text-xs text-white/40">{label}</span>}
        <span className="text-xs font-mono text-white/20 ml-auto">{lang}</span>
      </div>
      <pre className="bg-black px-5 py-5 font-mono text-xs text-white/55 leading-relaxed overflow-x-auto whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-syne)] relative overflow-hidden">
      <RailLines />
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 pt-20 pb-24 flex gap-14">
        {/* Sidebar */}
        <aside className="hidden lg:block w-44 shrink-0">
          <div className="sticky top-24 pt-1">
          <p className="text-[10px] text-white/25 uppercase tracking-widest mb-4">Contents</p>
          <nav className="flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="text-xs text-white/40 hover:text-white py-1.5 transition-colors border-l border-white/10 pl-3 hover:border-white/30"
              >
                {link.label}
              </a>
            ))}
          </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-16">
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Docs</p>
            <h1 className="text-4xl font-bold text-white mb-3">Integration Guide</h1>
            <p className="text-white/40 text-sm leading-relaxed max-w-xl">
              How to query Axiom from any dApp, agent, or script — and how to embed
              Venice AI inference + x402 micropayments into your own project.
            </p>
          </div>

          {/* What is Axiom */}
          <section id="what-is-axiom">
            <h2 className="text-xl font-bold text-white mb-3">What is Axiom?</h2>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              Axiom is a permissionless AI inference gateway that lets any on-chain agent or dApp
              pay for AI queries using <span className="text-white/80">x402</span> — an HTTP-native
              micropayment protocol. There is no subscription, no API key, and no custodial account.
              Every query costs a fraction of a cent in USDC, settled on Base.
            </p>
            <p className="text-sm text-white/50 leading-relaxed">
              Under the hood, Axiom routes inference through{" "}
              <span className="text-white/80">Venice AI</span> — a privacy-first, uncensored AI
              platform — and settles payments via{" "}
              <span className="text-white/80">MetaMask Smart Accounts</span> using ERC-7710
              delegations so users only sign once per session.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-px bg-white/10 border border-white/10 overflow-hidden">
              {[
                { label: "Venice AI", desc: "LLM, image, and audio inference" },
                { label: "x402 Protocol", desc: "HTTP-native pay-per-call payments" },
                { label: "MetaMask Smart Account", desc: "ERC-7710 session delegation" },
              ].map((item) => (
                <div key={item.label} className="bg-black px-5 py-5">
                  <p className="text-sm font-semibold text-white mb-1">{item.label}</p>
                  <p className="text-xs text-white/35 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section id="how-it-works">
            <h2 className="text-xl font-bold text-white mb-3">How it works</h2>
            <div className="flex flex-col gap-0 border border-white/10 overflow-hidden">
              {[
                {
                  step: "01",
                  title: "Client sends a POST request",
                  desc: "Your app or agent sends a prompt to /api/infer. No auth headers needed on the first call.",
                },
                {
                  step: "02",
                  title: "Server returns HTTP 402",
                  desc: "Axiom responds with payment requirements — the USDC amount, contract address, and facilitator URL.",
                },
                {
                  step: "03",
                  title: "Wallet pays via x402",
                  desc: "The MetaMask Smart Account (or any x402 client) signs and broadcasts a micropayment using an existing ERC-7710 delegation.",
                },
                {
                  step: "04",
                  title: "Venice AI runs inference",
                  desc: "Once payment is verified, the prompt is forwarded to Venice AI. Text, image, and audio models are all supported.",
                },
                {
                  step: "05",
                  title: "Response + settlement returned",
                  desc: "The AI response is returned to the client. 1Shot relays the on-chain settlement — gas paid in USDC, no ETH required.",
                },
              ].map((item, i) => (
                <div
                  key={item.step}
                  className={`flex gap-5 px-6 py-5 ${i < 4 ? "border-b border-white/8" : ""}`}
                >
                  <span className="text-xs font-mono text-white/15 mt-0.5 shrink-0">{item.step}</span>
                  <div>
                    <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
                    <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Venice AI */}
          <section id="venice-ai">
            <h2 className="text-xl font-bold text-white mb-3">Venice AI</h2>
            <p className="text-sm text-white/50 leading-relaxed mb-5">
              Venice AI provides privacy-preserving inference. Prompts are never logged or used
              for training. Axiom exposes three Venice modalities:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/10 border border-white/10 overflow-hidden">
              {[
                {
                  label: "Text Chat",
                  color: "#3B82F6",
                  endpoint: "POST /api/venice/chat",
                  models: "venice-uncensored, llama-3.3-70b, qwen-2.5-coder-32b",
                  desc: "OpenAI-compatible chat completions endpoint.",
                },
                {
                  label: "Image Generation",
                  color: "#8B5CF6",
                  endpoint: "POST /api/venice/image/generate",
                  models: "grok-imagine-image, venice-sd35",
                  desc: "Generate images from text prompts. Returns base64-encoded PNG/WebP.",
                },
                {
                  label: "Audio TTS",
                  color: "#10B981",
                  endpoint: "POST /api/venice/audio/speech",
                  models: "tts-kokoro, tts-xai-v1",
                  desc: "Text-to-speech with multiple voices. Returns MP3 audio.",
                },
              ].map((item) => (
                <div key={item.label} className="bg-black px-5 py-5 relative overflow-hidden">
                  <div
                    className="absolute top-0 inset-x-0 h-[2px]"
                    style={{ background: item.color + "60" }}
                  />
                  <p className="text-sm font-bold text-white mb-1 mt-1">{item.label}</p>
                  <p className="text-[10px] font-mono text-white/20 mb-2">{item.endpoint}</p>
                  <p className="text-xs text-white/40 leading-relaxed mb-2">{item.desc}</p>
                  <p className="text-[10px] text-white/20 font-mono">{item.models}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-px bg-white/10 border border-white/10 overflow-hidden">
              <div className="bg-black px-5 py-4">
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1.5">x402 Balance</p>
                <p className="text-[10px] font-mono text-white/20 mb-1">GET /api/venice/x402/balance/&#123;address&#125;</p>
                <p className="text-xs text-white/40">Check a wallet&apos;s Venice credit balance. Requires SIWX auth.</p>
              </div>
              <div className="bg-black px-5 py-4">
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1.5">x402 Transactions</p>
                <p className="text-[10px] font-mono text-white/20 mb-1">GET /api/venice/x402/transactions/&#123;address&#125;</p>
                <p className="text-xs text-white/40">Paginated credit ledger. Requires SIWX auth.</p>
              </div>
            </div>
          </section>

          {/* x402 */}
          <section id="x402">
            <h2 className="text-xl font-bold text-white mb-3">x402 Payments</h2>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              x402 is an extension of HTTP 402 Payment Required. A server advertises payment
              requirements in the response body. The client pays on-chain and retries with an{" "}
              <code className="text-white/70 bg-white/5 px-1 py-0.5">X-PAYMENT</code> header. No
              browser popups, no approval UI on every call — just a signed USDC transfer on Base.
            </p>

            <CodeBlock
              lang="json"
              label="402 response body"
              code={`{
  "x402Version": 2,
  "accepts": [{
    "scheme": "exact",
    "network": "eip155:84532",
    "maxAmountRequired": "10000",   // 0.01 USDC (6 decimals)
    "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "payTo": "0xYOUR_PAYOUT_ADDRESS",
    "resource": "/api/infer",
    "description": "Axiom AI inference — pay per query"
  }]
}`}
            />

            <CodeBlock
              lang="typescript"
              label="Client — pay and retry"
              code={`const res = await fetch("/api/infer", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt, model }),
});

if (res.status === 402) {
  const { accepts } = await res.json();
  // sign payment with your wallet / x402 client
  const payment = await x402Client.pay(accepts[0]);

  const paidRes = await fetch("/api/infer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-PAYMENT": JSON.stringify(payment),
    },
    body: JSON.stringify({ prompt, model }),
  });
  return paidRes.json();
}`}
            />
          </section>

          {/* Integration */}
          <section id="integration">
            <h2 className="text-xl font-bold text-white mb-1">Integration</h2>
            <p className="text-sm text-white/40 mb-6">
              Copy the snippets below to add Axiom inference into any dApp.
            </p>

            <h3 className="text-sm font-semibold text-white/80 mb-1 uppercase tracking-wider text-xs">
              Vanilla JavaScript / TypeScript
            </h3>
            <CodeBlock
              lang="typescript"
              label="queryAxiom.ts — drop this in your project"
              code={`// No SDK needed — just fetch()
export async function queryAxiom(
  prompt: string,
  model = "venice-uncensored",
  axiomBaseUrl = "https://your-axiom.vercel.app"
) {
  const endpoint = \`\${axiomBaseUrl}/api/infer\`;

  // 1. Probe — expect 402
  const probe = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, model }),
  });

  if (probe.ok) return probe.json(); // already paid somehow

  if (probe.status !== 402) {
    throw new Error(\`Unexpected status: \${probe.status}\`);
  }

  const { accepts } = await probe.json();

  // 2. Pay using your preferred x402 client or wallet
  //    e.g. @coinbase/x402, @metamask/x402-client, or manual ERC-20 transfer
  const payment = await yourX402Client.pay(accepts[0]);

  // 3. Retry with payment header
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-PAYMENT": JSON.stringify(payment),
    },
    body: JSON.stringify({ prompt, model }),
  });

  if (!res.ok) throw new Error(\`Inference failed: \${res.status}\`);
  return res.json();
  // { result: string, model: string, latency: string, txHash: string }
}`}
            />

            <h3 className="text-sm font-semibold text-white/80 mb-1 mt-8 uppercase tracking-wider text-xs">
              React Hook
            </h3>
            <CodeBlock
              lang="typescript"
              label="useAxiom.ts"
              code={`import { useState, useCallback } from "react";
import { queryAxiom } from "./queryAxiom";

export function useAxiom(model?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const query = useCallback(async (prompt: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await queryAxiom(prompt, model);
      setResult(data.result);
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [model]);

  return { query, result, loading, error };
}

// Usage:
// const { query, result, loading } = useAxiom("llama-3.3-70b");
// await query("Explain ERC-7710 in one sentence");`}
            />

            <h3 className="text-sm font-semibold text-white/80 mb-1 mt-8 uppercase tracking-wider text-xs">
              Venice AI Direct (chat, image, audio)
            </h3>
            <CodeBlock
              lang="typescript"
              label="venice.ts — call any Venice endpoint via Axiom proxy"
              code={`const BASE = "https://your-axiom.vercel.app";

// Text chat
export const chat = (messages: { role: string; content: string }[], model: string) =>
  fetch(\`\${BASE}/api/venice/chat\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages }),
  }).then((r) => r.json());

// Image generation
export const generateImage = (prompt: string, model = "grok-imagine-image") =>
  fetch(\`\${BASE}/api/venice/image/generate\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, width: 512, height: 512 }),
  }).then((r) => r.json());
// returns { images: string[] }  (base64)

// Text-to-speech
export const speak = (text: string, voice = "af_sky") =>
  fetch(\`\${BASE}/api/venice/audio/speech\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "tts-kokoro", input: text, voice }),
  }).then((r) => r.blob());
// returns Blob — create URL with URL.createObjectURL(blob)`}
            />

            <h3 className="text-sm font-semibold text-white/80 mb-1 mt-8 uppercase tracking-wider text-xs">
              curl
            </h3>
            <CodeBlock
              lang="bash"
              label="Quick test"
              code={`# Step 1 — probe (expect 402)
curl -X POST https://your-axiom.vercel.app/api/infer \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "What is Base chain?", "model": "venice-uncensored"}'

# Step 2 — retry with payment (replace <PAYMENT_JSON> with signed x402 payload)
curl -X POST https://your-axiom.vercel.app/api/infer \\
  -H "Content-Type: application/json" \\
  -H "X-PAYMENT: <PAYMENT_JSON>" \\
  -d '{"prompt": "What is Base chain?", "model": "venice-uncensored"}'

# Venice image generation (no x402 required — uses server-side API key)
curl -X POST https://your-axiom.vercel.app/api/venice/image/generate \\
  -H "Content-Type: application/json" \\
  -d '{"model": "grok-imagine-image", "prompt": "A neon cityscape on Base chain"}'`}
            />
          </section>

          {/* API Reference */}
          <section id="endpoints">
            <h2 className="text-xl font-bold text-white mb-3">API Reference</h2>
            <div className="flex flex-col gap-0 border border-white/10 overflow-hidden">
              {[
                {
                  method: "POST",
                  path: "/api/infer",
                  auth: "x402",
                  desc: "Main inference endpoint. Returns 402 on first call, response on paid retry.",
                },
                {
                  method: "POST",
                  path: "/api/venice/chat",
                  auth: "server key",
                  desc: "OpenAI-compatible chat completions via Venice AI.",
                },
                {
                  method: "POST",
                  path: "/api/venice/image/generate",
                  auth: "server key",
                  desc: "Generate images. Returns base64-encoded image array.",
                },
                {
                  method: "GET",
                  path: "/api/venice/image/styles",
                  auth: "server key",
                  desc: "List available image style presets.",
                },
                {
                  method: "POST",
                  path: "/api/venice/audio/speech",
                  auth: "server key",
                  desc: "Text-to-speech. Returns binary MP3/audio.",
                },
                {
                  method: "GET",
                  path: "/api/venice/x402/balance/[address]",
                  auth: "SIWX",
                  desc: "Get Venice credit balance for a wallet address.",
                },
                {
                  method: "POST",
                  path: "/api/venice/x402/topup",
                  auth: "x402-payment",
                  desc: "Top up Venice credit balance via X-402-Payment header.",
                },
                {
                  method: "GET",
                  path: "/api/venice/x402/transactions/[address]",
                  auth: "SIWX",
                  desc: "Paginated transaction history for a wallet.",
                },
              ].map((ep, i, arr) => (
                <div
                  key={ep.path}
                  className={`flex gap-4 px-6 py-4 items-start ${
                    i < arr.length - 1 ? "border-b border-white/8" : ""
                  }`}
                >
                  <span
                    className={`shrink-0 text-[10px] font-mono px-2 py-0.5 border ${
                      ep.method === "POST"
                        ? "text-[#3B82F6] border-[#3B82F6]/20"
                        : "text-[#10B981] border-[#10B981]/20"
                    }`}
                  >
                    {ep.method}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-mono text-white/70">{ep.path}</span>
                    <p className="text-xs text-white/35 mt-1 leading-relaxed">{ep.desc}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-mono text-white/20 border border-white/10 px-2 py-0.5">
                    {ep.auth}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
