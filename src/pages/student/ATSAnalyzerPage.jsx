import React, { useState, useRef } from "react";
import LoadingButton from "../../components/LoadingButton";
import SkillBadge from "../../components/SkillBadge";
import { uploadResume, analyzeResume } from "../../services/resumeService";
import { FaCloudUploadAlt, FaFileAlt, FaCheckCircle, FaExclamationTriangle, FaDownload, FaRedo, FaRobot, FaTimesCircle } from "react-icons/fa";

export default function ATSAnalyzerPage({ student, pushNotification }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState(
    "We are seeking a Python Developer with expertise in Django, SQL, and REST APIs. Experience with Docker, AWS, and Git is preferred. Freshers with strong project backgrounds are welcome."
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext)) {
      if (pushNotification) pushNotification("Invalid file type. Please upload PDF, DOC, or DOCX.");
      return;
    }
    setResumeFile(file);
    if (pushNotification) pushNotification(`Resume "${file.name}" ready for ATS scanning.`);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      let targetResumeId = null;

      if (resumeFile) {
        const uploaded = await uploadResume(resumeFile);
        targetResumeId = uploaded.id;
      }

      if (!targetResumeId) {
        if (pushNotification) pushNotification("Please select or upload a PDF/DOCX resume file first.");
        setAnalyzing(false);
        return;
      }

      const res = await analyzeResume(targetResumeId);

      const mappedResult = {
        atsScore: res.ats_score,
        breakdown: {
          keywordMatch: res.keyword_match_percentage,
          contactInfo: res.contact_info_detected?.email ? 100 : 50,
          formatting: res.word_count >= 150 ? 90 : 60,
          sections: Math.min(100, (res.sections_detected?.length || 0) * 20)
        },
        matchedKeywords: (res.matching_keywords && res.matching_keywords.length > 0) ? res.matching_keywords : (res.skills_detected || []),
        missingKeywords: res.missing_keywords || [],
        strengths: (res.recommendations && res.recommendations.length > 0) ? res.recommendations : ["Clean extractable document text", "Structured resume section formatting"],
        improvements: (res.warnings && res.warnings.length > 0) ? res.warnings : ["Ensure all target skill keywords are explicitly listed."]
      };

      setAnalysisResult(mappedResult);
      if (pushNotification) pushNotification("ATS evaluation complete.");
    } catch (e) {
      if (pushNotification) pushNotification(e.message || "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysisResult) return;
    const content = `PLACER-AI ATS Resume Analysis Report\n\nOverall ATS Score: ${analysisResult.atsScore}/100\n\nMatched Keywords:\n${analysisResult.matchedKeywords.join(", ")}\n\nMissing Keywords:\n${analysisResult.missingKeywords.join(", ")}\n\nStrengths:\n${analysisResult.strengths.join("\n")}\n\nImprovements Required:\n${analysisResult.improvements.join("\n")}`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ATS_Report_${student?.name || "Student"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    if (pushNotification) pushNotification("ATS report downloaded.");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Title Header */}
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
          <FaFileAlt style={{ color: "var(--primary, #2563eb)" }} /> AI Resume & ATS Analyzer
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" }}>
          Analyze your resume against a target job description.
        </p>
      </div>

      {/* Input Section Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {/* Resume Upload Box */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>1. Resume Upload</h3>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? "var(--primary, #2563eb)" : "#cbd5e1"}`,
              background: dragOver ? "#eff6ff" : "#f8fafc",
              borderRadius: "12px",
              padding: "30px 20px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <FaCloudUploadAlt style={{ fontSize: "36px", color: "var(--primary, #2563eb)" }} />
            <div>
              <span style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>
                {resumeFile ? resumeFile.name : "Drag & Drop Resume here"}
              </span>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>Supports PDF, DOC, DOCX</p>
            </div>
            <button type="button" className="secondary-button" style={{ padding: "6px 14px", fontSize: "12px", pointerEvents: "none" }}>
              {resumeFile ? "Change File" : "Upload Resume"}
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".pdf,.doc,.docx"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
        </div>

        {/* Job Description Box */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>2. Job Description</h3>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target job description here..."
            rows={5}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              lineHeight: "1.5",
              resize: "vertical",
              outline: "none"
            }}
          />
          <LoadingButton loading={analyzing} loadingText="Scanning ATS vectors..." onClick={handleAnalyze} style={{ width: "100%", padding: "12px" }}>
            <FaRobot /> Analyze Resume
          </LoadingButton>
        </div>
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Header Score Banner */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", background: "#f8fafc", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Overall ATS Compatibility</span>
              <h2 style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", margin: "4px 0 0 0" }}>
                {analysisResult.atsScore} <span style={{ fontSize: "18px", color: "#64748b" }}>/ 100</span>
              </h2>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="secondary-button" onClick={() => setAnalysisResult(null)}>
                <FaRedo /> Analyze Again
              </button>
              <button className="primary-button" onClick={handleDownloadReport}>
                <FaDownload /> Download Report
              </button>
            </div>
          </div>

          {/* Detailed Score Categories */}
          <div>
            <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", marginBottom: "12px" }}>Section Breakdown</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
              {Object.entries(analysisResult.breakdown).map(([cat, score]) => (
                <div key={cat} style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                    {cat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: score >= 80 ? "#10b981" : "#d97706", marginTop: "4px" }}>
                    {score}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FaCheckCircle style={{ color: "#10b981" }} /> Matched Keywords
              </h4>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {analysisResult.matchedKeywords.map((kw) => (
                  <SkillBadge key={kw} skill={kw} status="matched" />
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FaTimesCircle style={{ color: "#ef4444" }} /> Missing Keywords
              </h4>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {analysisResult.missingKeywords.map((kw) => (
                  <SkillBadge key={kw} skill={kw} status="missing" />
                ))}
              </div>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            <div style={{ background: "#ecfdf5", padding: "16px", borderRadius: "12px", border: "1px solid #a7f3d0" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#047857", margin: "0 0 8px 0" }}>Resume Strengths</h4>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "#065f46", lineHeight: "1.6" }}>
                {analysisResult.strengths.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: "#fffbeb", padding: "16px", borderRadius: "12px", border: "1px solid #fde68a" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#b45309", margin: "0 0 8px 0" }}>Improvements Required</h4>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "#92400e", lineHeight: "1.6" }}>
                {analysisResult.improvements.map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
