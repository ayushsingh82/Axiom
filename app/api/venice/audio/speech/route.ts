import type { NextRequest } from "next/server";

const VENICE_BASE = "https://api.venice.ai/api/v1";
const VENICE_API_KEY = process.env.VENICE_API_KEY ?? "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${VENICE_BASE}/audio/speech`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VENICE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Audio generation failed" }));
      return Response.json(err, { status: res.status });
    }

    const audioBuffer = await res.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "audio/mpeg",
      },
    });
  } catch {
    return Response.json({ error: "Audio generation failed" }, { status: 500 });
  }
}
