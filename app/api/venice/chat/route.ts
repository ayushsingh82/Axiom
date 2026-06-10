import type { NextRequest } from "next/server";

const VENICE_BASE = "https://api.venice.ai/api/v1";
const VENICE_API_KEY = process.env.VENICE_API_KEY ?? "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${VENICE_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VENICE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ error: "Chat completion failed" }, { status: 500 });
  }
}
