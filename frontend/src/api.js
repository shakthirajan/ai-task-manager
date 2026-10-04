// All backend calls in one place. The API key never touches the frontend.
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function req(path, opt = {}) {
  const r = await fetch(BASE + path, { headers: { "Content-Type": "application/json" }, ...opt });
  if (!r.ok) {
    let msg = "Request failed";
    try { const j = await r.json(); msg = typeof j.detail === "string" ? j.detail : "Invalid input"; } catch {}
    throw new Error(msg);
  }
  return r.status === 204 ? null : r.json();
}
const body = (method, data) => ({ method, body: JSON.stringify(data) });

export const api = {
  list: (f) => req("/tasks?" + new URLSearchParams(Object.entries(f).filter(([, v]) => v))),
  stats: () => req("/dashboard/stats"),
  create: (d) => req("/tasks", body("POST", d)),
  update: (id, d) => req(`/tasks/${id}`, body("PUT", d)),
  remove: (id) => req(`/tasks/${id}`, { method: "DELETE" }),
  toggle: (id) => req(`/tasks/${id}/complete`, { method: "PATCH" }),
  aiGenerate: (text) => req("/ai/generate-tasks", body("POST", { text })),
  aiPriority: (t) => req("/ai/suggest-priority", body("POST", t)),
  aiSummary: (t) => req("/ai/summarize", body("POST", t)),
  aiBreakdown: (t) => req("/ai/breakdown", body("POST", t)),
};
