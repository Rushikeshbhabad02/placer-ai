import { useMemo, useState, useEffect } from "react";
import {
  LuLayoutDashboard,
  LuUsers,
  LuBuilding2,
  LuBriefcase,
  LuClipboardList,
  LuSquareCheck,
  LuBell,
  LuTrendingUp,
  LuSettings,
  LuSearch,
  LuLogOut,
  LuCalendar,
  LuArrowUpRight,
  LuUserCheck,
  LuDownload,
  LuEye,
  LuDollarSign,
  LuInfo,
  LuGraduationCap,
  LuFileText,
  LuMapPin,
  LuPercent,
  LuActivity,
  LuTrash2,
  LuCircleCheck,
  LuCircleX,
  LuPlus,
  LuSquarePen,
  LuChevronDown,
  LuBookOpen,
  LuFileSignature,
  LuAward,
  LuHeart,
  LuMenu,
  LuChevronLeft,
  LuChevronRight
} from "react-icons/lu";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { safeGetItem } from "../utils/storage";
import { getCompanyLogo, normalizeJobImages, sanitizeProfilePhoto } from "../utils/images";
import { getAdminDashboard, getUsers, updateUserStatus } from "../services/adminService";
import "./dashboard.css";

// Seed Datasets for Cohesive Experience
const defaultStudentSeed = [
  {
    id: "student-1",
    name: "Rahul Kumar",
    email: "student@placer.ai",
    phone: "9876543210",
    role: "student",
    status: "Approved",
    placementStatus: "Unplaced",
    college: "D.Y. Patil Institute",
    university: "Savitribai Phule Pune University",
    rollNumber: "PRN-987654",
    branch: "Computer Engineering",
    year: "Final Year",
    passingYear: "2026",
    cgpa: "9.5",
    backlogs: "0",
    skills: ["React", "JavaScript", "SQL", "DSA"],
    about: "Ambitious Frontend Developer with a focus on React.js, responsive layouts, and interactive visual elements.",
    projects: [
      { name: "Placer-AI Dashboard", description: "Interactive recruitment platform build for placement officer portals." },
      { name: "Algorithm Visualizer", description: "Visual guide showing step-by-step sorting logic using HTML/JS." }
    ],
    education: [
      { school: "D.Y. Patil Institute", degree: "B.E. Computer Engineering", grade: "9.5 CGPA", startYear: "2022", endYear: "2026" }
    ],
    linkedin: "https://linkedin.com/in/rahulkumar",
    github: "https://github.com/rahulkumar",
    resume: "rahul_resume.pdf",
    atsScore: 82
  },
  {
    id: "student-2",
    name: "Sneha Patil",
    email: "sneha@placer.ai",
    phone: "9823456789",
    role: "student",
    status: "Approved",
    placementStatus: "Placed",
    college: "D.Y. Patil Institute",
    university: "Savitribai Phule Pune University",
    rollNumber: "PRN-982345",
    branch: "Information Technology",
    year: "Final Year",
    passingYear: "2026",
    cgpa: "8.9",
    backlogs: "0",
    skills: ["Figma", "UI/UX", "Adobe XD", "CSS"],
    about: "Creative UI/UX Designer dedicated to crafting accessible, sleek, and intuitive digital interfaces.",
    projects: [
      { name: "Health Tracker App", description: "Mobile prototype for step and calorie counting with premium widgets." }
    ],
    education: [
      { school: "D.Y. Patil Institute", degree: "B.E. Information Technology", grade: "8.9 CGPA", startYear: "2022", endYear: "2026" }
    ],
    linkedin: "https://linkedin.com/in/snehapatil",
    github: "https://github.com/snehapatil",
    resume: "sneha_resume.pdf",
    atsScore: 78
  },
  {
    id: "student-3",
    name: "Amit Verma",
    email: "amit@placer.ai",
    phone: "9123456780",
    role: "student",
    status: "Approved",
    placementStatus: "Placed",
    college: "D.Y. Patil Institute",
    university: "Savitribai Phule Pune University",
    rollNumber: "PRN-912345",
    branch: "Data Science",
    year: "Final Year",
    passingYear: "2026",
    cgpa: "9.2",
    backlogs: "0",
    skills: ["Python", "SQL", "Tableau", "Machine Learning"],
    about: "Data Analyst and Machine Learning enthusiast focused on statistics and customer segmentation analysis.",
    projects: [
      { name: "Customer Churn Model", description: "Predicting subscriber churn rates using random forest classifiers." }
    ],
    education: [
      { school: "D.Y. Patil Institute", degree: "B.E. Data Science", grade: "9.2 CGPA", startYear: "2022", endYear: "2026" }
    ],
    linkedin: "https://linkedin.com/in/amitverma",
    github: "https://github.com/amitverma",
    resume: "amit_resume.pdf",
    atsScore: 88
  },
  {
    id: "student-4",
    name: "Priya Deore",
    email: "priya@placer.ai",
    phone: "9345678901",
    role: "student",
    status: "Pending",
    placementStatus: "Unplaced",
    college: "D.Y. Patil Institute",
    university: "Savitribai Phule Pune University",
    rollNumber: "PRN-934567",
    branch: "Computer Engineering",
    year: "Third Year",
    passingYear: "2027",
    cgpa: "7.8",
    backlogs: "1",
    skills: ["Java", "C++", "DSA"],
    about: "Aspiring Backend Developer with a deep interest in data structures, algorithms, and microservices.",
    projects: [],
    education: [
      { school: "D.Y. Patil Institute", degree: "B.E. Computer Engineering", grade: "7.8 CGPA", startYear: "2023", endYear: "2027" }
    ],
    linkedin: "https://linkedin.com/in/priyadeore",
    github: "https://github.com/priyadeore",
    resume: "",
    atsScore: 65
  }
];

const defaultRecruiterSeed = [
  {
    id: "recruiter-1",
    name: "Kartik Ahire",
    email: "recruiter@google.com",
    role: "recruiter",
    company: "Google India",
    status: "Approved",
    createdAt: "5/10/2026"
  },
  {
    id: "recruiter-2",
    name: "Siddhesh Mane",
    email: "recruiter@microsoft.com",
    role: "recruiter",
    company: "Microsoft India",
    status: "Pending",
    createdAt: "6/20/2026"
  },
  {
    id: "recruiter-3",
    name: "Nikhil Joshi",
    email: "recruiter@tcs.com",
    role: "recruiter",
    company: "Tata Consultancy Services",
    status: "Approved",
    createdAt: "5/01/2026"
  }
];

const seedJobs = [
  {
    id: "JOB-1",
    company: "Tata Consultancy Services",
    companyShort: "TCS",
    logo: getCompanyLogo("Tata Consultancy Services"),
    role: "Frontend Developer",
    package: "4.2 LPA",
    location: "Pune, India",
    match: 86,
    status: "Active",
    type: "Full Time",
    skills: ["React", "JavaScript", "CSS"],
    applicants: 12
  },
  {
    id: "JOB-2",
    company: "Infosys Limited",
    companyShort: "Infosys",
    logo: getCompanyLogo("Infosys Limited"),
    role: "Software Engineer Trainee",
    package: "3.8 LPA",
    location: "Bengaluru, India",
    match: 78,
    status: "Active",
    type: "Full Time",
    skills: ["Java", "SQL", "DSA"],
    applicants: 8
  },
  {
    id: "JOB-3",
    company: "Wipro Technologies",
    companyShort: "Wipro",
    logo: getCompanyLogo("Wipro Technologies"),
    role: "Full Stack Intern",
    package: "5.0 LPA",
    location: "Hyderabad, India",
    match: 72,
    status: "Active",
    type: "Internship",
    skills: ["Node.js", "React", "MongoDB"],
    applicants: 5
  },
  {
    id: "JOB-4",
    company: "Capgemini",
    companyShort: "Capgemini",
    logo: getCompanyLogo("Capgemini"),
    role: "Data Analyst",
    package: "4.5 LPA",
    location: "Mumbai, India",
    match: 69,
    status: "Active",
    type: "Full Time",
    skills: ["Python", "Excel", "Power BI"],
    applicants: 4
  },
  {
    id: "JOB-5",
    company: "Amazon",
    companyShort: "Amazon",
    logo: getCompanyLogo("Amazon"),
    role: "SDE Intern",
    package: "6.0 LPA",
    location: "Bangalore, India",
    match: 81,
    status: "Active",
    type: "Internship",
    skills: ["Java", "C++", "DSA", "System Design"],
    applicants: 16
  }
];

const seedApplications = [
  { company: "Tata Consultancy Services", companyShort: "TCS", logo: getCompanyLogo("Tata Consultancy Services"), role: "Frontend Developer", stage: "Online Test", date: "24 Apr", status: "Applied" },
  { company: "Infosys Limited", companyShort: "Infosys", logo: getCompanyLogo("Infosys Limited"), role: "Software Engineer Trainee", stage: "Technical Interview", date: "26 Apr", status: "Shortlisted" },
  { company: "Accenture", companyShort: "Accenture", logo: getCompanyLogo("Accenture"), role: "Associate Engineer", stage: "Resume Review", date: "28 Apr", status: "Pending" },
  { company: "Tech Mahindra", companyShort: "TechM", logo: getCompanyLogo("Tech Mahindra"), role: "Graduate Trainee", stage: "Final Result", date: "30 Apr", status: "Rejected" }
];

const defaultMentorApprovals = [
  {
    id: "ap-1",
    studentName: "Rahul Kumar",
    studentEmail: "student@placer.ai",
    type: "Internship NOC",
    description: "Requesting NOC for Microsoft Full Stack Internship from July to Dec 2026.",
    date: "June 20, 2026",
    status: "Pending",
    details: "Requires validation of offer letter and academic clearance."
  },
  {
    id: "ap-2",
    studentName: "Sneha Patil",
    studentEmail: "sneha@placer.ai",
    type: "Certification Approval",
    description: "Approval for Google UX Design Professional Certificate verification.",
    date: "June 21, 2026",
    status: "Pending",
    details: "Certificate link: https://coursera.org/verify/uxdesign123"
  }
];

const defaultActivitySeed = [
  { text: "New Student Rahul Kumar registered on the portal.", time: "10 mins ago" },
  { text: "Google recruiter Kartik Ahire posted a SDE Intern job.", time: "1 hour ago" },
  { text: "Placement NOC request generated for Sneha Patil.", time: "2 hours ago" },
  { text: "Microsoft recruiter registration verified by placement team.", time: "4 hours ago" }
];

function AdminDashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState("Dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dbStats, setDbStats] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchBackendAdminData = async () => {
      try {
        const [statsData, usersData] = await Promise.allSettled([
          getAdminDashboard(),
          getUsers()
        ]);

        if (isMounted && statsData.status === "fulfilled" && statsData.value) {
          setDbStats(statsData.value);
        }

        if (isMounted && usersData.status === "fulfilled" && Array.isArray(usersData.value) && usersData.value.length > 0) {
          const backendUsers = usersData.value.map(u => ({
            id: u.id,
            user_id: u.id,
            name: u.full_name,
            email: u.email,
            phone: u.phone || "",
            role: u.role,
            status: u.is_active ? "Approved" : "Deactivated",
            is_active: u.is_active,
            createdAt: u.created_at
          }));
          setUsers(prev => {
            // Merge backend users with local state without duplicating
            const merged = [...backendUsers];
            prev.forEach(item => {
              if (!merged.some(m => String(m.id) === String(item.id) || m.email === item.email)) {
                merged.push(item);
              }
            });
            return merged;
          });
        }
      } catch (err) {
        console.warn("Backend sync notice:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchBackendAdminData();
    return () => { isMounted = false; };
  }, []);

  // Data States
  const [users, setUsers] = useState(() => {
    const saved = safeGetItem("placer_users", []);
    let combined = [...saved];

    defaultStudentSeed.forEach(student => {
      if (!combined.some(u => u.email && u.email.toLowerCase() === student.email.toLowerCase())) {
        combined.push(student);
      }
    });

    defaultRecruiterSeed.forEach(rec => {
      if (!combined.some(u => u.email && u.email.toLowerCase() === rec.email.toLowerCase())) {
        combined.push(rec);
      }
    });

    if (!combined.some(u => u.role === "admin")) {
      combined.push({
        id: "admin-123",
        name: "Placement Director",
        email: "admin@placer.ai",
        password: "password123",
        role: "admin",
        status: "Approved"
      });
    }

    return combined;
  });

  const [jobs, setJobs] = useState(() => {
    const saved = safeGetItem("placer_jobs", []);
    if (saved && saved.length > 0) return saved.map(normalizeJobImages);
    return seedJobs.map(normalizeJobImages);
  });

  const [applications, setApplications] = useState(() => {
    const saved = safeGetItem("placer_applications", []);
    const initialApps = saved && saved.length > 0 ? saved : seedApplications;
    return initialApps.map((app, idx) => ({
      id: app.id || `app-${idx}-${Date.now()}`,
      studentName: app.studentName || (app.email === "student@placer.ai" ? "Rahul Kumar" : "Sneha Patil"),
      studentEmail: app.studentEmail || "student@placer.ai",
      company: app.company,
      companyShort: app.companyShort || app.company,
      role: app.role,
      stage: app.stage || "Resume Review",
      date: app.date || "May 17, 2026",
      status: app.status || "Applied",
      match: app.match || 82,
      appliedOn: app.appliedOn || "May 17, 2026"
    }));
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = safeGetItem("placer_notifications", []);
    if (saved && saved.length > 0) return saved;
    return [
      { id: "n-1", sender: "Microsoft Careers", message: "Verification request pending for recruiter portal registration.", read: false, createdAt: "2 hours ago" },
      { id: "n-2", sender: "Rahul Kumar", message: "Applied for Frontend Developer SDE role at TCS.", read: false, createdAt: "3 hours ago" },
      { id: "n-3", sender: "System", message: "Database synchronization completed successfully.", read: true, createdAt: "Yesterday" }
    ];
  });

  const [approvals, setApprovals] = useState(() => {
    const saved = safeGetItem("placer_approvals", []);
    if (saved && saved.length > 0) return saved;
    return defaultMentorApprovals;
  });

  const [settings, setSettings] = useState(() => safeGetItem("placer_settings", {
    collegeName: "D.Y. Patil Institute",
    academicYear: "2025-2026",
    placementSeason: "Active",
    recruiterVerificationRequired: true,
    emailNotifications: true,
    smsAlerts: false,
    maintenanceMode: false
  }));

  const [activityFeed, setActivityFeed] = useState(() => safeGetItem("placer_activities", defaultActivitySeed));

  // Toggles
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Modal selections
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [schedulingInterview, setSchedulingInterview] = useState(null);
  const [jobComposer, setJobComposer] = useState(null); // { mode: 'create'|'edit', data }
  const [studentComposer, setStudentComposer] = useState(null); // { mode: 'create'|'edit', data }
  const [recruiterComposer, setRecruiterComposer] = useState(null); // { mode: 'create'|'edit', data }

  // Sync state to localstorage
  useEffect(() => { localStorage.setItem("placer_users", JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem("placer_jobs", JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem("placer_applications", JSON.stringify(applications)); }, [applications]);
  useEffect(() => { localStorage.setItem("placer_notifications", JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem("placer_approvals", JSON.stringify(approvals)); }, [approvals]);
  useEffect(() => { localStorage.setItem("placer_settings", JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem("placer_activities", JSON.stringify(activityFeed)); }, [activityFeed]);

  // Handlers
  const pushToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const pushActivity = (text) => {
    const newAct = { text, time: "Just now" };
    setActivityFeed(prev => [newAct, ...prev.slice(0, 8)]);
  };

  const handleQuickAction = (action) => {
    if (action === "add_recruiter") {
      setActiveView("Recruiters");
      pushToast("Navigate to Recruiters tab to verify or manage recruiter signups.");
    } else if (action === "post_job") {
      setActiveView("Jobs & Internships");
      setJobComposer({ mode: 'create', data: { type: "Full Time" } });
    } else if (action === "create_internship") {
      setActiveView("Jobs & Internships");
      setJobComposer({ mode: 'create', data: { type: "Internship" } });
    } else if (action === "send_notif") {
      const msg = window.prompt("Enter public broadcast notification message:");
      if (msg) {
        const newNotif = {
          id: `n-${Date.now()}`,
          sender: "Placement Cell Admin",
          message: msg,
          read: false,
          createdAt: "Just now"
        };
        setNotifications(prev => [newNotif, ...prev]);
        pushToast("Broadcast notification sent successfully.");
        pushActivity(`Admin broadcasted notification: "${msg.slice(0, 35)}..."`);
      }
    } else if (action === "verify_recruiter") {
      setActiveView("Recruiters");
      pushToast("Approve pending verification requests from Recruiters list.");
    }
  };

  const handleVerifyRecruiter = (id, action) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: action === "verify" ? "Approved" : "Rejected" } : u));
    const target = users.find(u => u.id === id);
    pushToast(action === "verify" ? `Verified Recruiter: ${target.name}` : `Rejected Recruiter: ${target.name}`);
    pushActivity(`${target.name} verification status updated to ${action === "verify" ? "Approved" : "Rejected"}.`);
  };

  const handleUpdateApplicationStatus = (id, nextStatus) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: nextStatus } : a));
    const app = applications.find(a => a.id === id);
    pushToast(`Application for ${app.studentName} updated to ${nextStatus}`);
    pushActivity(`${app.studentName}'s application for ${app.company} updated to ${nextStatus}.`);
  };

  const handleScheduleInterviewSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const date = data.get("date");
    const time = data.get("time");
    const location = data.get("location");

    setApplications(prev => prev.map(a => a.id === schedulingInterview.id ? { 
      ...a, 
      status: "Interview Scheduled", 
      stage: "Technical Interview",
      interviewDate: date,
      interviewTime: time,
      interviewLocation: location
    } : a));

    // Notify student
    const notif = {
      id: `n-${Date.now()}`,
      sender: "Placement Cell",
      message: `Your interview for ${schedulingInterview.role} at ${schedulingInterview.company} is scheduled on ${date} at ${time}. Location: ${location}`,
      read: false,
      createdAt: "Just now"
    };
    setNotifications(prev => [notif, ...prev]);

    pushToast(`Interview scheduled for ${schedulingInterview.studentName}`);
    pushActivity(`Interview scheduled for ${schedulingInterview.studentName} at ${schedulingInterview.company}.`);
    setSchedulingInterview(null);
  };

  const handleMentorAction = (id, action, feedback) => {
    setApprovals(prev => prev.map(ap => ap.id === id ? { ...ap, status: action === "approve" ? "Approved" : "Rejected", feedback } : ap));
    const item = approvals.find(ap => ap.id === id);
    pushToast(`${item.type} request ${action === "approve" ? "Approved" : "Rejected"}`);
    pushActivity(`${item.studentName}'s request for ${item.type} was ${action === "approve" ? "Approved" : "Rejected"}.`);
  };

  const handleSaveJobComposer = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const role = data.get("role");
    const company = data.get("company");
    const location = data.get("location");
    const salary = data.get("salary");
    const type = data.get("type");
    const skillsString = data.get("skills");
    const skills = skillsString.split(",").map(s => s.trim()).filter(Boolean);

    if (jobComposer.mode === "create") {
      const newJob = normalizeJobImages({
        id: `JOB-${Date.now()}`,
        company,
        companyShort: company,
        role,
        package: salary,
        location,
        type,
        skills,
        status: "Active",
        match: 80,
        applicants: 0
      });
      setJobs(prev => [newJob, ...prev]);
      pushToast("New job posted successfully!");
      pushActivity(`Placement Cell posted SDE role: ${role} at ${company}.`);
    } else {
      setJobs(prev => prev.map(j => j.id === jobComposer.data.id ? normalizeJobImages({
        ...j,
        role,
        company,
        location,
        package: salary,
        type,
        skills
      }) : j));
      pushToast("Job posting updated.");
    }
    setJobComposer(null);
  };

  const handleDeleteJob = (id) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      const job = jobs.find(j => j.id === id);
      setJobs(prev => prev.filter(j => j.id !== id));
      pushToast("Job posting deleted.");
      pushActivity(`Placement Cell deleted job posting for ${job.role} at ${job.company}.`);
    }
  };

  const handleStudentStatusChange = async (id, field, value) => {
    const isNumericId = typeof id === "number" || (!isNaN(id) && !String(id).includes("-"));
    if (isNumericId && (field === "status" || field === "is_active")) {
      const newActiveState = value === "Approved" || value === true || value === "Active";
      try {
        await updateUserStatus(id, newActiveState);
      } catch (err) {
        pushToast(err.message || "Failed to sync status update with backend");
      }
    }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, [field]: value, is_active: value === "Approved" || value === true || value === "Active" } : u));
    const targetUser = users.find(u => u.id === id);
    pushToast(`Updated status for user: ${targetUser?.name || id}`);
  };

  const handleSaveStudentComposer = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const name = data.get("name");
    const email = data.get("email");
    const phone = data.get("phone");
    const rollNumber = data.get("rollNumber");
    const branch = data.get("branch");
    const year = data.get("year");
    const cgpa = data.get("cgpa");
    const skillsString = data.get("skills");
    const skills = skillsString.split(",").map(s => s.trim()).filter(Boolean);
    const about = data.get("about");
    const placementStatus = data.get("placementStatus") || "Unplaced";

    if (studentComposer.mode === "create") {
      const newStudent = {
        id: `student-${Date.now()}`,
        name,
        email,
        phone,
        rollNumber,
        branch,
        year,
        cgpa,
        skills,
        about,
        placementStatus,
        status: "Approved",
        role: "student",
        atsScore: 75,
        projects: [],
        education: [
          { school: settings.collegeName, degree: `B.E. ${branch}`, grade: `${cgpa} CGPA`, startYear: "2022", endYear: "2026" }
        ],
        resume: ""
      };
      setUsers(prev => [newStudent, ...prev]);
      pushToast("New student created successfully!");
      pushActivity(`Admin registered a new student: ${name}`);
    } else {
      setUsers(prev => prev.map(u => u.id === studentComposer.data.id ? {
        ...u,
        name,
        email,
        phone,
        rollNumber,
        branch,
        year,
        cgpa,
        skills,
        about,
        placementStatus
      } : u));
      pushToast("Student profile updated successfully!");
      pushActivity(`Admin updated student profile for: ${name}`);
    }
    setStudentComposer(null);
  };

  const handleSaveRecruiterComposer = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const name = data.get("name");
    const email = data.get("email");
    const company = data.get("company");
    const status = data.get("status") || "Approved";

    if (recruiterComposer.mode === "create") {
      const newRecruiter = {
        id: `recruiter-${Date.now()}`,
        name,
        email,
        company,
        role: "recruiter",
        status,
        createdAt: new Date().toLocaleDateString("en-US")
      };
      setUsers(prev => [newRecruiter, ...prev]);
      pushToast("New recruiter created successfully!");
      pushActivity(`Admin registered new recruiter: ${name} (${company})`);
    } else {
      setUsers(prev => prev.map(u => u.id === recruiterComposer.data.id ? {
        ...u,
        name,
        email,
        company,
        status
      } : u));
      pushToast("Recruiter details updated successfully!");
      pushActivity(`Admin updated recruiter details for: ${name}`);
    }
    setRecruiterComposer(null);
  };

  // Metrics Logic
  const metrics = useMemo(() => {
    const studentCount = users.filter(u => u.role === "student").length;
    const recruiterCount = users.filter(u => u.role === "recruiter").length;
    const activeJobs = jobs.filter(j => j.status === "Active").length;
    const appCount = applications.length;

    const placedCount = users.filter(u => u.role === "student" && u.placementStatus === "Placed").length;
    const placementRate = studentCount > 0 ? Math.round((placedCount / studentCount) * 100) : 85;

    const interviews = applications.filter(a => a.status === "Interview Scheduled" || a.stage === "Technical Interview").length;

    return {
      students: studentCount,
      recruiters: recruiterCount,
      jobs: activeJobs,
      apps: appCount,
      rate: placementRate,
      placements: placedCount,
      interviews
    };
  }, [users, jobs, applications]);

  // Filters search results across datasets
  const filteredStudentsList = useMemo(() => {
    return users.filter(u => {
      if (u.role !== "student") return false;
      const name = u.name || "";
      const email = u.email || "";
      const skills = Array.isArray(u.skills) ? u.skills : [];
      return (
        name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        email.toLowerCase().includes(globalSearch.toLowerCase()) ||
        skills.some(s => String(s || "").toLowerCase().includes(globalSearch.toLowerCase()))
      );
    });
  }, [users, globalSearch]);

  const sidebarGroups = [
    {
      group: null,
      items: [
        { id: "Dashboard", icon: <LuLayoutDashboard />, label: "Dashboard" }
      ]
    },
    {
      group: "Management",
      items: [
        { id: "Students", icon: <LuGraduationCap />, label: "Students" },
        { id: "Recruiters", icon: <LuBuilding2 />, label: "Recruiters" },
        { id: "Jobs & Internships", icon: <LuBriefcase />, label: "Jobs & Internships" },
        { id: "Applications", icon: <LuClipboardList />, label: "Applications" },
        { id: "Mentor Approvals", icon: <LuSquareCheck />, label: "Mentor Approvals" }
      ]
    },
    {
      group: "Analytics",
      items: [
        { id: "Placement Analytics", icon: <LuTrendingUp />, label: "Placement Analytics" }
      ]
    },
    {
      group: "Communication",
      items: [
        { id: "Notifications", icon: <LuBell />, label: "Notifications", count: notifications.filter(n => !n.read).length }
      ]
    },
    {
      group: "System",
      items: [
        { id: "Settings", icon: <LuSettings />, label: "Settings" }
      ]
    }
  ];

  return (
    <div className={`hi-admin-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${settings.maintenanceMode ? "maintenance-active" : ""}`}>
      {/* SIDEBAR NAVIGATION */}
      <aside className={`hi-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="hi-sidebar-brand">
          <div className="hi-brand-logo">
            <span style={{ fontSize: "16px", fontWeight: "900" }}>PA</span>
          </div>
          <div className="hi-brand-text-group">
            <span className="hi-brand-name">PLACER-AI</span>
            <span className="hi-brand-tagline">Admin Console</span>
          </div>
          <button 
            type="button" 
            className="hi-sidebar-toggle" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <LuChevronRight /> : <LuChevronLeft />}
          </button>
        </div>

        <nav className="hi-sidebar-nav" style={{ overflowY: "auto", flexGrow: 1, paddingBottom: "24px" }}>
          {sidebarGroups.map((g, idx) => (
            <div key={idx} className="sidebar-nav-group">
              {g.group && <span className="sidebar-group-header">{g.group}</span>}
              {g.items.map(item => (
                <button
                  key={item.id}
                  className={`hi-nav-item ${activeView === item.id ? "active" : ""}`}
                  onClick={() => {
                    setActiveView(item.id);
                    setGlobalSearch(""); // clear search on tab change
                  }}
                >
                  <span className="hi-nav-icon">{item.icon}</span>
                  <span className="hi-nav-label">{item.label}</span>
                  {item.count > 0 && <span className="hi-badge-pill">{item.count}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="hi-sidebar-user" onClick={onLogout} title="Sign Out">
          <div className="hi-user-avatar">
            <span className="avatar-letter">A</span>
          </div>
          <div className="hi-user-info">
            <strong>Placement Director</strong>
            <span>Sign Out</span>
          </div>
          <LuLogOut style={{ marginLeft: "auto", color: "#cbd5e1" }} />
        </div>
      </aside>

      {/* MAIN VIEW CONTROLLER */}
      <div className="hi-main-content">
        {/* TOP NAVBAR */}
        <header className="hi-header" style={{ padding: "0 24px", height: "72px" }}>
          <div className="hi-header-search" style={{ position: "relative" }}>
            <LuSearch />
            <input
              placeholder="Search across students, recruiters, jobs..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
          </div>

          <div className="hi-header-actions" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            {/* Quick Actions Dropdown */}
            <div style={{ position: "relative" }}>
              <button 
                className="primary-button compact-button" 
                type="button" 
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                onClick={() => {
                  setShowQuickActions(!showQuickActions);
                  setShowNotifications(false);
                  setShowUserMenu(false);
                }}
              >
                Quick Actions <LuChevronDown />
              </button>
              {showQuickActions && (
                <div className="hi-dropdown-menu" style={{ width: "200px", right: 0, position: "absolute", top: "calc(100% + 8px)" }}>
                  <button className="hi-dropdown-item" onClick={() => { setActiveView("Jobs & Internships"); setJobComposer({ mode: 'create', data: {} }); setShowQuickActions(false); }}><LuPlus /> Post New Job</button>
                  <button className="hi-dropdown-item" onClick={() => { setActiveView("Recruiters"); setShowQuickActions(false); }}><LuUserCheck /> Verify Recruiters</button>
                  <button className="hi-dropdown-item" onClick={() => { setActiveView("Applications"); setShowQuickActions(false); }}><LuCalendar /> Schedule Interview</button>
                  <button className="hi-dropdown-item" onClick={() => { setActiveView("Mentor Approvals"); setShowQuickActions(false); }}><LuSquareCheck /> View Approvals</button>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="hi-notification-wrapper" style={{ position: "relative" }}>
              <div 
                className={`hi-notification-btn ${showNotifications ? "active" : ""}`} 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowQuickActions(false);
                  setShowUserMenu(false);
                }}
              >
                <LuBell />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="hi-badge">{notifications.filter(n => !n.read).length}</span>
                )}
              </div>
              {showNotifications && (
                <div className="hi-dropdown-menu hi-notif-dropdown" style={{ right: 0, position: "absolute", width: "320px", top: "calc(100% + 8px)" }}>
                  <div className="hi-dropdown-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Notifications</span>
                    <button style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "11px", fontWeight: "700", cursor: "pointer" }} onClick={() => { setNotifications(prev => prev.map(n => ({...n, read: true}))); pushToast("All notifications marked as read"); }}>Mark all read</button>
                  </div>
                  <div className="hi-dropdown-body">
                    {notifications.map((item, index) => (
                      <div
                        className={`hi-notif-item ${!item.read ? "unread" : ""}`}
                        key={item.id || index}
                        onClick={() => {
                          setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
                          pushToast("Notification read");
                        }}
                      >
                        <strong>{item.sender}</strong>
                        <span>{item.message}</span>
                        <small style={{ color: "#94a3b8", display: "block", marginTop: "4px" }}>{item.createdAt}</small>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>All caught up!</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Pill */}
            <div className="hi-user-menu-wrapper" style={{ position: "relative" }}>
              <div className="hi-user-pill" onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
                setShowQuickActions(false);
              }}>
                <div className="hi-user-pill-avatar" style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "#fff" }}>PD</div>
                <div className="hi-user-pill-text">
                  <strong>Director</strong>
                  <span>Admin</span>
                </div>
                <LuChevronDown />
              </div>
              {showUserMenu && (
                <div className="hi-dropdown-menu hi-user-dropdown" style={{ right: 0, position: "absolute", top: "calc(100% + 8px)" }}>
                  <button className="hi-dropdown-item" onClick={() => { setActiveView("Settings"); setShowUserMenu(false); }}><LuSettings /> System Settings</button>
                  <div className="hi-dropdown-divider"></div>
                  <button className="hi-dropdown-item logout" onClick={onLogout}><LuLogOut /> Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* NOTIFICATION TOAST */}
        {toastMessage && (
          <div className="hi-toast-message" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <LuInfo />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* CONTAINER CONTENT */}
        <div className="hi-content-body" style={{ padding: "32px", overflowY: "auto" }}>
          {/* Section Welcome Banner */}
          <div className="hi-welcome-bar" style={{ marginBottom: "28px" }}>
            <div>
              <h2 style={{ fontSize: "28px", fontWeight: "900", color: "var(--ink)", margin: 0 }}>
                {activeView}
              </h2>
              <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "14px", fontWeight: "500" }}>
                Managing {settings.collegeName} placement and recruiter connections.
              </p>
            </div>
            <div className="hi-date-picker" style={{ gap: "8px" }}>
              <span>{new Date().toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <LuCalendar />
            </div>
          </div>

          {/* VIEW SWAP LOGIC */}
          {activeView === "Dashboard" && (
            <DashboardHomeView 
              metrics={metrics} 
              applications={applications} 
              jobs={jobs} 
              users={users} 
              activityFeed={activityFeed}
              onViewAppStatus={handleUpdateApplicationStatus}
              onNavigateView={setActiveView}
              onQuickAction={handleQuickAction}
              isLoading={isLoading}
            />
          )}

          {activeView === "Students" && (
            <StudentsListView 
              users={users} 
              searchTerm={globalSearch} 
              onViewStudent={setSelectedStudent}
              onStatusChange={handleStudentStatusChange}
              onAddStudent={() => setStudentComposer({ mode: 'create', data: {} })}
              onEditStudent={(student) => setStudentComposer({ mode: 'edit', data: student })}
              onDeleteStudent={(id) => {
                if (window.confirm("Permanently delete this student account?")) {
                  setUsers(prev => prev.filter(u => u.id !== id));
                  pushToast("Student deleted.");
                }
              }}
            />
          )}

          {activeView === "Recruiters" && (
            <RecruitersManagementView 
              users={users} 
              jobs={jobs}
              searchTerm={globalSearch}
              onVerify={handleVerifyRecruiter}
              onAddRecruiter={() => setRecruiterComposer({ mode: 'create', data: {} })}
              onEditRecruiter={(recruiter) => setRecruiterComposer({ mode: 'edit', data: recruiter })}
              onDeleteRecruiter={(id) => {
                if (window.confirm("Remove recruiter account?")) {
                  setUsers(prev => prev.filter(u => u.id !== id));
                  pushToast("Recruiter removed.");
                }
              }}
            />
          )}

          {activeView === "Jobs & Internships" && (
            <JobsManagementView 
              jobs={jobs} 
              searchTerm={globalSearch} 
              onEditJob={(job) => setJobComposer({ mode: 'edit', data: job })}
              onDeleteJob={handleDeleteJob}
              onAddJob={() => setJobComposer({ mode: 'create', data: {} })}
              onViewApplicants={setSelectedJob}
            />
          )}

          {activeView === "Applications" && (
            <ApplicationsListView 
              applications={applications} 
              searchTerm={globalSearch}
              onStatusChange={handleUpdateApplicationStatus}
              onSchedule={setSchedulingInterview}
            />
          )}

          {activeView === "Mentor Approvals" && (
            <MentorApprovalsView 
              approvals={approvals} 
              searchTerm={globalSearch}
              onAction={handleMentorAction}
            />
          )}

          {activeView === "Notifications" && (
            <NotificationsListView 
              notifications={notifications} 
              searchTerm={globalSearch}
              onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))}
              onClearAll={() => { setNotifications([]); pushToast("Notifications cleared."); }}
              onDeleteNotification={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
            />
          )}

          {activeView === "Placement Analytics" && (
            <PlacementAnalyticsView 
              users={users} 
              applications={applications} 
              jobs={jobs}
              isLoading={isLoading}
            />
          )}

          {activeView === "Settings" && (
            <SettingsView 
              settings={settings} 
              onSave={setSettings} 
              pushToast={pushToast}
            />
          )}
        </div>
      </div>

      {/* MODALS */}
      {selectedStudent && (
        <StudentProfileModal 
          student={users.find(u => u.id === selectedStudent.id) || selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
          onDeleteResume={(id) => {
            setUsers(prev => prev.map(u => u.id === id ? { ...u, resume: "" } : u));
            pushToast("Resume deleted successfully");
          }}
          onUploadResume={(id, fileName) => {
            setUsers(prev => prev.map(u => u.id === id ? { ...u, resume: fileName || "resume.pdf" } : u));
            pushToast("Resume uploaded successfully");
          }}
        />
      )}

      {selectedJob && (
        <ViewApplicantsModal 
          job={selectedJob} 
          applications={applications}
          onClose={() => setSelectedJob(null)}
          onViewStudent={setSelectedStudent}
        />
      )}

      {schedulingInterview && (
        <InterviewSchedulerModal 
          application={schedulingInterview} 
          onClose={() => setSchedulingInterview(null)}
          onSubmit={handleScheduleInterviewSubmit}
        />
      )}

      {jobComposer && (
        <JobComposerModal 
          composer={jobComposer} 
          onClose={() => setJobComposer(null)}
          onSubmit={handleSaveJobComposer}
        />
      )}

      {studentComposer && (
        <StudentComposerModal 
          composer={studentComposer} 
          onClose={() => setStudentComposer(null)}
          onSubmit={handleSaveStudentComposer}
        />
      )}

      {recruiterComposer && (
        <RecruiterComposerModal 
          composer={recruiterComposer} 
          onClose={() => setRecruiterComposer(null)}
          onSubmit={handleSaveRecruiterComposer}
        />
      )}
    </div>
  );
}

// ==========================================
// SUB-VIEW COMPONENTS
// ==========================================

function DashboardHomeView({ metrics, applications, jobs, users, activityFeed, onViewAppStatus, onNavigateView, onQuickAction, isLoading }) {
  // Skeletons rendering
  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Metric Cards Skeleton */}
        <div className="hi-metrics-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" }}>
          {[...Array(6)].map((_, i) => <HomeMetricCard key={i} isLoading={true} label="" trend="" value="" color="" />)}
        </div>
        
        {/* Row 1 Skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" }}>
          <PlacementFunnel isLoading={true} applications={[]} />
          <AIInsightsPanel isLoading={true} users={[]} jobs={[]} applications={[]} />
        </div>

        {/* Row 2 Skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" }}>
          <div className="hi-chart-panel" style={{ padding: "24px", height: "340px", background: "#fff", borderRadius: "16px", border: "1px solid var(--line)" }}>
            <div className="skeleton-title" style={{ width: "30%" }} />
            <div className="skeleton-text" style={{ width: "50%" }} />
            <div className="skeleton" style={{ height: "220px", width: "100%", borderRadius: "10px", marginTop: "24px" }} />
          </div>
          <div className="hi-panel" style={{ padding: "24px", height: "340px", background: "#fff", borderRadius: "16px", border: "1px solid var(--line)" }}>
            <div className="skeleton-title" style={{ width: "50%" }} />
            <div className="skeleton-text" />
            <div className="skeleton-text" />
            <div className="skeleton-text" />
            <div className="skeleton-text" />
          </div>
        </div>
      </div>
    );
  }

  // Sparkline data
  const studentsSpark = [480, 500, 520, 510, 540, 550, metrics.students || 580];
  const recruitersSpark = [12, 15, 18, 16, 20, 22, metrics.recruiters || 24];
  const jobsSpark = [20, 25, 30, 28, 35, 42, metrics.jobs || 45];
  const appsSpark = [60, 70, 85, 80, 100, 110, metrics.apps || 120];
  const placementsSpark = [30, 35, 42, 40, 48, 55, metrics.placements || 62];
  const rateSpark = [72, 75, 78, 77, 80, 83, metrics.rate || 85];

  // Monthly trends area chart
  const monthlyTrendData = useMemo(() => [
    { month: "Jan", applications: 35, placements: 10 },
    { month: "Feb", applications: 50, placements: 18 },
    { month: "Mar", applications: 70, placements: 28 },
    { month: "Apr", applications: 85, placements: 42 },
    { month: "May", applications: 110, placements: 58 },
    { month: "Jun", applications: Math.max(120, applications.length), placements: Math.max(65, users.filter(u => u.role === "student" && u.placementStatus === "Placed").length) }
  ], [applications.length, users]);

  // Horizontal Department Ranking
  const deptPerformance = useMemo(() => {
    const students = users.filter(u => u.role === "student");
    const depts = [
      { name: "Computer Engineering", key: "Computer Engineering" },
      { name: "IT", key: "Information Technology" },
      { name: "Electronics & TC", key: "Electronics and Telecommunication" },
      { name: "Mechanical", key: "Mechanical Engineering" },
      { name: "Civil", key: "Civil Engineering" }
    ];

    return depts.map(d => {
      const deptStudents = students.filter(st => st.branch === d.key);
      const total = deptStudents.length || 10;
      const placed = deptStudents.filter(st => st.placementStatus === "Placed").length || (d.name === "Computer Engineering" ? 8 : d.name === "IT" ? 7 : d.name === "Mechanical" ? 4 : d.name === "Electronics & TC" ? 5 : 2);
      const rate = Math.round((placed / total) * 100);
      return {
        name: d.name,
        total,
        placed,
        rate: Math.min(100, rate)
      };
    }).sort((a, b) => b.rate - a.rate);
  }, [users]);

  // Top Recruiters
  const topRecruiters = useMemo(() => {
    const counts = {};
    jobs.forEach(j => { 
      const comp = j.company || "Unknown";
      counts[comp] = (counts[comp] || 0) + 1; 
    });
    return Object.keys(counts).map((comp, idx) => ({
      name: comp,
      jobs: counts[comp],
      hires: Math.round(counts[comp] * 1.5) + (idx === 0 ? 3 : idx === 1 ? 2 : 1),
      logo: getCompanyLogo(comp)
    })).sort((a,b) => b.jobs - a.jobs).slice(0, 4);
  }, [jobs]);

  const recentApps = applications.slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 6 Metric Cards */}
      <div className="hi-metrics-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" }}>
        <HomeMetricCard icon={<LuUsers />} label="Total Students" value={metrics.students} trend="+12.5%" color="#6366f1" sparkData={studentsSpark} />
        <HomeMetricCard icon={<LuBuilding2 />} label="Active Recruiters" value={metrics.recruiters} trend="+8.4%" color="#10b981" sparkData={recruitersSpark} />
        <HomeMetricCard icon={<LuBriefcase />} label="Active Jobs" value={metrics.jobs} trend="+15.3%" color="#f59e0b" sparkData={jobsSpark} />
        <HomeMetricCard icon={<LuClipboardList />} label="Applications" value={metrics.apps} trend="+10.2%" color="#3b82f6" sparkData={appsSpark} />
        <HomeMetricCard icon={<LuSquareCheck />} label="Placements" value={metrics.placements || 0} trend="+18.2%" color="#9333ea" sparkData={placementsSpark} />
        <HomeMetricCard icon={<LuPercent />} label="Placement Rate" value={`${metrics.rate}%`} trend="+4.1%" color="#14b8a6" sparkData={rateSpark} />
      </div>

      {/* Row 1: Hero Funnel & AI Analytics Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" }}>
        {/* Placement Funnel Component */}
        <PlacementFunnel applications={applications} />

        {/* AI Insights & Risk Analysis */}
        <AIInsightsPanel users={users} jobs={jobs} applications={applications} />
      </div>

      {/* Row 2: Monthly Trends & Department Performance */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" }}>
        {/* Monthly trends Area chart */}
        <div className="hi-chart-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>Monthly Placement Trends</h3>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>Applications vs Placements over the last 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyTrendData}>
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPlacements" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="applications" name="Applications" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorApps)" />
              <Area type="monotone" dataKey="placements" name="Placements" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPlacements)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department Performance */}
        <div className="hi-panel" style={{ padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800" }}>Department Performance</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {deptPerformance.map(dept => (
              <div key={dept.name} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600" }}>
                  <span style={{ color: "var(--ink)" }}>{dept.name}</span>
                  <span style={{ color: "var(--primary)" }}>{dept.rate}% Placed</span>
                </div>
                <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden", position: "relative" }}>
                  <div style={{ height: "100%", width: `${dept.rate}%`, background: dept.rate >= 80 ? "#10b981" : dept.rate >= 60 ? "#6366f1" : "#f59e0b", borderRadius: "4px" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b" }}>
                  <span>{dept.placed} Placed</span>
                  <span>{dept.total} Eligible</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Top Recruiters & Activity + Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" }}>
        {/* Left Column: Top Recruiters & Placements */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Top Recruiters */}
          <div className="hi-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>Top Recruiters</h3>
              <button className="hi-view-all-btn" onClick={() => onNavigateView("Recruiters")}>Manage</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {topRecruiters.map((rec, index) => (
                <div key={rec.name} className="hi-metric-card" style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--line)", background: "#fff" }}>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: index === 0 ? "#eab308" : index === 1 ? "#94a3b8" : index === 2 ? "#b45309" : "#64748b", width: "24px" }}>
                    #{index + 1}
                  </div>
                  <img src={rec.logo} alt={rec.name} style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "contain", background: "#f8fafc", padding: "4px", marginRight: "12px" }} />
                  <div style={{ flexGrow: 1 }}>
                    <strong style={{ fontSize: "13px", display: "block" }}>{rec.name}</strong>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>{rec.jobs} Active Postings</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <strong style={{ fontSize: "13px", color: "var(--primary)", display: "block" }}>{rec.hires} Hires</strong>
                    <span style={{ fontSize: "11px", color: "#10b981" }}>+12% conv</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Placements Activity Table */}
          <div className="hi-panel hi-table-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>Recent Placements Activity</h3>
              <button className="hi-view-all-btn" onClick={() => onNavigateView("Applications")}>View All</button>
            </div>
            <table className="hi-table" style={{ width: "100%", fontSize: "13px" }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "10px 8px" }}>Student</th>
                  <th style={{ padding: "10px 8px" }}>Company</th>
                  <th style={{ padding: "10px 8px" }}>Role</th>
                  <th style={{ padding: "10px 8px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map(app => (
                  <tr key={app.id}>
                    <td style={{ padding: "10px 8px" }}><strong>{app.studentName}</strong></td>
                    <td style={{ padding: "10px 8px" }}>{app.company}</td>
                    <td style={{ padding: "10px 8px" }}>{app.role}</td>
                    <td style={{ padding: "10px 8px" }}>
                      <span className={`hi-status-pill ${(app.status || "Applied").toLowerCase().replace(" ", "-")}`}>{app.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Activity Feed & Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Quick Actions Console */}
          <QuickActionsPanel onAction={onQuickAction} />

          {/* System Activity Feed */}
          <div className="hi-panel" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800" }}>System Activity Feed</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", flexGrow: 1, overflowY: "auto", maxHeight: "280px" }}>
              {activityFeed.map((act, index) => (
                <div key={index} style={{ display: "flex", gap: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)", marginTop: "6px" }} />
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--ink)", fontWeight: "500", lineHeight: 1.4 }}>{act.text}</p>
                    <small style={{ color: "#94a3b8", display: "block", marginTop: "2px" }}>{act.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeMetricCard({ icon, label, value, trend, color, sparkData, isLoading }) {
  if (isLoading) {
    return (
      <div className="hi-metric-card skeleton" style={{ height: "120px", borderRadius: "16px", padding: "18px", border: "1px solid var(--line)", background: "#fff", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "60%" }}>
            <div className="skeleton" style={{ height: "10px", width: "80%", borderRadius: "4px" }} />
            <div className="skeleton" style={{ height: "24px", width: "100%", borderRadius: "6px" }} />
          </div>
          <div className="skeleton-circle" style={{ width: "38px", height: "38px" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto" }}>
          <div className="skeleton" style={{ height: "10px", width: "40%", borderRadius: "4px" }} />
          <div className="skeleton" style={{ height: "10px", width: "30%", borderRadius: "4px" }} />
        </div>
      </div>
    );
  }

  const width = 100;
  const height = 30;
  const data = sparkData && sparkData.length > 0 ? sparkData : [10, 15, 8, 12, 18, 16, 20];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - 2 - ((val - min) / range) * (height - 4);
    return { x, y };
  });
  const linePath = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  const isPositive = trend && trend.startsWith("+");

  return (
    <div className="hi-metric-card" style={{ padding: "18px", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", gap: "10px", background: "#fff", borderRadius: "16px", border: "1px solid var(--line)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "11px", fontWeight: "750", color: "#64748b" }}>{label}</span>
          <strong style={{ fontSize: "24px", fontWeight: "850", color: "var(--ink)" }}>{value}</strong>
        </div>
        <div className="hi-metric-icon" style={{ backgroundColor: `${color}15`, color, width: "38px", height: "38px", borderRadius: "10px", display: "grid", placeItems: "center", fontSize: "18px" }}>
          {icon}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "4px" }}>
        <div style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ color: isPositive ? "#10b981" : "#ef4444", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "2px" }}>
            <LuArrowUpRight style={{ transform: isPositive ? "none" : "rotate(90deg)", fontSize: "12px" }} /> {trend}
          </span>
          <span style={{ color: "#94a3b8" }}>vs last month</span>
        </div>
        <div style={{ width: "90px", height: "30px" }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id={`gradient-${label.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`M 0,${points[0].y.toFixed(1)} L ${areaPath}`} fill={`url(#gradient-${label.replace(/[^a-zA-Z0-9]/g, '')})`} />
            <path d={`M 0,${points[0].y.toFixed(1)} L ${linePath}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function PlacementFunnel({ applications, isLoading }) {
  if (isLoading) {
    return (
      <div className="hi-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", background: "#fff", borderRadius: "16px", border: "1px solid var(--line)" }}>
        <div>
          <div className="skeleton-title" style={{ width: "40%" }} />
          <div className="skeleton-text" style={{ width: "60%" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
          {[...Array(6)].map((_, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="skeleton" style={{ width: "80px", height: "14px", borderRadius: "4px" }} />
              <div className="skeleton" style={{ flexGrow: 1, height: "36px", borderRadius: "6px" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const total = applications.length || 1;
  const applied = total;
  const shortlisted = applications.filter(a => ["Shortlisted", "Interview Scheduled", "Offered", "Hired"].includes(a.status)).length;
  const assessment = applications.filter(a => ["Interview Scheduled", "Offered", "Hired"].includes(a.status) || a.stage === "Online Test").length;
  const interview = applications.filter(a => ["Interview Scheduled", "Offered", "Hired"].includes(a.status) && (a.stage === "Technical Interview" || a.stage === "HR Interview")).length;
  const offer = applications.filter(a => ["Offered", "Hired"].includes(a.status)).length;
  const placed = applications.filter(a => a.status === "Hired").length;

  const funnelSteps = [
    { label: "Applied", count: applied, pct: 100, color: "#6366f1" },
    { label: "Shortlisted", count: Math.min(applied, shortlisted || Math.round(applied * 0.8)), pct: 0, color: "#4f46e5" },
    { label: "Assessment", count: Math.min(shortlisted || Math.round(applied * 0.8), assessment || Math.round(applied * 0.6)), pct: 0, color: "#3b82f6" },
    { label: "Interview", count: Math.min(assessment || Math.round(applied * 0.6), interview || Math.round(applied * 0.4)), pct: 0, color: "#2563eb" },
    { label: "Offer", count: Math.min(interview || Math.round(applied * 0.4), offer || Math.round(applied * 0.15)), pct: 0, color: "#10b981" },
    { label: "Placed", count: Math.min(offer || Math.round(applied * 0.15), placed || Math.round(applied * 0.1)), pct: 0, color: "#059669" }
  ];

  funnelSteps.forEach(step => {
    step.pct = Math.round((step.count / applied) * 100);
  });

  return (
    <div className="hi-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>Placement Process Funnel</h3>
        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>Academic Pipeline Conversion Funnel</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
        {funnelSteps.map((step, idx) => {
          const widthPct = 100 - idx * 11;
          return (
            <div key={step.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "90px", fontSize: "12px", fontWeight: "750", color: "#475569" }}>{step.label}</div>
              <div style={{ flexGrow: 1, position: "relative" }}>
                <div style={{
                  width: `${widthPct}%`,
                  height: "36px",
                  background: `linear-gradient(90deg, ${step.color}ee, ${step.color})`,
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 14px",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "700",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  transition: "width 0.3s ease"
                }}>
                  <span>{step.count} Students</span>
                  <span>{step.pct}%</span>
                </div>
              </div>
              {idx < funnelSteps.length - 1 && (
                <div style={{ fontSize: "11px", color: "#94a3b8", width: "70px", textAlign: "right" }}>
                  {Math.round((funnelSteps[idx+1].count / (step.count || 1)) * 100)}% Conv.
                </div>
              )}
              {idx === funnelSteps.length - 1 && (
                <div style={{ fontSize: "11px", color: "#10b981", fontWeight: "800", width: "70px", textAlign: "right" }}>
                  Success
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AIInsightsPanel({ users, jobs, applications, isLoading }) {
  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div className="hi-panel animate-pulse" style={{ padding: "24px", border: "1px solid #c084fc", background: "linear-gradient(135deg, #FAF5FF, #FFFFFF)", borderRadius: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div className="skeleton-circle" style={{ width: "36px", height: "36px" }} />
            <div style={{ flexGrow: 1 }}>
              <div className="skeleton" style={{ height: "14px", width: "50%", borderRadius: "4px" }} />
              <div className="skeleton" style={{ height: "10px", width: "30%", borderRadius: "4px", marginTop: "4px" }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="skeleton" style={{ height: "10px", borderRadius: "4px" }} />
            <div className="skeleton" style={{ height: "10px", width: "90%", borderRadius: "4px" }} />
            <div className="skeleton" style={{ height: "10px", width: "85%", borderRadius: "4px" }} />
          </div>
        </div>

        <div className="hi-panel" style={{ padding: "24px", borderRadius: "16px", border: "1px solid var(--line)", background: "#fff" }}>
          <div className="skeleton-title" style={{ width: "40%" }} />
          <div className="skeleton" style={{ height: "12px", width: "90%", borderRadius: "4px", marginBottom: "8px" }} />
          <div className="skeleton" style={{ height: "12px", width: "70%", borderRadius: "4px" }} />
        </div>
      </div>
    );
  }

  const lowATSStudents = users.filter(u => u.role === "student" && u.atsScore && u.atsScore < 75);
  const incompleteProfiles = users.filter(u => u.role === "student" && (!u.skills || u.skills.length === 0 || !u.about));
  const missingResumes = users.filter(u => u.role === "student" && !u.resume);
  const studentsWithApps = new Set(applications.map(a => a.studentEmail).filter(Boolean));
  const noAppsStudents = users.filter(u => u.role === "student" && !studentsWithApps.has(u.email));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* AI Insights Card */}
      <div className="hi-panel" style={{ padding: "24px", border: "1px solid #c084fc", background: "linear-gradient(135deg, #FAF5FF, #FFFFFF)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ background: "#f3e8ff", color: "#9333ea", width: "36px", height: "36px", borderRadius: "8px", display: "grid", placeItems: "center", fontSize: "18px" }}>
            <LuActivity />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#581c87" }}>AI Placement Insights</h3>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#7e22ce" }}>Predictive analytics & recommendations</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="insight-row" style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <div style={{ minWidth: "6px", height: "6px", borderRadius: "50%", background: "#a855f7", marginTop: "6px" }} />
            <div style={{ fontSize: "12px", lineHeight: 1.4 }}>
              <strong style={{ color: "#581c87" }}>Shortlist Probability:</strong> Rahul Kumar has an 82% match score for TCS SDE Intern position.
            </div>
          </div>
          <div className="insight-row" style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <div style={{ minWidth: "6px", height: "6px", borderRadius: "50%", background: "#a855f7", marginTop: "6px" }} />
            <div style={{ fontSize: "12px", lineHeight: 1.4 }}>
              <strong style={{ color: "#581c87" }}>High Demand Skills:</strong> Java, React, SQL, and Python are required by 85% of active recruiters.
            </div>
          </div>
          <div className="insight-row" style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <div style={{ minWidth: "6px", height: "6px", borderRadius: "50%", background: "#a855f7", marginTop: "6px" }} />
            <div style={{ fontSize: "12px", lineHeight: 1.4 }}>
              <strong style={{ color: "#581c87" }}>Placement Prediction:</strong> Computer Engineering is on track to hit a 95% placement rate by graduation.
            </div>
          </div>
        </div>
      </div>

      {/* Student Risk Analysis */}
      <div className="hi-panel" style={{ padding: "24px" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "800" }}>Student Risk Analysis</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {incompleteProfiles.length > 0 && (
            <div style={{ display: "flex", gap: "10px", background: "#fffbeb", border: "1px solid #fef08a", padding: "10px 14px", borderRadius: "10px", alignItems: "center" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#eab308" }} />
              <div style={{ flexGrow: 1, fontSize: "11px" }}>
                <strong>Incomplete Profiles:</strong> {incompleteProfiles.length} students have missing profile details.
              </div>
            </div>
          )}
          {missingResumes.length > 0 && (
            <div style={{ display: "flex", gap: "10px", background: "#fffbeb", border: "1px solid #fef08a", padding: "10px 14px", borderRadius: "10px", alignItems: "center" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#d97706" }} />
              <div style={{ flexGrow: 1, fontSize: "11px" }}>
                <strong>Missing Resumes:</strong> {missingResumes.length} students have not uploaded a resume PDF.
              </div>
            </div>
          )}
          {noAppsStudents.length > 0 && (
            <div style={{ display: "flex", gap: "10px", background: "#fff5f5", border: "1px solid #feb2b2", padding: "10px 14px", borderRadius: "10px", alignItems: "center" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ flexGrow: 1, fontSize: "11px" }}>
                <strong>No Applications:</strong> {noAppsStudents.length} students have not applied to any job postings.
              </div>
            </div>
          )}
          {lowATSStudents.length > 0 && (
            <div style={{ display: "flex", gap: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: "10px", alignItems: "center" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#64748b" }} />
              <div style={{ flexGrow: 1, fontSize: "11px" }}>
                <strong>Low ATS Resumes:</strong> {lowATSStudents.length} students have ATS scores below 75%.
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <button className="primary-button compact-button" style={{ fontSize: "10px", padding: "6px 12px", width: "100%" }} onClick={() => alert("Risk alerts sent to student dashboard and emails.")}>
              Notify At-Risk Students
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionsPanel({ onAction }) {
  const actions = [
    { label: "Add Recruiter", icon: <LuUsers />, action: "add_recruiter", color: "#6366f1" },
    { label: "Post Job", icon: <LuBriefcase />, action: "post_job", color: "#10b981" },
    { label: "Create Internship", icon: <LuCalendar />, action: "create_internship", color: "#f59e0b" },
    { label: "Send Notification", icon: <LuBell />, action: "send_notif", color: "#3b82f6" },
    { label: "Verify Recruiter", icon: <LuSquareCheck />, action: "verify_recruiter", color: "#9333ea" }
  ];

  return (
    <div className="hi-panel" style={{ padding: "24px" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "800" }}>Quick Action Console</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {actions.map(act => (
          <button 
            key={act.label} 
            onClick={() => onAction(act.action)} 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              padding: "10px 12px", 
              borderRadius: "8px", 
              border: "1px solid var(--line)", 
              background: "#fff", 
              cursor: "pointer", 
              fontSize: "11px", 
              fontWeight: "750", 
              textAlign: "left", 
              transition: "all 0.15s ease" 
            }}
            onMouseOver={e => { e.currentTarget.style.backgroundColor = `${act.color}08`; e.currentTarget.style.borderColor = act.color; }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.borderColor = "var(--line)"; }}
          >
            <div style={{ color: act.color, fontSize: "14px" }}>{act.icon}</div>
            <span style={{ color: "var(--ink)" }}>{act.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// --- STUDENTS MANAGEMENT MODULE ---
function StudentsListView({ users, searchTerm, onViewStudent, onStatusChange, onDeleteStudent, onAddStudent, onEditStudent }) {
  const [branchFilter, setBranchFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filtered = useMemo(() => {
    return users.filter(u => {
      if (u.role !== "student") return false;
      const nameStr = u.name || "";
      const studentSkills = Array.isArray(u.skills) ? u.skills : typeof u.skills === 'string' ? u.skills.split(',').map(s => s.trim()) : [];
      const matchesSearch = !searchTerm || 
        nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
        studentSkills.some(s => String(s || "").toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesBranch = branchFilter === "All" || u.branch === branchFilter;
      const matchesYear = yearFilter === "All" || u.year === yearFilter;
      const matchesStatus = statusFilter === "All" || (u.placementStatus || "Unplaced") === statusFilter;
      return matchesSearch && matchesBranch && matchesYear && matchesStatus;
    });
  }, [users, searchTerm, branchFilter, yearFilter, statusFilter]);

  const sorted = useMemo(() => {
    const sortedList = [...filtered];
    sortedList.sort((a, b) => {
      let valA = a[sortBy] || "";
      let valB = b[sortBy] || "";
      if (sortBy === "cgpa" || sortBy === "atsScore") {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sortedList;
  }, [filtered, sortBy, sortOrder]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1); // reset page on filter change
  }, [branchFilter, yearFilter, statusFilter, searchTerm, itemsPerPage]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Branch", "Year", "CGPA", "ATS Score", "Placement Status", "Verification Status"];
    const rows = sorted.map(st => [
      st.name,
      st.email,
      st.branch,
      st.year,
      st.cgpa,
      st.atsScore,
      st.placementStatus || "Unplaced",
      st.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val || "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Students_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const branches = ["All", "Computer Engineering", "Information Technology", "Electronics and Telecommunication", "Mechanical Engineering", "Civil Engineering", "Electrical Engineering", "Data Science", "AI & Machine Learning"];
  const years = ["All", "First Year", "Second Year", "Third Year", "Final Year"];
  const statuses = ["All", "Placed", "Unplaced"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Filters bar */}
      <div className="hi-panel" style={{ padding: "20px", display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", justifyContent: "space-between", background: "#fff", borderRadius: "16px", border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "750", color: "#64748b" }}>Branch</label>
            <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff", outline: "none", fontSize: "13px" }}>
              {branches.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "750", color: "#64748b" }}>Year</label>
            <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff", outline: "none", fontSize: "13px" }}>
              {years.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "750", color: "#64748b" }}>Placement Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff", outline: "none", fontSize: "13px" }}>
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button className="secondary-button" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }} onClick={exportCSV}>
            <LuDownload /> Export CSV
          </button>
          <button className="primary-button" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }} onClick={onAddStudent}>
            <LuPlus /> Add Student
          </button>
        </div>
      </div>

      {/* Student List Table */}
      <div className="hi-panel hi-table-panel" style={{ padding: "24px", background: "#fff", borderRadius: "16px", border: "1px solid var(--line)" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="hi-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--line)" }}>
                <th onClick={() => handleSort("name")} style={{ cursor: "pointer", padding: "12px", textAlign: "left" }}>
                  Student Details {sortBy === "name" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </th>
                <th>Branch / Academic</th>
                <th onClick={() => handleSort("cgpa")} style={{ cursor: "pointer", padding: "12px", textAlign: "left" }}>
                  CGPA {sortBy === "cgpa" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </th>
                <th onClick={() => handleSort("atsScore")} style={{ cursor: "pointer", padding: "12px", textAlign: "left" }}>
                  ATS Score {sortBy === "atsScore" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </th>
                <th>Skills</th>
                <th>Placement Status</th>
                <th>Verify Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(st => {
                const studentSkills = Array.isArray(st.skills) ? st.skills : typeof st.skills === 'string' ? st.skills.split(',').map(s => s.trim()) : [];
                return (
                  <tr key={st.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#e2e8f0", display: "grid", placeItems: "center", fontWeight: "800", color: "#475569", overflow: "hidden" }}>
                          {st.photo ? <img src={st.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (st.name || "S").slice(0, 1)}
                        </div>
                        <div>
                          <strong style={{ fontSize: "14px", display: "block" }}>{st.name || "Student"}</strong>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>{st.email || "No email"}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", display: "block" }}>{st.branch || "General"}</span>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>{st.year || "N/A"}</span>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "700" }}>{st.cgpa || "N/A"} CGPA</span>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ fontSize: "13px", color: (st.atsScore || 0) >= 80 ? "var(--green)" : "#eab308", display: "flex", alignItems: "center", gap: "4px" }}>
                        <LuActivity /> {st.atsScore || "N/A"}%
                      </div>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", maxWidth: "200px" }}>
                        {studentSkills.slice(0, 2).map(s => (
                          <span key={s} style={{ background: "#f1f5f9", color: "#475569", fontSize: "10px", padding: "2px 6px", borderRadius: "4px" }}>{s}</span>
                        ))}
                        {studentSkills.length > 2 && <span style={{ fontSize: "10px", color: "#94a3b8" }}>+{studentSkills.length - 2}</span>}
                      </div>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <select
                        className="hi-status-dropdown"
                        value={st.placementStatus || "Unplaced"}
                        onChange={e => onStatusChange(st.id, "placementStatus", e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--line)" }}
                      >
                        <option value="Unplaced">Unplaced</option>
                        <option value="Placed">Placed</option>
                      </select>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <span className={`hi-status-pill ${(st.status || "Pending").toLowerCase()}`}>{st.status || "Pending"}</span>
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "right" }}>
                      <div className="action-btns" style={{ justifyContent: "flex-end" }}>
                        <button className="btn-approve-circle" title="View Profile & Resume" onClick={() => onViewStudent(st)}><LuEye /></button>
                        <button className="btn-approve-circle" title="Edit Student Profile" onClick={() => onEditStudent(st)}><LuSquarePen /></button>
                        {st.status === "Pending" && (
                          <button className="btn-approve-circle" title="Approve Student Account" onClick={() => onStatusChange(st.id, "status", "Approved")}><LuCircleCheck /></button>
                        )}
                        <button className="btn-delete-circle" title="Delete Account" onClick={() => onDeleteStudent(st.id)}><LuTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && <tr><td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No students match search filters.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "12px", borderTop: "1px solid var(--line)" }}>
          <span style={{ fontSize: "13px", color: "#64748b" }}>
            Showing {sorted.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length} entries
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              className="secondary-button compact-button" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                className={currentPage === i + 1 ? "primary-button compact-button" : "secondary-button compact-button"}
                onClick={() => setCurrentPage(i + 1)}
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                {i + 1}
              </button>
            ))}
            <button 
              className="secondary-button compact-button" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- RECRUITERS MANAGEMENT MODULE ---
function RecruitersManagementView({ users, jobs, searchTerm, onVerify, onDeleteRecruiter, onAddRecruiter, onEditRecruiter }) {
  const [tab, setTab] = useState("verified"); // 'verified' | 'pending'
  const [sortBy, setSortBy] = useState("company");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filtered = useMemo(() => {
    return users.filter(u => {
      if (u.role !== "recruiter") return false;
      const nameStr = u.name || "";
      const companyStr = u.company || "";
      const matchesSearch = !searchTerm || nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || companyStr.toLowerCase().includes(searchTerm.toLowerCase());
      const recruiterStatus = u.status || "Pending";
      const matchesTab = tab === "verified" ? recruiterStatus === "Approved" : recruiterStatus === "Pending";
      return matchesSearch && matchesTab;
    });
  }, [users, searchTerm, tab]);

  const companyStats = useMemo(() => {
    const stats = {};
    jobs.forEach(j => {
      if (j && j.company) {
        stats[j.company] = (stats[j.company] || 0) + 1;
      }
    });
    return stats;
  }, [jobs]);

  const sorted = useMemo(() => {
    const sortedList = [...filtered];
    sortedList.sort((a, b) => {
      let valA = a[sortBy] || "";
      let valB = b[sortBy] || "";
      if (sortBy === "jobsCount") {
        valA = companyStats[a.company] || 0;
        valB = companyStats[b.company] || 0;
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sortedList;
  }, [filtered, sortBy, sortOrder, companyStats]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1); // Reset page on tab or filter changes
  }, [tab, searchTerm]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const exportCSV = () => {
    const headers = ["Company Name", "Contact Person", "Email", "Active Jobs", "Created Date", "Verification Status"];
    const rows = sorted.map(rec => [
      rec.company,
      rec.name,
      rec.email,
      companyStats[rec.company] || 0,
      rec.createdAt || "",
      rec.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val || "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Recruiters_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Tabs / Filters / Actions Header */}
      <div className="hi-panel" style={{ padding: "16px 20px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", background: "#fff", borderRadius: "16px", border: "1px solid var(--line)", gap: "16px" }}>
        <div className="hi-tabs-bar" style={{ display: "flex", gap: "12px", borderBottom: "none" }}>
          <button className={`hi-tab ${tab === "verified" ? "active" : ""}`} onClick={() => setTab("verified")} style={{ padding: "8px 16px", fontSize: "14px", border: "none", background: tab === "verified" ? "rgba(37,99,235,0.08)" : "none", color: tab === "verified" ? "var(--primary)" : "#64748b", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>Verified Companies</button>
          <button className={`hi-tab ${tab === "pending" ? "active" : ""}`} onClick={() => setTab("pending")} style={{ padding: "8px 16px", fontSize: "14px", border: "none", background: tab === "pending" ? "rgba(37,99,235,0.08)" : "none", color: tab === "pending" ? "var(--primary)" : "#64748b", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>Verification Requests {users.filter(u => u.role === "recruiter" && u.status === "Pending").length > 0 && <span className="hi-badge-pill" style={{ marginLeft: "6px", background: "var(--red)", color: "#fff", padding: "2px 6px", borderRadius: "99px", fontSize: "10px" }}>{users.filter(u => u.role === "recruiter" && u.status === "Pending").length}</span>}</button>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button className="secondary-button" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }} onClick={exportCSV}>
            <LuDownload /> Export CSV
          </button>
          <button className="primary-button" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }} onClick={onAddRecruiter}>
            <LuPlus /> Add Recruiter
          </button>
        </div>
      </div>

      {/* Recruiter List */}
      <div className="hi-panel hi-table-panel" style={{ padding: "24px", background: "#fff", borderRadius: "16px", border: "1px solid var(--line)" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="hi-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th onClick={() => handleSort("company")} style={{ cursor: "pointer" }}>Company {sortBy === "company" ? (sortOrder === "asc" ? "↑" : "↓") : ""}</th>
                <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>Contact Person {sortBy === "name" ? (sortOrder === "asc" ? "↑" : "↓") : ""}</th>
                <th>Email</th>
                <th onClick={() => handleSort("jobsCount")} style={{ cursor: "pointer" }}>Active Jobs {sortBy === "jobsCount" ? (sortOrder === "asc" ? "↑" : "↓") : ""}</th>
                <th>Created Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(rec => {
                const recruiterStatus = rec.status || "Pending";
                const companyName = rec.company || "Unknown Partner";
                return (
                  <tr key={rec.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img src={getCompanyLogo(companyName)} alt="" style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "contain", background: "#f8fafc", padding: "4px" }} />
                        <strong style={{ fontSize: "14px" }}>{companyName}</strong>
                      </div>
                    </td>
                    <td style={{ padding: "16px 12px" }}>{rec.name || "Contact"}</td>
                    <td style={{ padding: "16px 12px" }}>{rec.email || "No email"}</td>
                    <td style={{ padding: "16px 12px" }}>
                      <span style={{ fontWeight: "700" }}>{companyStats[companyName] || 0} Jobs</span>
                    </td>
                    <td style={{ padding: "16px 12px" }}>{rec.createdAt || "Sample"}</td>
                    <td style={{ padding: "16px 12px" }}>
                      <span className={`hi-status-pill ${recruiterStatus.toLowerCase()}`}>{recruiterStatus === "Approved" ? "Verified" : recruiterStatus}</span>
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "right" }}>
                      <div className="action-btns" style={{ justifyContent: "flex-end" }}>
                        <button className="btn-approve-circle" title="Edit Recruiter Details" onClick={() => onEditRecruiter(rec)}><LuSquarePen /></button>
                        {recruiterStatus === "Pending" ? (
                          <>
                            <button className="primary-button compact-button" style={{ fontSize: "11px", padding: "4px 8px" }} onClick={() => onVerify(rec.id, "verify")}>Approve</button>
                            <button className="danger-button compact-button" style={{ fontSize: "11px", padding: "4px 8px" }} onClick={() => onVerify(rec.id, "reject")}>Reject</button>
                          </>
                        ) : (
                          <button className="btn-delete-circle" onClick={() => onDeleteRecruiter(rec.id)}><LuTrash2 /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No recruiters found.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "12px", borderTop: "1px solid var(--line)" }}>
          <span style={{ fontSize: "13px", color: "#64748b" }}>
            Showing {sorted.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length} entries
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              className="secondary-button compact-button" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                className={currentPage === i + 1 ? "primary-button compact-button" : "secondary-button compact-button"}
                onClick={() => setCurrentPage(i + 1)}
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                {i + 1}
              </button>
            ))}
            <button 
              className="secondary-button compact-button" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- JOBS & INTERNSHIPS MODULE ---
function JobsManagementView({ jobs, searchTerm, onEditJob, onDeleteJob, onAddJob, onViewApplicants }) {
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("role");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      if (!j) return false;
      const roleStr = j.role || "";
      const companyStr = j.company || "";
      const matchesSearch = !searchTerm || roleStr.toLowerCase().includes(searchTerm.toLowerCase()) || companyStr.toLowerCase().includes(searchTerm.toLowerCase());
      const jobType = j.type || "Full Time";
      const matchesType = typeFilter === "All" || jobType.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [jobs, searchTerm, typeFilter]);

  const sorted = useMemo(() => {
    const sortedList = [...filtered];
    sortedList.sort((a, b) => {
      let valA = a[sortBy] || "";
      let valB = b[sortBy] || "";
      if (sortBy === "applicants") {
        valA = a.applicants || 0;
        valB = b.applicants || 0;
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sortedList;
  }, [filtered, sortBy, sortOrder]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1); // Reset page on filter changes
  }, [typeFilter, searchTerm]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const exportCSV = () => {
    const headers = ["Role", "Company", "Location", "Salary Package", "Type", "Skills", "Applicants", "Status"];
    const rows = sorted.map(job => [
      job.role,
      job.company,
      job.location,
      job.package,
      job.type || "Full Time",
      (job.skills || []).join("; "),
      job.applicants || 0,
      job.status || "Active"
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val || "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Jobs_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header & Filters bar */}
      <div className="hi-panel" style={{ padding: "20px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", background: "#fff", borderRadius: "16px", border: "1px solid var(--line)", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: "750", color: "#64748b" }}>Campaign Type</label>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff", outline: "none", fontSize: "13px" }}>
            <option value="All">All</option>
            <option value="Full Time">Full-Time</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button className="secondary-button" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }} onClick={exportCSV}>
            <LuDownload /> Export CSV
          </button>
          <button className="primary-button" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }} onClick={onAddJob}>
            <LuPlus /> Create New Job
          </button>
        </div>
      </div>

      {/* Jobs table */}
      <div className="hi-panel hi-table-panel" style={{ padding: "24px", background: "#fff", borderRadius: "16px", border: "1px solid var(--line)" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="hi-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th onClick={() => handleSort("role")} style={{ cursor: "pointer" }}>Role {sortBy === "role" ? (sortOrder === "asc" ? "↑" : "↓") : ""}</th>
                <th onClick={() => handleSort("company")} style={{ cursor: "pointer" }}>Company {sortBy === "company" ? (sortOrder === "asc" ? "↑" : "↓") : ""}</th>
                <th>Location</th>
                <th>Salary Package</th>
                <th>Type</th>
                <th>Required Skills</th>
                <th onClick={() => handleSort("applicants")} style={{ cursor: "pointer" }}>Applicants {sortBy === "applicants" ? (sortOrder === "asc" ? "↑" : "↓") : ""}</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(job => {
                const jobSkills = Array.isArray(job.skills) ? job.skills : typeof job.skills === 'string' ? job.skills.split(',').map(s => s.trim()) : [];
                const jobType = job.type || "Full Time";
                return (
                  <tr key={job.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "16px 12px" }}><strong>{job.role || "Job Posting"}</strong></td>
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <img src={job.logo || getCompanyLogo(job.company)} alt="" style={{ width: "24px", height: "24px", borderRadius: "4px", objectFit: "contain", background: "#f8fafc" }} />
                        <span>{job.company || "Unknown"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 12px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><LuMapPin style={{ color: "#94a3b8" }} /> {job.location || "Remote"}</span></td>
                    <td style={{ padding: "16px 12px" }}><span style={{ fontWeight: "750" }}>{job.package || "Not Disclosed"}</span></td>
                    <td style={{ padding: "16px 12px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: jobType.toLowerCase().includes("intern") ? "#14b8a6" : "#6366f1" }}>{jobType}</span>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", maxWidth: "150px" }}>
                        {jobSkills.slice(0, 2).map(s => (
                          <span key={s} style={{ background: "#f1f5f9", color: "#475569", fontSize: "10px", padding: "2px 6px", borderRadius: "4px" }}>{s}</span>
                        ))}
                        {jobSkills.length > 2 && <span style={{ fontSize: "10px", color: "#94a3b8" }}>+{jobSkills.length - 2}</span>}
                      </div>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <button className="link-button" type="button" style={{ fontWeight: "800", textDecoration: "underline" }} onClick={() => onViewApplicants(job)}>
                        {job.applicants || 0} Candidates
                      </button>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <span className={`hi-status-pill ${(job.status || "Active").toLowerCase() === "active" ? "approved" : "rejected"}`}>{job.status || "Active"}</span>
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "right" }}>
                      <div className="action-btns" style={{ justifyContent: "flex-end" }}>
                        <button className="btn-approve-circle" onClick={() => onEditJob(job)} title="Edit Posting"><LuSquarePen /></button>
                        <button className="btn-delete-circle" onClick={() => onDeleteJob(job.id)} title="Delete Posting"><LuTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && <tr><td colSpan="9" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No postings found.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "12px", borderTop: "1px solid var(--line)" }}>
          <span style={{ fontSize: "13px", color: "#64748b" }}>
            Showing {sorted.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length} entries
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              className="secondary-button compact-button" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                className={currentPage === i + 1 ? "primary-button compact-button" : "secondary-button compact-button"}
                onClick={() => setCurrentPage(i + 1)}
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                {i + 1}
              </button>
            ))}
            <button 
              className="secondary-button compact-button" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- APPLICATIONS MODULE ---
function ApplicationsListView({ applications, searchTerm, onStatusChange, onSchedule }) {
  const [filterStage, setFilterStage] = useState("All");
  const [sortBy, setSortBy] = useState("studentName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filtered = useMemo(() => {
    return applications.filter(a => {
      const name = a.studentName || "";
      const company = a.company || "";
      const matchesSearch = !searchTerm || 
        name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStage = filterStage === "All" || a.stage === filterStage;
      return matchesSearch && matchesStage;
    });
  }, [applications, searchTerm, filterStage]);

  const sorted = useMemo(() => {
    const sortedList = [...filtered];
    sortedList.sort((a, b) => {
      let valA = a[sortBy] || "";
      let valB = b[sortBy] || "";
      if (sortBy === "match") {
        valA = a.match || 0;
        valB = b.match || 0;
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sortedList;
  }, [filtered, sortBy, sortOrder]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1); // Reset page on filter changes
  }, [filterStage, searchTerm]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const exportCSV = () => {
    const headers = ["Candidate", "Company", "Role", "Applied Date", "Current Stage", "Status", "Match Score"];
    const rows = sorted.map(app => [
      app.studentName,
      app.company,
      app.role,
      app.appliedOn || app.date || "",
      app.stage,
      app.status,
      app.match ? `${app.match}%` : ""
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val || "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Applications_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stages = ["All", "Resume Review", "Online Test", "Technical Interview", "HR Interview", "Final Result"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Filters bar */}
      <div className="hi-panel" style={{ padding: "20px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", background: "#fff", borderRadius: "16px", border: "1px solid var(--line)", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", fontWeight: "750", color: "#64748b" }}>Placement Stage</label>
          <select value={filterStage} onChange={e => setFilterStage(e.target.value)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff", outline: "none", fontSize: "13px" }}>
            {stages.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <button className="secondary-button" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }} onClick={exportCSV}>
            <LuDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="hi-panel hi-table-panel" style={{ padding: "24px", background: "#fff", borderRadius: "16px", border: "1px solid var(--line)" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="hi-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th onClick={() => handleSort("studentName")} style={{ cursor: "pointer" }}>Candidate {sortBy === "studentName" ? (sortOrder === "asc" ? "↑" : "↓") : ""}</th>
                <th onClick={() => handleSort("company")} style={{ cursor: "pointer" }}>Company {sortBy === "company" ? (sortOrder === "asc" ? "↑" : "↓") : ""}</th>
                <th>Role</th>
                <th>Applied Date</th>
                <th>Current Stage</th>
                <th onClick={() => handleSort("match")} style={{ cursor: "pointer" }}>Match % {sortBy === "match" ? (sortOrder === "asc" ? "↑" : "↓") : ""}</th>
                <th>Status</th>
                <th>Change Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(app => (
                <tr key={app.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "16px 12px" }}><strong>{app.studentName}</strong></td>
                  <td style={{ padding: "16px 12px" }}>{app.company}</td>
                  <td style={{ padding: "16px 12px" }}>{app.role}</td>
                  <td style={{ padding: "16px 12px" }}>{app.appliedOn || app.date}</td>
                  <td style={{ padding: "16px 12px" }}><span style={{ color: "var(--primary)", fontWeight: "700" }}>{app.stage}</span></td>
                  <td style={{ padding: "16px 12px" }}>
                    <strong style={{ color: "var(--primary)" }}>{app.match || 75}%</strong>
                  </td>
                  <td style={{ padding: "16px 12px" }}>
                    <span className={`hi-status-pill ${app.status.toLowerCase().replace(" ", "-")}`}>{app.status}</span>
                  </td>
                  <td style={{ padding: "16px 12px" }}>
                    <select
                      className="hi-status-dropdown"
                      value={app.status}
                      onChange={e => onStatusChange(app.id, e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--line)" }}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Offered">Offered</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td style={{ padding: "16px 12px", textAlign: "right" }}>
                    <button className="primary-button compact-button" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }} onClick={() => onSchedule(app)}>
                      <LuCalendar style={{ fontSize: "12px" }} /> Schedule
                    </button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && <tr><td colSpan="9" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No applications found.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "12px", borderTop: "1px solid var(--line)" }}>
          <span style={{ fontSize: "13px", color: "#64748b" }}>
            Showing {sorted.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length} entries
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              className="secondary-button compact-button" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                className={currentPage === i + 1 ? "primary-button compact-button" : "secondary-button compact-button"}
                onClick={() => setCurrentPage(i + 1)}
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                {i + 1}
              </button>
            ))}
            <button 
              className="secondary-button compact-button" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MENTOR APPROVALS MODULE ---
function MentorApprovalsView({ approvals, searchTerm, onAction }) {
  const [feedbackMap, setFeedbackMap] = useState({});

  const filtered = useMemo(() => {
    return approvals.filter(ap => {
      const name = ap.studentName || "";
      const type = ap.type || "";
      return !searchTerm || 
        name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        type.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [approvals, searchTerm]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="hi-panel hi-table-panel" style={{ padding: "24px" }}>
        <table className="hi-table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Request Type</th>
              <th>Description</th>
              <th>Status</th>
              <th>Admin Feedback</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(ap => (
              <tr key={ap.id}>
                <td style={{ padding: "16px 12px" }}><span style={{ color: "#94a3b8", fontSize: "12px" }}>{ap.date}</span></td>
                <td style={{ padding: "16px 12px" }}>
                  <strong>{ap.studentName}</strong>
                  <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>{ap.studentEmail}</span>
                </td>
                <td style={{ padding: "16px 12px" }}><span style={{ color: "var(--primary)", fontWeight: "800" }}>{ap.type}</span></td>
                <td style={{ padding: "16px 12px" }}>
                  <p style={{ margin: 0, fontSize: "13px", maxWidth: "250px", lineHeight: 1.4 }}>{ap.description}</p>
                  <small style={{ color: "#94a3b8", display: "block", marginTop: "4px" }}>{ap.details}</small>
                </td>
                <td style={{ padding: "16px 12px" }}>
                  <span className={`hi-status-pill ${ap.status.toLowerCase()}`}>{ap.status}</span>
                </td>
                <td style={{ padding: "16px 12px" }}>
                  {ap.status === "Pending" ? (
                    <input 
                      placeholder="Add reviewer notes..."
                      value={feedbackMap[ap.id] || ""}
                      onChange={e => setFeedbackMap({...feedbackMap, [ap.id]: e.target.value})}
                      style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--line)", outline: "none", fontSize: "12px", width: "160px" }}
                    />
                  ) : (
                    <span style={{ color: "#64748b", fontSize: "12px", fontStyle: "italic" }}>{ap.feedback || "No feedback"}</span>
                  )}
                </td>
                <td style={{ padding: "16px 12px" }}>
                  <div className="action-btns">
                    {ap.status === "Pending" ? (
                      <>
                        <button className="btn-approve-circle" title="Approve Request" onClick={() => onAction(ap.id, "approve", feedbackMap[ap.id] || "Approved by Admin")}><LuCircleCheck /></button>
                        <button className="btn-delete-circle" title="Reject Request" onClick={() => onAction(ap.id, "reject", feedbackMap[ap.id] || "Rejected by Admin")}><LuCircleX /></button>
                      </>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>Resolved</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No requests pending approval.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- NOTIFICATIONS MODULE ---
function NotificationsListView({ notifications, searchTerm, onMarkRead, onClearAll, onDeleteNotification }) {
  const filtered = useMemo(() => {
    return notifications.filter(n => {
      const sender = n.sender || "";
      const message = n.message || "";
      return !searchTerm || 
        sender.toLowerCase().includes(searchTerm.toLowerCase()) || 
        message.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [notifications, searchTerm]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="hi-panel" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>System Notifications Log</h3>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>Logs of signup requests, placements, and portal triggers</p>
        </div>
        {notifications.length > 0 && (
          <button className="danger-button" onClick={onClearAll}>Clear All</button>
        )}
      </div>

      <div className="hi-panel" style={{ padding: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filtered.map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: item.read ? "transparent" : "rgba(99,102,241,0.02)", border: "1px solid var(--line)", borderRadius: "12px", borderLeft: item.read ? "1px solid var(--line)" : "4px solid var(--primary)" }}>
              <div style={{ flexGrow: 1 }}>
                <strong style={{ fontSize: "14px", display: "block" }}>{item.sender}</strong>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--ink)", lineHeight: 1.4 }}>{item.message}</p>
                <small style={{ color: "#94a3b8", display: "block", marginTop: "4px" }}>{item.createdAt}</small>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {!item.read && (
                  <button className="primary-button compact-button" style={{ fontSize: "11px", padding: "4px 8px" }} onClick={() => onMarkRead(item.id)}>Mark Read</button>
                )}
                <button className="btn-delete-circle" onClick={() => onDeleteNotification(item.id)}><LuTrash2 /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#cbd5e1" }}>
              <LuBell size={48} style={{ color: "#cbd5e1", marginBottom: "12px" }} />
              <p>No notifications available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- PLACEMENT ANALYTICS MODULE ---
function PlacementAnalyticsView({ users, applications, jobs, isLoading }) {
  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Metric Cards Skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="hi-panel skeleton" style={{ height: "120px", borderRadius: "16px", background: "#fff", border: "1px solid var(--line)" }} />
          ))}
        </div>
        
        {/* Layout Skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="hi-panel skeleton" style={{ height: "300px", borderRadius: "16px" }} />
            <div className="hi-panel skeleton" style={{ height: "300px", borderRadius: "16px" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="hi-panel skeleton" style={{ height: "400px", borderRadius: "16px" }} />
            <div className="hi-panel skeleton" style={{ height: "200px", borderRadius: "16px" }} />
          </div>
        </div>
      </div>
    );
  }

  const students = users.filter(u => u.role === "student");
  const branchCounts = {};
  const placedCounts = {};

  students.forEach(st => {
    const branch = st.branch || "General";
    branchCounts[branch] = (branchCounts[branch] || 0) + 1;
    if (st.placementStatus === "Placed") {
      placedCounts[branch] = (placedCounts[branch] || 0) + 1;
    }
  });

  const departmentData = Object.keys(branchCounts).map(branch => {
    const total = branchCounts[branch];
    const placed = placedCounts[branch] || 0;
    const rate = Math.round((placed / total) * 100);
    return { name: branch.replace(" Engineering", ""), total, placed, rate };
  });

  const recruiterStats = [
    { name: "Google India", jobs: 4, hires: 8 },
    { name: "Microsoft", jobs: 3, hires: 6 },
    { name: "TCS", jobs: 6, hires: 12 },
    { name: "Infosys Ltd", jobs: 5, hires: 9 },
    { name: "Amazon", jobs: 2, hires: 4 }
  ];

  const monthlyTrendData = [
    { month: "Jan", applications: 35, placements: 10 },
    { month: "Feb", applications: 50, placements: 18 },
    { month: "Mar", applications: 70, placements: 28 },
    { month: "Apr", applications: 85, placements: 42 },
    { month: "May", applications: 110, placements: 58 },
    { month: "Jun", applications: Math.max(120, applications.length), placements: Math.max(65, users.filter(u => u.role === "student" && u.placementStatus === "Placed").length) }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* High-level highlights */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        <AnalyticsStatCard label="Highest Placement Package" value="₹42.0 LPA" subText="Offered by Amazon SDE" />
        <AnalyticsStatCard label="Average Placement Package" value="₹8.5 LPA" subText="Academic Term 2025-2026" />
        <AnalyticsStatCard label="Internship FTE Conversion" value="72%" subText="Avg. return offer rate" />
        <AnalyticsStatCard label="Active Recruiting Companies" value="28 Partners" subText="TCS, Google, Microsoft, Amazon" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" }}>
        {/* Left Column - Charts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Monthly Placement Trend */}
          <div className="hi-chart-panel" style={{ padding: "24px", background: "#fff", borderRadius: "16px", border: "1px solid var(--line)" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800" }}>Monthly Placement Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="colorAppsAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPlacementsAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="applications" name="Applications" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAppsAnalytics)" />
                <Area type="monotone" dataKey="placements" name="Placements" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPlacementsAnalytics)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recruiter Hiring Statistics */}
          <div className="hi-chart-panel" style={{ padding: "24px", background: "#fff", borderRadius: "16px", border: "1px solid var(--line)" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800" }}>Recruiter Hiring Statistics</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={recruiterStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="jobs" name="Active Postings" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hires" name="Hires Placed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Performance */}
          <div className="hi-panel" style={{ padding: "24px", background: "#fff", borderRadius: "16px", border: "1px solid var(--line)" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: "800" }}>Department Wise Placement Details</h3>
            <table className="hi-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Branch / Department</th>
                  <th>Eligible Students</th>
                  <th>Placed Count</th>
                  <th>Placement Rate</th>
                </tr>
              </thead>
              <tbody>
                {departmentData.map(dept => (
                  <tr key={dept.name}>
                    <td style={{ padding: "12px 8px" }}><strong>{dept.name}</strong></td>
                    <td style={{ padding: "12px 8px" }}>{dept.total} Students</td>
                    <td style={{ padding: "12px 8px" }}>{dept.placed} Placed</td>
                    <td style={{ padding: "12px 8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flexGrow: 1, height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden", maxWidth: "120px" }}>
                          <div style={{ height: "100%", width: `${dept.rate}%`, background: dept.rate >= 80 ? "var(--green)" : "#eab308" }} />
                        </div>
                        <strong style={{ fontSize: "13px" }}>{dept.rate}%</strong>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Funnel & Insights */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Placement Process Funnel */}
          <PlacementFunnel applications={applications} />

          {/* AI Insights Panel */}
          <AIInsightsPanel users={users} jobs={jobs} applications={applications} />
        </div>
      </div>
    </div>
  );
}

function AnalyticsStatCard({ label, value, subText }) {
  return (
    <div className="hi-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
      <strong style={{ fontSize: "24px", fontWeight: "900", color: "var(--ink)" }}>{value}</strong>
      <span style={{ fontSize: "12px", color: "#94a3b8" }}>{subText}</span>
    </div>
  );
}

// --- SETTINGS VIEW ---
function SettingsView({ settings, onSave, pushToast }) {
  const [form, setForm] = useState(settings);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.collegeName || form.collegeName.trim().length < 5) {
      setError("Institution/College Name must be at least 5 characters long.");
      return;
    }
    setError("");
    onSave(form);
    pushToast("Configuration settings updated successfully!");
  };

  return (
    <div className="hi-panel" style={{ padding: "28px", background: "#fff", borderRadius: "16px", border: "1px solid var(--line)" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "600px" }}>
        {error && (
          <div style={{ padding: "12px 16px", background: "#fee2e2", border: "1px solid #fecaca", color: "#ef4444", borderRadius: "8px", fontSize: "13px", fontWeight: "600" }}>
            {error}
          </div>
        )}

        <div>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "700", color: "var(--ink)" }}>Institution / College Name</label>
          <input 
            value={form.collegeName}
            onChange={e => setForm({...form, collegeName: e.target.value})}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--line)", outline: "none", fontSize: "14px" }}
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "700", color: "var(--ink)" }}>Academic Enrollment Year</label>
            <select 
              value={form.academicYear}
              onChange={e => setForm({...form, academicYear: e.target.value})}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff", outline: "none", fontSize: "14px" }}
            >
              <option>2025-2026</option>
              <option>2024-2025</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "700", color: "var(--ink)" }}>Placement Season Status</label>
            <select 
              value={form.placementSeason}
              onChange={e => setForm({...form, placementSeason: e.target.value})}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff", outline: "none", fontSize: "14px" }}
            >
              <option>Active</option>
              <option>Suspended</option>
              <option>Closed</option>
            </select>
          </div>
        </div>

        <div className="settings-list" style={{ marginTop: "12px", borderTop: "1px solid var(--line)", paddingTop: "16px" }}>
          <div className="setting-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <strong style={{ fontSize: "14px", display: "block" }}>Recruiter Verification Required</strong>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>Require manual verification for new recruiter signups.</p>
            </div>
            <label className="switch-container">
              <input 
                type="checkbox" 
                className="switch-input"
                checked={form.recruiterVerificationRequired} 
                onChange={e => setForm({...form, recruiterVerificationRequired: e.target.checked})}
              />
              <span className="switch-slider"></span>
            </label>
          </div>

          <div className="setting-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <strong style={{ fontSize: "14px", display: "block" }}>Email Notifications</strong>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>Dispatch alert triggers to administrators and mentors.</p>
            </div>
            <label className="switch-container">
              <input 
                type="checkbox" 
                className="switch-input"
                checked={form.emailNotifications} 
                onChange={e => setForm({...form, emailNotifications: e.target.checked})}
              />
              <span className="switch-slider"></span>
            </label>
          </div>

          <div className="setting-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
            <div>
              <strong style={{ fontSize: "14px", display: "block" }}>Maintenance Mode</strong>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>Toggle system-wide maintenance mode flags.</p>
            </div>
            <label className="switch-container">
              <input 
                type="checkbox" 
                className="switch-input"
                checked={form.maintenanceMode} 
                onChange={e => setForm({...form, maintenanceMode: e.target.checked})}
              />
              <span className="switch-slider"></span>
            </label>
          </div>
        </div>

        <button type="submit" className="primary-button" style={{ width: "fit-content", marginTop: "16px" }}>
          Save Configuration
        </button>
      </form>
    </div>
  );
}

// ==========================================
// MODALS
// ==========================================

function StudentProfileModal({ student, onClose, onDeleteResume, onUploadResume }) {
  const handleDownloadResume = (st) => {
    const content = `RESUME: ${st.name.toUpperCase()}
Email: ${st.email}
Phone: ${st.phone}
Branch: ${st.branch} (${st.year})
CGPA: ${st.cgpa}
ATS Score: ${st.atsScore}%

PROFESSIONAL SUMMARY
${st.about || "N/A"}

EDUCATION
${(st.education || []).map(edu => `- ${edu.degree} at ${edu.school} (${edu.startYear}-${edu.endYear}): ${edu.grade}`).join("\n")}

ACADEMIC PROJECTS
${(st.projects || []).map(proj => `- ${proj.name}: ${proj.description}`).join("\n")}

TECHNICAL SKILLS
${(st.skills || []).join(", ")}
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${st.name.replace(/\s+/g, "_")}_Resume.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" role="dialog" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", zIndex: 10000, display: "grid", placeItems: "center" }}>
      <div className="hi-panel" style={{ width: "100%", maxWidth: "680px", background: "#fff", borderRadius: "16px", padding: "28px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px", marginBottom: "16px" }}>
          <div>
            <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "800", textTransform: "uppercase" }}>Student Profile Card</span>
            <h2 style={{ margin: "4px 0 0", fontSize: "20px", fontWeight: "900" }}>{student.name}</h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>{student.branch} · {student.year}</p>
          </div>
          <button style={{ background: "none", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer" }} onClick={onClose}>&times;</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Detail Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", background: "#f8fafc", padding: "16px", borderRadius: "12px" }}>
            <div>
              <small style={{ color: "#64748b", display: "block" }}>University / PRN</small>
              <strong style={{ fontSize: "13px" }}>{student.rollNumber}</strong>
            </div>
            <div>
              <small style={{ color: "#64748b", display: "block" }}>CGPA / Marksheet</small>
              <strong style={{ fontSize: "13px" }}>{student.cgpa} CGPA</strong>
            </div>
            <div>
              <small style={{ color: "#64748b", display: "block" }}>Email Contact</small>
              <span style={{ fontSize: "13px" }}>{student.email}</span>
            </div>
            <div>
              <small style={{ color: "#64748b", display: "block" }}>Mobile Phone</small>
              <span style={{ fontSize: "13px" }}>{student.phone}</span>
            </div>
          </div>

          {/* About Summary */}
          {student.about && (
            <div>
              <h4 style={{ margin: "0 0 6px 0", fontSize: "13px", fontWeight: "800", textTransform: "uppercase", color: "#475569" }}>Professional Summary</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: 1.4 }}>{student.about}</p>
            </div>
          )}

          {/* Skills tags */}
          <div>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "800", textTransform: "uppercase", color: "#475569" }}>Domain Skills ({student.atsScore}% ATS score)</h4>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {(student.skills || []).map(s => (
                <span key={s} style={{ background: "#eef2ff", color: "var(--primary)", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "750" }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Mock Resume Document Panel */}
          {student.resume ? (
            <div style={{ marginTop: "16px", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "800", textTransform: "uppercase", color: "#475569" }}>Resume Document Preview</h4>
              <div className="resume-viewer-panel" style={{ 
                background: "#f8fafc", 
                border: "1px solid var(--line)", 
                borderRadius: "12px", 
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                {/* Document toolbar */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  background: "#fff", 
                  padding: "8px 12px", 
                  borderRadius: "8px", 
                  border: "1px solid var(--line)" 
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                    <LuFileText style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis" }} title={student.resume}>
                      {student.resume}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <button 
                      type="button" 
                      className="secondary-button compact-button" 
                      style={{ fontSize: "11px", padding: "4px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      onClick={() => handleDownloadResume(student)}
                    >
                      <LuDownload /> Download
                    </button>
                    <button 
                      type="button" 
                      className="danger-button compact-button" 
                      style={{ fontSize: "11px", padding: "4px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      onClick={() => onDeleteResume(student.id)}
                    >
                      <LuTrash2 /> Delete
                    </button>
                  </div>
                </div>

                {/* Paper visual content container */}
                <div className="resume-paper-visual" style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "24px",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  fontSize: "12px",
                  color: "#334155",
                  lineHeight: "1.5"
                }}>
                  {/* Header */}
                  <div style={{ textAlign: "center", borderBottom: "2px solid #334155", paddingBottom: "12px" }}>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "900", color: "#1e293b", textTransform: "uppercase" }}>{student.name}</h3>
                    <div style={{ display: "flex", justifyContent: "center", gap: "12px", color: "#64748b", flexWrap: "wrap", fontSize: "11px" }}>
                      <span>{student.email}</span>
                      <span>•</span>
                      <span>{student.phone}</span>
                      <span>•</span>
                      <a href={student.linkedin || "https://linkedin.com"} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "underline" }}>LinkedIn</a>
                      <span>•</span>
                      <a href={student.github || "https://github.com"} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "underline" }}>GitHub</a>
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#1e293b", borderBottom: "1px solid #e2e8f0", paddingBottom: "2px" }}>Education</h4>
                    {(student.education || []).map((edu, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                        <div>
                          <strong>{edu.school}</strong>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{edu.degree}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <strong>{edu.grade}</strong>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{edu.startYear} - {edu.endYear}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Projects */}
                  {student.projects && student.projects.length > 0 && (
                    <div>
                      <h4 style={{ margin: "0 0 6px 0", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#1e293b", borderBottom: "1px solid #e2e8f0", paddingBottom: "2px" }}>Academic Projects</h4>
                      {student.projects.map((proj, idx) => (
                        <div key={idx} style={{ marginBottom: "6px" }}>
                          <strong>{proj.name}</strong>
                          <p style={{ margin: "2px 0 0", color: "#475569", fontSize: "11px" }}>{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills */}
                  <div>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#1e293b", borderBottom: "1px solid #e2e8f0", paddingBottom: "2px" }}>Technical Skills</h4>
                    <p style={{ margin: 0, fontWeight: "500" }}>
                      {(student.skills || []).join(", ")}
                    </p>
                  </div>

                  {/* ATS Badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "8px 12px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "11px", color: "#475569" }}>
                    <span>Score parsed by placement scanner:</span>
                    <strong style={{ color: (student.atsScore || 0) >= 80 ? "var(--green)" : "#eab308" }}>{student.atsScore || 75}% ATS Fit</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: "16px", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "800", textTransform: "uppercase", color: "#475569" }}>Resume Document</h4>
              <div style={{ 
                border: "2px dashed #cbd5e1", 
                borderRadius: "12px", 
                padding: "24px", 
                textAlign: "center", 
                background: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px"
              }}>
                <LuFileText size={32} style={{ color: "#94a3b8" }} />
                <div>
                  <strong style={{ fontSize: "13px", display: "block", color: "var(--ink)" }}>No Resume Uploaded</strong>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>Please upload a resume file to enable PDF preview and downloading.</span>
                </div>
                <button 
                  type="button" 
                  className="secondary-button compact-button" 
                  onClick={() => {
                    const fileName = window.prompt("Enter resume filename to simulate upload:", `${student.name.toLowerCase().replace(" ", "_")}_resume.pdf`);
                    if (fileName) {
                      onUploadResume(student.id, fileName);
                    }
                  }}
                  style={{ fontSize: "11px", padding: "6px 12px", marginTop: "4px" }}
                >
                  Simulate Resume Upload
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

function ViewApplicantsModal({ job, applications, onClose, onViewStudent }) {
  const applicants = useMemo(() => {
    return applications.filter(a => a.company === job.company && a.role === job.role);
  }, [applications, job]);

  return (
    <div className="modal-backdrop" role="dialog" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", zIndex: 10000, display: "grid", placeItems: "center" }}>
      <div className="hi-panel" style={{ width: "100%", maxWidth: "640px", background: "#fff", borderRadius: "16px", padding: "28px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px", marginBottom: "16px" }}>
          <div>
            <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "800", textTransform: "uppercase" }}>Applicants Log</span>
            <h2 style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: "900" }}>{job.role} Candidates</h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>{job.company} · {job.location}</p>
          </div>
          <button style={{ background: "none", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer" }} onClick={onClose}>&times;</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {applicants.map(app => (
            <div key={app.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", border: "1px solid var(--line)", borderRadius: "12px" }}>
              <div>
                <strong style={{ fontSize: "14px", display: "block" }}>{app.studentName}</strong>
                <span style={{ fontSize: "11px", color: "#64748b" }}>{app.studentEmail}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <strong style={{ color: "var(--primary)", fontSize: "13px" }}>{app.match}% Match</strong>
                <span className={`hi-status-pill ${app.status.toLowerCase().replace(" ", "-")}`} style={{ fontSize: "10px" }}>{app.status}</span>
              </div>
            </div>
          ))}
          {applicants.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px", color: "#cbd5e1" }}>No applications received yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function InterviewSchedulerModal({ application, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" role="dialog" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", zIndex: 10000, display: "grid", placeItems: "center" }}>
      <form onSubmit={onSubmit} className="hi-panel" style={{ width: "100%", maxWidth: "480px", background: "#fff", borderRadius: "16px", padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px", marginBottom: "20px" }}>
          <div>
            <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "800", textTransform: "uppercase" }}>Interview Pipeline</span>
            <h2 style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: "900" }}>Schedule Interview</h2>
          </div>
          <button type="button" style={{ background: "none", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer" }} onClick={onClose}>&times;</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "11px", color: "#64748b", fontWeight: "800", display: "block", marginBottom: "4px" }}>Student Candidate</label>
            <strong style={{ fontSize: "14px" }}>{application.studentName}</strong>
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "#64748b", fontWeight: "800", display: "block", marginBottom: "4px" }}>Company & Role</label>
            <span style={{ fontSize: "13px" }}>{application.role} at {application.company}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Date</label>
              <input required type="date" name="date" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Time</label>
              <input required type="time" name="time" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Location / Format</label>
            <select name="location" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff" }}>
              <option>Google Meet (Virtual Link)</option>
              <option>Seminar Hall-1 (In-Person)</option>
              <option>Placement Cell Cubicle-2 (In-Person)</option>
              <option>Company Office Campus (Off-campus)</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "16px", marginTop: "8px" }}>
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">Confirm Schedule</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function JobComposerModal({ composer, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" role="dialog" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", zIndex: 10000, display: "grid", placeItems: "center" }}>
      <form onSubmit={onSubmit} className="hi-panel" style={{ width: "100%", maxWidth: "520px", background: "#fff", borderRadius: "16px", padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px", marginBottom: "20px" }}>
          <div>
            <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "800", textTransform: "uppercase" }}>Placement Campaign</span>
            <h2 style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: "900" }}>{composer.mode === "create" ? "Create Job Posting" : "Edit Job Posting"}</h2>
          </div>
          <button type="button" style={{ background: "none", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer" }} onClick={onClose}>&times;</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Job Role Title</label>
              <input required name="role" defaultValue={composer.data.role || ""} placeholder="e.g. SDE Intern" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Company Partner</label>
              <input required name="company" defaultValue={composer.data.company || ""} placeholder="e.g. Microsoft" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Location</label>
              <input required name="location" defaultValue={composer.data.location || ""} placeholder="e.g. Pune, India" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Salary Package</label>
              <input required name="salary" defaultValue={composer.data.package || ""} placeholder="e.g. 5.5 LPA" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Campaign Type</label>
              <select name="type" defaultValue={composer.data.type || "Full-time"} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff" }}>
                <option>Full-time</option>
                <option>Internship</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Required Skills (Comma separated)</label>
              <input name="skills" defaultValue={composer.data.skills ? composer.data.skills.join(", ") : ""} placeholder="e.g. React, Node.js" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "16px", marginTop: "8px" }}>
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">Publish Posting</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function StudentComposerModal({ composer, onClose, onSubmit }) {
  const branchesList = ["Computer Engineering", "Information Technology", "Electronics and Telecommunication", "Mechanical Engineering", "Civil Engineering", "Electrical Engineering", "Data Science", "AI & Machine Learning"];
  const yearsList = ["First Year", "Second Year", "Third Year", "Final Year"];

  return (
    <div className="modal-backdrop" role="dialog" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", zIndex: 10000, display: "grid", placeItems: "center" }}>
      <form onSubmit={onSubmit} className="hi-panel" style={{ width: "100%", maxWidth: "560px", background: "#fff", borderRadius: "16px", padding: "28px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px", marginBottom: "20px" }}>
          <div>
            <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "800", textTransform: "uppercase" }}>Student Database</span>
            <h2 style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: "900" }}>{composer.mode === "create" ? "Add Student Profile" : "Edit Student Profile"}</h2>
          </div>
          <button type="button" style={{ background: "none", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer" }} onClick={onClose}>&times;</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Full Name</label>
              <input required name="name" defaultValue={composer.data.name || ""} placeholder="e.g. Rahul Kumar" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Email Address</label>
              <input required type="email" name="email" defaultValue={composer.data.email || ""} placeholder="e.g. student@placer.ai" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Contact Phone</label>
              <input required type="tel" name="phone" defaultValue={composer.data.phone || ""} placeholder="e.g. 9876543210" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Roll Number / PRN</label>
              <input required name="rollNumber" defaultValue={composer.data.rollNumber || ""} placeholder="e.g. PRN-987654" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Branch</label>
              <select name="branch" defaultValue={composer.data.branch || "Computer Engineering"} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff" }}>
                {branchesList.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Current Year</label>
              <select name="year" defaultValue={composer.data.year || "Final Year"} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff" }}>
                {yearsList.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>CGPA</label>
              <input required type="number" step="0.01" min="0" max="10" name="cgpa" defaultValue={composer.data.cgpa || ""} placeholder="e.g. 9.5" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Placement Status</label>
              <select name="placementStatus" defaultValue={composer.data.placementStatus || "Unplaced"} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff" }}>
                <option value="Unplaced">Unplaced</option>
                <option value="Placed">Placed</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Domain Skills (Comma separated)</label>
            <input name="skills" defaultValue={composer.data.skills ? composer.data.skills.join(", ") : ""} placeholder="e.g. React, JavaScript, SQL" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} />
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Professional Summary / About</label>
            <textarea name="about" defaultValue={composer.data.about || ""} placeholder="Tell us about your professional focus..." rows="3" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "16px", marginTop: "8px" }}>
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">{composer.mode === "create" ? "Create Profile" : "Save Changes"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function RecruiterComposerModal({ composer, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" role="dialog" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", zIndex: 10000, display: "grid", placeItems: "center" }}>
      <form onSubmit={onSubmit} className="hi-panel" style={{ width: "100%", maxWidth: "480px", background: "#fff", borderRadius: "16px", padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px", marginBottom: "20px" }}>
          <div>
            <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "800", textTransform: "uppercase" }}>Recruiter Relations</span>
            <h2 style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: "900" }}>{composer.mode === "create" ? "Add Recruiter Partner" : "Edit Recruiter Partner"}</h2>
          </div>
          <button type="button" style={{ background: "none", border: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer" }} onClick={onClose}>&times;</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Company Partner Name</label>
            <input required name="company" defaultValue={composer.data.company || ""} placeholder="e.g. Microsoft India" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} />
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Contact Person Full Name</label>
            <input required name="name" defaultValue={composer.data.name || ""} placeholder="e.g. Siddhesh Mane" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} />
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Email Contact</label>
            <input required type="email" name="email" defaultValue={composer.data.email || ""} placeholder="e.g. recruiter@microsoft.com" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)" }} />
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "750", display: "block", marginBottom: "6px" }}>Verification Status</label>
            <select name="status" defaultValue={composer.data.status || "Approved"} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff" }}>
              <option value="Approved">Approved / Verified</option>
              <option value="Pending">Pending Review</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "16px", marginTop: "8px" }}>
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">{composer.mode === "create" ? "Create Partner" : "Save Changes"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AdminDashboard;
