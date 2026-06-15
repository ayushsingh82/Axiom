# Axiom

**Permissionless AI inference for on-chain agents and dApps.**

Any agent or dApp calls Axiom, pays per-query via the x402 HTTP payment protocol, and gets back a Venice AI response — no API key, no subscription, no native ETH for gas.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                  │
│               Agent · dApp · Script · Wallet                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │  POST /api/infer  {prompt, model}
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AXIOM ORACLE                             │
│                                                                 │
│   ┌─────────────────┐        ┌──────────────────────────────┐  │
│   │   x402 Gateway  │        │      Payment Verifier        │  │
│   │                 │        │                              │  │
│   │  1. Returns 402 │──────▶ │  2. Client pays 0.01 USDC   │  │
│   │     + terms     │        │     via ERC-7710 delegation  │  │
│   │                 │ ◀───── │     (no ETH needed)          │  │
│   │  3. Accepts     │        │                              │  │
│   │     X-PAYMENT   │        └──────────┬───────────────────┘  │
│   └────────┬────────┘                   │                       │
│            │                            │ 1Shot Relayer         │
│            │                            │ settles on-chain      │
│            ▼                            ▼                       │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    Venice AI Router                     │   │
│   │                                                         │   │
│   │   Text ──▶ llama-3.3-70b / venice-uncensored           │   │
│   │   Image ─▶ grok-imagine / venice-sd35                  │   │
│   │   Audio ─▶ tts-kokoro / tts-xai-v1                     │   │
│   └──────────────────────────┬──────────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────────┘
                               │  {result, latency, txHash}
                               ▼
                          CLIENT ✓
```

---

## How it works

1. **Call** — client sends a prompt to `/api/infer`. No auth header needed.
2. **402** — Axiom responds with payment terms: amount, asset, and network.
3. **Pay** — an ERC-7710 delegation authorises a 0.01 USDC micro-payment. 1Shot relays the transaction with gas paid in USDC — no ETH required.
4. **Infer** — the retried request (with `X-PAYMENT` header) is accepted. Venice AI runs the query and returns the result.

---

## Tech stack

| Layer | Technology | Role |
|---|---|---|
| AI Inference | Venice AI | Text, image, and audio inference |
| Payments | x402 Protocol | HTTP-native pay-per-call |
| Delegation | ERC-7710 | Scoped smart account permissions |
| Permissions | ERC-7715 | Fine-grained spend approval |
| Gas abstraction | 1Shot Relayer | Gasless execution, paid in USDC |
| Wallet | MetaMask Smart Accounts (EIP-7702) | EOA → smart account upgrade |
| Network | Base Sepolia | Settlement chain (USDC) |
| Frontend | Next.js 16, Tailwind CSS | UI |

---

## Hackathon tracks

Built for the **MetaMask Smart Accounts Kit × 1Shot API × Venice AI Dev Cook Off**.

- **Best x402 + ERC-7710** — x402 triggers ERC-7710-delegated micropayments on every inference call, requiring zero user interaction after initial delegation
- **Best Use of Venice AI** — Venice powers all text, image, and audio inference behind the Oracle with no centralised API key exposed to the client
- **Best Use of 1Shot Permissionless Relayer** — 1Shot executes every settlement transaction with gas abstracted to USDC on Base Sepolia

---

## Live demo

**[https://axiom-402.vercel.app](https://axiom-402.vercel.app)**

---

## Getting started (local)

```bash
npm install
npm run dev
```

Set environment variables in `.env.local`:

```
VENICE_API_KEY=your_key_here
ORACLE_PAYOUT_ADDRESS=your_wallet_address
```

Open [https://axiom-402.vercel.app](https://axiom-402.vercel.app) or your local dev server to explore the Oracle, Playground, and Docs.
