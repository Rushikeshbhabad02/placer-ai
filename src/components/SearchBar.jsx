import React from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

export default function SearchBar({ value, onChange, placeholder = "Search...", onClear }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: "480px"
      }}
    >
      <FaSearch
        style={{
          position: "absolute",
          left: "14px",
          color: "#94a3b8",
          fontSize: "14px",
          pointerEvents: "none"
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 36px 10px 38px",
          borderRadius: "10px",
          border: "1px solid #cbd5e1",
          background: "#fff",
          fontSize: "14px",
          outline: "none",
          color: "#0f172a",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            if (onClear) onClear();
          }}
          style={{
            position: "absolute",
            right: "12px",
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center"
          }}
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
}
