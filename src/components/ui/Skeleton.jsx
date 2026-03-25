export default function Skeleton({ height = 120, className = "" }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ height }}
    />
  );
}

export function StatSkeleton() {
  return (
    <div className="stat-card skeleton" style={{ height: 90 }} />
  );
}

export function ChartSkeleton() {
  return (
    <div className="chart-card skeleton" style={{ height: 340 }} />
  );
}
