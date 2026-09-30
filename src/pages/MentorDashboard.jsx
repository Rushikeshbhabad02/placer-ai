import { useState, useEffect } from "react";
import { FaCheckCircle, FaClock, FaFileAlt, FaTimesCircle, FaUserGraduate } from "react-icons/fa";
import { safeGetItem } from "../utils/storage";
import {
  getMentorApprovals,
  approveStudent,
  rejectStudent,
  getMentorDashboardStats
} from "../services/mentorService";
import { getStoredToken } from "../services/authService";
import "./dashboard.css";

const fallbackApplications = [
  { company: "TCS", role: "Frontend Developer", stage: "Mentor Approval", date: "24 Apr", status: "Pending" },
  { company: "Infosys", role: "Software Engineer Trainee", stage: "Technical Interview", date: "26 Apr", status: "Shortlisted" }
];

function MentorDashboard({ user, onLogout }) {
  const [applications, setApplications] = useState(
    () => safeGetItem("placer_applications", null) || fallbackApplications
  );
  const [dbStats, setDbStats] = useState(null);
  const [message, setMessage] = useState("Review student applications and send decision.");

  const normalizeDbApproval = (app) => ({
    approval_id: app.id,
    company: app.student ? (app.student.college || "Academic Student") : "Student Request",
    role: app.student ? `${app.student.degree || "Degree"} - ${app.student.branch || "Branch"}` : "Mentorship Request",
    studentName: app.student ? app.student.full_name : "Student",
    stage: app.status === "pending" ? "Mentor Approval" : (app.status === "approved" ? "Recruiter Screening" : "Mentor Rejected"),
    date: app.created_at ? new Date(app.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently",
    status: app.status === "pending" ? "Pending" : (app.status === "approved" ? "Shortlisted" : "Rejected"),
    comments: app.comments
  });

  const fetchDbData = async () => {
    const token = getStoredToken();
    if (!token) return;

    try {
      const [approvalsRes, statsRes] = await Promise.all([
        getMentorApprovals().catch(() => null),
        getMentorDashboardStats().catch(() => null)
      ]);
      if (Array.isArray(approvalsRes) && approvalsRes.length > 0) {
        setApplications(approvalsRes.map(normalizeDbApproval));
      }
      if (statsRes) {
        setDbStats(statsRes);
      }
    } catch (err) {
      console.error("[DB Sync] Load mentor data failed:", err);
    }
  };

  useEffect(() => {
    fetchDbData();
  }, []);

  const decide = async (target, status) => {
    const token = getStoredToken();
    if (token && target.approval_id) {
      try {
        if (status === "Shortlisted" || status === "approved") {
          await approveStudent(target.approval_id, "Approved by mentor");
        } else {
          await rejectStudent(target.approval_id, "Rejected by mentor");
        }
        await fetchDbData();
        setMessage(`Student request ${status.toLowerCase()} successfully.`);
        return;
      } catch (err) {
        console.error("[DB Sync] Decision failed:", err);
      }
    }

    const nextApplications = applications.map((item) =>
      (item.approval_id && item.approval_id === target.approval_id) || (item.company === target.company && item.role === target.role)
        ? {
            ...item,
            status,
            stage: status === "Shortlisted" ? "Recruiter Screening" : "Mentor Rejected",
            mentorDecisionAt: new Date().toLocaleString(),
            mentorDecisionBy: user?.name || "Mentor"
          }
        : item
    );
    const notifications = safeGetItem("placer_notifications", []);
    localStorage.setItem("placer_applications", JSON.stringify(nextApplications));
    localStorage.setItem(
      "placer_notifications",
      JSON.stringify([`Mentor ${status.toLowerCase()} your ${target.company} application.`, ...notifications])
    );
    setApplications(nextApplications);
    setMessage(`${target.company} application ${status.toLowerCase()} successfully.`);
  };

  const pending = dbStats ? dbStats.pending_reviews : applications.filter((item) => item.status === "Pending").length;
  const shortlisted = dbStats ? dbStats.approved_students : applications.filter((item) => item.status === "Shortlisted" || item.status === "approved").length;
  const totalAssigned = dbStats ? dbStats.total_assigned_students : (applications.length || 24);
  const activeApplications = applications.filter((item) => (item.status || "").toLowerCase() === "pending");
  const historyApplications = applications.filter((item) => (item.status || "").toLowerCase() !== "pending");


  return (
    <div className="app-shell">
      <main className="dashboard-main">
        <header className="page-header">
          <div>
            <p className="eyebrow">PLACER-AI mentor workspace</p>
            <h1>Welcome, {user?.name || "Mentor"}</h1>
            <p>{message}</p>
          </div>
          <button className="secondary-button" type="button" onClick={onLogout}>Logout</button>
        </header>

        <section className="stats-grid">
          <Metric label="Assigned Students" value="24" tone="indigo" icon={<FaUserGraduate />} />
          <Metric label="Pending Reviews" value={pending} tone="amber" icon={<FaClock />} />
          <Metric label="Approved" value={shortlisted} tone="green" icon={<FaCheckCircle />} />
          <Metric label="Resume Reviews" value="14" tone="red" icon={<FaFileAlt />} />
        </section>

        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h2>Application Approval Queue</h2>
              <p>Accept or reject applications sent by students</p>
            </div>
          </div>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Stage</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeApplications.map((item) => (
                  <tr key={`${item.company}-${item.role}-${item.date}`}>
                    <td>{item.company}</td>
                    <td>{item.role}</td>
                    <td>{item.stage}</td>
                    <td>{item.date}</td>
                    <td><span className={`status-pill ${item.status?.toLowerCase()}`}>{item.status}</span></td>
                    <td>
                      <div className="row-actions">
                        <button className="secondary-button" type="button" onClick={() => decide(item, "Shortlisted")}>
                          <FaCheckCircle /> Accept
                        </button>
                        <button className="danger-button" type="button" onClick={() => decide(item, "Rejected")}>
                          <FaTimesCircle /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeApplications.length === 0 && (
                  <tr>
                    <td colSpan="6">No pending applications for mentor approval.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel table-panel">
          <div className="panel-title">
            <div>
              <h2>Approval History</h2>
              <p>Completed decisions are locked and cannot be changed.</p>
            </div>
          </div>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Final Stage</th>
                  <th>Decision</th>
                  <th>Decision Time</th>
                </tr>
              </thead>
              <tbody>
                {historyApplications.map((item) => (
                  <tr key={`${item.company}-${item.role}-${item.date}-history`}>
                    <td>{item.company}</td>
                    <td>{item.role}</td>
                    <td>{item.stage}</td>
                    <td><span className={`status-pill ${item.status?.toLowerCase()}`}>{item.status}</span></td>
                    <td>{item.mentorDecisionAt || "Already decided"}</td>
                  </tr>
                ))}
                {historyApplications.length === 0 && (
                  <tr>
                    <td colSpan="5">No approval history yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value, tone, icon }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>Live status</span>
      </div>
    </article>
  );
}

export default MentorDashboard;
