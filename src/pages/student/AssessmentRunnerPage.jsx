import React, { useState, useEffect } from "react";
import AssessmentCard from "../../components/AssessmentCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import { getAssessments, submitAssessmentResult } from "../../services/aiService";
import { FaClipboardList, FaClock, FaCheckCircle, FaTimesCircle, FaPlay, FaArrowLeft, FaCheck } from "react-icons/fa";

export default function AssessmentRunnerPage({ student, pushNotification }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [instructionsAccepted, setInstructionsAccepted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const list = await getAssessments();
        setAssessments(list);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Timer countdown hook during test
  useEffect(() => {
    if (!instructionsAccepted || !activeAssessment || result) return;
    if (timeLeft <= 0) {
      handleSubmitTest();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [instructionsAccepted, activeAssessment, timeLeft, result]);

  const handleStartAssessment = (assessment) => {
    setActiveAssessment(assessment);
    setInstructionsAccepted(false);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeft(assessment.durationMinutes * 60);
    setResult(null);
  };

  const handleOptionSelect = (qId, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitTest = async () => {
    if (!activeAssessment) return;
    setShowConfirmModal(false);

    let correctCount = 0;
    activeAssessment.questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const total = activeAssessment.questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    const wrongCount = total - correctCount;
    const timeSpentSeconds = activeAssessment.durationMinutes * 60 - timeLeft;

    const resObj = {
      assessmentId: activeAssessment.id,
      title: activeAssessment.title,
      score: percentage,
      correctCount,
      wrongCount,
      total,
      timeSpent: `${Math.floor(timeSpentSeconds / 60)}m ${timeSpentSeconds % 60}s`,
      performance: percentage >= 75 ? "Excellent" : percentage >= 50 ? "Good" : "Needs Improvement"
    };

    setResult(resObj);
    await submitAssessmentResult(resObj);
    if (pushNotification) pushNotification(`Assessment completed! Score: ${percentage}%`);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) return <LoadingSpinner message="Fetching placement technical assessments..." />;

  // 1. Result View Page
  if (result) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <button
          className="secondary-button"
          onClick={() => { setActiveAssessment(null); setResult(null); }}
          style={{ width: "fit-content", display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          <FaArrowLeft /> Back to Assessments
        </button>

        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "16px" }}>
            <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "700", textTransform: "uppercase" }}>Test Completed</span>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "4px 0 0 0" }}>{result.title} — Results</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
            <div style={{ background: "#eff6ff", padding: "16px", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
              <span style={{ fontSize: "12px", color: "#1e40af", fontWeight: "700" }}>Final Score</span>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#1e3a8a", marginTop: "4px" }}>{result.score}%</div>
            </div>

            <div style={{ background: "#ecfdf5", padding: "16px", borderRadius: "12px", border: "1px solid #a7f3d0" }}>
              <span style={{ fontSize: "12px", color: "#047857", fontWeight: "700" }}>Correct Answers</span>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#065f46", marginTop: "4px" }}>{result.correctCount} / {result.total}</div>
            </div>

            <div style={{ background: "#fef2f2", padding: "16px", borderRadius: "12px", border: "1px solid #fecaca" }}>
              <span style={{ fontSize: "12px", color: "#b91c1c", fontWeight: "700" }}>Wrong / Skipped</span>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#991b1b", marginTop: "4px" }}>{result.wrongCount}</div>
            </div>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Time Taken</span>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginTop: "6px" }}>{result.timeSpent}</div>
            </div>
          </div>

          <div style={{ padding: "16px", borderRadius: "12px", background: result.score >= 75 ? "#ecfdf5" : "#fffbeb", border: `1px solid ${result.score >= 75 ? "#a7f3d0" : "#fde68a"}` }}>
            <h4 style={{ margin: 0, fontSize: "15px", color: result.score >= 75 ? "#047857" : "#b45309" }}>
              Performance Rating: {result.performance}
            </h4>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#334155" }}>
              {result.score >= 75
                ? "Great job! You have passed the benchmark required for recruiter recommendation."
                : "You may want to revise core topics and attempt practice quizzes before formal client drives."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Interactive MCQ Test Runner Page
  if (activeAssessment && instructionsAccepted) {
    const q = activeAssessment.questions[currentQuestionIndex];
    const totalQ = activeAssessment.questions.length;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Test Top Bar */}
        <div style={{ background: "#fff", padding: "16px 24px", borderRadius: "14px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>{activeAssessment.title}</h3>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Question {currentQuestionIndex + 1} of {totalQ}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fef3c7", padding: "8px 14px", borderRadius: "20px", color: "#b45309", fontWeight: "700", fontSize: "14px" }}>
            <FaClock /> {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question & Options Box */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <h4 style={{ fontSize: "17px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{q.question}</h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {q.options.map((option, idx) => {
              const isSelected = answers[q.id] === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleOptionSelect(q.id, idx)}
                  style={{
                    padding: "14px 18px",
                    borderRadius: "10px",
                    border: `1.5px solid ${isSelected ? "var(--primary, #2563eb)" : "#cbd5e1"}`,
                    background: isSelected ? "#eff6ff" : "#fff",
                    color: isSelected ? "#1e40af" : "#0f172a",
                    fontWeight: isSelected ? "600" : "500",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}
                >
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: `2px solid ${isSelected ? "var(--primary)" : "#cbd5e1"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>
                    {isSelected ? <FaCheck style={{ color: "var(--primary)" }} /> : String.fromCharCode(65 + idx)}
                  </div>
                  {option}
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
            <button
              className="secondary-button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            >
              Previous
            </button>

            <div style={{ display: "flex", gap: "6px" }}>
              {activeAssessment.questions.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    background: currentQuestionIndex === idx ? "var(--primary)" : answers[activeAssessment.questions[idx].id] !== undefined ? "#dbeafe" : "#f1f5f9",
                    color: currentQuestionIndex === idx ? "#fff" : "#334155",
                    fontSize: "12px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                >
                  {idx + 1}
                </div>
              ))}
            </div>

            {currentQuestionIndex === totalQ - 1 ? (
              <button className="primary-button" onClick={() => setShowConfirmModal(true)}>
                Submit Test
              </button>
            ) : (
              <button className="primary-button" onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}>
                Next
              </button>
            )}
          </div>
        </div>

        {/* Submit Confirmation Dialog Modal */}
        <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Submit Assessment?" maxWidth="480px">
          <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 20px 0" }}>
            You have answered {Object.keys(answers).length} of {totalQ} questions. Are you sure you want to finish and submit?
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button className="secondary-button" onClick={() => setShowConfirmModal(false)}>Cancel</button>
            <button className="primary-button" onClick={handleSubmitTest}>Yes, Submit Now</button>
          </div>
        </Modal>
      </div>
    );
  }

  // 3. Instructions Screen
  if (activeAssessment && !instructionsAccepted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <button className="secondary-button" onClick={() => setActiveAssessment(null)} style={{ width: "fit-content", display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <FaArrowLeft /> Back to List
        </button>

        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "28px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
            Instructions for {activeAssessment.title}
          </h2>

          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", fontSize: "13.5px", color: "#334155", lineHeight: "1.6" }}>
            <p style={{ margin: "0 0 8px 0" }}>• Total Time Limit: <strong>{activeAssessment.durationMinutes} minutes</strong></p>
            <p style={{ margin: "0 0 8px 0" }}>• Total Questions: <strong>{activeAssessment.questions.length} MCQs</strong></p>
            <p style={{ margin: "0 0 8px 0" }}>• Passing Benchmark: <strong>{activeAssessment.passScore}%</strong></p>
            <p style={{ margin: 0 }}>• Do not refresh or close the browser tab during the test execution.</p>
          </div>

          <button className="primary-button" style={{ width: "fit-content", padding: "12px 24px", fontSize: "15px" }} onClick={() => setInstructionsAccepted(true)}>
            <FaPlay style={{ fontSize: "12px" }} /> Start Assessment Now
          </button>
        </div>
      </div>
    );
  }

  // 4. Assessments List Default Screen
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
          <FaClipboardList style={{ color: "var(--primary, #2563eb)" }} /> Technical & Aptitude Assessments
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" }}>
          Complete verified skill evaluation tests assigned by recruiters and admins.
        </p>
      </div>

      {assessments.length === 0 ? (
        <EmptyState icon="inbox" title="No assessments available" message="You're all caught up! Check back later for upcoming tests." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {assessments.map((ass) => (
            <AssessmentCard key={ass.id} assessment={ass} onStart={handleStartAssessment} />
          ))}
        </div>
      )}
    </div>
  );
}
