export default function Dashboard({ stats }) {
  if (!stats) return null;
  const { total, completed, pending, overdue, by_status } = stats;
  const pct = (n) => (total ? (n / total) * 100 : 0);
  return (
    <section className="dash">
      <div className="stats">
        <div><b>{total}</b><span>Total</span></div>
        <div><b>{completed}</b><span>Completed</span></div>
        <div><b>{pending}</b><span>Pending</span></div>
        <div className={overdue ? "bad" : ""}><b>{overdue}</b><span>Overdue</span></div>
      </div>
      {Object.entries(by_status).map(([k, v]) => (
        <div className="bar-row" key={k}>
          <span>{k} ({v})</span>
          <div className="bar"><div className={"fill " + k.replace(" ", "")} style={{ width: pct(v) + "%" }} /></div>
        </div>
      ))}
    </section>
  );
}
