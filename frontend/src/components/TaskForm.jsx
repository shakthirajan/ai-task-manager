import { useState } from "react";

export default function TaskForm({ task, onSave, onClose }) {
  const [d, setD] = useState({
    title: task.title || "", description: task.description || "", priority: task.priority || "Medium",
    status: task.status || "Todo", due_date: task.due_date || "",
  });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!d.title.trim()) return setErr("Title is required");
    try { await onSave({ ...d, due_date: d.due_date || null }); } catch (x) { setErr(x.message); }
  };
  return (
    <div className="modal" onClick={onClose}>
      <form className="card" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>{task.id ? "Edit Task" : "New Task"}</h2>
        {err && <div className="error">{err}</div>}
        <input placeholder="Title" value={d.title} onChange={set("title")} maxLength={200} />
        <textarea placeholder="Description" rows={4} value={d.description} onChange={set("description")} />
        <div className="row">
          <select value={d.priority} onChange={set("priority")}><option>Low</option><option>Medium</option><option>High</option></select>
          <select value={d.status} onChange={set("status")}><option>Todo</option><option>In Progress</option><option>Done</option></select>
          <input type="date" value={d.due_date} onChange={set("due_date")} />
        </div>
        <div className="row end">
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="primary">Save</button>
        </div>
      </form>
    </div>
  );
}
