import type { NextRequest } from "next/server";

const VENICE_BASE = "https://api.venice.ai/api/v1";
const VENICE_API_KEY = process.env.VENICE_API_KEY ?? "";

async function pollinations(prompt: string, width: number, height: number): Promise<Response> {
  const encoded = encodeURIComponent(prompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&nologo=true`;
  const imgRes = await fetch(url);
  if (!imgRes.ok) throw new Error("Pollinations fetch failed");
  const buffer = await imgRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return Response.json({ images: [base64] }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, width = 512, height = 512 } = body;

    if (!VENICE_API_KEY) {
      return pollinations(prompt, width, height);
    }

    const res = await fetch(`${VENICE_BASE}/image/generate`, {
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
    return Response.json({ error: "Image generation failed" }, { status: 500 });
  }
}
