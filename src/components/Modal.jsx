import React, { useEffect } from "react";
import { FaTimesCircle } from "react-icons/fa";

export default function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = "680px" }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        zIndex: 1100,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: "20px",
        overflowY: "auto"
      }}
      onClick={onClose}
    >
      <div
        className="modal-container"
        style={{
          maxWidth,
          width: "100%",
          padding: "28px",
          borderRadius: "20px",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            paddingBottom: "16px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justify: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px"
          }}
        >
          <div>
            {title && <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "#0f172a" }}>{title}</h2>}
            {subtitle && <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>{subtitle}</p>}
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{ fontSize: "22px", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
          >
            <FaTimesCircle />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
