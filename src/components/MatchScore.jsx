import React from "react";

export default function MatchScore({ score = 85, size = "medium" }) {
  const getScoreColor = (val) => {
    if (val >= 85) return "#10b981"; // Emerald
    if (val >= 70) return "#2563eb"; // Royal Blue
    if (val >= 50) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  const color = getScoreColor(score);

  if (size === "small") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          background: `${color}15`,
          color: color,
          padding: "4px 8px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "700"
        }}
      >
        AI Match: {score}%
      </span>
    );
  }

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: size === "large" ? "72px" : "56px",
        height: size === "large" ? "72px" : "56px",
        borderRadius: "50%",
        border: `3px solid ${color}`,
        background: `${color}10`,
        color: color,
        fontWeight: "800",
        boxShadow: `0 2px 8px ${color}20`
      }}
    >
      <span style={{ fontSize: size === "large" ? "20px" : "15px", lineHeight: "1" }}>{score}%</span>
      <span style={{ fontSize: "9px", textTransform: "uppercase", fontWeight: "700", opacity: 0.8, marginTop: "2px" }}>
        Match
      </span>
    </div>
  );
}
