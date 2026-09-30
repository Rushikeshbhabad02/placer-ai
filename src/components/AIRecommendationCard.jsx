import React from "react";
import MatchScore from "./MatchScore";
import SkillBadge from "./SkillBadge";
import { FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaClock, FaLightbulb, FaCheck, FaBookmark } from "react-icons/fa";

export default function AIRecommendationCard({
  job,
  onViewDetails,
  onApply,
  onSave,
  isApplied = false,
  isSaved = false
}) {
  const {
    role = "Software Engineer",
    company = "Tech Corp",
    location = "Pune, India",
    type = "Full Time",
    experience = "Fresher",
    package: salary = "₹4–7 LPA",
    match = 90,
    matchedSkills = ["Python", "SQL", "React"],
    missingSkills = ["Docker"],
    whyRecommended = "Your technical skills closely match the core position criteria.",
    postedDate = "2 days ago",
    logo
  } = job;

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        position: "relative",
        overflow: "hidden"
      }}
      className="job-recommendation-card"
    >
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          {logo ? (
            <img
              src={logo}
              alt={company}
              style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover", border: "1px solid #e2e8f0" }}
            />
          ) : (
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "var(--primary, #2563eb)",
                color: "#fff",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px"
              }}
            >
              {company.charAt(0)}
            </div>
          )}
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{role}</h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "2px 0 0 0", fontWeight: "500" }}>{company}</p>
          </div>
        </div>
        <MatchScore score={match} size="medium" />
      </div>

      {/* Meta tags */}
      <div style={{ display: "flex", wrap: "wrap", gap: "16px", fontSize: "13px", color: "#475569" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <FaMapMarkerAlt style={{ color: "#94a3b8" }} /> {location}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <FaBriefcase style={{ color: "#94a3b8" }} /> {type} • {experience}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: "600", color: "#16a34a" }}>
          <FaMoneyBillWave /> {salary}
        </span>
      </div>

      {/* Why Recommended box */}
      <div
        style={{
          background: "#f8fafc",
          borderRadius: "12px",
          padding: "12px 14px",
          border: "1px solid #f1f5f9",
          fontSize: "13px",
          color: "#334155",
          lineHeight: "1.4"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", color: "var(--primary, #2563eb)", marginBottom: "4px" }}>
          <FaLightbulb /> Why recommended:
        </div>
        <p style={{ margin: 0 }}>"{whyRecommended}"</p>
      </div>

      {/* Skills Matched & Missing */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {matchedSkills.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", width: "95px" }}>Matched:</span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {matchedSkills.map((sk) => (
                <SkillBadge key={sk} skill={sk} status="matched" />
              ))}
            </div>
          </div>
        )}

        {missingSkills.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", width: "95px" }}>Missing:</span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {missingSkills.map((sk) => (
                <SkillBadge key={sk} skill={sk} status="missing" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer & Action Buttons */}
      <div
        style={{
          display: "flex",
          justify: "space-between",
          alignItems: "center",
          paddingTop: "12px",
          borderTop: "1px solid #f1f5f9",
          marginTop: "4px"
        }}
      >
        <span style={{ fontSize: "12px", color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <FaClock /> Posted {postedDate}
        </span>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="secondary-button"
            style={{ padding: "8px 14px", fontSize: "13px" }}
            onClick={() => onViewDetails && onViewDetails(job)}
          >
            View Details
          </button>
          <button
            type="button"
            className="icon-button"
            style={{ padding: "8px 12px", fontSize: "13px", background: isSaved ? "#fef3c7" : "#f1f5f9", color: isSaved ? "#d97706" : "#64748b", border: "none", borderRadius: "8px", cursor: "pointer" }}
            onClick={() => onSave && onSave(job)}
            title={isSaved ? "Saved" : "Save Job"}
          >
            <FaBookmark />
          </button>
          <button
            type="button"
            className="primary-button"
            style={{ padding: "8px 16px", fontSize: "13px" }}
            disabled={isApplied}
            onClick={() => onApply && onApply(job)}
          >
            {isApplied ? <><FaCheck /> Applied</> : "Apply Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
