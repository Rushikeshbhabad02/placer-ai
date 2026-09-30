import React, { useState, useEffect, useRef } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaLightbulb,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaInfoCircle,
  FaUser,
  FaBookmark
} from "react-icons/fa";
import { askAI, getAIHealth } from "../../services/aiService";

const starterQuestions = [
  "Why am I not a strong match for this job?",
  "What skills am I missing for backend developer roles?",
  "How can I improve my profile for Python jobs?",
  "Explain my ATS score result.",
  "Which jobs match my profile best?"
];

function AIAssistantPage({ student }) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your PLACER-AI Career Assistant. Ask me anything about your job matches, skill gaps, or ATS score explanations.",
      sources: [],
      grounded: true
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState({ available: false, model: "llama3.2", message: "Checking status..." });
  const chatEndRef = useRef(null);

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const checkHealth = async () => {
    const health = await getAIHealth();
    setAiStatus(health);
  };

  const handleSend = async (questionText) => {
    const query = (questionText || inputQuestion).trim();
    if (!query || loading) return;

    const userMsg = { sender: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInputQuestion("");
    setLoading(true);

    try {
      const res = await askAI(query);
      const aiMsg = {
        sender: "ai",
        text: res.answer || "No response received.",
        sources: res.sources || [],
        grounded: res.grounded !== false,
        aiAvailable: res.ai_available !== false
      };
      setMessages((prev) => [...prev, aiMsg]);
      if (res.ai_available !== undefined) {
        setAiStatus((prev) => ({ ...prev, available: res.ai_available }));
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Local AI service is currently unavailable. Please start Ollama and try again.",
          sources: [],
          grounded: false,
          aiAvailable: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content ai-assistant-page">
      {/* Page Header */}
      <div className="section-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0, color: "#1e293b" }}>
            <FaRobot style={{ color: "#4f46e5" }} /> PLACER-AI Career Assistant
          </h2>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
            Contextual local RAG AI grounded strictly in your profile and platform data.
          </p>
        </div>

        {/* AI Health Status Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", backgroundColor: aiStatus.available ? "#ecfdf5" : "#fef2f2", color: aiStatus.available ? "#047857" : "#b91c1c", border: `1px solid ${aiStatus.available ? "#a7f3d0" : "#fecaca"}` }}>
          {aiStatus.available ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span>{aiStatus.available ? `Ollama Ready (${aiStatus.model})` : "Ollama Offline"}</span>
        </div>
      </div>

      {/* Main Chat Container */}
      <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", height: "550px", overflow: "hidden" }}>
        
        {/* Messages View */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", background: "#f8fafc" }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ alignSelf: msg.sender === "user" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", fontSize: "12px", color: "#64748b", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                {msg.sender === "user" ? <FaUser /> : <FaRobot style={{ color: "#4f46e5" }} />}
                <span>{msg.sender === "user" ? "You" : "PLACER-AI Assistant"}</span>
              </div>
              <div style={{ padding: "14px 18px", borderRadius: msg.sender === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px", backgroundColor: msg.sender === "user" ? "#4f46e5" : "#ffffff", color: msg.sender === "user" ? "#ffffff" : "#1e293b", border: msg.sender === "user" ? "none" : "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", fontSize: "14px", lineHeight: "1.6", whitespace: "pre-wrap" }}>
                {msg.text}
              </div>

              {/* Source Badges */}
              {msg.sources && msg.sources.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Sources:</span>
                  {msg.sources.map((src, sIdx) => (
                    <span key={sIdx} style={{ fontSize: "11px", background: "#e0e7ff", color: "#3730a3", padding: "2px 8px", borderRadius: "10px", fontWeight: "500" }}>
                      {src.type === "job" ? `Job #${src.job_id}: ${src.title}` : src.type === "student_profile" ? `Profile (${src.section})` : src.type === "ats" ? `ATS Resume #${src.resume_id}` : src.type}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "12px", background: "#ffffff", border: "1px solid #e2e8f0", color: "#64748b", fontSize: "13px" }}>
              <FaSpinner className="fa-spin" style={{ color: "#4f46e5" }} />
              <span>AI is analyzing your profile and relevant job information...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Starter Suggestions */}
        <div style={{ padding: "10px 16px", background: "#ffffff", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "8px", overflowX: "auto" }}>
          <FaLightbulb style={{ color: "#f59e0b", flexShrink: 0 }} />
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", flexShrink: 0 }}>Try asking:</span>
          {starterQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              disabled={loading}
              style={{ padding: "4px 10px", borderRadius: "14px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#334155", fontSize: "12px", cursor: "pointer", whitespace: "nowrap", transition: "all 0.2s" }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <div style={{ padding: "14px 16px", background: "#ffffff", borderTop: "1px solid #e2e8f0", display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question about your match, skills, or job profile..."
            disabled={loading}
            style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none" }}
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading || !inputQuestion.trim()}
            style={{ padding: "10px 18px", borderRadius: "8px", border: "none", background: "#4f46e5", color: "#ffffff", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", opacity: loading || !inputQuestion.trim() ? 0.6 : 1 }}
          >
            <FaPaperPlane /> Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIAssistantPage;
