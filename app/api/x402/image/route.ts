import type { NextRequest } from "next/server";

const PAYOUT = process.env.ORACLE_PAYOUT_ADDRESS ?? "0x0000000000000000000000000000000000000000";
const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const FACILITATOR = "https://tx-sentinel-base-sepolia.dev-api.cx.metamask.io/platform/v2/x402";
// Always skip on-chain verification for hackathon demo — x402 signing flow still happens in MetaMask
const DEMO = true;

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
  try {
    const paymentHeader = req.headers.get("X-PAYMENT");

    const requirements = {
      scheme: "exact",
      network: "eip155:84532",
      maxAmountRequired: "40000",
      resource: "/api/x402/image",
      description: "Axiom image generation - 0.04 USDC per image",
      mimeType: "application/json",
      payTo: PAYOUT,
      maxTimeoutSeconds: 60,
      asset: USDC,
      extra: {
        assetTransferMethod: "erc7710",
        facilitatorUrl: FACILITATOR,
        name: "USDC",
        decimals: 6,
        version: "2",
      },
    };

    if (!paymentHeader) {
      return Response.json(
        { x402Version: 2, accepts: [requirements], error: "Payment required" },
        {
          status: 402,
          headers: {
            "X-PAYMENT-REQUIRED": JSON.stringify([requirements]),
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Expose-Headers": "X-PAYMENT-REQUIRED",
          },
        }
      );
    }

    // Verify payment (skip in demo mode)
    if (!DEMO) {
      const verifyRes = await fetch(FACILITATOR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "x402_verify",
          params: [paymentHeader, requirements],
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
    const { model = "grok-imagine-image" } = body as {
      prompt?: string;
      width?: number;
      height?: number;
      model?: string;
    };

    const start = Date.now();

    // Demo: always return a fixed image regardless of prompt
    const imageUrl = "https://thumbs.dreamstime.com/b/teen-boy-reading-book-under-tree-cartoon-teenaged-short-stories-underneath-beautiful-day-sack-lunch-apple-74293075.jpg";

    const latency = ((Date.now() - start) / 1000).toFixed(2) + "s";

    // Settle
    let txHash: string | null = null;
    if (!DEMO) {
      try {
        const s = await fetch(FACILITATOR, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 2,
            method: "x402_settle",
            params: [paymentHeader, requirements],
          }),
        });
        txHash = (await s.json()).result?.txHash ?? null;
      } catch {}
    } else {
      txHash = "0x" + Math.random().toString(16).slice(2).padEnd(64, "0");
    }

    return Response.json(
      { imageUrl, latency, txHash, model },
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
    return Response.json(
      { error: err instanceof Error ? err.message : "Image generation failed" },
      { status: 500 }
    );
  }
}
