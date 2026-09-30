import React, { useState, useEffect } from "react";
import SkillBadge from "../../components/SkillBadge";
import { SkillGapCard, ProgressBar } from "../../components/SkillGapCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import { getRoleSkillGap } from "../../services/skillGapService";
import { FaChartLine, FaCheckCircle, FaExclamationCircle, FaBookOpen, FaBriefcase, FaGraduationCap } from "react-icons/fa";

const SUPPORTED_ROLES = [
  "Python Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "Frontend Developer",
  "Backend Developer",
  "AI/ML Developer",
  "Cloud/DevOps"
];

export default function SkillGapPage({ student }) {
  const [selectedRole, setSelectedRole] = useState("Python Full Stack Developer");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadGapData = async (role = selectedRole) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRoleSkillGap(role);
      setData(res);
    } catch (e) {
      setError("Unable to load skill gap analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGapData(selectedRole);
  }, [student, selectedRole]);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
  };

  if (loading) return <LoadingSpinner message="Analyzing your skill profile against market demands..." size={32} />;
  if (error) return <ErrorState message={error} onRetry={() => loadGapData(selectedRole)} />;
  if (!data) return null;

  const coveragePct = data.coverage_percentage || 0;
  const matchedSkills = data.matched_skills || [];
  const missingSkills = data.missing_skills || [];
  const totalTargetCount = data.total_target_skill_count || 0;
  const roadmap = data.learning_roadmap || [];
  const gaps = data.gaps || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header & Role Selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <FaChartLine style={{ color: "var(--primary, #2563eb)" }} /> Skill Gap Analysis & Learning Roadmap
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" }}>
            Deterministic skill comparison based on your active student profile, projects, and resume data.
          </p>
        </div>

        {/* Target Role Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff", padding: "8px 14px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
          <FaBriefcase style={{ color: "var(--primary, #2563eb)", fontSize: "14px" }} />
          <label htmlFor="target-role-select" style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>Target Domain:</label>
          <select
            id="target-role-select"
            value={selectedRole}
            onChange={handleRoleChange}
            style={{
              fontSize: "13.5px",
              fontWeight: "600",
              color: "#0f172a",
              border: "none",
              background: "transparent",
              outline: "none",
              cursor: "pointer"
            }}
          >
            {SUPPORTED_ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Readiness Score Banner */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
              Target Role: {data.target_role}
            </span>
            <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "2px 0 0 0" }}>
              {matchedSkills.length} of {totalTargetCount} Target Skills Matched
            </h3>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: coveragePct >= 70 ? "#10b981" : "#d97706" }}>
            {coveragePct}% Skill Coverage
          </div>
        </div>
        <ProgressBar progress={coveragePct} color={coveragePct >= 70 ? "#10b981" : "#2563eb"} height={12} />
      </div>

      {/* Skills Matrix Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        {/* Matched Skills */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <FaCheckCircle style={{ color: "#10b981" }} /> Matched Skills ({matchedSkills.length})
          </h3>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Skills detected from your profile, projects, and active resume.</p>
          {matchedSkills.length === 0 ? (
            <span style={{ fontSize: "13px", color: "#94a3b8", italic: "true" }}>No skills matched yet. Add your technical skills in your profile.</span>
          ) : (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {matchedSkills.map((sk) => (
                <SkillBadge key={sk} skill={sk} status="matched" />
              ))}
            </div>
          )}
        </div>

        {/* Missing Skills with Priorities */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <FaExclamationCircle style={{ color: "#ef4444" }} /> Missing Skills ({missingSkills.length})
          </h3>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Competencies required for '{data.target_role}' missing from your active profile.</p>
          {missingSkills.length === 0 ? (
            <span style={{ fontSize: "13px", color: "#10b981", fontWeight: "600" }}>Great job! You have full skill coverage for this target domain.</span>
          ) : (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {gaps.map((g) => (
                <span
                  key={g.skill}
                  style={{
                    background: g.priority === "high" ? "#fef2f2" : "#fffbe6",
                    color: g.priority === "high" ? "#b91c1c" : "#b45309",
                    border: `1px solid ${g.priority === "high" ? "#fecaca" : "#fef08a"}`,
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  {g.skill} <small style={{ opacity: 0.85 }}>({g.priority.toUpperCase()})</small>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Learning Roadmap Section */}
      <div>
        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <FaBookOpen style={{ color: "var(--primary, #2563eb)" }} /> Personalized Learning Roadmap
        </h3>
        {roadmap.length === 0 ? (
          <EmptyState
            icon="ai"
            title="No Skill Gaps Found"
            message="Your profile meets all standard skill requirements for this target domain."
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
            {roadmap.map((step) => (
              <div
                key={step.order}
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  padding: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                  position: "relative"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: "6px" }}>
                    STEP {step.order}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      color: step.priority === "high" ? "#dc2626" : step.priority === "medium" ? "#d97706" : "#64748b",
                      background: step.priority === "high" ? "#fef2f2" : step.priority === "medium" ? "#fffbe6" : "#f1f5f9",
                      padding: "2px 8px",
                      borderRadius: "6px"
                    }}
                  >
                    {step.priority} Priority
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: "15.5px", fontWeight: "700", color: "#0f172a", margin: "2px 0 0 0" }}>
                    {step.topic}
                  </h4>
                  <p style={{ fontSize: "12.5px", color: "#64748b", margin: "4px 0 0 0" }}>
                    Skill: <strong style={{ color: "#334155" }}>{step.skill}</strong>
                  </p>
                </div>

                <div style={{ fontSize: "12.5px", color: "#475569", background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                  <strong>Reason:</strong> {step.reason}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
