function InfoCard({ title, value, description }) {
  return (
    <div className="info-card">
      <p>{title}</p>
      <h2>{value}</h2>
      <span>{description}</span>
    </div>
  );
}

export default InfoCard;
