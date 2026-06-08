# Axiom

Permissionless on-chain AI inference. Any agent or dApp calls it, pays per-query via x402, Venice runs the AI, and 1Shot settles gas in USDC.

## What it does

Axiom is an on-chain AI inference oracle. You send a prompt, pay a micro-fee automatically via the x402 HTTP payment protocol, and get back a Venice AI response — all without an API key, subscription, or native ETH for gas.

- **No signup** — connect a MetaMask Smart Account and query immediately
- **Pay-per-query** — x402 handles micropayments automatically in the HTTP layer
- **No ETH for gas** — 1Shot relayer settles all transactions with USDC
- **Scoped permissions** — ERC-7710 delegations mean the app never touches your full wallet

## How it works

```
Agent / dApp
    │
    ├─ POST /infer
    │
    │  ← HTTP 402 (payment required)
    │
    ├─ x402 client pays via ERC-7710 delegation
    │     └─ 1Shot relayer submits tx, gas paid in USDC
    │
    └─ POST /infer (retry with payment proof)
          └─ Venice AI runs inference → response returned
```

## Tech stack

| Layer | Technology |
|---|---|
| AI Inference | Venice AI (text, image, multimodal) |
| Payments | x402 HTTP payment protocol |
| Delegation | ERC-7710 smart account delegations |
| Permissions | ERC-7715 fine-grained permission requests |
| Gas abstraction | 1Shot Permissionless Relayer (USDC) |
| Wallet | MetaMask Smart Accounts via EIP-7702 |
| Frontend | Next.js 15, Tailwind CSS, Syne font |

## Pages

| Route | Description |
|---|---|
| `/` | Landing — project overview, how it works, tech stack |
| `/oracle` | Query interface — send prompts, see responses |
| `/dashboard` | Agent activity — tx history, costs, latency |
| `/docs` | Integration guide — x402, ERC-7710, 1Shot |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Hackathon tracks

Built for the MetaMask Smart Accounts Kit x 1Shot API x Venice AI Dev Cook Off.

- **Best x402 + ERC-7710** — x402 triggers 7710-delegated micropayments per inference call
- **Best Use of Venice AI** — Venice is the inference engine behind every Axiom response
- **Best Use of 1Shot Permissionless Relayer** — 1Shot executes all settlements with gas in USDC
