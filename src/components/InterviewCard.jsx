import React from "react";
import StatusBadge from "./StatusBadge";
import { FaCalendarAlt, FaClock, FaVideo, FaBuilding, FaBriefcase, FaInfoCircle } from "react-icons/fa";

export default function InterviewCard({ interview, onViewDetails }) {
  const {
    company = "Infosys Limited",
    companyLogo,
    role = "Software Engineer Trainee",
    date = "2026-10-05",
    time = "10:30 AM",
    type = "Technical Interview",
    status = "Scheduled",
    meetingLink = "https://meet.google.com/abc-defg-hij"
  } = interview;

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {companyLogo ? (
            <img src={companyLogo} alt={company} style={{ width: "42px", height: "42px", borderRadius: "10px", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "var(--primary, #2563eb)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
              <FaBuilding />
            </div>
          )}
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{role}</h3>
            <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>{company}</span>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", background: "#f8fafc", padding: "12px 16px", borderRadius: "12px" }}>
        <div style={{ fontSize: "13px", color: "#334155" }}>
          <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" }}>Date</div>
          <div style={{ fontWeight: "600", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
            <FaCalendarAlt style={{ color: "var(--primary)" }} /> {date}
          </div>
        </div>

        <div style={{ fontSize: "13px", color: "#334155" }}>
          <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" }}>Time</div>
          <div style={{ fontWeight: "600", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
            <FaClock style={{ color: "var(--primary)" }} /> {time}
          </div>
        </div>

        <div style={{ fontSize: "13px", color: "#334155" }}>
          <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" }}>Type</div>
          <div style={{ fontWeight: "600", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
            <FaBriefcase style={{ color: "var(--primary)" }} /> {type}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px" }}>
        {meetingLink ? (
          <a
            href={meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="primary-button"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", fontSize: "13px" }}
          >
            <FaVideo /> Join Meeting
          </a>
        ) : (
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Link pending recruiter release</span>
        )}

        <button
          type="button"
          className="secondary-button"
          style={{ padding: "8px 14px", fontSize: "13px" }}
          onClick={() => onViewDetails && onViewDetails(interview)}
        >
          <FaInfoCircle /> Details
        </button>
      </div>
    </div>
  );
}
