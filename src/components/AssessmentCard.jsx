import React from "react";
import StatusBadge from "./StatusBadge";
import { FaClock, FaQuestionCircle, FaClipboardList, FaPlay, FaCheckCircle } from "react-icons/fa";

export default function AssessmentCard({ assessment, onStart, onViewResult }) {
  const {
    title = "Python & SQL Technical Assessment",
    role = "Python Developer",
    durationMinutes = 20,
    totalQuestions = 5,
    status = "Available",
    resultScore = null
  } = assessment;

  const isCompleted = status === "Completed" || resultScore !== null;

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div>
          <span style={{ fontSize: "12px", color: "var(--primary, #2563eb)", fontWeight: "700", textTransform: "uppercase" }}>
            {role}
          </span>
          <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#0f172a", margin: "4px 0 0 0" }}>{title}</h3>
        </div>
        <StatusBadge status={status} />
      </div>

      <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#64748b" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <FaQuestionCircle /> {totalQuestions} Questions
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <FaClock /> {durationMinutes} Minutes
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
        {isCompleted ? (
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#059669", display: "flex", alignItems: "center", gap: "6px" }}>
            <FaCheckCircle /> Score: {resultScore !== null ? `${resultScore}%` : "Passed"}
          </div>
        ) : (
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Ready for test attempt</span>
        )}

        {isCompleted ? (
          <button
            type="button"
            className="secondary-button"
            style={{ padding: "8px 16px", fontSize: "13px" }}
            onClick={() => onViewResult && onViewResult(assessment)}
          >
            <FaClipboardList /> View Result
          </button>
        ) : (
          <button
            type="button"
            className="primary-button"
            style={{ padding: "8px 16px", fontSize: "13px" }}
            onClick={() => onStart && onStart(assessment)}
          >
            <FaPlay style={{ fontSize: "11px" }} /> Start Assessment
          </button>
        )}
      </div>
    </div>
  );
}
