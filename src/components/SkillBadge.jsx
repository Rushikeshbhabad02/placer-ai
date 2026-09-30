import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function SkillBadge({ skill, status = "matched" }) {
  if (status === "matched") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          background: "#ecfdf5",
          color: "#047857",
          border: "1px solid #a7f3d0",
          borderRadius: "16px",
          padding: "4px 10px",
          fontSize: "12px",
          fontWeight: "600"
        }}
      >
        <FaCheckCircle style={{ fontSize: "11px" }} /> {skill}
      </span>
    );
  }

  if (status === "missing") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          background: "#fef2f2",
          color: "#b91c1c",
          border: "1px solid #fecaca",
          borderRadius: "16px",
          padding: "4px 10px",
          fontSize: "12px",
          fontWeight: "600"
        }}
      >
        <FaTimesCircle style={{ fontSize: "11px" }} /> {skill}
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "#f1f5f9",
        color: "#334155",
        borderRadius: "16px",
        padding: "4px 10px",
        fontSize: "12px",
        fontWeight: "600"
      }}
    >
      {skill}
    </span>
  );
}
