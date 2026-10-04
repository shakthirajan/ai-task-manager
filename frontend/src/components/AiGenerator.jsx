import { useState } from "react";
import { api } from "../api";

export default function AiGenerator({ onClose, onAdded }) {
  const [text, setText] = useState("");
  const [items, setItems] = useState([]);   // preview list: { ...task, selected }
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const generate = async () => {
    if (text.trim().length < 3) return setErr("Please describe what you need to do.");
    setBusy(true); setErr("");
    try { setItems((await api.aiGenerate(text)).tasks.map((t) => ({ ...t, selected: true }))); }
    catch (e) { setErr(e.message); }
    setBusy(false);
  };
  const edit = (i, patch) => setItems(items.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  const addSelected = async () => {
    setBusy(true);
    try {
      for (const t of items.filter((t) => t.selected))
        await api.create({ title: t.title, description: t.description, priority: t.priority, due_date: t.due_date });
      onAdded();
    } catch (e) { setErr(e.message); setBusy(false); }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="card wide" onClick={(e) => e.stopPropagation()}>
        <h2>✨ Describe → Tasks</h2>
        <textarea rows={3} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)}
          placeholder="e.g. I'm launching a website next week" />
        <button className="ai" disabled={busy} onClick={generate}>{busy ? "Working..." : "✨ Generate tasks"}</button>
        {busy && <span className="spinner" />}
        {err && <div className="error">{err}</div>}
        {items.map((t, i) => (
          <div className="preview" key={i}>
            <input type="checkbox" checked={t.selected} onChange={(e) => edit(i, { selected: e.target.checked })} />
            <input value={t.title} onChange={(e) => edit(i, { title: e.target.value })} />
            <select value={t.priority} onChange={(e) => edit(i, { priority: e.target.value })}>
              <option>Low</option><option>Medium</option><option>High</option></select>
            <input type="date" value={t.due_date || ""} onChange={(e) => edit(i, { due_date: e.target.value || null })} />
          </div>
        ))}
        <div className="row end">
          <button onClick={onClose}>Close</button>
          {items.length > 0 && <button className="primary" disabled={busy} onClick={addSelected}>Add selected tasks</button>}
        </div>
      </div>
    </div>
  );
}
