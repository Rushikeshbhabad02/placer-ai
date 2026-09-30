function Card({ title, value }) {
  return (
    <div style={{
      background: "#fff",
      padding: "15px",
      borderRadius: "10px"
    }}>
      <h4>{title}</h4>
      <h2>{value}</h2>
    </div>
  );
}

export default Card;