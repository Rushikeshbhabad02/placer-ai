import React from "react";

export default function StatusBadge({ status = "Applied" }) {
  const getStyle = (st) => {
    const key = String(st).toLowerCase();
    if (key.includes("shortlisted") || key.includes("approved") || key.includes("completed")) {
      return { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" };
    }
    if (key.includes("applied") || key.includes("scheduled") || key.includes("active") || key.includes("open")) {
      return { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
    }
    if (key.includes("pending") || key.includes("on hold") || key.includes("review")) {
      return { bg: "#fffbeb", color: "#b45309", border: "#fde68a" };
    }
    if (key.includes("rejected") || key.includes("cancelled") || key.includes("expired")) {
      return { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" };
    }
    return { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" };
  };

  const style = getStyle(status);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: "600",
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`
      }}
    >
      {status}
    </span>
  );
}
