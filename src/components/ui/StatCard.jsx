export default function StatCard({ icon, label, value, unit, sub, accent }) {
  return (
    <div className="stat-card" style={accent ? { "--accent": accent } : {}}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-label">{label}</div>
        <div className="stat-value">
          {value ?? "—"}
          {unit && <span className="stat-unit">{unit}</span>}
        </div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}
