const MetricCard = ({ label, value, accent, icon: Icon }) => (
  <div className="metric-card">
    <div className="metric-icon" style={{ background: accent }}>
      {Icon && <Icon size={18} />}
    </div>
    <div>
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  </div>
);

export default MetricCard;
