export type ActivityEntry = {
  id: string;
  type: "text" | "image" | "audio";
  model: string;
  status: "settled" | "failed";
  cost: number;
  latency: string;
  timestamp: number;
  txHash?: string | null;
};

const KEY = "axiom_v1_activity";

export function logActivity(entry: ActivityEntry): void {
  if (typeof window === "undefined") return;
  try {
    const prev = getActivity();
    localStorage.setItem(KEY, JSON.stringify([entry, ...prev].slice(0, 100)));
  } catch {}
}

export function getActivity(): ActivityEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function getStats(entries: ActivityEntry[]) {
  const settled = entries.filter((e) => e.status === "settled");
  return {
    total: entries.length,
    totalCost: settled.reduce((s, e) => s + e.cost, 0),
    avgLatency:
      settled.length
        ? (settled.reduce((s, e) => s + parseFloat(e.latency), 0) / settled.length).toFixed(2)
        : "—",
    byType: {
      text: entries.filter((e) => e.type === "text").length,
      image: entries.filter((e) => e.type === "image").length,
      audio: entries.filter((e) => e.type === "audio").length,
    },
  };
}
