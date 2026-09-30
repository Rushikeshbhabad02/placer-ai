import React from "react";
import { FaSpinner } from "react-icons/fa";

export default function LoadingSpinner({ message = "Loading data...", size = 24 }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        gap: "12px",
        color: "var(--muted, #64748b)"
      }}
    >
      <FaSpinner
        style={{
          fontSize: `${size}px`,
          animation: "spin 1s linear infinite",
          color: "var(--primary, #2563eb)"
        }}
      />
      <span style={{ fontSize: "14px", fontWeight: "500" }}>{message}</span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
