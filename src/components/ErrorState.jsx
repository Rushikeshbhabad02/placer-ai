import React from "react";
import { FaExclamationTriangle, FaRedo } from "react-icons/fa";

export default function ErrorState({
  title = "Something went wrong",
  message = "We encountered an issue loading this section. Please try again.",
  onRetry = null
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        textAlign: "center",
        background: "#fef2f2",
        borderRadius: "16px",
        border: "1px solid #fecaca",
        margin: "16px 0"
      }}
    >
      <FaExclamationTriangle style={{ fontSize: "36px", color: "#ef4444", marginBottom: "12px" }} />
      <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#991b1b", margin: "0 0 6px 0" }}>{title}</h3>
      <p style={{ fontSize: "13px", color: "#7f1d1d", maxWidth: "400px", margin: "0 0 16px 0" }}>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          <FaRedo /> Try Again
        </button>
      )}
    </div>
  );
}
