import React, { useState, useEffect } from "react";
import InterviewCard from "../../components/InterviewCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import { getInterviews } from "../../services/aiService";
import { FaCalendarCheck, FaBuilding, FaVideo, FaInfoCircle } from "react-icons/fa";

export default function InterviewsSection({ pushNotification }) {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const list = await getInterviews();
        setInterviews(list);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading upcoming interview schedules..." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
          <FaCalendarCheck style={{ color: "var(--primary, #2563eb)" }} /> Interview Schedules
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" }}>
          Track and join your upcoming technical and HR interview rounds.
        </p>
      </div>

      {interviews.length === 0 ? (
        <EmptyState icon="calendar" title="No upcoming interviews" message="When recruiters shortlist your profile for interviews, your schedules will appear here." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {interviews.map((item) => (
            <InterviewCard key={item.id} interview={item} onViewDetails={setSelectedInterview} />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={Boolean(selectedInterview)}
        onClose={() => setSelectedInterview(null)}
        title={selectedInterview ? `${selectedInterview.role} — ${selectedInterview.company}` : ""}
        subtitle="Interview Round Details"
        maxWidth="600px"
      >
        {selectedInterview && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Date & Time</span>
                <div style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a", marginTop: "2px" }}>
                  {selectedInterview.date} at {selectedInterview.time}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Round Type</span>
                <div style={{ fontWeight: "700", fontSize: "14px", color: "#0f172a", marginTop: "2px" }}>
                  {selectedInterview.type}
                </div>
              </div>
            </div>

            {selectedInterview.notes && (
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>Recruiter Notes & Instructions</h4>
                <p style={{ fontSize: "13.5px", color: "#334155", background: "#fff", border: "1px solid #e2e8f0", padding: "12px", borderRadius: "8px", margin: 0, lineHeight: "1.5" }}>
                  {selectedInterview.notes}
                </p>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "12px" }}>
              <button className="secondary-button" onClick={() => setSelectedInterview(null)}>Close</button>
              {selectedInterview.meetingLink && (
                <a
                  href={selectedInterview.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-button"
                  style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <FaVideo /> Join Interview Room
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
