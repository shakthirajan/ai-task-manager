import { useState } from "react";
import { api } from "../api";

export default function TaskCard({ task, onEdit, onDelete, onToggle, onChanged }) {
  const [ai, setAi] = useState(null);     // latest AI result for this card
  const [busy, setBusy] = useState("");   // which AI action is running (disables buttons)
  const [err, setErr] = useState("");
  const overdue = task.due_date && task.due_date < new Date().toISOString().slice(0, 10) && task.status !== "Done";
  const payload = { title: task.title, description: task.description, due_date: task.due_date };
  const full = { title: task.title, description: task.description, priority: task.priority, status: task.status, due_date: task.due_date };

  const run = async (kind) => {
    setBusy(kind); setErr(""); setAi(null);
    try {
      if (kind === "priority") setAi({ kind, ...(await api.aiPriority(payload)) });
      if (kind === "summary") setAi({ kind, ...(await api.aiSummary(payload)) });
      if (kind === "steps") setAi({ kind, ...(await api.aiBreakdown(payload)) });
    } catch (e) { setErr(e.message); }
    setBusy("");
  };
  const applyPriority = async () => { await api.update(task.id, { ...full, priority: ai.priority }); setAi(null); onChanged(); };
  const addAsTasks = async () => {
    for (const s of ai.tasks) await api.create({ title: s.title, description: s.description, priority: s.priority, due_date: s.due_date });
    setAi(null); onChanged();
  };
  const addChecklist = async () => {
    const list = ai.tasks.map((s) => `- [ ] ${s.title}`).join("\n");
    await api.update(task.id, { ...full, description: (task.description + "\n" + list).trim() });
    setAi(null); onChanged();
  };

  return (
    <div className={"task " + (overdue ? "overdue" : "") + (task.status === "Done" ? " done" : "")}>
      <div className="row between">
        <h3>{task.title}</h3>
        <span className={"badge " + task.priority}>{task.priority}</span>
      </div>
      <p className="desc">{task.description}</p>
      <div className="meta">
        <span>{task.status}</span>
        <span>{task.due_date ? (overdue ? "⚠ Overdue: " : "Due: ") + task.due_date : "No due date"}</span>
      </div>
      <div className="row wrap">
        <button onClick={onToggle}>{task.status === "Done" ? "Reopen" : "✓ Complete"}</button>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete}>Delete</button>
      </div>
      <div className="row wrap ai-row">
        <button className="ai" disabled={!!busy} onClick={() => run("priority")}>✨ Priority</button>
        <button className="ai" disabled={!!busy} onClick={() => run("summary")}>✨ Summarise</button>
        <button className="ai" disabled={!!busy} onClick={() => run("steps")}>✨ Break down</button>
        {busy && <span className="spinner" />}
      </div>
      {err && <div className="error">{err}</div>}
      {ai?.kind === "priority" && (
        <div className="result">Suggested: <b>{ai.priority}</b> — {ai.reason}
          <button className="primary" onClick={applyPriority}>Apply</button></div>
      )}
      {ai?.kind === "summary" && <div className="result">{ai.summary}</div>}
      {ai?.kind === "steps" && (
        <div className="result">
          <ol>{ai.tasks.map((s, i) => <li key={i}>{s.title}</li>)}</ol>
          <div className="row wrap"><button className="primary" onClick={addAsTasks}>Add as tasks</button>
            <button onClick={addChecklist}>Add as checklist</button></div>
        </div>
      )}
    </div>
  );
}
