import React from "react";

export function ProgressBar({ progress = 0, color = "var(--primary, #2563eb)", height = 8 }) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div style={{ width: "100%", background: "#e2e8f0", borderRadius: "10px", height: `${height}px`, overflow: "hidden" }}>
      <div
        style={{
          width: `${clampedProgress}%`,
          background: color,
          height: "100%",
          borderRadius: "10px",
          transition: "width 0.4s ease"
        }}
      />
    </div>
  );
}

export function SkillGapCard({ skillItem }) {
  const { skill, priority = "High", reason = "Required by target roles.", progress = 40 } = skillItem;

  const priorityColor =
    priority.toLowerCase() === "high" ? "#dc2626" : priority.toLowerCase() === "medium" ? "#d97706" : "#2563eb";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{skill}</h4>
        <span
          style={{
            fontSize: "11px",
            fontWeight: "700",
            textTransform: "uppercase",
            color: priorityColor,
            background: `${priorityColor}15`,
            padding: "3px 8px",
            borderRadius: "12px"
          }}
        >
          Priority: {priority}
        </span>
      </div>

      <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: "1.4" }}>"{reason}"</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569", fontWeight: "600" }}>
          <span>Current Preparedness</span>
          <span>{progress}%</span>
        </div>
        <ProgressBar progress={progress} color={priorityColor} height={8} />
      </div>
    </div>
  );
}
