import type { NextRequest } from "next/server";

const VENICE_BASE = "https://api.venice.ai/api/v1";
const VENICE_API_KEY = process.env.VENICE_API_KEY ?? "";

export async function POST(req: NextRequest) {
  const paymentHeader = req.headers.get("X-402-Payment");

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${VENICE_API_KEY}`,
      "Content-Type": "application/json",
    };
    if (paymentHeader) headers["X-402-Payment"] = paymentHeader;

    const res = await fetch(`${VENICE_BASE}/x402/top-up`, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ error: "Top-up failed" }, { status: 500 });
  }
}
