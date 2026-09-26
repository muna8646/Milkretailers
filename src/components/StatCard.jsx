export default function StatCard({
  title,
  value,
  description,
  icon,
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-icon">
          {icon}
        </span>

        <span className="stat-title">
          {title}
        </span>
      </div>

      <div className="stat-value">
        {value}
      </div>

      {description && (
        <div className="stat-description">
          {description}
        </div>
      )}
    </div>
  );
}