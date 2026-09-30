import React, { useState, useEffect } from "react";
import AIRecommendationCard from "../../components/AIRecommendationCard";
import MatchScore from "../../components/MatchScore";
import Modal from "../../components/Modal";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import { getRecommendations, getJobMatch } from "../../services/recommendationService";
import { analyzeJobWithAI } from "../../services/aiService";
import { FaRobot, FaCheckCircle, FaExclamationCircle, FaBookOpen, FaBriefcase, FaArrowLeft, FaCheck } from "react-icons/fa";

export default function AIRecommendationsPage({ student, onApplyJob, onSaveJob, appliedJobs = [], savedJobs = [] }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [matchDetails, setMatchDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [loadingAiAnalysis, setLoadingAiAnalysis] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecommendations(15);
      const recs = (data?.recommendations || []).map((r) => ({
        id: r.job_id,
        job_id: r.job_id,
        role: r.title,
        title: r.title,
        company: r.company,
        company_name: r.company,
        location: r.location,
        type: r.employment_type || "Full Time",
        package: r.salary_range || "Competitive",
        match: r.match_score,
        match_score: r.match_score,
        match_level: r.match_level,
        matchedSkills: r.matched_skills || [],
        missingSkills: r.missing_skills || [],
        whyRecommended: r.reasons?.[0] || "High alignment based on deterministic profile & skill matching.",
        reasons: r.reasons || []
      }));
      setRecommendations(recs);
    } catch (err) {
      setError("Unable to load recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [student]);

  const handleViewDetails = async (job) => {
    setSelectedJob(job);
    try {
      setLoadingDetails(true);
      const jobId = job.job_id || job.id;
      const matchData = await getJobMatch(jobId);

      setMatchDetails({
        overallMatch: matchData.match_score,
        matchLevel: matchData.match_level,
        breakdown: {
          skillMatch: matchData.score_breakdown?.skill_match ? Math.round((matchData.score_breakdown.skill_match / 50) * 100) : 0,
          eligibilityMatch: matchData.score_breakdown?.eligibility ? Math.round((matchData.score_breakdown.eligibility / 15) * 100) : 0,
          educationMatch: matchData.score_breakdown?.education ? Math.round((matchData.score_breakdown.education / 10) * 100) : 0,
          resumeAlignment: matchData.score_breakdown?.resume_alignment ? Math.round((matchData.score_breakdown.resume_alignment / 15) * 100) : 0,
          profileCompleteness: matchData.score_breakdown?.profile_completeness ? Math.round((matchData.score_breakdown.profile_completeness / 10) * 100) : 0
        },
        whyMatches: matchData.reasons || [],
        missingSkills: matchData.missing_skills || [],
        improvementSuggestions: matchData.improvement_suggestions || [],
        recommendedLearning: (matchData.missing_skills || []).map((sk) => ({
          title: `Learn ${sk}`,
          duration: "Priority Gap"
        }))
      });
    } catch (e) {
      setMatchDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const avgMatch = recommendations.length
    ? Math.round(recommendations.reduce((acc, r) => acc + (r.match || 0), 0) / recommendations.length)
    : 0;

  const totalMatchedSkills = recommendations.reduce((acc, r) => acc + (r.matchedSkills?.length || 0), 0);
  const totalSkillGaps = recommendations.reduce((acc, r) => acc + (r.missingSkills?.length || 0), 0);

  if (loading) return <LoadingSpinner message="Analyzing available jobs..." size={32} />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Title & Subtitle */}
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
          <FaRobot style={{ color: "var(--primary, #2563eb)" }} /> AI Job Recommendations
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" }}>
          Deterministic job recommendations and match score breakdown based on your active student profile, skills, projects, and resume.
        </p>
      </div>

      {/* Recommendation Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div style={{ background: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Recommended Jobs</div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--primary, #2563eb)", marginTop: "4px" }}>{recommendations.length}</div>
        </div>

        <div style={{ background: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Average Match Score</div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#10b981", marginTop: "4px" }}>{avgMatch}%</div>
        </div>

        <div style={{ background: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Skills Matched</div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#059669", marginTop: "4px" }}>{totalMatchedSkills}</div>
        </div>

        <div style={{ background: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Skill Gaps</div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#d97706", marginTop: "4px" }}>{totalSkillGaps}</div>
        </div>
      </div>

      {/* Recommended Jobs Grid */}
      {recommendations.length === 0 ? (
        <EmptyState
          icon="ai"
          title="No suitable job recommendations are available yet."
          message="Complete your profile, add skills and upload a resume to receive real-time match recommendations."
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
          {recommendations.map((job) => {
            const isApplied = appliedJobs.some((a) => a.company === job.company && a.role === job.role);
            const isSaved = savedJobs.some((s) => s.company === job.company && s.role === job.role);

            return (
              <AIRecommendationCard
                key={job.id || `${job.company}-${job.role}`}
                job={job}
                onViewDetails={handleViewDetails}
                onApply={onApplyJob}
                onSave={onSaveJob}
                isApplied={isApplied}
                isSaved={isSaved}
              />
            );
          })}
        </div>
      )}

      {/* AI Match Details Modal */}
      <Modal
        isOpen={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        title={selectedJob ? `${selectedJob.role} — Match Details` : "Job Match Breakdown"}
        subtitle={selectedJob ? selectedJob.company : ""}
        maxWidth="720px"
      >
        {loadingDetails ? (
          <LoadingSpinner message="Calculating deterministic job match metrics..." />
        ) : matchDetails ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Overall Score Banner */}
            <div style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", padding: "20px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #bfdbfe" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e40af", textTransform: "uppercase" }}>Overall AI Job Match ({matchDetails.matchLevel})</span>
                <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#1e3a8a", margin: "2px 0 0 0" }}>{matchDetails.overallMatch}% Match Score</h3>
                <p style={{ fontSize: "13px", color: "#3b82f6", margin: "4px 0 0 0" }}>Calculated deterministically using profile, skills, education, and resume data</p>
              </div>
              <MatchScore score={matchDetails.overallMatch} size="large" />
            </div>

            {/* Breakdown Bars */}
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", marginBottom: "12px" }}>Score Component Breakdown</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                {Object.entries(matchDetails.breakdown).map(([key, val]) => (
                  <div key={key} style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600", color: "#334155" }}>
                      <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</span>
                      <span style={{ color: "var(--primary, #2563eb)", fontWeight: "700" }}>{val}%</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "#e2e8f0", borderRadius: "4px", marginTop: "8px", overflow: "hidden" }}>
                      <div style={{ width: `${val}%`, height: "100%", background: "var(--primary, #2563eb)", borderRadius: "4px" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why this job matches you */}
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FaCheckCircle style={{ color: "#10b981" }} /> Match Reasons
              </h4>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13.5px", color: "#334155", lineHeight: "1.7" }}>
                {matchDetails.whyMatches.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>

            {/* Missing Skills */}
            {matchDetails.missingSkills.length > 0 && (
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaExclamationCircle style={{ color: "#ef4444" }} /> Missing Skills
                </h4>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {matchDetails.missingSkills.map((sk) => (
                    <span key={sk} style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Improvement Suggestions */}
            {matchDetails.improvementSuggestions.length > 0 && (
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaBookOpen style={{ color: "var(--primary, #2563eb)" }} /> Improvement Suggestions
                </h4>
                <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13.5px", color: "#334155", lineHeight: "1.7" }}>
                  {matchDetails.improvementSuggestions.map((sug, idx) => (
                    <li key={idx}>{sug}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Explanation Box if requested */}
            {aiAnalysisResult && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "16px", borderRadius: "12px", marginTop: "12px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#166534", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaRobot style={{ color: "#15803d" }} /> Grounded AI Analysis (RAG + Ollama)
                </h4>
                <p style={{ fontSize: "13.5px", color: "#14532d", margin: 0, lineHeight: "1.6", whitespace: "pre-wrap" }}>
                  {aiAnalysisResult.answer}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "16px", borderTop: "1px solid #e2e8f0", flexWrap: "wrap" }}>
              <button
                className="secondary-button"
                type="button"
                disabled={loadingAiAnalysis}
                onClick={async () => {
                  setLoadingAiAnalysis(true);
                  try {
                    const res = await analyzeJobWithAI(selectedJob.job_id || selectedJob.id);
                    setAiAnalysisResult(res);
                  } catch (err) {
                    setAiAnalysisResult({ answer: "Unable to retrieve AI analysis at this time." });
                  } finally {
                    setLoadingAiAnalysis(false);
                  }
                }}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "#e0e7ff", color: "#3730a3", border: "1px solid #c7d2fe" }}
              >
                <FaRobot /> {loadingAiAnalysis ? "Analyzing..." : "Ask AI About This Job"}
              </button>
              <button className="secondary-button" onClick={() => { setSelectedJob(null); setAiAnalysisResult(null); }}>Back</button>
              <button className="icon-button" style={{ padding: "8px 14px" }} onClick={() => onSaveJob && onSaveJob(selectedJob)}>Save Job</button>
              <button className="primary-button" onClick={() => { onApplyJob && onApplyJob(selectedJob); setSelectedJob(null); setAiAnalysisResult(null); }}>Apply Now</button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

