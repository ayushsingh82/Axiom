import { NextRequest } from "next/server";
import OpenAI from "openai";

const PAYOUT_ADDRESS =
  process.env.ORACLE_PAYOUT_ADDRESS ?? "0x0000000000000000000000000000000000000000";
const VENICE_API_KEY = process.env.VENICE_API_KEY ?? "";

// USDC on Base
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
// MetaMask facilitator for Base
const FACILITATOR_URL =
  "https://tx-sentinel-base-mainnet.dev-api.cx.metamask.io/platform/v2/x402";

const paymentRequirements = {
  scheme: "exact",
  network: "eip155:8453",
  maxAmountRequired: "10000", // 0.01 USDC (6 decimals)
  resource: "/api/infer",
  description: "Axiom AI inference — pay per query",
  mimeType: "application/json",
  payTo: PAYOUT_ADDRESS,
  maxTimeoutSeconds: 60,
  asset: USDC_BASE,
  outputSchema: null,
  extra: {
    assetTransferMethod: "erc7710",
    facilitatorUrl: FACILITATOR_URL,
    name: "USDC",
    decimals: 6,
    version: "2",
  },
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-PAYMENT",
      "Access-Control-Expose-Headers": "X-PAYMENT-REQUIRED, X-PAYMENT-RESPONSE",
    },
  });
}

export async function POST(request: NextRequest) {
  const paymentHeader = request.headers.get("X-PAYMENT");

  // No payment header — return 402 with requirements
  if (!paymentHeader) {
    return Response.json(
      {
        x402Version: 2,
        accepts: [paymentRequirements],
        error: "Payment required",
      },
      {
        status: 402,
        headers: {
          "X-PAYMENT-REQUIRED": JSON.stringify([paymentRequirements]),
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Expose-Headers": "X-PAYMENT-REQUIRED",
        },
      }
    );
  }

  // Payment header present — verify via MetaMask facilitator then call Venice
  try {
    // Verify payment with facilitator
    const verifyRes = await fetch(FACILITATOR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "x402_verify",
        params: [paymentHeader, paymentRequirements],
      }),
    });

    if (!verifyRes.ok) {
      return Response.json({ error: "Payment verification failed" }, { status: 402 });
    }

    const verifyData = await verifyRes.json();
    if (verifyData.error || !verifyData.result?.isValid) {
      return Response.json({ error: "Invalid payment" }, { status: 402 });
    }

    // Parse request body
    const body = await request.json();
    const { prompt, model = "venice-uncensored" } = body as {
      prompt: string;
      model?: string;
    };

    if (!prompt?.trim()) {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const start = Date.now();

    // Call Venice AI
    const client = new OpenAI({
      apiKey: VENICE_API_KEY,
      baseURL: "https://api.venice.ai/api/v1",
    });

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      // @ts-expect-error venice_parameters is Venice-specific
      venice_parameters: { include_venice_system_prompt: false },
    });

    const latency = ((Date.now() - start) / 1000).toFixed(2) + "s";

    // Settle payment via facilitator
    const settleRes = await fetch(FACILITATOR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "x402_settle",
        params: [paymentHeader, paymentRequirements],
      }),
    });
    const settleData = await settleRes.json();

    return Response.json(
      {
        result: response.choices[0].message.content,
        model: response.model,
        usage: response.usage,
        latency,
        txHash: settleData.result?.txHash ?? null,
      },
      {
        headers: {
          "X-PAYMENT-RESPONSE": JSON.stringify({ success: true }),
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Expose-Headers": "X-PAYMENT-RESPONSE",
        },
      }
    );
  } catch (err) {
    console.error("[infer]", err);
    return Response.json({ error: "Inference failed" }, { status: 500 });
  }
}
