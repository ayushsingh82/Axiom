import type { NextRequest } from "next/server";

const VENICE_BASE = "https://api.venice.ai/api/v1";

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/venice/x402/transactions/[walletAddress]">
) {
  const { walletAddress } = await ctx.params;
  const siwxHeader = req.headers.get("X-Sign-In-With-X");

  if (!siwxHeader) {
    return Response.json({ error: "X-Sign-In-With-X header required" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = url.searchParams.get("limit") ?? "50";
  const offset = url.searchParams.get("offset") ?? "0";

  try {
    const res = await fetch(
      `${VENICE_BASE}/x402/transactions/${walletAddress}?limit=${limit}&offset=${offset}`,
      { headers: { "X-Sign-In-With-X": siwxHeader } }
    );
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
