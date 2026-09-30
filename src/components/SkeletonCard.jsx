import React from "react";

export function SkeletonCard({ count = 3 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            animation: "pulse 1.5s infinite ease-in-out"
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#e2e8f0" }}></div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ width: "60%", height: "16px", background: "#e2e8f0", borderRadius: "4px" }}></div>
              <div style={{ width: "40%", height: "12px", background: "#f1f5f9", borderRadius: "4px" }}></div>
            </div>
          </div>
          <div style={{ width: "100%", height: "40px", background: "#f8fafc", borderRadius: "8px" }}></div>
          <div style={{ width: "80%", height: "14px", background: "#f1f5f9", borderRadius: "4px" }}></div>
        </div>
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export function SkeletonTable({ rows = 4 }) {
  return (
    <div style={{ width: "100%", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px" }}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          style={{
            display: "flex",
            justify: "space-between",
            alignItems: "center",
            padding: "12px 0",
            borderBottom: idx === rows - 1 ? "none" : "1px solid #f1f5f9",
            animation: "pulse 1.5s infinite ease-in-out"
          }}
        >
          <div style={{ width: "30%", height: "14px", background: "#e2e8f0", borderRadius: "4px" }}></div>
          <div style={{ width: "20%", height: "14px", background: "#f1f5f9", borderRadius: "4px" }}></div>
          <div style={{ width: "15%", height: "14px", background: "#f1f5f9", borderRadius: "4px" }}></div>
          <div style={{ width: "10%", height: "24px", background: "#e2e8f0", borderRadius: "12px" }}></div>
        </div>
      ))}
    </div>
  );
}
