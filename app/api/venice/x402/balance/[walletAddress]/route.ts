import type { NextRequest } from "next/server";

const VENICE_BASE = "https://api.venice.ai/api/v1";

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/venice/x402/balance/[walletAddress]">
) {
  const { walletAddress } = await ctx.params;
  const siwxHeader = req.headers.get("X-Sign-In-With-X");

  if (!siwxHeader) {
    return Response.json({ error: "X-Sign-In-With-X header required" }, { status: 401 });
  }

  try {
    const res = await fetch(`${VENICE_BASE}/x402/balance/${walletAddress}`, {
      headers: { "X-Sign-In-With-X": siwxHeader },
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ error: "Failed to fetch balance" }, { status: 500 });
  }
}
