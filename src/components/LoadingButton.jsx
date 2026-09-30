import React from "react";
import { FaSpinner } from "react-icons/fa";

export default function LoadingButton({
  loading = false,
  loadingText = "Processing...",
  children,
  className = "primary-button",
  disabled = false,
  onClick,
  type = "button",
  style = {}
}) {
  return (
    <button
      type={type}
      className={className}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        opacity: loading || disabled ? 0.75 : 1,
        cursor: loading || disabled ? "not-allowed" : "pointer",
        ...style
      }}
    >
      {loading && <FaSpinner style={{ animation: "spin 1s linear infinite" }} />}
      {loading ? loadingText : children}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}
