import { useMemo, useState, useEffect, useRef } from "react";
import {
  FaBell, FaBriefcase, FaCalendarAlt, FaChartBar, FaCheckCircle,
  FaChevronDown, FaClipboardCheck, FaCog, FaCommentAlt,
  FaEllipsisV, FaEye, FaFilter, FaGraduationCap, FaHome,
  FaInbox, FaLayerGroup, FaMagic, FaPaperPlane, FaPlus,
  FaSearch, FaSignOutAlt, FaTimesCircle, FaUserFriends,
  FaChevronLeft, FaChevronRight, FaClock, FaMapMarkerAlt, FaTrash, FaFileAlt, 
  FaDownload, FaBuilding, FaHistory, FaBullseye, FaChartLine, FaRobot, FaMicrophone, FaPaperclip, FaUpload, FaPowerOff, FaLink, FaAward, FaTools, FaMapPin, FaUserPlus, FaEdit,
  FaArrowUp, FaArrowDown, FaCheck, FaExclamationTriangle
} from "react-icons/fa";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar
} from "recharts";
import { safeGetItem } from "../utils/storage";
import {
  getRecruiterProfile,
  updateRecruiterProfile,
  getRecruiterJobs,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterDashboardStats
} from "../services/recruiterService";
import { getStoredToken } from "../services/authService";
import "./dashboard.css";


const DUMMY_APPS = [
  { id: '1', studentName: "Rohit Sharma", role: "Frontend Developer", appliedOn: "May 17, 2026", status: "Applied", company: "Acme Corp", exp: "Fresher", skills: ["React", "CSS", "Figma"], edu: "B.Tech CSE, IIT Bombay", bio: "Passionate developer with a love for pixel-perfect UI.", atsScore: 82 },
  { id: '2', studentName: "Sneha Patil", role: "UI/UX Designer", appliedOn: "May 17, 2026", status: "Shortlisted", company: "Acme Corp", exp: "1 Year", skills: ["Adobe XD", "Figma", "User Research"], edu: "B.Des, NID", bio: "Creative designer focused on user-centric experiences.", interviewDate: "May 25, 2026", interviewTime: "10:30 AM", interviewLocation: "At College Campus", atsScore: 91 },
  { id: '3', studentName: "Amit Verma", role: "Backend Developer", appliedOn: "May 16, 2026", status: "Interview", company: "Acme Corp", exp: "6 Months", skills: ["Node.js", "MongoDB", "Redis"], edu: "M.Tech, VIT", bio: "Scalability enthusiast and backend architect.", interviewDate: "May 26, 2026", interviewTime: "02:00 PM", interviewLocation: "At Company Office", atsScore: 87 },
  { id: '4', studentName: "Pooja Singh", role: "Data Analyst", appliedOn: "May 16, 2026", status: "Applied", company: "Acme Corp", exp: "Fresher", skills: ["Python", "SQL", "Tableau"], edu: "B.Sc Stats, DU", bio: "Data-driven storyteller.", atsScore: 78 },
  { id: '5', studentName: "Karan Mehta", role: "Full Stack Developer", appliedOn: "May 15, 2026", status: "Rejected", company: "Acme Corp", exp: "2 Years", skills: ["Next.js", "Postgres", "AWS"], edu: "B.E, BITS Pilani", bio: "Building full-stack apps from scratch.", atsScore: 68 }
];

const DUMMY_ASSESSMENTS = [
  { id: 'a1', name: "Frontend Developer Tech Assessment", role: "Frontend Developer", type: "Coding Test", assigned: 45, completed: 32, avgScore: 78, status: "Active" },
  { id: 'a2', name: "Aptitude & Logical Reasoning", role: "All Roles", type: "MCQ Test", assigned: 120, completed: 110, avgScore: 65, status: "Completed" },
  { id: 'a3', name: "UI/UX Design Challenge", role: "Product Designer", type: "Assignment", assigned: 15, completed: 12, avgScore: 82, status: "Active" },
  { id: 'a4', name: "Backend Architecture Design", role: "Backend Engineer", type: "Assignment", assigned: 20, completed: 18, avgScore: 71, status: "Expired" }
];

const DUMMY_ASSESSMENT_RESULTS = [
  { id: 'r1', studentName: "Rohit Sharma", score: 85, status: "Completed", time: "May 18, 2026 • 10:30 AM" },
  { id: 'r2', studentName: "Priya Patel", score: 92, status: "Completed", time: "May 18, 2026 • 11:45 AM" },
  { id: 'r3', studentName: "Amit Kumar", score: 0, status: "Pending", time: "-" },
  { id: 'r4', studentName: "Neha Singh", score: 78, status: "Completed", time: "May 19, 2026 • 02:15 PM" }
];

const DUMMY_CONVERSATIONS = [
  {
    id: "c1",
    candidateName: "Rohit Sharma",
    role: "Frontend Developer",
    status: "Online",
    unread: 2,
    messages: [
      { id: "m1", text: "Hi, I have applied for the Frontend Developer role.", sender: "candidate", time: "10:00 AM" },
      { id: "m2", text: "Hello Rohit, we have received your application. Can we schedule an interview tomorrow?", sender: "recruiter", time: "10:30 AM" },
      { id: "m3", text: "Sure, tomorrow at 2 PM works for me.", sender: "candidate", time: "10:35 AM" },
      { id: "m4", text: "Great. Please share your updated resume here as well.", sender: "recruiter", time: "10:40 AM" },
      { id: "m5", text: "Attached my resume. Let me know if you need anything else.", sender: "candidate", time: "11:00 AM", isFile: true, fileName: "Rohit_Sharma_Resume.pdf" },
      { id: "m6", text: "Thanks, I will review it before our call.", sender: "recruiter", time: "11:05 AM" }
    ]
  },
  {
    id: "c2",
    candidateName: "Sneha Patil",
    role: "UI/UX Designer",
    status: "Offline",
    unread: 0,
    messages: [
      { id: "m1", text: "Hello, could you provide some feedback on my portfolio?", sender: "candidate", time: "Yesterday" },
      { id: "m2", text: "Hi Sneha, our design team is currently reviewing it. We will get back to you by EOD.", sender: "recruiter", time: "Yesterday" }
    ]
  },
  {
    id: "c3",
    candidateName: "Amit Verma",
    role: "Backend Developer",
    status: "Offline",
    unread: 1,
    messages: [
      { id: "m1", text: "Hi, I had a question regarding the API design round.", sender: "candidate", time: "2 Days ago" }
    ]
  }
];

function RecruiterDashboard({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [activeTab, setActiveTab] = useState("All Openings");
  const [jobSearch, setJobSearch] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [schedulingFor, setSchedulingFor] = useState(null);
  const [message, setMessage] = useState("");

  const company = user?.company || "Acme Corp";

  const normalizeDbJob = (j) => ({
    ...j,
    id: j.id,
    title: j.title,
    role: j.title,
    company: j.company_name || company,
    company_name: j.company_name || company,
    location: j.location || "Remote",
    jobType: j.job_type || "Full-time",
    type: j.job_type || "Full-time",
    experience: j.experience_required || "0-2 Years",
    salary: j.salary_min && j.salary_max ? `${j.salary_min} - ${j.salary_max} LPA` : (j.salary_min ? `${j.salary_min} LPA` : "As per industry"),
    description: j.description || "",
    status: (j.status || "Active").toLowerCase() === "active" ? "Active" : (j.status || "Closed"),
    postedOn: j.created_at ? new Date(j.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently",
    skills: j.skills_required ? j.skills_required.split(",").map(s => s.trim()) : [],
    recruiter_id: j.recruiter_id
  });

  // Data States
  const [jobs, setJobs] = useState(() => safeGetItem("placer_jobs", []));
  const [applications, setApplications] = useState(() => safeGetItem("placer_applications", DUMMY_APPS));

  // Initial Database Load
  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    getRecruiterJobs().then(dbJobs => {
      if (Array.isArray(dbJobs) && dbJobs.length > 0) {
        setJobs(dbJobs.map(normalizeDbJob));
      }
    }).catch(err => console.error("[DB Sync] Load recruiter jobs failed:", err));
  }, []);

  // Filtered Data
  const myJobs = useMemo(() => jobs.filter(j => j.company === company || j.recruiter_id), [jobs, company]);
  const myApps = useMemo(() => applications.filter(a => a.company === company), [applications, company]);
  const scheduledInterviews = useMemo(() => myApps.filter(a => a.interviewDate), [myApps]);

  // Persist
  useEffect(() => { localStorage.setItem("placer_jobs", JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem("placer_applications", JSON.stringify(applications)); }, [applications]);

  // Handlers
  const handlePostJob = async (jobData) => {
    const token = getStoredToken();
    if (token) {
      try {
        await createJob({
          title: jobData.title || jobData.role || "Job Title",
          company_name: company,
          description: jobData.description || "",
          location: jobData.location || "Remote",
          job_type: jobData.type || jobData.jobType || "Full-time",
          experience_required: jobData.experience || "0-2 Years",
          salary_min: parseFloat(jobData.salaryMin || jobData.salary) || null,
          salary_max: parseFloat(jobData.salaryMax) || null,
          skills_required: Array.isArray(jobData.skills) ? jobData.skills.join(", ") : (jobData.skills || ""),
          application_deadline: jobData.deadline || null
        });
        const freshJobs = await getRecruiterJobs().catch(() => null);
        if (freshJobs) {
          setJobs(freshJobs.map(normalizeDbJob));
        }
      } catch (err) {
        console.error("[DB Sync] Create job failed:", err);
      }
    } else {
      const newJob = {
        ...jobData,
        id: `JOB-${Date.now()}`,
        company,
        postedOn: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        status: "Active",
        applicants: 0,
        newApplicants: 0,
        skills: []
      };
      setJobs([newJob, ...jobs]);
    }
    setShowComposer(false);
    setMessage("New job posted successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleUpdateJobStatus = async (id, newStatus) => {
    const token = getStoredToken();
    if (token && typeof id === 'number') {
      try {
        await updateJob(id, { status: newStatus.toLowerCase() });
        const freshJobs = await getRecruiterJobs().catch(() => null);
        if (freshJobs) {
          setJobs(freshJobs.map(normalizeDbJob));
        }
      } catch (err) {
        console.error("[DB Sync] Update job status failed:", err);
      }
    } else {
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status: newStatus } : j));
    }
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm("Delete this job posting?")) {
      const token = getStoredToken();
      if (token && typeof id === 'number') {
        try {
          await deleteJob(id);
          const freshJobs = await getRecruiterJobs().catch(() => null);
          if (freshJobs) {
            setJobs(freshJobs.map(normalizeDbJob));
            return;
          }
        } catch (err) {
          console.error("[DB Sync] Delete job failed:", err);
        }
      }
      setJobs(prev => prev.filter(j => j.id !== id));
    }
  };


  const handleUpdateAppStatus = (appId, status) => {
    if (status === "Shortlisted") {
      const candidate = applications.find(a => a.id === appId);
      setSchedulingFor(candidate);
    } else {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      setSelectedCandidate(null);
      setMessage(`Status updated to ${status}`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleFinalSchedule = (scheduleData) => {
    setApplications(prev => prev.map(a => a.id === schedulingFor.id ? { ...a, status: "Interview", ...scheduleData } : a));
    setSchedulingFor(null);
    setSelectedCandidate(null);
    setActiveSection("Interviews");
    setMessage("Interview scheduled successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  // Stats
  const stats = useMemo(() => ({
    totalJobs: myJobs.length || 12,
    totalApps: myApps.length || 245,
    shortlisted: myApps.filter(a => a.status === "Shortlisted").length || 38,
    interviews: myApps.filter(a => a.status === "Interview").length || 16,
    hired: myApps.filter(a => a.status === "Hired").length || 5
  }), [myJobs, myApps]);

  const menuItems = [
    { id: "Dashboard", icon: <FaHome />, label: "Dashboard" },
    { id: "Jobs & Internships", icon: <FaBriefcase />, label: "Jobs & Internships" },
    { id: "Candidates", icon: <FaUserFriends />, label: "Candidates" },
    { id: "Screening", icon: <FaFilter />, label: "Screening" },
    { id: "Assessments", icon: <FaClipboardCheck />, label: "Assessments" },
    { id: "Interviews", icon: <FaCalendarAlt />, label: "Interviews" },
    { id: "Messages", icon: <FaCommentAlt />, label: "Messages", badge: "3", badgeColor: "red" },
    { id: "Settings", icon: <FaCog />, label: "Settings" }
  ];

  return (
    <div className="hi-admin-shell">
      {/* SIDEBAR */}
      <aside className="hi-sidebar">
        <div className="hi-sidebar-brand">
          <div className="hi-brand-logo"><FaBullseye /></div>
          <div className="hi-brand-text-group">
            <span className="hi-brand-name">PLACER.AI</span>
            <span className="hi-brand-tagline">Recruiter Portal</span>
          </div>
        </div>
        <nav className="hi-sidebar-nav" style={{ overflowY: 'auto', flexGrow: 1, paddingBottom: '20px' }}>
          {menuItems.map(item => (
            <button key={item.id} className={`hi-nav-item ${activeSection === item.id ? "active" : ""}`} onClick={() => setActiveSection(item.id)}>
              <span className="hi-nav-icon">{item.icon}</span>
              <span className="hi-nav-label">{item.label}</span>
              {item.badge && <span className="hi-badge" style={item.badgeColor === 'red' ? { background: '#ef4444', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', padding: 0 } : {}}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="hi-sidebar-user" onClick={onLogout} title="Sign Out">
          <div className="hi-user-avatar">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "Recruiter")}&background=8b5cf6&color=fff`} alt="RS" />
          </div>
          <div className="hi-user-info">
            <strong>{user?.fullName || "Recruiter User"}</strong>
            <span>Sign Out</span>
          </div>
          <FaSignOutAlt style={{ marginLeft: "auto", color: "#64748b" }} />
        </div>
      </aside>

      {/* MAIN */}
      <div className="hi-main-content">
        <header className="hi-header">
          <div className="hi-header-search">
            <FaSearch />
            <input placeholder="Search everywhere..." />
          </div>
          <div className="hi-header-actions">
            <div className="hi-notification-btn"><FaBell /><span className="hi-badge">5</span></div>
            <div className="hi-user-pill">
              <div className="hi-user-pill-avatar">
                {String(user?.fullName || "RU").split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div className="hi-user-pill-text"><strong>{user?.fullName || "Recruiter User"}</strong><span>{company} Recruitment</span></div>
            </div>
          </div>
        </header>

        <main className="hi-content-body">
          {message && <div className="hi-toast-message">{message}</div>}

          <div className="hi-welcome-bar">
            <div><h2>{activeSection} 👋</h2><p>Managing your recruitment workflow.</p></div>
            <div className="hi-header-actions">
              <div className="hi-date-picker"><FaCalendarAlt /><span>Jun 15 – Jun 21, 2026</span><FaChevronDown /></div>
              {(activeSection === "Dashboard" || activeSection === "Jobs & Internships") && (
                <button className="primary-button" onClick={() => setShowComposer(true)}><FaPlus /> Post New Job</button>
              )}
            </div>
          </div>

          {activeSection === "Dashboard" && <DashboardHome stats={stats} applications={myApps} />}
          
          {activeSection === "Jobs & Internships" && (
            <JobsManagementView 
              jobs={myJobs} activeTab={activeTab} setActiveTab={setActiveTab} 
              searchTerm={jobSearch} setSearchTerm={setJobSearch}
              onUpdateStatus={handleUpdateJobStatus} onDelete={handleDeleteJob}
            />
          )}

          {activeSection === "Candidates" && <CandidatesListView applications={myApps} onReview={setSelectedCandidate} />}
          {activeSection === "Assessments" && <AssessmentsView assessments={DUMMY_ASSESSMENTS} />}
          {activeSection === "Interviews" && <InterviewsView interviews={scheduledInterviews} />}
          {activeSection === "Settings" && <RecruiterSettingsView user={user} />}
          {activeSection === "Screening" && <ScreeningView applications={myApps} onStatusUpdate={handleUpdateAppStatus} onReview={setSelectedCandidate} />}
          {activeSection === "Messages" && <MessagesView />}

          {!["Dashboard", "Jobs & Internships", "Candidates", "Assessments", "Interviews", "Settings", "Screening", "Messages"].includes(activeSection) && (
            <div className="hi-panel">
              <div className="empty-state-large"><FaMagic size={64} color="#e2e8f0" /><p>{activeSection} view is loading...</p></div>
            </div>
          )}
        </main>
      </div>

      {showComposer && <JobComposer onClose={() => setShowComposer(false)} onSubmit={handlePostJob} />}
      {selectedCandidate && <CandidateProfileModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} onStatusUpdate={handleUpdateAppStatus} />}
      {schedulingFor && <InterviewSchedulerModal candidate={schedulingFor} onClose={() => setSchedulingFor(null)} onSchedule={handleFinalSchedule} />}
    </div>
  );
}

// --- VIEWS ---

function HomeMetricCard({ icon, label, value, trend, color, isNegative = false }) {
  return (
    <div className="hi-metric-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}12`, color, display: 'grid', placeItems: 'center', fontSize: '20px' }}>
          {icon}
        </div>
        <span style={{ 
          fontSize: '12px', 
          fontWeight: '800', 
          color: isNegative ? '#ef4444' : '#10b981',
          background: isNegative ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
          padding: '4px 8px',
          borderRadius: '99px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {isNegative ? <FaArrowDown size={10} /> : <FaArrowUp size={10} />} {trend}
        </span>
      </div>
      <div>
        <span style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        <strong style={{ display: 'block', fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '4px', letterSpacing: '-0.5px' }}>{value}</strong>
      </div>
    </div>
  );
}

function DashboardHome({ stats, applications }) {
  const activities = [
    { id: '1', text: "Rohit Sharma completed Frontend Developer Assessment", time: "10 mins ago", type: "success" },
    { id: '2', text: "Interview scheduled with Sneha Patil for UI/UX Designer", time: "1 hour ago", type: "info" },
    { id: '3', text: "New application received from Pooja Singh (Data Analyst)", time: "3 hours ago", type: "warning" },
    { id: '4', text: "Backend Architecture Test assigned to Amit Verma", time: "5 hours ago", type: "primary" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 5 METRIC GRID */}
      <div className="hi-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <HomeMetricCard icon={<FaBriefcase />} label="Total Jobs Posted" value={stats.totalJobs} trend="12%" color="#8b5cf6" />
        <HomeMetricCard icon={<FaFileAlt />} label="Total Applications" value={stats.totalApps} trend="18%" color="#0ea5e9" />
        <HomeMetricCard icon={<FaUserFriends />} label="Shortlisted Candidates" value={stats.shortlisted} trend="8%" color="#10b981" />
        <HomeMetricCard icon={<FaCalendarAlt />} label="Interviews Booked" value={stats.interviews} trend="5%" color="#f59e0b" />
        <HomeMetricCard icon={<FaCheckCircle />} label="Hired Candidates" value={stats.hired} trend="15%" color="#10b981" />
      </div>

      {/* CHARTS GRID */}
      <div className="hi-charts-grid-responsive" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* AREA CHART */}
          <div className="hi-chart-panel" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '850', color: '#0f172a' }}>Applications Funnel</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Interactive overview of daily pipeline activity</span>
              </div>
              <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', outline: 'none', cursor: 'pointer' }}>
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={[
                { n: 'Mon', applications: 22, interviews: 4 },
                { n: 'Tue', applications: 45, interviews: 8 },
                { n: 'Wed', applications: 35, interviews: 6 },
                { n: 'Thu', applications: 55, interviews: 12 },
                { n: 'Fri', applications: 72, interviews: 15 },
                { n: 'Sat', applications: 88, interviews: 20 },
                { n: 'Sun', applications: 100, interviews: 25 }
              ]}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{fill:'#64748b',fontSize:12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill:'#64748b',fontSize:12}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} />
                <Area type="monotone" dataKey="applications" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" name="Applications" />
                <Area type="monotone" dataKey="interviews" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorInts)" name="Interviews" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* RECENT APPLICATIONS TABLE */}
          <div className="hi-panel hi-table-panel" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '850', color: '#0f172a' }}>Recent Applications</h3>
              <button className="text-link" style={{ fontSize: '13px', fontWeight: '800' }}>View All</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="hi-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #f1f5f9', color: '#64748b', fontSize: '12px', fontWeight: 'bold' }}>
                    <th style={{ padding: '12px 16px' }}>Candidate</th>
                    <th style={{ padding: '12px 16px' }}>Job Role</th>
                    <th style={{ padding: '12px 16px' }}>Applied On</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.slice(0, 4).map(app => {
                    const statusColors = app.status === "Shortlisted" ? { bg: '#fffbeb', text: '#d97706' } :
                                         app.status === "Interview" ? { bg: '#f3e8ff', text: '#9333ea' } :
                                         app.status === "Hired" ? { bg: '#f0fdf4', text: '#10b981' } :
                                         app.status === "Rejected" ? { bg: '#fef2f2', text: '#ef4444' } :
                                         { bg: '#eff6ff', text: '#3b82f6' };

                    return (
                      <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(app.studentName)}&background=random&color=fff`} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="" />
                            <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{app.studentName}</strong>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13.5px', color: '#475569' }}>{app.role}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13.5px', color: '#64748b' }}>{app.appliedOn || "May 17, 2026"}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 'bold', background: statusColors.bg, color: statusColors.text }}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* DONUT CHART */}
          <div className="hi-chart-panel" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '850', color: '#0f172a' }}>Pipeline Stages</h3>
            </div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', height: '160px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[
                    { name: 'Applied', value: stats.totalApps - stats.shortlisted - stats.interviews - stats.hired, color: '#8b5cf6' },
                    { name: 'Shortlisted', value: stats.shortlisted, color: '#3b82f6' },
                    { name: 'Interviews', value: stats.interviews, color: '#f59e0b' },
                    { name: 'Hired', value: stats.hired, color: '#10b981' }
                  ]} innerRadius={50} outerRadius={68} paddingAngle={4} dataKey="value">
                    <Cell fill="#8b5cf6"/>
                    <Cell fill="#3b82f6"/>
                    <Cell fill="#f59e0b"/>
                    <Cell fill="#10b981"/>
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <strong style={{ display: 'block', fontSize: '24px', color: '#0f172a', fontWeight: '900' }}>{stats.totalApps}</strong>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '750', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Funnels</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }}></span> Applied</span>
                <strong>{stats.totalApps - stats.shortlisted - stats.interviews - stats.hired}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span> Shortlisted</span>
                <strong>{stats.shortlisted}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span> Interviews</span>
                <strong>{stats.interviews}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Hired</span>
                <strong>{stats.hired}</strong>
              </div>
            </div>
          </div>

          {/* RECENT ACTIVITY SECTION */}
          <div className="hi-panel" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '850', color: '#0f172a' }}>Recent Activity</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activities.map(act => {
                const typeColors = act.type === "success" ? "#10b981" :
                                     act.type === "warning" ? "#f59e0b" :
                                     act.type === "info" ? "#3b82f6" : "#8b5cf6";
                return (
                  <div key={act.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: typeColors, marginTop: '5px', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#334155', fontWeight: '500', lineHeight: '1.4' }}>{act.text}</p>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{act.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobsManagementView({ jobs, activeTab, setActiveTab, searchTerm, setSearchTerm, onUpdateStatus, onDelete }) {
  const filtered = useMemo(() => {
    return jobs.filter(j => {
      const matchesSearch = j.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === "All Openings" || j.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [jobs, activeTab, searchTerm]);

  return (
    <div className="hi-panel hi-table-panel" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div className="hi-tabs-bar" style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
          {["All Openings", "Active", "Closed"].map(t => (
            <button 
              key={t} 
              className={`hi-tab ${activeTab === t ? "active" : ""}`} 
              onClick={() => setActiveTab(t)}
              style={{ padding: '8px 16px', border: 'none', background: activeTab === t ? '#fff' : 'transparent', borderRadius: '8px', fontSize: '13px', fontWeight: '750', color: activeTab === t ? '#0f172a' : '#64748b', cursor: 'pointer', transition: '0.2s', boxShadow: activeTab === t ? '0 2px 8px rgba(0,0,0,0.04)' : 'none' }}
            >
              {t}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', width: '260px' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8', fontSize: '13px' }} />
          <input 
            placeholder="Search jobs..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }} 
          />
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table className="hi-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid #f1f5f9', color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              <th style={{ padding: '16px' }}>Job Title</th>
              <th style={{ padding: '16px' }}>Location</th>
              <th style={{ padding: '16px' }}>Package</th>
              <th style={{ padding: '16px' }}>Type</th>
              <th style={{ padding: '16px' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(j => (
              <tr key={j.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px' }}><strong style={{ color: '#0f172a', fontSize: '14px' }}>{j.role}</strong></td>
                <td style={{ padding: '16px', fontSize: '13.5px', color: '#475569' }}>{j.location}</td>
                <td style={{ padding: '16px', fontSize: '13.5px', color: '#475569' }}>{j.salary}</td>
                <td style={{ padding: '16px', fontSize: '13.5px', color: '#475569' }}>{j.type}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '4px 10px', 
                    borderRadius: '99px', 
                    fontSize: '11px', 
                    fontWeight: 'bold', 
                    background: j.status === 'Active' ? '#f0fdf4' : '#fef2f2', 
                    color: j.status === 'Active' ? '#10b981' : '#ef4444' 
                  }}>{j.status}</span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div className="action-btns" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn-approve-circle" onClick={()=>onUpdateStatus(j.id, j.status==='Active'?'Closed':'Active')} title="Toggle Status" style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: '0.2s' }}><FaPowerOff style={{color: j.status === 'Active' ? '#64748b' : '#10b981', fontSize: '13px'}} /></button>
                    <button className="btn-delete-circle" onClick={()=>onDelete(j.id)} title="Delete" style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: '0.2s' }}><FaTrash style={{ fontSize: '13px' }} /></button>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan="6" style={{textAlign:'center', padding:'40px', color: '#64748b', fontSize: '14.5px'}}>No {activeTab} jobs found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CandidatesListView({ applications, onReview }) {
  if (applications.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: '16px', padding: '48px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', textAlign: 'center', color: '#64748b' }}>
        <FaUserFriends size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
        <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '18px', fontWeight: '800' }}>No Candidates Yet</h3>
        <p style={{ margin: 0, fontSize: '14px' }}>Candidates who apply to your jobs will appear here.</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '16px 24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
        <thead>
          <tr style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '2.5px solid #f1f5f9' }}>
            <th style={{ padding: '16px' }}>Candidate</th>
            <th style={{ padding: '16px' }}>Job Applied</th>
            <th style={{ padding: '16px' }}>ATS Match</th>
            <th style={{ padding: '16px' }}>Exp / Edu</th>
            <th style={{ padding: '16px' }}>Status</th>
            <th style={{ padding: '16px', textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => {
            const safeName = app.studentName || app.name || "Anonymous Candidate";
            const safeRole = app.role || "Role Not Specified";
            const safeExp = app.exp || "Experience N/A";
            const safeEdu = app.edu || "Education N/A";
            const hasSkills = Array.isArray(app.skills) && app.skills.length > 0;
            const atsVal = app.atsScore || (65 + (parseInt(String(app.id).replace(/\D/g, '') || '0') % 30));

            const getStatusColor = (s) => {
              switch(s) {
                case "Applied": return { bg: "#eff6ff", text: "#3b82f6", border: "#bfdbfe" };
                case "Shortlisted": return { bg: "#fef3c7", text: "#d97706", border: "#fde68a" };
                case "Interview": return { bg: "#f3e8ff", text: "#9333ea", border: "#e9d5ff" };
                case "Hired": return { bg: "#f0fdf4", text: "#10b981", border: "#bbf7d0" };
                case "Rejected": return { bg: "#fef2f2", text: "#ef4444", border: "#fecaca" };
                case "Hold": return { bg: "#fffbeb", text: "#f59e0b", border: "#fde68a" };
                default: return { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };
              }
            };
            const colors = getStatusColor(app.status);

            return (
              <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=random&color=fff`} alt="v" style={{ width: '40px', height: '40px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} />
                    <div>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: '14px' }}>{safeName}</strong>
                      <span style={{ color: '#64748b', fontSize: '12.5px', display: 'block', marginTop: '2px' }}>{safeEdu}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px', color: '#334155', fontSize: '14px', fontWeight: '600' }}>{safeRole}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: atsVal >= 80 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                    color: atsVal >= 80 ? '#10b981' : '#f59e0b',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    fontSize: '12px'
                  }}>
                    {atsVal}% Match
                  </span>
                </td>
                <td style={{ padding: '16px', color: '#475569', fontSize: '13.5px' }}>{safeExp}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ display: 'inline-block', background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold' }}>{app.status}</span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <button onClick={() => onReview(app)} style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.18)', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', fontSize: '13px' }} onMouseEnter={e => {e.currentTarget.style.background = 'rgba(139, 92, 246, 0.14)'}} onMouseLeave={e => {e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)'}}>Review Profile</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MessagesView() {
  const [conversations, setConversations] = useState(DUMMY_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState("c1");
  const [search, setSearch] = useState("");
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const activeChat = conversations.find(c => c.id === activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: "recruiter",
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setConversations(prev => prev.map(c => 
      c.id === activeChatId ? { ...c, messages: [...c.messages, newMessage] } : c
    ));
    setInputText("");
  };

  const handleQuickReply = (text) => {
    setInputText(text);
  };

  const filteredConversations = conversations.filter(c => 
    c.candidateName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 180px)', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
      {/* LEFT PANEL */}
      <div style={{ width: '320px', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8', fontSize: '13px' }} />
            <input 
              placeholder="Search chats..." 
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
            />
          </div>
        </div>
        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
          {filteredConversations.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No conversations.</div>
          ) : (
            filteredConversations.map(c => {
              const lastMessage = c.messages[c.messages.length - 1];
              const isActive = activeChatId === c.id;
              return (
                <div 
                  key={c.id} 
                  onClick={() => { setActiveChatId(c.id); setConversations(prev => prev.map(conv => conv.id === c.id ? {...conv, unread: 0} : conv)); }}
                  style={{ display: 'flex', gap: '12px', padding: '14px 20px', cursor: 'pointer', background: isActive ? '#fff' : 'transparent', borderLeft: isActive ? '4px solid #8b5cf6' : '4px solid transparent', borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}
                >
                  <div style={{ position: 'relative' }}>
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.candidateName)}&background=random&color=fff`} alt="v" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    {c.status === "Online" && <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', background: '#10b981', border: '1.5px solid #fff', borderRadius: '50%' }}></div>}
                  </div>
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.candidateName}</strong>
                      <span style={{ fontSize: '11px', color: isActive ? '#8b5cf6' : '#94a3b8', fontWeight: isActive ? 'bold' : 'normal' }}>{lastMessage?.time}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: isActive ? '#475569' : '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>{lastMessage?.isFile ? '📎 Attachment' : lastMessage?.text}</span>
                      {c.unread > 0 && <span style={{ background: '#8b5cf6', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '99px' }}>{c.unread}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      {activeChat ? (
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
          {/* Header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeChat.candidateName)}&background=random&color=fff`} alt="v" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                {activeChat.status === "Online" && <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', background: '#10b981', border: '1.5px solid #fff', borderRadius: '50%' }}></div>}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>{activeChat.candidateName}</h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Pipeline: <strong style={{color: '#475569'}}>{activeChat.role}</strong></span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', color: '#64748b', fontSize: '18px', cursor: 'pointer' }}>
              <FaSearch title="Search in chat" />
              <FaEllipsisV title="More options" />
            </div>
          </div>

          {/* Messages Area */}
          <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', background: '#f8fafc' }}>
            {activeChat.messages.map(msg => {
              const isMine = msg.sender === "recruiter";
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', maxWidth: '70%', flexDirection: isMine ? 'row-reverse' : 'row' }}>
                    {!isMine && <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeChat.candidateName)}&background=random&color=fff`} alt="v" style={{ width: '28px', height: '28px', borderRadius: '50%', marginBottom: '4px' }} />}
                    <div style={{ background: isMine ? '#8b5cf6' : '#fff', color: isMine ? '#fff' : '#334155', padding: '10px 14px', borderRadius: isMine ? '14px 14px 2px 14px' : '14px 14px 14px 2px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', fontSize: '13.5px', lineHeight: '1.5', border: isMine ? 'none' : '1px solid #e2e8f0' }}>
                      {msg.isFile ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <FaFileAlt size={22} style={{ color: isMine ? '#d8b4fe' : '#94a3b8' }} />
                          <div>
                            <strong style={{ display: 'block', fontSize: '13px' }}>{msg.fileName}</strong>
                            <span style={{ fontSize: '11px', opacity: 0.8 }}>Click to download</span>
                          </div>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '4px', padding: isMine ? '0 4px 0 0' : '0 0 0 36px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {msg.time} {isMine && <span style={{ color: '#10b981' }}>✓✓</span>}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div style={{ padding: '10px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {["Hi, when are you available for an interview?", "Please share your updated resume.", "Your profile has been shortlisted!", "Thanks, we will get back to you soon."].map(qr => (
              <button key={qr} onClick={() => handleQuickReply(qr)} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '99px', fontSize: '11.5px', color: '#8b5cf6', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600' }}>{qr}</button>
            ))}
          </div>

          {/* Input Area */}
          <div style={{ padding: '16px 20px', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#f1f5f9', padding: '6px 14px', borderRadius: '10px' }}>
              <button type="button" title="Attach File" style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '16px', display: 'flex' }}><FaPaperclip /></button>
              <input 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type your message..."
                style={{ flexGrow: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: '#0f172a' }}
              />
              <button type="submit" disabled={!inputText.trim()} style={{ background: inputText.trim() ? '#8b5cf6' : '#cbd5e1', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputText.trim() ? 'pointer' : 'default', transition: 'background 0.2s' }}>
                <FaPaperPlane style={{ fontSize: '12px', marginLeft: '-1px' }} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#94a3b8' }}>
          <FaCommentAlt size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '18px', fontWeight: '800' }}>No Conversation Selected</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>Select a candidate from the sidebar list to start direct chat.</p>
        </div>
      )}
    </div>
  );
}

function InterviewsView({ interviews }) {
  return (
    <div className="hi-panel hi-table-panel" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
      <div className="hi-panel-header" style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '850', color: '#0f172a' }}>Scheduled Interviews</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="hi-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid #f1f5f9', color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              <th style={{ padding: '16px' }}>Candidate</th>
              <th style={{ padding: '16px' }}>Job Role</th>
              <th style={{ padding: '16px' }}>Date & Time</th>
              <th style={{ padding: '16px' }}>Location</th>
              <th style={{ padding: '16px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {interviews.length > 0 ? interviews.map(int => (
              <tr key={int.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(int.studentName)}&background=random&color=fff`} alt="v" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '13.5px' }}>{int.studentName}</span>
                  </div>
                </td>
                <td style={{ padding: '16px', fontSize: '13.5px', color: '#475569' }}>{int.role}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '13px' }}>
                    <FaCalendarAlt /> <span>{int.interviewDate} • {int.interviewTime}</span>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: int.interviewLocation?.includes('College') ? '#eff6ff' : '#f0fdf4', color: int.interviewLocation?.includes('College') ? '#3b82f6' : '#10b981', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 'bold' }}>
                    <FaMapPin /> {int.interviewLocation}
                  </span>
                </td>
                <td style={{ padding: '16px' }}><span className="status-pill applied" style={{ background: '#f59e0b16', color: '#f59e0b', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 'bold' }}>Scheduled</span></td>
              </tr>
            )) : <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14.5px' }}>No upcoming interviews scheduled.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AssessmentsView({ assessments }) {
  const [localAssessments, setLocalAssessments] = useState(assessments);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = useMemo(() => {
    return localAssessments.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "All" || a.role === roleFilter;
      const matchesType = typeFilter === "All" || a.type === typeFilter;
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      return matchesSearch && matchesRole && matchesType && matchesStatus;
    });
  }, [localAssessments, search, roleFilter, typeFilter, statusFilter]);

  const getStatusStyle = (status) => {
    switch(status) {
      case "Active": return { bg: "#eff6ff", text: "#3b82f6", border: "#bfdbfe" };
      case "Completed": return { bg: "#f0fdf4", text: "#10b981", border: "#bbf7d0" };
      case "Expired": return { bg: "#fef2f2", text: "#ef4444", border: "#fecaca" };
      default: return { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };
    }
  };

  if (activeAssessment) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setActiveAssessment(null)} style={{ background: 'transparent', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
            <FaChevronLeft /> Back to Assessments
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => alert("Edit feature coming soon!")} style={{ padding: '8px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}><FaEdit /> Edit</button>
            <button onClick={() => alert("Assign More feature coming soon!")} style={{ padding: '8px 16px', background: '#8b5cf6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(139,92,246,0.2)' }}><FaUserPlus /> Assign More</button>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '20px', fontWeight: '850' }}>{activeAssessment.name}</h2>
            <div style={{ display: 'flex', gap: '16px', color: '#64748b', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaBriefcase /> {activeAssessment.role}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaClipboardCheck /> {activeAssessment.type}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaUserFriends /> {activeAssessment.completed}/{activeAssessment.assigned} Completed</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{activeAssessment.avgScore}%</div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '750', textTransform: 'uppercase' }}>Average Score</div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px 24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '2.5px solid #f1f5f9' }}>
                <th style={{ padding: '16px' }}>Candidate</th>
                <th style={{ padding: '16px' }}>Score</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px' }}>Submission Time</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_ASSESSMENT_RESULTS.map(res => (
                <tr key={res.id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(res.studentName)}&background=random&color=fff`} style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="" />
                      <strong style={{ color: '#0f172a', fontSize: '13.5px' }}>{res.studentName}</strong>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', fontWeight: '800', color: res.score >= 75 ? '#10b981' : '#f59e0b' }}>{res.score > 0 ? `${res.score}%` : 'N/A'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      display: 'inline-block', 
                      padding: '4px 10px', 
                      borderRadius: '99px', 
                      fontSize: '11px', 
                      fontWeight: 'bold',
                      background: res.status === 'Completed' ? '#f0fdf4' : '#fffbeb',
                      color: res.status === 'Completed' ? '#10b981' : '#f59e0b'
                    }}>{res.status}</span>
                  </td>
                  <td style={{ padding: '16px', color: '#64748b', fontSize: '13px' }}>{res.time}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', color: '#475569', cursor: 'pointer', fontWeight: '750', fontSize: '12px' }}>Review Answers</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {showCreate && <AssessmentComposer onClose={() => setShowCreate(false)} />}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button onClick={() => setShowCreate(true)} style={{ padding: '10px 20px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)', fontSize: '13.5px' }}>
          <FaPlus /> Create Assessment
        </button>
      </div>

      <div style={{ background: '#fff', padding: '16px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flexGrow: 1, minWidth: '250px', position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: '16px', top: '14px', color: '#94a3b8', fontSize: '13px' }} />
          <input 
            placeholder="Search assessments..." 
            value={search} onChange={e=>setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13.5px' }}
          />
        </div>
        <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', fontSize: '13.5px', cursor: 'pointer' }}>
          <option value="All">All Job Roles</option>
          {[...new Set(assessments.map(a => a.role))].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', fontSize: '13.5px', cursor: 'pointer' }}>
          <option value="All">All Types</option>
          <option value="MCQ Test">MCQ Test</option>
          <option value="Coding Test">Coding Test</option>
          <option value="Assignment">Assignment</option>
        </select>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', fontSize: '13.5px', cursor: 'pointer' }}>
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Expired">Expired</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', padding: '16px 24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflowX: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <FaClipboardCheck size={40} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>No assessments found.</p>
            <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748b' }}>Adjust your filters or create a new assessment.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
            <thead>
              <tr style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '2.5px solid #f1f5f9' }}>
                <th style={{ padding: '16px' }}>Assessment Name</th>
                <th style={{ padding: '16px' }}>Job Role & Type</th>
                <th style={{ padding: '16px' }}>Participation</th>
                <th style={{ padding: '16px' }}>Avg Score</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const colors = getStatusStyle(a.status);
                const participatePercent = a.assigned > 0 ? (a.completed / a.assigned) * 100 : 0;
                
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' }}>
                    <td style={{ padding: '16px' }}>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: '14.5px' }}>{a.name}</strong>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ display: 'block', color: '#334155', fontSize: '14px', fontWeight: '600' }}>{a.role}</span>
                      <span style={{ display: 'block', color: '#64748b', fontSize: '12.5px', marginTop: '2px' }}>{a.type}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '180px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                          <span>{a.completed} / {a.assigned} Done</span>
                          <strong>{Math.round(participatePercent)}%</strong>
                        </div>
                        <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${participatePercent}%`, height: '100%', background: '#8b5cf6', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '150px' }}>
                        <div style={{ flexGrow: 1, height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', minWidth: '60px' }}>
                          <div style={{ width: `${a.avgScore}%`, height: '100%', background: a.avgScore >= 75 ? '#10b981' : a.avgScore >= 50 ? '#f59e0b' : '#ef4444', borderRadius: '4px' }}></div>
                        </div>
                        <strong style={{ fontSize: '13px', color: '#334155' }}>{a.avgScore}%</strong>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ display: 'inline-block', background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold' }}>{a.status}</span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setActiveAssessment(a)} style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.18)', padding: '6px 12px', borderRadius: '8px', color: '#8b5cf6', cursor: 'pointer', fontSize: '12.5px', fontWeight: '800' }}>View Details</button>
                        <button onClick={() => alert(`Assigning candidates to ${a.name}`)} style={{ background: '#fff', border: '1px solid #cbd5e1', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#64748b', cursor: 'pointer' }} title="Assign"><FaUserPlus /></button>
                        <button onClick={() => { if(window.confirm("Delete this assessment?")) setLocalAssessments(prev => prev.filter(x => x.id !== a.id)); }} style={{ background: '#fff', border: '1px solid #fee2e2', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }} title="Delete"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                )})}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function AssessmentComposer({ onClose }) {
  const [form, setForm] = useState({ name: "", role: "All Roles", type: "MCQ Test", duration: "60", passMarks: "60" });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Assessment "${form.name}" created successfully!`);
    onClose();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, padding: '20px' }}>
      <div style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'grid', placeItems: 'center', fontSize: '18px' }}>
              <FaClipboardCheck />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '850' }}>Create Assessment</h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Configure screening challenges for applicant filters.</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="form-group">
            <label>Assessment Name *</label>
            <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Frontend Technical screening" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Target Job Role</label>
              <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', backgroundColor: '#fff', cursor: 'pointer' }}>
                <option>All Roles</option>
                <option>Frontend Developer</option>
                <option>Backend Engineer</option>
                <option>Product Designer</option>
                <option>Full Stack Developer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Assessment Type</label>
              <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', backgroundColor: '#fff', cursor: 'pointer' }}>
                <option>MCQ Test</option>
                <option>Coding Test</option>
                <option>Assignment</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Duration (Minutes)</label>
              <input type="number" required value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} placeholder="60" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} />
            </div>
            <div className="form-group">
              <label>Passing Score (%)</label>
              <input type="number" required value={form.passMarks} onChange={e=>setForm({...form,passMarks:e.target.value})} placeholder="60" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} />
            </div>
          </div>

          <div className="form-group">
            <label>Test URL Link</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRight: '1px solid #cbd5e1', color: '#64748b' }}><FaLink /></div>
              <input placeholder="https://assessment.placer-ai.com/..." style={{ width: '100%', padding: '12px 14px', border: 'none', outline: 'none', fontSize: '14px' }} />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px' }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#8b5cf6', color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)', fontSize: '13.5px' }}>Create Assessment</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ScreeningView({ applications, onStatusUpdate, onReview }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [expFilter, setExpFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = applications.filter(app => {
    if (search) {
      const nameMatch = app.studentName && app.studentName.toLowerCase().includes(search.toLowerCase());
      const roleMatch = app.role && app.role.toLowerCase().includes(search.toLowerCase());
      if (!nameMatch && !roleMatch) return false;
    }
    if (roleFilter !== "All" && app.role !== roleFilter) return false;
    if (expFilter !== "All") {
      const expStr = app.exp || "";
      const isFresher = expStr.toLowerCase().includes("fresher");
      if (expFilter === "Fresher" && !isFresher) return false;
      if (expFilter === "Experienced" && isFresher) return false;
    }
    if (statusFilter !== "All" && app.status !== statusFilter) return false;
    return true;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case "Applied": return { bg: "#eff6ff", text: "#3b82f6" };
      case "Shortlisted": return { bg: "#fffbeb", text: "#d97706" };
      case "Interview": return { bg: "#f3e8ff", text: "#9333ea" };
      case "Rejected": return { bg: "#fef2f2", text: "#ef4444" };
      case "Hold": return { bg: "#fffbeb", text: "#f59e0b" };
      default: return { bg: "#f1f5f9", text: "#475569" };
    }
  };

  const getAiScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Filter Bar */}
      <div style={{ background: '#fff', padding: '16px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flexGrow: 1, minWidth: '250px', position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: '16px', top: '14px', color: '#94a3b8', fontSize: '13px' }} />
          <input 
            placeholder="Search candidates by name, skills or role..." 
            value={search} onChange={e=>setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13.5px' }}
          />
        </div>
        <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', fontSize: '13.5px', cursor: 'pointer' }}>
          <option value="All">All Job Roles</option>
          {[...new Set(applications.map(a => a.role))].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={expFilter} onChange={e=>setExpFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', fontSize: '13.5px', cursor: 'pointer' }}>
          <option value="All">All Experience</option>
          <option value="Fresher">Fresher</option>
          <option value="Experienced">Experienced</option>
        </select>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff', fontSize: '13.5px', cursor: 'pointer' }}>
          <option value="All">All Statuses</option>
          <option value="Applied">Applied</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Interview">Interview</option>
          <option value="Hold">Hold</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Candidates List Table */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '16px 24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflowX: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <FaSearch size={40} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Screening list is empty.</p>
            <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748b' }}>No candidates match the specified filters.</p>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
              <thead>
                <tr style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '2.5px solid #f1f5f9' }}>
                  <th style={{ padding: '16px' }}>Candidate</th>
                  <th style={{ padding: '16px' }}>Job Role</th>
                  <th style={{ padding: '16px' }}>Skills</th>
                  <th style={{ padding: '16px' }}>Exp / Edu</th>
                  <th style={{ padding: '16px' }}>AI Match</th>
                  <th style={{ padding: '16px' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Decision</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => {
                  const aiScore = app.atsScore || (65 + (parseInt(String(app.id).replace(/\D/g, '') || '0') % 30));
                  const colors = getStatusColor(app.status);
                  const safeName = app.studentName || app.name || "Anonymous Candidate";
                  const safeRole = app.role || "Role Not Specified";
                  const safeExp = app.exp || "Experience N/A";
                  const safeEdu = app.edu || "Education N/A";
                  const hasSkills = Array.isArray(app.skills) && app.skills.length > 0;
                  
                  return (
                    <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => onReview(app)}>
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=random&color=fff`} alt="v" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                          <div>
                            <strong style={{ display: 'block', color: '#0f172a', fontSize: '13.5px' }}>{safeName}</strong>
                            <span style={{ color: '#8b5cf6', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontWeight: '750' }}><FaFileAlt /> View Resume</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: '#334155', fontSize: '13.5px', fontWeight: '600' }}>{safeRole}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {hasSkills ? (
                            <>
                              {app.skills.slice(0, 2).map(s => <span key={s} style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>{s}</span>)}
                              {app.skills.length > 2 && <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>+{app.skills.length - 2}</span>}
                            </>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>Not provided</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ display: 'block', color: '#334155', fontSize: '13.5px' }}>{safeExp}</span>
                        <span style={{ display: 'block', color: '#64748b', fontSize: '11.5px', marginTop: '2px' }}>{safeEdu}</span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '140px' }}>
                          <div style={{ flexGrow: 1, height: '5px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', minWidth: '50px' }}>
                            <div style={{ width: `${aiScore}%`, height: '100%', background: getAiScoreColor(aiScore), borderRadius: '4px' }}></div>
                          </div>
                          <strong style={{ fontSize: '12.5px', color: '#334155' }}>{aiScore}%</strong>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ display: 'inline-block', background: colors.bg, color: colors.text, padding: '4px 10px', borderRadius: '99px', fontSize: '11.5px', fontWeight: 'bold' }}>{app.status}</span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => onStatusUpdate(app.id, 'Shortlisted')} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #10b981', background: '#f0fdf4', color: '#10b981', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} title="Shortlist"><FaCheckCircle /></button>
                          <button onClick={() => onStatusUpdate(app.id, 'Hold')} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f59e0b', background: '#fffbeb', color: '#f59e0b', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} title="Hold"><FaClock /></button>
                          <button onClick={() => onStatusUpdate(app.id, 'Rejected')} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ef4444', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} title="Reject"><FaTimesCircle /></button>
                        </div>
                      </td>
                    </tr>
                  )})}
              </tbody>
            </table>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid #f1f5f9', marginTop: '8px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Showing 1 to {filtered.length} of {filtered.length} candidates</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button style={{ padding: '6px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>Previous</button>
                <button style={{ padding: '6px 12px', background: '#8b5cf6', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>1</button>
                <button style={{ padding: '6px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CandidateProfileModal({ candidate, onClose, onStatusUpdate }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const atsVal = candidate.atsScore || (65 + (parseInt(String(candidate.id).replace(/\D/g, '') || '0') % 30));
  
  return (
    <div className="hi-modal-backdrop">
      <div className="hi-modal-profile-xl">
        <div className="profile-modal-header">
          <div className="profile-top-info">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.studentName || "Candidate")}&background=random&color=fff`} className="profile-hero-img" alt="c" />
            <div className="profile-main-meta">
              <h2>{candidate.studentName}</h2>
              <p>{candidate.role} Applicant • {candidate.edu}</p>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                background: atsVal >= 80 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                color: atsVal >= 80 ? '#10b981' : '#f59e0b',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '800',
                marginTop: '6px',
                width: 'fit-content'
              }}>
                ATS Score: {atsVal}% Match
              </span>
            </div>
          </div>
          <button className="close-x" onClick={onClose}>×</button>
        </div>
        <div className="profile-tabs-nav">{["Overview", "Experience", "Projects", "Resume"].map(t=><button key={t} className={activeTab===t?'active':''} onClick={()=>setActiveTab(t)}>{t}</button>)}</div>
        <div className="profile-modal-body scrollable">
          {activeTab === "Overview" && (
            <div className="profile-overview-tab">
              <h3>About Me</h3>
              <p>{candidate.bio || "No summary provided."}</p>
              <h3>Skills</h3>
              <div className="skill-tags-full">
                {candidate.skills?.map(s=><span key={s} style={{ background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', marginRight: '6px', display: 'inline-block', marginBottom: '6px' }}>{s}</span>) || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>None declared</span>}
              </div>
            </div>
          )}
          {activeTab === "Experience" && (
            <div className="profile-experience-tab">
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h4>Technical Intern</h4>
                  <span>Acme Software Development Team • 2025</span>
                  <p>Cooperated on interactive dashboard structures and state-management components.</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === "Projects" && (
            <div className="profile-overview-tab">
              <h3>Projects</h3>
              {candidate.projects?.map((proj, idx) => (
                <div key={idx} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
                  <strong style={{ display: 'block', color: '#0f172a', fontSize: '14px' }}>{proj.name}</strong>
                  <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginTop: '2px' }}>{proj.description}</span>
                </div>
              )) || <p style={{ fontStyle: 'italic', color: '#94a3b8' }}>No project list provided.</p>}
            </div>
          )}
          {activeTab === "Resume" && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <FaFileAlt size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
              <p style={{ fontWeight: '700', margin: '0 0 6px 0', fontSize: '15px' }}>{candidate.studentName}_Resume.pdf</p>
              <span style={{ fontSize: '12.5px', color: '#64748b', display: 'block', marginBottom: '20px' }}>PDF Document • 1.2 MB</span>
              <button className="primary-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}><FaDownload /> Download Resume</button>
            </div>
          )}
        </div>
        <div className="profile-modal-footer">
          <button className="btn-reject" onClick={()=>onStatusUpdate(candidate.id, "Rejected")}>Reject Candidate</button>
          <div>
            <button className="btn-secondary-h" onClick={onClose}>Close</button>
            <button className="btn-primary-h" onClick={()=>onStatusUpdate(candidate.id, "Shortlisted")} style={{ background: '#8b5cf6', color: '#fff', border: 'none' }}>Shortlist Candidate</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InterviewSchedulerModal({ candidate, onClose, onSchedule }) {
  const [form, setForm] = useState({ date: "", time: "", location: "At Company Office" });
  return (
    <div className="hi-modal-backdrop">
      <div className="hi-modal-scheduler">
        <div className="modal-header">
          <div className="modal-title-box"><FaCalendarAlt className="header-icon" /><div><h2>Schedule Interview</h2><p>For {candidate.studentName}</p></div></div>
          <button className="close-x" onClick={onClose}>×</button>
        </div>
        <form className="modal-body-pro" onSubmit={e=>{e.preventDefault(); onSchedule({interviewDate: form.date, interviewTime: form.time, interviewLocation: form.location})}}>
          <div className="form-group"><label>Select Date</label><input type="date" required value={form.date} onChange={e=>setForm({...form, date: e.target.value})} /></div>
          <div className="form-group"><label>Select Time</label><input type="time" required value={form.time} onChange={e=>setForm({...form, time: e.target.value})} /></div>
          <div className="form-group"><label>Interview Location</label><select value={form.location} onChange={e=>setForm({...form, location: e.target.value})}><option>At Company Office</option><option>At College Campus</option></select></div>
          <div className="modal-footer-pro"><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button><button type="submit" className="btn-primary-pro" style={{ background: '#8b5cf6' }}>Confirm Schedule</button></div>
        </form>
      </div>
    </div>
  );
}

function JobComposer({ onClose, onSubmit }) {
  const [form, setForm] = useState({ role: "", location: "", salary: "", type: "Full-time", formLink: "", banner: null });
  const [preview, setPreview] = useState(null);
  
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setForm({...form, banner: reader.result}); setPreview(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, padding: '20px' }}>
      <div style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'grid', placeItems: 'center', fontSize: '18px' }}>
              <FaBriefcase />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '850' }}>Create Job Posting</h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Enter the details to attract top talent.</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
        </div>
        
        <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Job Role *</label>
              <input required value={form.role} onChange={e=>setForm({...form,role:e.target.value})} placeholder="e.g. Senior Frontend Engineer" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} />
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="e.g. Remote, India" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Salary Package</label>
              <input value={form.salary} onChange={e=>setForm({...form,salary:e.target.value})} placeholder="e.g. ₹12LPA - ₹18LPA" style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }} />
            </div>
            <div className="form-group">
              <label>Employment Type</label>
              <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', backgroundColor: '#fff', cursor: 'pointer' }}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Application Form Link <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>(Optional)</span></label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRight: '1px solid #cbd5e1', color: '#64748b' }}><FaLink /></div>
              <input value={form.formLink} onChange={e=>setForm({...form,formLink:e.target.value})} placeholder="https://forms.gle/..." style={{ width: '100%', padding: '12px 14px', border: 'none', outline: 'none', fontSize: '14px' }} />
            </div>
          </div>
          
          <div className="form-group">
            <label>Job Banner Image</label>
            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: preview ? '8px' : '32px', textAlign: 'center', backgroundColor: '#f8fafc', transition: 'all 0.2s' }}>
              {preview ? (
                <div style={{ position: 'relative' }}>
                  <img src={preview} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} alt="Preview" />
                  <label style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(15, 23, 42, 0.7)', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Change <input type="file" hidden onChange={handleImage} />
                  </label>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#64748b' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#475569' }}><FaUpload /></div>
                  <div><strong style={{ color: '#8b5cf6' }}>Click to upload</strong> or drag banner</div>
                  <div style={{ fontSize: '12px' }}>PNG or JPG (max. 800x400px)</div>
                  <input type="file" hidden onChange={handleImage} />
                </label>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px' }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#8b5cf6', color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)', fontSize: '13.5px' }}>Publish Job</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const industryTypes = [
  "Information Technology",
  "Finance & Banking",
  "Healthcare",
  "Manufacturing",
  "E-commerce",
  "Education",
  "Consulting",
  "Other"
];

const companySizes = [
  "1-50 Employees",
  "51-200 Employees",
  "201-500 Employees",
  "501-1000 Employees",
  "1000+ Employees"
];

function RecruiterSettingsView({ user }) {
  const [profileForm, setProfileForm] = useState({
    name: user?.fullName || user?.name || "Recruiter User",
    designation: "Senior Talent Acquisition",
    email: user?.email || "recruiter@acmecorp.com",
    phone: user?.phone || "+91 98765 43210"
  });

  const [companyForm, setCompanyForm] = useState({
    name: user?.company || "Acme Corp",
    website: "https://acmecorp.com",
    industry: "Information Technology",
    size: "201-500 Employees",
    description: "Leading enterprise cloud software provider."
  });

  const [notifications, setNotifications] = useState({
    emailNotif: true,
    matchingAlerts: true,
    marketingEmails: false,
    securityLogs: true
  });

  const [toast, setToast] = useState("");

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    getRecruiterProfile().then(prof => {
      if (prof) {
        setProfileForm(prev => ({
          ...prev,
          name: prof.full_name || prev.name,
          designation: prof.designation || prev.designation,
          email: prof.email || prev.email,
          phone: prof.phone || prev.phone
        }));
        setCompanyForm(prev => ({
          ...prev,
          name: prof.company_name || prev.name,
          website: prof.company_website || prev.website,
          industry: prof.company_industry || prev.industry,
          size: prof.company_size || prev.size,
          description: prof.company_description || prev.description
        }));
      }
    }).catch(err => console.error("[DB Sync] Load recruiter profile failed:", err));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = getStoredToken();
    if (token) {
      try {
        await updateRecruiterProfile({
          full_name: profileForm.name,
          designation: profileForm.designation,
          phone: profileForm.phone
        });
      } catch (err) {
        console.error("[DB Sync] Save recruiter profile failed:", err);
      }
    }
    setToast("Profile settings saved successfully.");
    setTimeout(() => setToast(""), 3000);
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    const token = getStoredToken();
    if (token) {
      try {
        await updateRecruiterProfile({
          company_name: companyForm.name,
          company_website: companyForm.website,
          company_industry: companyForm.industry,
          company_size: companyForm.size,
          company_description: companyForm.description
        });
      } catch (err) {
        console.error("[DB Sync] Save company profile failed:", err);
      }
    }
    setToast("Company settings saved successfully.");
    setTimeout(() => setToast(""), 3000);
  };


  const handleToggle = (key) => {
    setNotifications(prev => {
      const next = { ...prev, [key]: !prev[key] };
      setToast("Notification preferences updated.");
      setTimeout(() => setToast(""), 2000);
      return next;
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      {toast && <div className="hi-toast-message">{toast}</div>}
      
      <div className="hi-charts-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Profile Settings */}
        <div className="hi-panel" style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div className="hi-panel-header" style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '850', color: '#0f172a' }}>Recruiter Profile</h3>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Manage your account credentials.</p>
          </div>
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input type="text" value={profileForm.designation} onChange={e => setProfileForm({...profileForm, designation: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={profileForm.email} disabled style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#64748b', fontSize: '14px', cursor: 'not-allowed' }} />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input type="text" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
            </div>
            <button type="submit" className="primary-button" style={{ width: 'fit-content', padding: '10px 20px', borderRadius: '8px', background: '#8b5cf6', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', fontSize: '13.5px' }}>Save Profile</button>
          </form>
        </div>

        {/* Company Settings */}
        <div className="hi-panel" style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div className="hi-panel-header" style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '850', color: '#0f172a' }}>Organization Details</h3>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Edit information for your organization.</p>
          </div>
          <form onSubmit={handleSaveCompany} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
            </div>
            <div className="form-group">
              <label>Website URL</label>
              <input type="text" value={companyForm.website} onChange={e => setCompanyForm({...companyForm, website: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
            </div>
            <div className="form-grid" style={{ gap: '16px' }}>
              <div className="form-group">
                <label>Industry</label>
                <select value={companyForm.industry} onChange={e => setCompanyForm({...companyForm, industry: e.target.value})} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                  {industryTypes.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div className="form-group" style={{marginTop: '10px'}}>
                <label>Size</label>
                <select value={companyForm.size} onChange={e => setCompanyForm({...companyForm, size: e.target.value})} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                  {companySizes.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={companyForm.description} onChange={e => setCompanyForm({...companyForm, description: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'none', height: '62px', fontFamily: 'inherit' }} />
            </div>
            <button type="submit" className="primary-button" style={{ width: 'fit-content', padding: '10px 20px', borderRadius: '8px', background: '#8b5cf6', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', fontSize: '13.5px' }}>Save Organization</button>
          </form>
        </div>
      </div>

      {/* Notification Preferences Toggle Switches */}
      <div className="hi-panel" style={{ padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <div className="hi-panel-header" style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '850', color: '#0f172a' }}>Preferences</h3>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Configure communication channels and system notification alerts.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', fontWeight: '750' }}>Email Notifications</strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Receive updates for candidate applications and pipeline stages.</span>
            </div>
            <label className="switch-container">
              <input type="checkbox" className="switch-input" checked={notifications.emailNotif} onChange={() => handleToggle('emailNotif')} />
              <div className="switch-slider"></div>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', fontWeight: '750' }}>AI Matching Alerts</strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Get instant alerts when candidate scores exceed matching thresholds.</span>
            </div>
            <label className="switch-container">
              <input type="checkbox" className="switch-input" checked={notifications.matchingAlerts} onChange={() => handleToggle('matchingAlerts')} />
              <div className="switch-slider"></div>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', fontWeight: '750' }}>Drive cycle announcements</strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Receive notifications regarding calendar changes or drive event notes.</span>
            </div>
            <label className="switch-container">
              <input type="checkbox" className="switch-input" checked={notifications.marketingEmails} onChange={() => handleToggle('marketingEmails')} />
              <div className="switch-slider"></div>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', fontWeight: '750' }}>Security Log Alerts</strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Send alerts when there is a login from a new device or IP address.</span>
            </div>
            <label className="switch-container">
              <input type="checkbox" className="switch-input" checked={notifications.securityLogs} onChange={() => handleToggle('securityLogs')} />
              <div className="switch-slider"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecruiterDashboard;
