import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import Dashboard from "../components/Dashboard";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import AiGenerator from "../components/AiGenerator";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [f, setF] = useState({ search: "", status: "", priority: "", due: "" });
  const [editing, setEditing] = useState(null);   // null = closed, {} = new, task = edit
  const [showAi, setShowAi] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try { setTasks(await api.list(f)); setStats(await api.stats()); setErr(""); }
    catch (e) { setErr("Cannot reach the server: " + e.message); }
  }, [f]);
  useEffect(() => { load(); }, [load]);

  const save = async (d) => {
    if (editing.id) await api.update(editing.id, d); else await api.create(d);
    setEditing(null); load();
  };
  const del = async (id) => { if (confirm("Delete this task?")) { await api.remove(id); load(); } };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <div className="app">
      <header>
        <h1>✨ AI Task Manager</h1>
        <div className="row">
          <button className="ai" onClick={() => setShowAi(true)}>✨ Describe → Tasks</button>
          <button className="primary" onClick={() => setEditing({})}>+ New Task</button>
        </div>
      </header>
      {err && <div className="error">{err}</div>}
      <Dashboard stats={stats} />
      <div className="filters">
        <input placeholder="Search tasks..." value={f.search} onChange={set("search")} />
        <select value={f.status} onChange={set("status")}>
          <option value="">All status</option><option>Todo</option><option>In Progress</option><option>Done</option>
        </select>
        <select value={f.priority} onChange={set("priority")}>
          <option value="">All priority</option><option>Low</option><option>Medium</option><option>High</option>
        </select>
        <select value={f.due} onChange={set("due")}>
          <option value="">Any due date</option><option value="overdue">Overdue</option>
          <option value="today">Today</option><option value="week">Next 7 days</option>
        </select>
      </div>
      <div className="grid">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} onEdit={() => setEditing(t)} onDelete={() => del(t.id)}
            onToggle={async () => { await api.toggle(t.id); load(); }} onChanged={load} />
        ))}
        {!tasks.length && <p className="muted">No tasks found. Create one or use ✨ Describe → Tasks.</p>}
      </div>
      {editing && <TaskForm task={editing} onSave={save} onClose={() => setEditing(null)} />}
      {showAi && <AiGenerator onClose={() => setShowAi(false)} onAdded={() => { setShowAi(false); load(); }} />}
    </div>
  );
}
