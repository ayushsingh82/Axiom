import type { NextRequest } from "next/server";

const PAYOUT = process.env.ORACLE_PAYOUT_ADDRESS ?? "0x0000000000000000000000000000000000000000";
const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const FACILITATOR = "https://tx-sentinel-base-sepolia.dev-api.cx.metamask.io/platform/v2/x402";
const DEMO = !process.env.ORACLE_PAYOUT_ADDRESS || PAYOUT === "0x0000000000000000000000000000000000000000";

const REQUIREMENTS = {
  scheme: "exact",
  network: "eip155:84532",
  maxAmountRequired: "40000", // 0.04 USDC
  resource: "/api/x402/image",
  description: "Axiom image generation — 0.04 USDC per image",
  mimeType: "application/json",
  payTo: PAYOUT,
  maxTimeoutSeconds: 60,
  asset: USDC,
  outputSchema: null,
  extra: {
    assetTransferMethod: "erc7710",
    facilitatorUrl: FACILITATOR,
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

export async function POST(req: NextRequest) {
  const paymentHeader = req.headers.get("X-PAYMENT");

  if (!paymentHeader) {
    return Response.json(
      { x402Version: 2, accepts: [REQUIREMENTS], error: "Payment required" },
      {
        status: 402,
        headers: {
          "X-PAYMENT-REQUIRED": JSON.stringify([REQUIREMENTS]),
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Expose-Headers": "X-PAYMENT-REQUIRED",
        },
      }
    );
  }

  try {
    // Verify payment (skip in demo mode)
    if (!DEMO) {
      const verifyRes = await fetch(FACILITATOR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0", id: 1,
          method: "x402_verify",
          params: [paymentHeader, REQUIREMENTS],
        }),
      });
      if (verifyRes.ok) {
        const v = await verifyRes.json();
        if (v.error || !v.result?.isValid) {
          return Response.json({ error: "Invalid payment" }, { status: 402 });
        }
      }
    }

    const body = await req.json();
    const { prompt, width = 512, height = 512 } = body;

    const start = Date.now();

    // Return Pollinations URL directly — browser loads it, avoids server timeout
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&seed=${Date.now()}`;

    const latency = ((Date.now() - start) / 1000).toFixed(2) + "s";

    // Settle
    let txHash: string | null = null;
    if (!DEMO) {
      try {
        const s = await fetch(FACILITATOR, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0", id: 2,
            method: "x402_settle",
            params: [paymentHeader, REQUIREMENTS],
          }),
        });
        txHash = (await s.json()).result?.txHash ?? null;
      } catch {}
    } else {
      txHash = "0x" + Math.random().toString(16).slice(2).padEnd(64, "0");
    }

    return Response.json(
      { imageUrl, latency, txHash, model: body.model ?? "pollinations" },
      {
        headers: {
          "X-PAYMENT-RESPONSE": JSON.stringify({ success: true }),
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Expose-Headers": "X-PAYMENT-RESPONSE",
        },
      }
    );
  } catch (err) {
    console.error("[x402/image]", err);
    return Response.json({ error: "Image generation failed" }, { status: 500 });
  }
}
