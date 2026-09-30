import React from "react";
import { FaInbox, FaExclamationTriangle, FaSearch, FaRobot, FaBriefcase, FaCalendarAlt } from "react-icons/fa";

const iconMap = {
  inbox: FaInbox,
  warning: FaExclamationTriangle,
  search: FaSearch,
  ai: FaRobot,
  jobs: FaBriefcase,
  calendar: FaCalendarAlt
};

export default function EmptyState({
  icon = "inbox",
  title = "No data found",
  message = "There are currently no items to display.",
  actionLabel = null,
  onAction = null
}) {
  const IconComponent = iconMap[icon] || FaInbox;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        background: "#fff",
        borderRadius: "16px",
        border: "1px border-dashed #cbd5e1",
        margin: "16px 0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          color: "var(--muted, #64748b)",
          marginBottom: "16px"
        }}
      >
        <IconComponent />
      </div>
      <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0" }}>{title}</h3>
      <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "420px", margin: "0 0 20px 0", lineHeight: "1.5" }}>
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          className="primary-button"
          onClick={onAction}
          style={{ padding: "10px 20px", borderRadius: "8px" }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
