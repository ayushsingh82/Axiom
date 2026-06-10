const VENICE_BASE = "https://api.venice.ai/api/v1";
const VENICE_API_KEY = process.env.VENICE_API_KEY ?? "";

export async function GET() {
  try {
    const res = await fetch(`${VENICE_BASE}/image/styles`, {
      headers: { Authorization: `Bearer ${VENICE_API_KEY}` },
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ error: "Failed to fetch image styles" }, { status: 500 });
  }
}
