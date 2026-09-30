import { useEffect, useMemo, useState, useRef } from "react";
import {
  FaAward,
  FaBell,
  FaBolt,
  FaBrain,
  FaBriefcase,
  FaCalendarCheck,
  FaCheckCircle,
  FaClock,
  FaCloudUploadAlt,
  FaCode,
  FaEdit,
  FaEnvelope,
  FaEye,
  FaFileAlt,
  FaFilter,
  FaGraduationCap,
  FaLightbulb,
  FaMobileAlt,
  FaPlus,
  FaRobot,
  FaSave,
  FaTools,
  FaUniversalAccess,
  FaTrash,
  FaTimesCircle,
  FaUserGraduate,
  FaUserShield,
  FaFileContract,
  FaMicrophone,
  FaUserTie,
  FaBuilding
} from "react-icons/fa";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { getCompanyLogo, normalizeJobImages, sanitizeProfilePhoto } from "../utils/images";
import { safeGetItem } from "../utils/storage";
import AIRecommendationsPage from "./student/AIRecommendationsPage";
import SkillGapPage from "./student/SkillGapPage";
import ATSAnalyzerPage from "./student/ATSAnalyzerPage";
import AISearchPage from "./student/AISearchPage";
import InterviewsSection from "./student/InterviewsSection";
import AssessmentRunnerPage from "./student/AssessmentRunnerPage";
import AIAssistantPage from "./student/AIAssistantPage";
import {
  getStudentProfile,
  updateStudentProfile,
  getEducation,
  addEducation,
  updateEducation,
  deleteEducation,
  getSkills,
  addSkill,
  deleteSkill,
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  getResumes,
  addResumeMetadata,
  deleteResumeMetadata,
  getStudentDashboardStats
} from "../services/studentService";
import { getStoredToken } from "../services/authService";
import "./dashboard.css";


const seedJobs = [
  {
    company: "Tata Consultancy Services",
    companyShort: "TCS",
    logo: getCompanyLogo("Tata Consultancy Services"),
    role: "Frontend Developer",
    package: "4.2 LPA",
    location: "Pune, India",
    match: 86,
    status: "Open",
    skills: ["React", "JavaScript", "CSS"]
  },
  {
    company: "Infosys Limited",
    companyShort: "Infosys",
    logo: getCompanyLogo("Infosys Limited"),
    role: "Software Engineer Trainee",
    package: "3.8 LPA",
    location: "Bengaluru, India",
    match: 78,
    status: "Open",
    skills: ["Java", "SQL", "DSA"]
  },
  {
    company: "Wipro Technologies",
    companyShort: "Wipro",
    logo: getCompanyLogo("Wipro Technologies"),
    role: "Full Stack Intern",
    package: "5.0 LPA",
    location: "Hyderabad, India",
    match: 72,
    status: "Saved",
    skills: ["Node.js", "React", "MongoDB"]
  },
  {
    company: "Capgemini",
    companyShort: "Capgemini",
    logo: getCompanyLogo("Capgemini"),
    role: "Data Analyst",
    package: "4.5 LPA",
    location: "Mumbai, India",
    match: 69,
    status: "Open",
    skills: ["Python", "Excel", "Power BI"]
  },
  {
    company: "Amazon",
    companyShort: "Amazon",
    logo: getCompanyLogo("Amazon"),
    role: "SDE Intern",
    package: "6.0 LPA",
    location: "Bangalore, India",
    match: 81,
    status: "Open",
    skills: ["Java", "C++", "DSA", "System Design"]
  },
  {
    company: "Microsoft India",
    companyShort: "Microsoft",
    logo: getCompanyLogo("Microsoft India"),
    role: "Software Engineer",
    package: "7.5 LPA",
    location: "Hyderabad, India",
    match: 76,
    status: "Open",
    skills: ["C#", ".NET", "Azure", "JavaScript"]
  },
  {
    company: "Google India",
    companyShort: "Google",
    logo: getCompanyLogo("Google India"),
    role: "Associate Product Manager",
    package: "8.0 LPA",
    location: "Bangalore, India",
    match: 73,
    status: "Open",
    skills: ["Product Analysis", "Python", "SQL", "Communication"]
  },
  {
    company: "Accenture",
    companyShort: "Accenture",
    logo: getCompanyLogo("Accenture"),
    role: "Associate Engineer",
    package: "4.0 LPA",
    location: "Pune, India",
    match: 74,
    status: "Open",
    skills: ["Java", "SQL", "Problem Solving"]
  }
];

const seedApplications = [
  { company: "Tata Consultancy Services", companyShort: "TCS", logo: getCompanyLogo("Tata Consultancy Services"), role: "Frontend Developer", stage: "Online Test", date: "24 Apr", status: "Applied" },
  { company: "Infosys Limited", companyShort: "Infosys", logo: getCompanyLogo("Infosys Limited"), role: "Software Engineer Trainee", stage: "Technical Interview", date: "26 Apr", status: "Shortlisted" },
  { company: "Accenture", companyShort: "Accenture", logo: getCompanyLogo("Accenture"), role: "Associate Engineer", stage: "Resume Review", date: "28 Apr", status: "Pending" },
  { company: "Tech Mahindra", companyShort: "TechM", logo: getCompanyLogo("Tech Mahindra"), role: "Graduate Trainee", stage: "Final Result", date: "30 Apr", status: "Rejected" }
];

const seedNotifications = [
  { sender: "Infosys Careers", message: "shortlisted you for a technical interview.", type: "system", createdAt: "8m" },
  { sender: "Kartik Ahire", message: "viewed your profile.", type: "view", createdAt: "1h" },
  { sender: "Pooja Deore", message: "commented on your post: Solid step into AI engineering 🔥", type: "social", createdAt: "3h" },
  { sender: "Manas Deshmukh", message: "started a new position as Data Science Intern at TechnoKraft.", type: "event", createdAt: "5h", actionLabel: "Say congrats" }
];

const getNotificationId = (message, index) =>
  `notification-${index}-${String(message).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 44)}`;

const normalizeNotifications = (items) => {
  const list = (Array.isArray(items) ? items : []).map((item, index) => {
    if (typeof item === "object" && item !== null) {
      const message = item.message || String(item.text || "");
      const sender = item.sender || "Placer AI";
      return {
        id: item.id || getNotificationId(message, index),
        sender,
        message,
        type: item.type || "info",
        read: Boolean(item.read),
        createdAt: item.createdAt || "Earlier",
        actionLabel: item.actionLabel || null
      };
    }

    return {
      id: getNotificationId(item, index),
      sender: "System",
      message: String(item),
      type: "info",
      read: false,
      createdAt: "Earlier",
      actionLabel: null
    };
  });

  const seen = new Set();
  return list.filter((item) => {
    const key = `${item.sender}-${item.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const seedDocuments = [
  {
    id: "doc-1",
    name: "Resume_Rahul_Kumar.pdf",
    type: "application/pdf",
    size: 245000,
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 3).toLocaleString(),
    dataUrl: "data:application/pdf;base64,JVBERi0xLjQKJdHAxT4KMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PgplbmRvYmoKMiAwIG9iagogIDw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbIDMgMCBSIFUgLyBDb3VudCAxID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWyAwIDAgNTk1IDg0MiBdID4+CmVuZG9iagp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2OCAwMDAwMCBuIAowMDAwMDAwMTMwIDAwMDAwIG4gCnRyYWlsZXIKICA8PCAvU2l6ZSA0IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgoxODMKJSVFT0Y="
  },
  {
    id: "doc-2",
    name: "10th_Passing_Certificate.pdf",
    type: "application/pdf",
    size: 512000,
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 30).toLocaleString(),
    dataUrl: "data:application/pdf;base64,JVBERi0xLjQKJdHAxT4KMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nIC9QYWdlcyAyIDAgUiA+PgplbmRvYmoKMiAwIG9iagogIDw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbIDMgMCBSIFUgLyBDb3VudCAxID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWyAwIDAgNTk1IDg0MiBdID4+CmVuZG9iagp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2OCAwMDAwMCBuIAowMDAwMDAwMTMwIDAwMDAwIG4gCnRyYWlsZXIKICA8PCAvU2l6ZSA0IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgoxODMKJSVFT0Y="
  },
  {
    id: "doc-3",
    name: "College_ID_Card.png",
    type: "image/png",
    size: 104800,
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 5).toLocaleString(),
    dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }
];

const skillData = [
  { skill: "React", score: 86 },
  { skill: "JavaScript", score: 82 },
  { skill: "DSA", score: 64 },
  { skill: "SQL", score: 70 },
  { skill: "Aptitude", score: 76 }
];

const fallbackUser = {
  name: "Rushikesh Bhabad",
  email: "rushikesh@example.com",
  phone: "9876543210",
  year: "Final Year",
  branch: "Computer Engineering",
  skills: ["React", "JavaScript", "SQL", "DSA"],
  photo: "",
  about: "",
  activity: [],
  education: [],
  cgpa: "",
  goal: "Frontend Developer",
  projects: [],
  internships: [],
  certifications: [],
  languages: "",
  interests: "",
  interestedCompanies: ""
};

const defaultPreferences = {
  emailAlerts: true,
  smsReminders: true,
  publicProfile: true,
  weeklyDigest: true,
  reducedMotion: false,
  compactView: false
};

const roleGuides = {
  "Data Analyst": {
    scope: "Good demand in analytics, reporting and operations teams across service and product companies.",
    learnNext: ["Python", "SQL", "Power BI", "Data cleaning"],
    improveFirst: ["Add one dashboard case study", "Show business insights", "Strengthen SQL practice"]
  },
  "Full Stack Developer": {
    scope: "Strong scope in startups, service companies and product teams that want end-to-end builders.",
    learnNext: ["Node.js", "Express", "MongoDB", "System flow basics"],
    improveFirst: ["Ship one complete app", "Add auth and CRUD", "Deploy and document APIs"]
  },
  "Frontend Engineer": {
    scope: "Consistent scope in web product teams, service firms and UI-heavy application roles.",
    learnNext: ["TypeScript", "React patterns", "API integration", "Responsive design"],
    improveFirst: ["Polish UI quality", "Add real projects", "Improve component structure"]
  },
  "Career Focus": {
    scope: "Best improvement comes from choosing one clear role path and aligning your resume around it.",
    learnNext: ["Role-specific tools", "Project proof", "Interview basics"],
    improveFirst: ["Choose a target role", "Update profile fields", "Build one aligned project"]
  },
  "Portfolio Builder": {
    scope: "Projects are the fastest way to improve trust and unlock better shortlisting across roles.",
    learnNext: ["GitHub workflow", "Deployment", "Project presentation"],
    improveFirst: ["Publish code", "Add screenshots", "Write outcome-based descriptions"]
  },
  "Industry Ready Candidate": {
    scope: "Internship or real-work proof helps convert profile strength into recruiter trust.",
    learnNext: ["Team workflow", "Communication", "Task ownership"],
    improveFirst: ["Get practical exposure", "Track outcomes", "Add real experience bullets"]
  },
  "SDE Trainee": {
    scope: "Good scope in trainee and fresher engineering roles, but coding-round readiness matters a lot.",
    learnNext: ["Arrays", "Strings", "Hashing", "Recursion"],
    improveFirst: ["Practice DSA daily", "Revise patterns", "Explain solutions clearly"]
  },
  "Skill Builder": {
    scope: "Useful as a supporting layer when paired with projects and a clearer target role.",
    learnNext: ["One platform certification", "Revision discipline", "Tool familiarity"],
    improveFirst: ["Pick one relevant certificate", "Finish it fast", "Show learning outcome"]
  },
  "Placement Ready": {
    scope: "Your profile is already in a usable range; focus now on conversion quality and consistency.",
    learnNext: ["Interview communication", "Portfolio polish", "Targeted applications"],
    improveFirst: ["Refine your resume", "Apply selectively", "Track what improves conversion"]
  }
};

const getJobKey = (company, role) => `${company}::${role}`;
const getDisplayStatus = (jobStatus, applicationStatus) => {
  if (applicationStatus === "Pending") {
    return "Applied";
  }

  return applicationStatus || jobStatus || "Open";
};

const toLowerList = (value) =>
  (Array.isArray(value) ? value : String(value || "").split(","))
    .map((item) => String(item).trim().toLowerCase())
    .filter(Boolean);

const enrichRecommendation = (card) => {
  const guide = roleGuides[card.futureRole] || roleGuides["Career Focus"];

  return {
    ...card,
    scope: guide.scope,
    learnNext: guide.learnNext,
    improveFirst: guide.improveFirst
  };
};

const buildRecommendations = (student) => {
  const branch = String(student.branch || "").toLowerCase();
  const goal = String(student.goal || "").toLowerCase();
  const skills = toLowerList(student.skills);
  const interests = toLowerList(student.interests || student.interestedCompanies);
  const projects = cleanList(student.projects);
  const internships = cleanInternshipList(student.internships);
  const certifications = cleanList(student.certifications);

  const hasFrontend = ["react", "javascript", "html", "css", "typescript"].some((skill) => skills.includes(skill));
  const hasBackend = ["node.js", "node", "express", "mongodb", "sql", "java", "python"].some((skill) => skills.includes(skill));
  const wantsData = goal.includes("data") || branch.includes("information") || skills.includes("python") || skills.includes("power bi");
  const wantsFrontend = goal.includes("front") || hasFrontend;
  const wantsFullStack = goal.includes("full") || (hasFrontend && hasBackend);
  const isCoreCs = branch.includes("computer") || branch.includes("information") || branch.includes("it");

  const cards = [];

  if (wantsData && !wantsFrontend) {
    cards.push({
      title: "Data-focused roles match your profile",
      score: 82,
      reason: "Your branch, goals or current skills point toward analyst and data-oriented entry roles.",
      action: "Strengthen one data portfolio case study",
      requiredSkills: ["Python", "SQL", "Excel", "Power BI"],
      aiUse: ["Ask AI to explain dashboards", "Generate analysis prompts", "Review your project summary"],
      implementation: ["Build one dashboard project", "Document insights clearly", "Add data storytelling to your resume"],
      futureRole: "Data Analyst"
    });
  } else if (wantsFullStack) {
    cards.push({
      title: "Full stack roles are a strong next target",
      score: 84,
      reason: "Your profile already shows a mix of UI interest and backend-ready skills.",
      action: "Build one complete full stack project",
      requiredSkills: ["React", "Node.js", "REST APIs", "Database design"],
      aiUse: ["Generate API schema drafts", "Review component structure", "Debug integration issues faster"],
      implementation: ["Add auth and CRUD flow", "Connect frontend to backend", "Deploy and document the project"],
      futureRole: "Full Stack Developer"
    });
  } else if (wantsFrontend || isCoreCs) {
    cards.push({
      title: "Frontend roles fit your current profile best",
      score: hasFrontend ? 86 : 74,
      reason: hasFrontend
        ? "Your current skills already align with entry-level frontend hiring patterns."
        : "Your branch supports frontend preparation, but you still need stronger UI project proof.",
      action: "Prioritize frontend-ready portfolio work",
      requiredSkills: ["React", "JavaScript", "TypeScript", "API integration"],
      aiUse: ["Review layouts with AI", "Generate component ideas", "Refine project explanations"],
      implementation: ["Build one polished dashboard", "Add responsive pages", "Deploy and attach links to your resume"],
      futureRole: "Frontend Engineer"
    });
  } else {
    cards.push({
      title: "Create a role-focused profile direction",
      score: 70,
      reason: "Your current profile is broad, so choosing one clear direction will improve recommendation quality.",
      action: "Pick a role path and align your profile",
      requiredSkills: ["Role-specific tools", "Project proof", "Clear resume positioning"],
      aiUse: ["Ask AI to compare roles", "Generate learning plans", "Refine your resume summary"],
      implementation: ["Choose one target role", "Build one relevant project", "Add matching skills and keywords"],
      futureRole: "Career Focus"
    });
  }

  if (projects.length === 0) {
    cards.push({
      title: "Projects are the biggest missing proof point",
      score: 68,
      reason: "Without projects, recruiters cannot verify your practical skills even if your profile looks promising.",
      action: "Add two resume-ready projects",
      requiredSkills: ["Problem solving", "GitHub", "Deployment"],
      aiUse: ["Break large ideas into tasks", "Generate starter architecture", "Review project descriptions"],
      implementation: ["Build one major project", "Build one mini project", "Publish code and screenshots"],
      futureRole: "Portfolio Builder"
    });
  }

  if (internships.length === 0) {
    cards.push({
      title: "Internship evidence can improve trust fast",
      score: 72,
      reason: "A practical internship or simulated client project helps your profile look much more job-ready.",
      action: "Target internship-style experience next",
      requiredSkills: ["Team workflow", "Communication", "Delivery discipline"],
      aiUse: ["Practice interview answers", "Draft outreach messages", "Review task updates"],
      implementation: ["Apply to internships weekly", "Take one freelance or campus project", "Write outcome-based bullet points"],
      futureRole: "Industry Ready Candidate"
    });
  }

  if (isCoreCs && !skills.includes("dsa") && !skills.includes("data structures")) {
    cards.push({
      title: "Coding round preparation needs more attention",
      score: 66,
      reason: "Core software roles usually expect stronger problem-solving depth before final conversion.",
      action: "Start a structured DSA revision plan",
      requiredSkills: ["Arrays", "Strings", "Hashing", "Recursion"],
      aiUse: ["Ask for hints instead of answers", "Generate revision sheets", "Review dry runs"],
      implementation: ["Solve two questions daily", "Track repeated mistakes", "Revise one pattern every weekend"],
      futureRole: "SDE Trainee"
    });
  }

  if (certifications.length === 0) {
    cards.push({
      title: "Certifications can support your profile positioning",
      score: 61,
      reason: "They will not replace projects, but they can strengthen a focused learning path and resume keywords.",
      action: "Add one targeted certification",
      requiredSkills: ["Platform basics", "Structured learning", "Resume keywords"],
      aiUse: ["Compare course options", "Generate revision quizzes", "Summarize key topics"],
      implementation: ["Pick one relevant certification", "Finish it this month", "Add the outcome to your resume"],
      futureRole: "Skill Builder"
    });
  }

  if (!cards.length) {
    cards.push({
      title: "Your profile is in a good starting position",
      score: 78,
      reason: "You already have enough information in your profile to start targeting better-matched roles.",
      action: "Keep refining your strongest path",
      requiredSkills: ["Execution", "Consistency", "Interview readiness"],
      aiUse: ["Review your plan weekly", "Practice explanations", "Refine portfolio copy"],
      implementation: ["Update profile often", "Apply selectively", "Track conversion after each improvement"],
      futureRole: "Placement Ready"
    });
  }

  return cards.slice(0, 4).map(enrichRecommendation);
};

const toList = (value) => {
  if (Array.isArray(value)) {
    return value.length ? value : [""];
  }

  if (!value) {
    return [""];
  }

  return String(value)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
};

const cleanList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter(item => {
      if (typeof item === 'object' && item !== null) {
        return Object.values(item).some(v => v !== null && v !== undefined && String(v).trim() !== "");
      }
      return item && String(item).trim() !== "";
    });
  }
  return toList(value).map((item) => typeof item === 'string' ? item.trim() : "").filter(Boolean);
};

const emptyEducation = {
  school: "",
  degree: "",
  fieldOfStudy: "",
  startMonth: "",
  startYear: "",
  endMonth: "",
  endYear: "",
  grade: "",
  activities: "",
  description: ""
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const years = Array.from({ length: 35 }, (_, index) => String(new Date().getFullYear() + 5 - index));

const toEducationList = (education, student = {}) => {
  if (Array.isArray(education) && education.length) {
    return education;
  }

  if (student.year || student.branch || student.cgpa) {
    return [
      {
        ...emptyEducation,
        degree: student.year || "",
        fieldOfStudy: student.branch || "",
        grade: student.cgpa || ""
      }
    ];
  }

  return [{ ...emptyEducation }];
};

const cleanEducationList = (items) =>
  items
    .map((item) => ({
      ...emptyEducation,
      ...item,
      school: String(item.school || "").trim(),
      degree: String(item.degree || "").trim(),
      fieldOfStudy: String(item.fieldOfStudy || "").trim(),
      grade: String(item.grade || "").trim(),
      activities: String(item.activities || "").trim(),
      description: String(item.description || "").trim()
    }))
    .filter((item) => item.school || item.degree || item.fieldOfStudy || item.grade || item.activities || item.description);

const emptyInternship = {
  company: "",
  role: "",
  location: "",
  startMonth: "",
  startYear: "",
  endMonth: "",
  endYear: "",
  description: ""
};

const toInternshipList = (internships) => {
  if (Array.isArray(internships) && internships.length) {
    if (typeof internships[0] === "string") {
      return internships.map(role => ({ ...emptyInternship, role }));
    }
    return internships;
  }
  return [{ ...emptyInternship }];
};

const cleanInternshipList = (items) =>
  (Array.isArray(items) ? items : [])
    .map((item) => {
      if (typeof item === "string") {
        return { ...emptyInternship, role: item.trim() };
      }
      return {
        ...emptyInternship,
        ...item,
        company: String(item.company || "").trim(),
        role: String(item.role || "").trim(),
        location: String(item.location || "").trim(),
        description: String(item.description || "").trim()
      };
    })
    .filter((item) => item.company || item.role || item.location || item.description);

const normalizeApplicationImages = (item) => ({
  ...item,
  logo: getCompanyLogo(item.company, item.logo, item.companyWebsite || item.companyDomain)
});

const getStudentProfileCompletion = (student) => {
  let uploadedResume = null;
  try {
    uploadedResume = JSON.parse(localStorage.getItem("placer_uploaded_resume") || "null");
  } catch (e) {}

  const educationList = Array.isArray(student.education) ? student.education : [];
  const projectList = Array.isArray(student.projects) ? student.projects : [];
  const internshipList = Array.isArray(student.internships) ? student.internships : [];
  const certificationList = Array.isArray(student.certifications) ? student.certifications : [];
  const achievements = Array.isArray(student.achievements) ? student.achievements : [];
  const competitiveExams = Array.isArray(student.competitiveExams) ? student.competitiveExams : [];
  
  const rawSkills = Array.isArray(student.skills) 
    ? student.skills 
    : (student.skills ? String(student.skills).split(',') : []);
  const skillsCount = rawSkills.filter(Boolean).length;

  const rawLanguages = Array.isArray(student.languages) 
    ? student.languages 
    : (student.languages ? String(student.languages).split(',') : []);
  const languagesCount = rawLanguages.filter(l => l && l !== "[object Object]").length;

  const hasAbout = student.about ? 1 : 0;
  const hasEducation = educationList.length > 0 ? 1 : 0;
  const hasSkills = skillsCount > 0 ? 1 : 0;
  const hasLanguages = languagesCount > 0 ? 1 : 0;
  const hasInternships = internshipList.length > 0 ? 1 : 0;
  const hasProjects = projectList.length > 0 ? 1 : 0;
  const hasCertifications = certificationList.length > 0 ? 1 : 0;
  const hasAchievements = achievements.length > 0 ? 1 : 0;
  const hasExams = competitiveExams.length > 0 ? 1 : 0;
  const hasResume = (student.resume || uploadedResume) ? 1 : 0;
  const hasSocials = (student.socialLinks && (student.socialLinks.linkedin || student.socialLinks.github || student.socialLinks.portfolio)) ? 1 : 0;
  const hasPreferences = (student.careerPreferences && (student.careerPreferences.targetRole || student.careerPreferences.targetLocation)) ? 1 : 0;

  const score = (hasAbout * 10) +
                (hasEducation * 10) +
                (hasSkills * 10) +
                (hasLanguages * 5) +
                (hasInternships * 10) +
                (hasProjects * 15) +
                (hasCertifications * 10) +
                (hasAchievements * 10) +
                (hasExams * 5) +
                (hasResume * 10) +
                (hasSocials * 2.5) +
                (hasPreferences * 2.5);

  return Math.round(score);
};

const StudentDashboard = ({ user, onUserChange, onLogout, activeSection: initialActiveSection }) => {
  const [activeSection, setActiveSection] = useState(initialActiveSection || "Dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const [student, setStudent] = useState(() => safeGetItem("placer_current_user", null) || user || fallbackUser);
  const [jobList, setJobList] = useState(() => (safeGetItem("placer_jobs", null) || seedJobs).map(normalizeJobImages));
  const [applicationList, setApplicationList] = useState(() => (safeGetItem("placer_applications", null) || seedApplications).map(normalizeApplicationImages));
  const [notificationList, setNotificationList] = useState(() => normalizeNotifications(safeGetItem("placer_notifications", null) || seedNotifications));
  const [documentList, setDocumentList] = useState(() => safeGetItem("placer_documents", null) || seedDocuments);
  const [preferences, setPreferences] = useState(() => safeGetItem("placer_preferences", defaultPreferences));

  const profileCompletion = useMemo(() => getStudentProfileCompletion(student), [student]);

  const syncPlacementData = () => {
    setJobList((current) => {
      const nextJobs = (safeGetItem("placer_jobs", null) || seedJobs).map(normalizeJobImages);
      return JSON.stringify(current) === JSON.stringify(nextJobs) ? current : nextJobs;
    });
    setApplicationList((current) => {
      const nextApplications = (safeGetItem("placer_applications", null) || seedApplications).map(normalizeApplicationImages);
      return JSON.stringify(current) === JSON.stringify(nextApplications) ? current : nextApplications;
    });
    setNotificationList((current) => {
      const nextNotifications = normalizeNotifications(safeGetItem("placer_notifications", null) || seedNotifications);
      return JSON.stringify(current) === JSON.stringify(nextNotifications) ? current : nextNotifications;
    });
    setDocumentList((current) => {
      const nextDocuments = safeGetItem("placer_documents", null) || seedDocuments;
      return JSON.stringify(current) === JSON.stringify(nextDocuments) ? current : nextDocuments;
    });
    setStudent((current) => {
      const nextStudent = safeGetItem("placer_current_user", null);
      if (!nextStudent) return current;
      const sanitized = { ...fallbackUser, ...nextStudent, photo: sanitizeProfilePhoto(nextStudent.photo) };
      return JSON.stringify(current) === JSON.stringify(sanitized) ? current : sanitized;
    });
  };

  useEffect(() => {
    if (user) {
      setStudent((current) => {
        const nextStudent = { ...fallbackUser, ...user, photo: sanitizeProfilePhoto(user?.photo) };
        return JSON.stringify(current) === JSON.stringify(nextStudent) ? current : nextStudent;
      });
    }
  }, [user]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (["placer_jobs", "placer_applications", "placer_notifications", "placer_documents", "placer_current_user"].includes(event.key)) {
        syncPlacementData();
      }
    };
    const intervalId = window.setInterval(syncPlacementData, 2500);

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    Promise.all([
      getStudentProfile().catch(() => null),
      getEducation().catch(() => []),
      getSkills().catch(() => []),
      getProjects().catch(() => []),
      getResumes().catch(() => []),
      getStudentDashboardStats().catch(() => null)
    ]).then(([profileData, eduData, skillsData, projData, resumesData, statsData]) => {
      setStudent((current) => {
        if (!profileData && (!eduData || !eduData.length) && (!skillsData || !skillsData.length) && (!projData || !projData.length)) {
          return current;
        }

        const nextObj = { ...current };

        if (profileData) {
          nextObj.id = profileData.id;
          nextObj.user_id = profileData.user_id;
          nextObj.name = profileData.full_name || current.name;
          nextObj.full_name = profileData.full_name || current.full_name;
          nextObj.email = profileData.email || current.email;
          nextObj.phone = profileData.phone || current.phone;
          if (profileData.college) nextObj.college = profileData.college;
          if (profileData.degree) nextObj.degree = profileData.degree;
          if (profileData.branch) nextObj.branch = profileData.branch;
          if (profileData.graduation_year) {
            nextObj.graduationYear = profileData.graduation_year;
            nextObj.graduation_year = profileData.graduation_year;
          }
          if (profileData.cgpa !== null && profileData.cgpa !== undefined) {
            nextObj.cgpa = profileData.cgpa;
          }
          if (profileData.location) nextObj.location = profileData.location;
          if (profileData.bio) {
            nextObj.about = profileData.bio;
            nextObj.bio = profileData.bio;
          }
          if (profileData.github_url || profileData.linkedin_url || profileData.portfolio_url) {
            nextObj.socialLinks = {
              ...(current.socialLinks || {}),
              github: profileData.github_url || current.socialLinks?.github || "",
              linkedin: profileData.linkedin_url || current.socialLinks?.linkedin || "",
              portfolio: profileData.portfolio_url || current.socialLinks?.portfolio || ""
            };
          }
        }

        if (Array.isArray(eduData) && eduData.length > 0) {
          nextObj.education = eduData.map((e) => ({
            id: e.id,
            school: e.institution,
            institution: e.institution,
            degree: e.degree || "",
            fieldOfStudy: e.field_of_study || "",
            field_of_study: e.field_of_study || "",
            startYear: e.start_year || "",
            start_year: e.start_year || "",
            endYear: e.end_year || "",
            end_year: e.end_year || "",
            grade: e.cgpa || e.percentage || "",
            cgpa: e.cgpa,
            percentage: e.percentage
          }));
        }

        if (Array.isArray(skillsData) && skillsData.length > 0) {
          nextObj.skills = skillsData;
        }

        if (Array.isArray(projData) && projData.length > 0) {
          nextObj.projects = projData.map((p) => ({
            id: p.id,
            name: p.title,
            title: p.title,
            description: p.description || "",
            tech: p.technologies || "",
            technologies: p.technologies || "",
            github: p.github_url || "",
            github_url: p.github_url || "",
            link: p.live_url || "",
            live_url: p.live_url || "",
            start_date: p.start_date || "",
            end_date: p.end_date || ""
          }));
        }

        if (Array.isArray(resumesData) && resumesData.length > 0) {
          nextObj.resumes = resumesData;
        }

        return nextObj;
      });
    });
  }, []);

  const updatePreferences = (updater) => {
    setPreferences((current) => {
      const nextPreferences = typeof updater === "function" ? updater(current) : updater;
      localStorage.setItem("placer_preferences", JSON.stringify(nextPreferences));
      return nextPreferences;
    });
  };

  const updateStudent = (nextStudent) => {
    const sanitizedStudent = { ...nextStudent, photo: sanitizeProfilePhoto(nextStudent.photo) };
    setStudent(sanitizedStudent);
    localStorage.setItem("placer_current_user", JSON.stringify(sanitizedStudent));

    const token = getStoredToken();
    if (token) {
      updateStudentProfile({
        college: sanitizedStudent.college || sanitizedStudent.school || null,
        degree: sanitizedStudent.degree || null,
        branch: sanitizedStudent.branch || null,
        graduation_year: parseInt(sanitizedStudent.graduationYear || sanitizedStudent.graduation_year) || null,
        cgpa: parseFloat(sanitizedStudent.cgpa) || null,
        location: sanitizedStudent.location || null,
        bio: sanitizedStudent.about || sanitizedStudent.bio || null,
        github_url: sanitizedStudent.socialLinks?.github || sanitizedStudent.github_url || null,
        linkedin_url: sanitizedStudent.socialLinks?.linkedin || sanitizedStudent.linkedin_url || null,
        portfolio_url: sanitizedStudent.socialLinks?.portfolio || sanitizedStudent.portfolio_url || null
      }).catch(err => console.error("[DB Sync] Profile update failed:", err));
    }

    const savedStudents = safeGetItem("placer_students", []);
    const nextStudents = savedStudents.map((item) => (item.email === sanitizedStudent.email ? sanitizedStudent : item));
    localStorage.setItem("placer_students", JSON.stringify(nextStudents.length ? nextStudents : [sanitizedStudent]));

    const savedUsers = safeGetItem("placer_users", []);
    const nextUsers = savedUsers.map((item) =>
      item.email === sanitizedStudent.email && item.role === sanitizedStudent.role ? { ...item, ...sanitizedStudent } : item
    );
    if (nextUsers.length) {
      localStorage.setItem("placer_users", JSON.stringify(nextUsers));
    }

    if (onUserChange) {
      onUserChange(sanitizedStudent);
    }
  };

  const jobsWithStatus = useMemo(() => {
    const applicationsByJob = new Map(
      applicationList.map((item) => [getJobKey(item.company, item.role), item])
    );
    const liveJobs = jobList.map((job) => {
      const application = applicationsByJob.get(getJobKey(job.company, job.role));

      return {
        ...normalizeJobImages(job),
        applicationStatus: application?.status || null,
        stage: application?.stage || null,
        appliedDate: application?.date || null,
        displayStatus: getDisplayStatus(job.status, application?.status),
        isHistoryOnly: false
      };
    });
    const existingKeys = new Set(liveJobs.map((job) => getJobKey(job.company, job.role)));
    const historyOnlyJobs = applicationList
      .filter((item) => !existingKeys.has(getJobKey(item.company, item.role)))
      .map((item) => ({
        company: item.company,
        companyShort: item.companyShort,
        companyWebsite: item.companyWebsite || item.companyDomain || "",
        logo: getCompanyLogo(item.company, item.logo, item.companyWebsite || item.companyDomain),
        role: item.role,
        package: "From application history",
        location: item.stage === "Recruiter Decision" ? "Decision updated" : "Previously applied",
        match: 0,
        status: item.status,
        skills: [],
        applicationStatus: item.status,
        stage: item.stage,
        appliedDate: item.date,
        displayStatus: getDisplayStatus(item.status, item.status),
        isHistoryOnly: true
      }));

    return [...liveJobs, ...historyOnlyJobs].sort((left, right) => {
      if (left.isHistoryOnly !== right.isHistoryOnly) {
        return left.isHistoryOnly ? 1 : -1;
      }

      const statusPriority = {
        Active: 0,
        Open: 1,
        Saved: 2,
        Applied: 3,
        Pending: 4,
        Shortlisted: 5,
        "On Hold": 6,
        Draft: 7,
        Closed: 8,
        Rejected: 9
      };

      return (statusPriority[left.displayStatus] ?? 99) - (statusPriority[right.displayStatus] ?? 99);
    });
  }, [applicationList, jobList]);

  const filteredJobs = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return jobsWithStatus.filter((job) => {
      const matchesSearch =
        !query ||
        [job.company, job.role, job.location, ...job.skills].some((value) =>
          value.toLowerCase().includes(query)
        );
      const matchesStatus = statusFilter === "All" || job.displayStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobsWithStatus, searchTerm, statusFilter]);

  const filteredApplications = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) {
      return applicationList;
    }

    return applicationList.filter((item) =>
      [item.company, item.role, item.stage, item.status, item.date].some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
  }, [applicationList, searchTerm]);

  const filteredNotifications = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) {
      return notificationList;
    }

    return notificationList.filter((item) => item.message.toLowerCase().includes(query));
  }, [notificationList, searchTerm]);

  const unreadNotifications = useMemo(() => notificationList.filter((item) => !item.read), [notificationList]);

  const generatedRecommendations = useMemo(() => buildRecommendations(student), [student]);

  const filteredRecommendations = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) {
      return generatedRecommendations;
    }

    return generatedRecommendations.filter((item) =>
      [item.title, item.reason, item.action, item.futureRole, ...item.requiredSkills].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [generatedRecommendations, searchTerm]);

  const filteredDocuments = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) {
      return documentList;
    }

    return documentList.filter((document) => document.name.toLowerCase().includes(query));
  }, [documentList, searchTerm]);

  const dashboardStats = useMemo(() => {
    const totalApplications = applicationList.length;
    const eligibleJobs = jobList.filter((j) => j.status === "Open" || j.status === "Saved").length;
    const upcomingDrives = Math.max(3, jobList.filter((j) => j.status === "Open" && j.match >= 75).length);
    const interviewsCount = applicationList.filter((item) =>
      ["Technical Interview", "Online Test", "Technical Round", "HR Interview", "Final Interview", "Final Result"].some(
        (stage) => String(item.stage || "").toLowerCase().includes(stage.toLowerCase())
      ) && item.status !== "Rejected"
    ).length;

    return [
      {
        label: "Total Applied Jobs",
        value: totalApplications,
        trend: totalApplications ? "Track progress in Applications" : "No applications yet",
        tone: "indigo",
        icon: <FaBriefcase />
      },
      {
        label: "Eligible Jobs",
        value: eligibleJobs,
        trend: eligibleJobs ? "Opportunities matching branch" : "Update profile to find matches",
        tone: "green",
        icon: <FaCheckCircle />
      },
      {
        label: "Upcoming Drives",
        value: upcomingDrives,
        trend: "On-campus & pool recruitment",
        tone: "amber",
        icon: <FaCalendarCheck />
      },
      {
        label: "Interview Count",
        value: interviewsCount,
        trend: interviewsCount ? "Prep with AI Mock Interviews" : "Awaiting interview shortlists",
        tone: "indigo",
        icon: <FaClock />
      },
      {
        label: "Readiness Score",
        value: profileCompletion,
        unit: "%",
        trend: profileCompletion >= 80 ? "Excellent profile readiness" : "Complete sections to improve score",
        tone: "green",
        icon: <FaAward />
      }
    ];
  }, [applicationList, jobList, profileCompletion]);

  const statusChartData = useMemo(() => {
    const counts = [
      { name: "Applied", value: applicationList.filter((item) => item.status === "Applied").length, color: "#4f46e5" },
      { name: "Pending", value: applicationList.filter((item) => item.status === "Pending").length, color: "#d97706" },
      { name: "Shortlisted", value: applicationList.filter((item) => item.status === "Shortlisted").length, color: "#059669" },
      { name: "Rejected", value: applicationList.filter((item) => item.status === "Rejected").length, color: "#dc2626" }
    ];

    return counts.filter((item) => item.value > 0);
  }, [applicationList]);

  const pushNotification = (message) => {
    const nextNotifications = [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        message,
        read: false,
        createdAt: new Date().toLocaleString()
      },
      ...notificationList
    ];
    setNotificationList(nextNotifications);
    localStorage.setItem("placer_notifications", JSON.stringify(nextNotifications));
  };

  const markNotificationsSeen = () => {
    setNotificationList((current) => {
      if (!current.some((item) => !item.read)) {
        return current;
      }

      const nextNotifications = current.map((item) => ({ ...item, read: true }));
      localStorage.setItem("placer_notifications", JSON.stringify(nextNotifications));
      return nextNotifications;
    });
  };

  const toggleNotifications = () => {
    setShowNotifications((value) => {
      const nextValue = !value;
      if (nextValue) {
        markNotificationsSeen();
      }
      return nextValue;
    });
  };

  const persistJobs = (nextJobs) => {
    const normalizedJobs = nextJobs.map(normalizeJobImages);
    setJobList(normalizedJobs);
    localStorage.setItem("placer_jobs", JSON.stringify(normalizedJobs));
  };

  const persistApplications = (nextApplications) => {
    const normalizedApplications = nextApplications.map(normalizeApplicationImages);
    setApplicationList(normalizedApplications);
    localStorage.setItem("placer_applications", JSON.stringify(normalizedApplications));
  };

  const handleApplyJob = (job) => {
    const alreadyApplied = applicationList.some((item) => item.company === job.company && item.role === job.role);
    if (alreadyApplied) {
      pushNotification(`You already applied for ${job.role} at ${job.company}.`);
      setActiveSection("My Applications");
      setSelectedJob(null);
      return false;
    }

    const nextApplications = [
      {
        company: job.company,
        companyShort: job.companyShort,
        companyWebsite: job.companyWebsite || job.companyDomain || "",
        logo: getCompanyLogo(job.company, job.logo, job.companyWebsite || job.companyDomain),
        role: job.role,
        stage: "Mentor Approval",
        date: new Date().toLocaleDateString(),
        status: "Pending"
      },
      ...applicationList
    ];
    persistApplications(nextApplications);
    pushNotification(`Application sent to mentor for ${job.role} at ${job.company}.`);
    setActiveSection("My Applications");
    setSelectedJob(null);
    return true;
  };

  const handleSaveJob = (job) => {
    const nextJobs = jobList.map((item) =>
      item.company === job.company && item.role === job.role ? { ...item, status: "Saved" } : item
    );
    persistJobs(nextJobs);
    pushNotification(`${job.company} ${job.role} saved for later.`);
  };

  const handleDocumentUpload = (file) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const nextDocument = {
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        dataUrl: reader.result,
        uploadedAt: new Date().toLocaleString()
      };
      const nextDocuments = [nextDocument, ...documentList];
      setDocumentList(nextDocuments);
      localStorage.setItem("placer_documents", JSON.stringify(nextDocuments));
      pushNotification(`${file.name} uploaded successfully and sent for verification.`);
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentView = (document) => {
    if (document.dataUrl) {
      setPreviewDoc(document);
      pushNotification(`${document.name} opened for preview.`);
      return;
    }
    pushNotification(`${document.name} is a sample document. Upload a file to preview it.`);
  };

  const handleDocumentDelete = (document) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the document "${document.name}"?`);
    if (!confirmDelete) return;
    const nextDocuments = documentList.filter((item) => item.id !== document.id);
    setDocumentList(nextDocuments);
    localStorage.setItem("placer_documents", JSON.stringify(nextDocuments));
    pushNotification(`${document.name} deleted successfully.`);
  };

  const handleRecommendationAction = (action) => {
    pushNotification(`AI task added: ${action}.`);
  };

  const handleNotificationDelete = (targetNotification) => {
    const targetIndex = notificationList.findIndex((item) => item.id === targetNotification.id);
    const nextNotifications = notificationList.filter((_, index) => index !== targetIndex);
    setNotificationList(nextNotifications);
    localStorage.setItem("placer_notifications", JSON.stringify(nextNotifications));
  };

  const handleNotificationMarkRead = (targetNotification) => {
    setNotificationList((current) => {
      let nextNotifications;
      if (targetNotification) {
        nextNotifications = current.map((item) =>
          item.id === targetNotification.id ? { ...item, read: true } : item
        );
      } else {
        nextNotifications = current.map((item) => ({ ...item, read: true }));
      }
      localStorage.setItem("placer_notifications", JSON.stringify(nextNotifications));
      return nextNotifications;
    });
    pushNotification(targetNotification ? "Notification marked as read." : "All notifications marked as read.");
  };

  const handleClearAllNotifications = () => {
    const confirmClear = window.confirm("Are you sure you want to clear all notifications?");
    if (!confirmClear) return;
    setNotificationList([]);
    localStorage.setItem("placer_notifications", JSON.stringify([]));
    pushNotification("All notifications cleared.");
  };

  const handleSettingChange = (key, enabled, label) => {
    updatePreferences((current) => ({ ...current, [key]: enabled }));
    pushNotification(`${label} ${enabled ? "enabled" : "disabled"}.`);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-motion", preferences.reducedMotion ? "reduced" : "default");
  }, [preferences.reducedMotion]);

  const handleDeleteAccount = () => {
    const shouldDelete = window.confirm(
      "Are you sure you want to permanently delete your account? This action cannot be undone."
    );

    if (!shouldDelete) {
      return;
    }

    const nextUsers = safeGetItem("placer_users", []).filter(
      (item) => !(item.email === student.email && item.role === student.role)
    );
    const nextStudents = safeGetItem("placer_students", []).filter(
      (item) => item.email !== student.email
    );

    localStorage.setItem("placer_users", JSON.stringify(nextUsers));
    localStorage.setItem("placer_students", JSON.stringify(nextStudents));
    localStorage.removeItem("placer_current_user");

    window.alert("Your account has been deleted permanently.");

    if (onLogout) {
      onLogout();
    }
  };

  const sectionTitle = activeSection === "Dashboard" ? "Placement Dashboard" : activeSection;

  return (
    <div className={`app-shell ${preferences.compactView ? "compact-ui" : ""}`}>
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        notifications={notificationList}
        unreadCount={unreadNotifications.length}
        showNotifications={showNotifications}
        onToggleNotifications={toggleNotifications}
        user={student}
        onLogout={onLogout}
      />

      <div className="dashboard-layout">
        <Sidebar
          active={activeSection}
          onChange={(section) => {
            setActiveSection(section);
            if (section === "Notifications") {
              markNotificationsSeen();
            }
          }}
          notificationCount={unreadNotifications.length}
        />

        <main className="dashboard-main">
          <header className="page-header">
            <div>
              <h1>{sectionTitle}</h1>
              <p>Welcome back, {student.name}. Track jobs, resume readiness and AI recommendations in one place.</p>
            </div>
            <div
              className="profile-score"
              style={{ "--score": `${profileCompletion}%` }}
              aria-label={`Profile completion ${profileCompletion} percent`}
            >
              <span>{profileCompletion}%</span>
              <small>Profile ready</small>
            </div>
          </header>

          {activeSection === "Dashboard" && (
            <DashboardHome
              applications={filteredApplications}
              stats={dashboardStats}
              statusData={statusChartData}
              filteredJobs={filteredJobs}
              recommendedJobs={jobsWithStatus}
              notifications={filteredNotifications}
              onApplyJob={handleApplyJob}
              onSaveJob={handleSaveJob}
              onViewJob={setSelectedJob}
              onShowSection={setActiveSection}
            />
          )}
          {activeSection === "Profile" && <ProfileSection student={student} onSave={updateStudent} />}
          {activeSection === "Jobs" && (
            <JobsSection
              filteredJobs={filteredJobs}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onApplyJob={handleApplyJob}
              onSaveJob={handleSaveJob}
              onViewJob={setSelectedJob}
            />
          )}
          {activeSection === "My Applications" && <ApplicationsSection applications={filteredApplications} />}
          {activeSection === "AI Recommendations" && (
            <AIRecommendationsPage
              student={student}
              onApplyJob={handleApplyJob}
              onSaveJob={handleSaveJob}
              appliedJobs={applicationList}
              savedJobs={jobList.filter((j) => j.status === "Saved")}
            />
          )}
          {activeSection === "AI Assistant" && <AIAssistantPage student={student} />}
          {activeSection === "Skill Gap Analysis" && <SkillGapPage student={student} />}
          {activeSection === "Resume & ATS" && (
            <ATSAnalyzerPage student={student} pushNotification={pushNotification} />
          )}
          {activeSection === "AI Job Search" && (
            <AISearchPage
              onApplyJob={handleApplyJob}
              onSaveJob={handleSaveJob}
              appliedJobs={applicationList}
              savedJobs={jobList.filter((j) => j.status === "Saved")}
            />
          )}
          {activeSection === "Interviews" && <InterviewsSection pushNotification={pushNotification} />}
          {activeSection === "Assessments" && (
            <AssessmentRunnerPage student={student} pushNotification={pushNotification} />
          )}
          {activeSection === "Documents" && (
            <DocumentsSection
              documents={filteredDocuments}
              onDelete={handleDocumentDelete}
              onUpload={handleDocumentUpload}
              onView={handleDocumentView}
            />
          )}
          {activeSection === "Notifications" && (
            <NotificationsSection 
              notifications={filteredNotifications} 
              onDelete={handleNotificationDelete} 
              onClearAll={handleClearAllNotifications}
              onMarkRead={handleNotificationMarkRead}
            />
          )}
          {activeSection === "Settings" && (
            <SettingsSection
              preferences={preferences}
              onSettingChange={handleSettingChange}
              onDeleteAccount={handleDeleteAccount}
            />
          )}
          {activeSection === "Mock Interviews" && <MockInterviewSection pushNotification={pushNotification} />}
          {activeSection === "Mentors" && <MentorConnectSection pushNotification={pushNotification} />}
        </main>
      </div>

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          isApplied={applicationList.some(
            (item) => item.company === selectedJob.company && item.role === selectedJob.role
          )}
          onApply={handleApplyJob}
          onClose={() => setSelectedJob(null)}
          onSave={handleSaveJob}
        />
      )}

      {previewDoc && (
        <div 
          className="modal-backdrop" 
          role="dialog" 
          aria-modal="true" 
          style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1000, position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => setPreviewDoc(null)}
        >
          <section 
            className="job-modal" 
            style={{ maxWidth: "800px", width: "100%", padding: "24px", borderRadius: "16px", background: "#fff", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ paddingBottom: "16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "#0f172a" }}>
                  Document Preview
                </h2>
                <p style={{ fontSize: "12px", color: "var(--muted)", margin: "4px 0 0 0" }}>
                  {previewDoc.name}
                </p>
              </div>
              <button 
                className="icon-button" 
                type="button" 
                onClick={() => setPreviewDoc(null)} 
                aria-label="Close" 
                style={{ fontSize: "20px", border: "none", background: "none", cursor: "pointer" }}
              >
                <FaTimesCircle />
              </button>
            </div>

            <div style={{ padding: "24px 0", display: "flex", justifyContent: "center", alignItems: "center", background: "#f8fafc", borderRadius: "8px", marginTop: "16px", minHeight: "300px" }}>
              {previewDoc.type.toLowerCase().includes("pdf") ? (
                <iframe 
                  src={previewDoc.dataUrl} 
                  title={previewDoc.name} 
                  style={{ width: "100%", height: "60vh", border: "none", borderRadius: "8px" }} 
                />
              ) : previewDoc.type.toLowerCase().includes("image") || previewDoc.type.toLowerCase().includes("png") || previewDoc.type.toLowerCase().includes("jpg") || previewDoc.type.toLowerCase().includes("jpeg") ? (
                <img 
                  src={previewDoc.dataUrl} 
                  alt={previewDoc.name} 
                  style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain", borderRadius: "8px" }} 
                />
              ) : (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <FaFileAlt style={{ fontSize: "64px", color: "var(--muted)", marginBottom: "16px" }} />
                  <p style={{ fontWeight: 600, color: "var(--ink)", marginBottom: "8px" }}>No Online Preview Available</p>
                  <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "20px" }}>Previewing is supported for PDF and Images. Download to view locally.</p>
                  <a 
                    href={previewDoc.dataUrl} 
                    download={previewDoc.name} 
                    className="primary-button" 
                    style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>

            <div style={{ paddingTop: "16px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
              <button 
                className="secondary-button" 
                type="button" 
                onClick={() => setPreviewDoc(null)}
              >
                Close
              </button>
              <a 
                href={previewDoc.dataUrl} 
                download={previewDoc.name} 
                className="primary-button" 
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                Download
              </a>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function DashboardHome({ applications, stats, statusData, filteredJobs, recommendedJobs, notifications, onApplyJob, onSaveJob, onViewJob, onShowSection }) {
  const recentApplications = applications.slice(0, 4);
  const totalApplications = statusData.reduce((sum, item) => sum + item.value, 0);
  const liveJobs = filteredJobs
    .filter((job) => !job.isHistoryOnly && !["Applied", "Pending", "Shortlisted", "Rejected"].includes(job.displayStatus))
    .sort((left, right) => {
      const leftPriority = ["Active", "Open"].includes(left.displayStatus) ? 0 : left.displayStatus === "Saved" ? 1 : 2;
      const rightPriority = ["Active", "Open"].includes(right.displayStatus) ? 0 : right.displayStatus === "Saved" ? 1 : 2;

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return (right.match || 0) - (left.match || 0);
    });
  const availableJobs = liveJobs.length > 0 ? liveJobs : filteredJobs.slice(0, 3);

  return (
    <>
      <section className="stats-grid">
        {stats.map((stat) => (
          <article className="metric-card" key={stat.label}>
            <div className={`metric-icon ${stat.tone}`}>{stat.icon}</div>
            <div>
              <p>{stat.label}</p>
              <strong>{stat.value}{stat.unit || ""}</strong>
              <span>{stat.trend}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="reference-dashboard-grid">
        <div className="panel ai-panel">
          <div className="panel-title compact-title">
            <div>
              <h2><FaRobot /> AI Recommended Jobs</h2>
              <p>Best-matched live roles first, with history fallback when the feed is quiet.</p>
            </div>
            <button className="link-button" type="button" onClick={() => onShowSection("Jobs")}>View All</button>
          </div>
          <div className="recommended-list">
            {availableJobs.slice(0, 3).map((job) => (
              <RecommendedJobRow
                job={job}
                key={`${job.company}-${job.role}`}
                onApplyJob={onApplyJob}
                onSaveJob={onSaveJob}
                onViewJob={onViewJob}
              />
            ))}
            {availableJobs.length === 0 && <EmptyState text="No recommended jobs are available right now." />}
          </div>
        </div>

        <div className="panel status-panel">
          <div className="panel-title compact-title">
            <div>
              <h2>Application Status</h2>
            </div>
            <button className="link-button muted-link" type="button" onClick={() => onShowSection("My Applications")}>This Month</button>
          </div>
          <div className="status-content">
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={0}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <strong>{applications.length}</strong>
                <span>Total</span>
              </div>
            </div>
            <div className="status-legend">
              {statusData.length > 0 ? statusData.map((item) => (
                <div key={item.name}>
                  <span className="legend-dot" style={{ background: item.color }} />
                  <span>{item.name}</span>
                  <strong>{item.value} ({totalApplications ? Math.round((item.value / totalApplications) * 100) : 0}%)</strong>
                </div>
              )) : <EmptyState text="No real application statuses yet." />}
            </div>
          </div>
        </div>

        <div className="panel recent-panel">
          <div className="panel-title compact-title">
            <div>
              <h2>Recent Applications</h2>
            </div>
          </div>
          <div className="mini-table">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Applied On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((item) => (
                  <tr key={`${item.company}-${item.role}-${item.date}`}>
                    <td>{item.company}</td>
                    <td>{item.role}</td>
                    <td>{item.date}</td>
                    <td><span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span></td>
                  </tr>
                ))}
                {recentApplications.length === 0 && (
                  <tr>
                    <td colSpan="4">No real applications yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button className="link-button center-link" type="button" onClick={() => onShowSection("My Applications")}>
            View All Applications
          </button>
        </div>

        <div className="panel notification-panel">
          <div className="panel-title compact-title">
            <div>
              <h2>Notifications</h2>
            </div>
            <button className="link-button" type="button" onClick={() => onShowSection("Notifications")}>View All</button>
          </div>
          <div className="dashboard-notifications">
            {notifications.slice(0, 3).map((item, index) => (
              <article className="dashboard-notification" key={`${item}-${index}`}>
                <div className={`metric-icon ${index === 1 ? "green" : index === 2 ? "amber" : "indigo"}`}>
                  {index === 1 ? <FaCheckCircle /> : index === 2 ? <FaBell /> : <FaBriefcase />}
                </div>
                <div>
                  <h3>{item.message}</h3>
                  <p>{index === 0 ? "2 hours ago" : `${index} day ago`}</p>
                </div>
                <span className="notification-dot" />
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function RecommendedJobRow({ job, onViewJob, onSaveJob }) {
  return (
    <article className="recommended-job-row">
      <button className="company-logo-button" type="button" onClick={() => onSaveJob(job)}>
        {job.logo ? (
          <img
            src={job.logo}
            alt={job.company}
            title={job.company}
            onError={(event) => {
              event.currentTarget.style.display = "none";
              event.currentTarget.nextElementSibling.style.display = "inline-flex";
            }}
          />
        ) : null}
        <span style={{ display: job.logo ? "none" : "inline-flex" }}>{job.companyShort || job.company.slice(0, 3)}</span>
      </button>
      <div className="recommended-job-main">
        <h3>{job.role}</h3>
        <p>{job.company}</p>
        <span className={`status-pill ${String(job.displayStatus || job.status).toLowerCase()}`}>{job.displayStatus || job.status}</span>
        <div className="skill-tags small-tags">
          {job.skills.slice(0, 3).map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </div>
      <div className="recommended-job-action">
        <strong>{job.match}% Match</strong>
        <button className="primary-button compact-button" type="button" onClick={() => onViewJob(job)}>
          View Job
        </button>
      </div>
    </article>
  );
}

function JobsSection({ filteredJobs, statusFilter, setStatusFilter, onApplyJob, onSaveJob, onViewJob }) {
  const [jobView, setJobView] = useState("live");
  const filters = ["All", "Active", "Saved", "Pending", "Shortlisted", "On Hold", "Draft", "Closed", "Rejected"];
  const visibleJobs = filteredJobs.filter((job) => (jobView === "live" ? !job.isHistoryOnly : job.isHistoryOnly));

  return (
    <section>
      <div className="toolbar">
        <div className="toolbar-label">
          <FaFilter />
          <span>Filter jobs</span>
        </div>
        <div className="segmented-control">
          <button
            className={jobView === "live" ? "active" : ""}
            onClick={() => setJobView("live")}
            type="button"
          >
            Live Jobs
          </button>
          <button
            className={jobView === "history" ? "active" : ""}
            onClick={() => setJobView("history")}
            type="button"
          >
            Job History
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-label">
          <FaBriefcase />
          <span>{jobView === "live" ? "Current openings and saved jobs" : "Applied, shortlisted and rejected jobs"}</span>
        </div>
        <div className="segmented-control">
          {filters.map((filter) => (
            <button
              className={statusFilter === filter ? "active" : ""}
              key={filter}
              onClick={() => setStatusFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="job-list">
        {visibleJobs.map((job) => (
          <JobCard
            job={job}
            key={`${job.company}-${job.role}`}
            onApplyJob={onApplyJob}
            onSaveJob={onSaveJob}
            onViewJob={onViewJob}
          />
        ))}
        {visibleJobs.length === 0 && (
          <EmptyState text={jobView === "live" ? "No live jobs match your search." : "No job history matches your search."} />
        )}
      </div>
    </section>
  );
}

function JobCard({ job, onApplyJob, onSaveJob, onViewJob }) {
  const isLocked = Boolean(job.applicationStatus) || job.isHistoryOnly;

  return (
    <article className="job-card">
      <div className="company-mark">
        {job.logo ? (
          <img src={job.logo} alt={job.company} title={job.company} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextElementSibling.style.display = "inline-flex"; }} />
        ) : null}
        <div style={{ display: job.logo ? "none" : "inline-flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
          {job.companyShort || job.company.slice(0, 2)}
        </div>
      </div>
      <div className="job-content">
        <div className="job-heading">
          <div>
            <h3>{job.role}</h3>
            <p>{job.companyShort || job.company} · {job.location}</p>
          </div>
          <span className={`status-pill ${job.displayStatus.toLowerCase()}`}>{job.displayStatus}</span>
        </div>
        <div className="job-meta">
          <span>{job.package}</span>
          <span>{job.isHistoryOnly ? (job.appliedDate || "History") : `${job.match}% match`}</span>
        </div>
        {job.skills.length > 0 && (
          <div className="skill-tags">
            {job.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        )}
      </div>
      <div className="job-actions">
        <button className="icon-button" type="button" title="Save job" aria-label="Save job" onClick={() => onSaveJob(job)} disabled={isLocked}>
          <FaSave />
        </button>
        <button className="secondary-button" type="button" onClick={() => onViewJob(job)}>View</button>
        <button className="primary-button" type="button" onClick={() => onApplyJob(job)} disabled={isLocked}>
          {isLocked ? job.displayStatus : "Apply"}
        </button>
      </div>
    </article>
  );
}

function JobDetailsModal({ job, isApplied, onApply, onClose, onSave }) {
  const isReadOnlyHistory = job.isHistoryOnly;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="job-modal">
        <div className="panel-title">
          <div>
            <p className="eyebrow">Job Details</p>
            <h2>{job.role}</h2>
            <p>{job.company} - {job.location}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close job details">
            x
          </button>
        </div>

        <div className="job-detail-grid">
          <div>
            <span>Package</span>
            <strong>{job.package}</strong>
          </div>
          <div>
            <span>{isReadOnlyHistory ? "Applied On" : "AI Match"}</span>
            <strong>{isReadOnlyHistory ? (job.appliedDate || "Recorded") : `${job.match}%`}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{job.displayStatus || job.status}</strong>
          </div>
        </div>

        {job.skills.length > 0 && (
          <div className="skill-tags">
            {job.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        )}

        <p className="modal-copy">
          {isReadOnlyHistory
            ? "This job is shown from your application history so you can still track its latest status inside the Jobs tab."
            : "This role matches your current profile. After applying, your application will move to the mentor approval queue and you can track the status from the My Applications page."}
        </p>

        <div className="row-actions modal-actions">
          <button className="secondary-button" type="button" onClick={() => onSave(job)} disabled={isReadOnlyHistory}>
            <FaSave /> Save Job
          </button>
          <button className="primary-button" type="button" onClick={() => onApply(job)} disabled={isApplied || isReadOnlyHistory}>
            {isReadOnlyHistory ? "History" : isApplied ? (job.displayStatus || "Already Applied") : "Apply Now"}
          </button>
        </div>
      </section>
    </div>
  );
}

function ApplicationsSection({ applications }) {
  const steps = ["Applied", "Shortlisted", "Assessment", "Interview", "Offer"];

  const getTimelineStep = (status, stage) => {
    const statusLower = String(status || "").toLowerCase();
    const stageLower = String(stage || "").toLowerCase();

    if (statusLower.includes("offer") || stageLower.includes("offer") || statusLower.includes("hired") || statusLower.includes("select")) return 4;
    if (stageLower.includes("interview") || stageLower.includes("round") || stageLower.includes("gd") || stageLower.includes("hr")) return 3;
    if (stageLower.includes("test") || stageLower.includes("assessment") || stageLower.includes("exam") || stageLower.includes("coding")) return 2;
    if (statusLower.includes("shortlist") || stageLower.includes("shortlist") || statusLower.includes("approved")) return 1;
    return 0;
  };

  return (
    <section className="applications-tracker-layout" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="panel-title" style={{ marginBottom: "8px" }}>
        <div>
          <h2>Application Tracker</h2>
          <p>Track your recruitment rounds and progress milestones</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {applications.map((item) => {
          const activeStep = getTimelineStep(item.status, item.stage);
          const isRejected = String(item.status || "").toLowerCase().includes("reject");
          
          return (
            <article 
              className="application-card-tracker" 
              key={`${item.company}-${item.role}`}
              style={{
                background: "#fff",
                borderRadius: "16px",
                border: "1px solid var(--line)",
                padding: "24px",
                boxShadow: "var(--shadow-glass)",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div 
                style={{ 
                  position: "absolute", 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  height: "4px", 
                  background: isRejected ? "var(--red)" : activeStep === 4 ? "var(--green)" : "var(--primary)" 
                }} 
              />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {item.logo ? (
                    <div style={{ width: "48px", height: "48px", borderRadius: "10px", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", padding: "6px" }}>
                      <img 
                        src={item.logo} 
                        alt={item.company} 
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    </div>
                  ) : (
                    <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: "rgba(37,99,235,0.05)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "var(--primary)" }}>
                      {String(item.companyShort || item.company).charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "var(--ink)" }}>{item.company}</h3>
                    <div style={{ fontSize: "13px", color: "var(--muted)", fontWeight: "500" }}>Applied for <strong style={{ color: "#334155" }}>{item.role}</strong></div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                  <span className={`status-pill ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "500" }}>Applied on: {item.date}</span>
                </div>
              </div>

              <div style={{ marginTop: "10px", paddingBottom: "10px" }}>
                <div className="application-timeline-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", width: "100%", padding: "0 10px" }}>
                  <div style={{ position: "absolute", top: "14px", left: "30px", right: "30px", height: "4px", background: "#f1f5f9", zIndex: 1 }} />
                  <div 
                    style={{ 
                      position: "absolute", 
                      top: "14px", 
                      left: "30px", 
                      width: `calc(${activeStep} * (100% - 60px) / 4)`, 
                      height: "4px", 
                      background: isRejected ? "var(--red)" : "var(--primary)", 
                      zIndex: 1, 
                      transition: "width 0.3s ease" 
                    }} 
                  />

                  {steps.map((step, idx) => {
                    const isCompleted = idx < activeStep;
                    const isActive = idx === activeStep;
                    
                    let dotColor = "#e2e8f0";
                    let dotBorder = "3px solid #e2e8f0";
                    if (isRejected) {
                      if (idx <= activeStep) {
                        dotColor = "var(--red)";
                        dotBorder = "3px solid rgba(239, 68, 68, 0.2)";
                      }
                    } else if (isCompleted || isActive) {
                      dotColor = activeStep === 4 ? "var(--green)" : "var(--primary)";
                      dotBorder = isActive ? `3px solid ${activeStep === 4 ? "rgba(34, 197, 94, 0.25)" : "rgba(37, 99, 235, 0.25)"}` : "3px solid transparent";
                    }

                    return (
                      <div 
                        key={step} 
                        style={{ 
                          display: "flex", 
                          flexDirection: "column", 
                          alignItems: "center", 
                          zIndex: 2, 
                          flex: 1,
                          position: "relative"
                        }}
                      >
                        <div 
                          style={{ 
                            width: "32px", 
                            height: "32px", 
                            borderRadius: "50%", 
                            background: isCompleted || isActive ? dotColor : "#fff", 
                            border: isCompleted || isActive ? dotBorder : "3px solid #e2e8f0",
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            color: isCompleted || isActive ? "#fff" : "#94a3b8",
                            fontSize: "12px",
                            fontWeight: "bold",
                            transition: "all 0.3s ease",
                            boxShadow: isActive ? "0 0 10px rgba(37, 99, 235, 0.4)" : "none"
                          }}
                        >
                          {idx + 1}
                        </div>
                        <span 
                          style={{ 
                            marginTop: "8px", 
                            fontSize: "12px", 
                            fontWeight: isActive ? "700" : "500", 
                            color: isActive ? (isRejected ? "var(--red)" : "var(--primary)") : "var(--muted)",
                            textAlign: "center" 
                          }}
                        >
                          {step}
                        </span>
                        {isActive && (
                          <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "500", marginTop: "2px", display: "block", textAlign: "center" }}>
                            {isRejected ? "Rejected at round" : `Current Stage: ${item.stage}`}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          );
        })}

        {applications.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", background: "#fff", borderRadius: "16px", border: "1px solid var(--line)" }}>
            <p style={{ color: "var(--muted)", margin: 0 }}>No job applications tracked yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ProfileSection({ student, onSave }) {
  const [modalConfig, setModalConfig] = useState({ type: null, mode: 'add', index: null, data: {} });
  const [skillsInput, setSkillsInput] = useState("");
  const [showSkillsSuggestions, setShowSkillsSuggestions] = useState(false);
  const [uploadedResume, setUploadedResume] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("placer_uploaded_resume") || "null");
    } catch (e) {
      return null;
    }
  });

  const allSuggestedSkills = [
    "React", "React Native", "Angular", "Vue.js", "HTML5", "CSS3", "JavaScript", "TypeScript",
    "Node.js", "Express.js", "Python", "Django", "Flask", "Java", "Spring Boot", "C++", "C#",
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "Firebase", "Redis", "Docker", "Kubernetes",
    "AWS", "Google Cloud", "Git", "GitHub", "Data Structures", "Algorithms", "Machine Learning",
    "Data Analysis", "System Design", "UI/UX Design", "Product Management", "Agile", "Excel"
  ];

  // Standardize state collections to avoid null reference crashes
  const educationList = Array.isArray(student.education) ? student.education : [];
  const projectList = Array.isArray(student.projects) ? student.projects : [];
  const internshipList = Array.isArray(student.internships) ? student.internships : [];
  const certificationList = Array.isArray(student.certifications) ? student.certifications : [];
  const achievements = (Array.isArray(student.achievements) ? student.achievements : []).map(item => {
    if (typeof item === 'object' && item !== null) {
      return item.text || item.name || JSON.stringify(item);
    }
    return String(item);
  }).filter(Boolean);
  const competitiveExams = Array.isArray(student.competitiveExams) ? student.competitiveExams : [];
  const socialLinks = student.socialLinks || { linkedin: "", github: "", portfolio: "", twitter: "" };
  const careerPreferences = student.careerPreferences || { targetRole: "", targetLocation: "", preferredSalary: "", jobType: "" };
  
  const rawSkills = Array.isArray(student.skills) 
    ? student.skills 
    : (student.skills 
        ? String(student.skills).split(',') 
        : []);
  const skills = rawSkills.map(s => {
    if (typeof s === 'object' && s !== null) {
      return s.name || s.skill || JSON.stringify(s);
    }
    return String(s).trim();
  }).filter(Boolean);

  const rawLanguages = Array.isArray(student.languages) 
    ? student.languages 
    : (student.languages 
        ? (typeof student.languages === 'object' 
            ? [student.languages] 
            : String(student.languages).split(',')) 
        : []);
  const languages = rawLanguages.map(l => {
    if (typeof l === 'object' && l !== null) {
      return { language: l.language || l.name || "Unknown", read: l.read ?? true, write: l.write ?? true, speak: l.speak ?? true };
    }
    return { language: String(l).trim(), read: true, write: true, speak: true };
  }).filter(l => l.language && l.language !== "[object Object]");

  // Completion calculation
  const scoreSummary = student.about ? 10 : 0;
  const scoreEducation = educationList.length > 0 ? 15 : 0;
  const scoreSkills = skills.length > 0 ? 15 : 0;
  const scoreProjects = projectList.length > 0 ? 15 : 0;
  const scoreInternship = internshipList.length > 0 ? 10 : 0;
  const scoreResume = (student.resume || uploadedResume) ? 15 : 0;
  const scoreLanguages = languages.length > 0 ? 10 : 0;
  const scoreCertifications = certificationList.length > 0 ? 10 : 0;

  const profileCompletion = scoreSummary + scoreEducation + scoreSkills + scoreProjects + scoreInternship + scoreResume + scoreLanguages + scoreCertifications;

  const pushLocalNotification = (message) => {
    try {
      const current = JSON.parse(localStorage.getItem("placer_notifications") || "[]");
      const next = [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          message,
          read: false,
          createdAt: "Just now"
        },
        ...current
      ];
      localStorage.setItem("placer_notifications", JSON.stringify(next));
    } catch (e) {}
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onSave({ ...student, photo: reader.result });
      pushLocalNotification("Profile photo updated successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoRemove = () => {
    onSave({ ...student, photo: "" });
    pushLocalNotification("Profile photo removed.");
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      alert("Please upload a PDF file only.");
      return;
    }
    const token = getStoredToken();
    if (token) {
      try {
        await addResumeMetadata({
          file_name: file.name,
          file_type: file.type || "application/pdf",
          file_size: file.size,
          file_path: file.name
        });
        const updatedResumes = await getResumes().catch(() => []);
        if (updatedResumes && updatedResumes.length) {
          onSave({ ...student, resume: file.name, resumes: updatedResumes });
        }
      } catch (err) {
        console.error("[DB Sync] Resume upload metadata failed:", err);
      }
    }
    const reader = new FileReader();
    reader.onload = () => {
      const resumeData = {
        name: file.name,
        uploadedAt: new Date().toLocaleString(),
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        dataUrl: reader.result
      };
      localStorage.setItem("placer_uploaded_resume", JSON.stringify(resumeData));
      setUploadedResume(resumeData);
      onSave({ ...student, resume: file.name });
      pushLocalNotification(`Resume PDF "${file.name}" uploaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  const handleResumeRemove = async () => {
    const token = getStoredToken();
    if (token && Array.isArray(student.resumes) && student.resumes.length > 0) {
      const activeResume = student.resumes[0];
      if (activeResume && activeResume.id) {
        await deleteResumeMetadata(activeResume.id).catch(err => console.error("[DB Sync] Resume delete failed:", err));
      }
    }
    localStorage.removeItem("placer_uploaded_resume");
    setUploadedResume(null);
    onSave({ ...student, resume: null, resumes: [] });
    pushLocalNotification("Resume PDF removed.");
  };

  // AI Summary Generator
  const generateAISummary = () => {
    const skillsListStr = skills.filter(Boolean).join(", ") || "software development and programming tools";
    const branchName = student.branch || "Computer Engineering";
    const target = student.goal || careerPreferences.targetRole || "Software Developer";
    const projectsList = projectList.map(p => typeof p === 'string' ? p : (p.title || p.name)).filter(Boolean);
    const projectsText = projectsList.length > 0 ? `Demonstrated hands-on experience in building systems like ${projectsList.join(", ")}.` : "Eager to apply theoretical knowledge to solve real-world problems.";

    const generated = `Ambitious and goal-oriented ${branchName} student with a strong engineering foundation. Passionate about specializing in ${skillsListStr} to deliver high-quality solutions. ${projectsText} Eager to leverage these capabilities in a professional ${target} role.`;
    
    setModalConfig({
      type: 'summary',
      mode: 'edit',
      index: null,
      data: {
        about: generated,
        goal: target
      }
    });
    pushLocalNotification("AI Profile Summary generated successfully! Review and save in the modal.");
  };

  // Dynamic Skill Recommendations
  const skillRecs = useMemo(() => {
    const goalLower = (student.goal || careerPreferences.targetRole || "").toLowerCase();
    const skillsLower = skills.map(s => s.toLowerCase());

    let recs = [];
    if (goalLower.includes("data") || goalLower.includes("analyst")) {
      recs = ["Python", "SQL", "Excel", "Power BI", "Tableau", "Pandas", "Scikit-Learn"];
    } else if (goalLower.includes("full") || goalLower.includes("stack")) {
      recs = ["React", "Node.js", "Express", "MongoDB", "Redux", "TypeScript", "Docker"];
    } else if (goalLower.includes("back") || goalLower.includes("engineer")) {
      recs = ["Java", "Spring Boot", "PostgreSQL", "Redis", "Microservices", "REST APIs", "Git"];
    } else {
      recs = ["React", "JavaScript", "HTML5", "CSS3", "Git", "TypeScript", "TailwindCSS"];
    }
    return recs.filter(r => !skillsLower.includes(r.toLowerCase()));
  }, [student.goal, careerPreferences.targetRole, skills]);

  const addRecommendedSkill = async (skill) => {
    if (!skills.includes(skill)) {
      const token = getStoredToken();
      if (token) {
        try {
          await addSkill({ name: skill });
          const freshSkills = await getSkills().catch(() => null);
          if (freshSkills) {
            onSave({ ...student, skills: freshSkills });
            pushLocalNotification(`Added recommended skill: ${skill}`);
            return;
          }
        } catch (err) {
          console.error("[DB Sync] Skill add failed:", err);
        }
      }
      const nextSkills = [...skills, skill];
      onSave({ ...student, skills: nextSkills });
      pushLocalNotification(`Added recommended skill: ${skill}`);
    }
  };

  // AI Career Suggestions
  const careerSuggestions = useMemo(() => {
    const studentSkillsLower = skills.map(s => s.toLowerCase());
    const branchLower = (student.branch || "").toLowerCase();

    const suggestionsList = [];
    if (studentSkillsLower.includes("react") || studentSkillsLower.includes("javascript")) {
      suggestionsList.push("Frontend Engineer (Web applications)");
    }
    if (studentSkillsLower.includes("node.js") || studentSkillsLower.includes("java") || studentSkillsLower.includes("python")) {
      suggestionsList.push("Backend Developer (API & databases)");
    }
    if (studentSkillsLower.includes("sql") || studentSkillsLower.includes("python") || studentSkillsLower.includes("excel")) {
      suggestionsList.push("Data Analyst (Dashboarding & analytics)");
    }
    if (branchLower.includes("computer") || branchLower.includes("it")) {
      suggestionsList.push("Software Development Engineer (SDE)");
    } else {
      suggestionsList.push("Systems Engineer / Graduate Analyst");
    }
    return suggestionsList.slice(0, 3);
  }, [skills, student.branch]);

  // Missing Profile Detection
  const missingAlerts = useMemo(() => {
    const alerts = [];
    if (!student.about) alerts.push({ name: "Profile Summary", score: 10 });
    if (educationList.length === 0) alerts.push({ name: "Education", score: 15 });
    if (skills.length === 0) alerts.push({ name: "Skills", score: 15 });
    if (projectList.length === 0) alerts.push({ name: "Projects", score: 15 });
    if (internshipList.length === 0) alerts.push({ name: "Internships", score: 10 });
    if (!student.resume && !uploadedResume) alerts.push({ name: "Resume PDF", score: 15 });
    if (languages.length === 0) alerts.push({ name: "Languages", score: 10 });
    if (certificationList.length === 0) alerts.push({ name: "Certifications", score: 10 });
    return alerts;
  }, [student, uploadedResume, educationList, skills, projectList, internshipList, languages, certificationList]);

  // Database persistence integration
  const handleSaveItem = async (section, itemData) => {
    let updatedStudent = { ...student };
    const token = getStoredToken();

    if (section === 'header') {
      updatedStudent = { ...updatedStudent, ...itemData };
    } else if (section === 'summary') {
      updatedStudent.about = itemData.about;
      updatedStudent.goal = itemData.goal;
    } else if (section === 'socials') {
      updatedStudent.socialLinks = itemData;
    } else if (section === 'preferences') {
      updatedStudent.careerPreferences = itemData;
    } else if (section === 'education') {
      const currentList = Array.isArray(student.education) ? [...student.education] : [];
      if (token) {
        try {
          const eduPayload = {
            institution: itemData.school || itemData.institution || "College / University",
            degree: itemData.degree || null,
            field_of_study: itemData.fieldOfStudy || itemData.field_of_study || null,
            start_year: parseInt(itemData.startYear || itemData.start_year) || null,
            end_year: parseInt(itemData.endYear || itemData.end_year) || null,
            percentage: parseFloat(itemData.grade) || null,
            cgpa: parseFloat(itemData.grade) || null
          };
          if (modalConfig.mode === 'add') {
            await addEducation(eduPayload);
          } else if (modalConfig.mode === 'edit' && itemData.id) {
            await updateEducation(itemData.id, eduPayload);
          }
          const freshEdu = await getEducation().catch(() => null);
          if (freshEdu) {
            updatedStudent.education = freshEdu.map((e) => ({
              id: e.id,
              school: e.institution,
              institution: e.institution,
              degree: e.degree || "",
              fieldOfStudy: e.field_of_study || "",
              field_of_study: e.field_of_study || "",
              startYear: e.start_year || "",
              start_year: e.start_year || "",
              endYear: e.end_year || "",
              end_year: e.end_year || "",
              grade: e.cgpa || e.percentage || "",
              cgpa: e.cgpa,
              percentage: e.percentage
            }));
          }
        } catch (err) {
          console.error("[DB Sync] Education save failed:", err);
        }
      }
      if (!token || !updatedStudent.education) {
        if (modalConfig.mode === 'add') {
          currentList.push(itemData);
        } else {
          currentList[modalConfig.index] = itemData;
        }
        updatedStudent.education = currentList;
      }
    } else if (section === 'skills') {
      if (token && typeof itemData === 'string' && itemData.trim()) {
        try {
          await addSkill({ name: itemData.trim() });
          const freshSkills = await getSkills().catch(() => null);
          if (freshSkills) {
            updatedStudent.skills = freshSkills;
          }
        } catch (err) {
          console.error("[DB Sync] Skill add failed:", err);
        }
      }
      if (!token || !updatedStudent.skills) {
        updatedStudent.skills = itemData;
      }
    } else if (section === 'projects') {
      const currentList = Array.isArray(student.projects) ? [...student.projects] : [];
      if (token) {
        try {
          const projPayload = {
            title: itemData.name || itemData.title || "Project Title",
            description: itemData.description || null,
            technologies: Array.isArray(itemData.technologies) ? itemData.technologies.join(", ") : (itemData.technologies || itemData.tech || null),
            github_url: itemData.github || itemData.github_url || null,
            live_url: itemData.link || itemData.live_url || null,
            start_date: itemData.start_date || null,
            end_date: itemData.end_date || null
          };
          if (modalConfig.mode === 'add') {
            await addProject(projPayload);
          } else if (modalConfig.mode === 'edit' && itemData.id) {
            await updateProject(itemData.id, projPayload);
          }
          const freshProj = await getProjects().catch(() => null);
          if (freshProj) {
            updatedStudent.projects = freshProj.map((p) => ({
              id: p.id,
              name: p.title,
              title: p.title,
              description: p.description || "",
              tech: p.technologies || "",
              technologies: p.technologies || "",
              github: p.github_url || "",
              github_url: p.github_url || "",
              link: p.live_url || "",
              live_url: p.live_url || "",
              start_date: p.start_date || "",
              end_date: p.end_date || ""
            }));
          }
        } catch (err) {
          console.error("[DB Sync] Project save failed:", err);
        }
      }
      if (!token || !updatedStudent.projects) {
        if (modalConfig.mode === 'add') {
          currentList.push(itemData);
        } else {
          currentList[modalConfig.index] = itemData;
        }
        updatedStudent.projects = currentList;
      }
    } else if (section === 'languages') {
      const currentList = Array.isArray(student.languages) ? [...student.languages] : [];
      if (modalConfig.mode === 'add') {
        currentList.push(itemData);
      } else {
        currentList[modalConfig.index] = itemData;
      }
      updatedStudent.languages = currentList;
    } else if (section === 'achievements') {
      const currentList = Array.isArray(student.achievements) ? [...student.achievements] : [];
      const val = typeof itemData === 'object' && itemData !== null ? itemData.text : String(itemData);
      if (modalConfig.mode === 'add') {
        currentList.push(val);
      } else {
        currentList[modalConfig.index] = val;
      }
      updatedStudent.achievements = currentList;
    } else {
      const currentList = Array.isArray(student[section]) ? [...student[section]] : [];
      if (modalConfig.mode === 'add') {
        currentList.push(itemData);
      } else {
        currentList[modalConfig.index] = itemData;
      }
      updatedStudent[section] = currentList;
    }

    onSave(updatedStudent);
    setModalConfig({ type: null, mode: 'add', index: null, data: {} });
    pushLocalNotification(`Profile Section "${section}" updated and saved successfully!`);
  };

  const handleDeleteItem = async (section, index) => {
    const shouldDelete = window.confirm("Are you sure you want to delete this entry?");
    if (!shouldDelete) return;

    const token = getStoredToken();

    if (section === 'education') {
      const currentList = Array.isArray(student.education) ? [...student.education] : [];
      const target = currentList[index];
      if (token && target && target.id) {
        await deleteEducation(target.id).catch(err => console.error("[DB Sync] Education delete failed:", err));
        const freshEdu = await getEducation().catch(() => null);
        if (freshEdu) {
          onSave({ ...student, education: freshEdu });
          pushLocalNotification("Deleted education record.");
          return;
        }
      }
      const updatedList = currentList.filter((_, idx) => idx !== index);
      onSave({ ...student, education: updatedList });
      pushLocalNotification("Deleted education record.");
      return;
    }

    if (section === 'skills') {
      const targetSkill = rawSkills[index];
      if (token && targetSkill && typeof targetSkill === 'object' && targetSkill.id) {
        await deleteSkill(targetSkill.id).catch(err => console.error("[DB Sync] Skill delete failed:", err));
        const freshSkills = await getSkills().catch(() => null);
        if (freshSkills) {
          onSave({ ...student, skills: freshSkills });
          pushLocalNotification("Skill tag removed.");
          return;
        }
      }
      const updatedSkills = skills.filter((_, idx) => idx !== index);
      onSave({ ...student, skills: updatedSkills });
      pushLocalNotification("Skill tag removed.");
      return;
    }

    if (section === 'projects') {
      const currentList = Array.isArray(student.projects) ? [...student.projects] : [];
      const target = currentList[index];
      if (token && target && target.id) {
        await deleteProject(target.id).catch(err => console.error("[DB Sync] Project delete failed:", err));
        const freshProj = await getProjects().catch(() => null);
        if (freshProj) {
          onSave({ ...student, projects: freshProj });
          pushLocalNotification("Deleted project record.");
          return;
        }
      }
      const updatedList = currentList.filter((_, idx) => idx !== index);
      onSave({ ...student, projects: updatedList });
      pushLocalNotification("Deleted project record.");
      return;
    }

    if (section === 'languages') {
      const updatedLanguages = languages.filter((_, idx) => idx !== index);
      onSave({ ...student, languages: updatedLanguages });
      pushLocalNotification("Language removed.");
      return;
    }

    const currentList = Array.isArray(student[section]) ? [...student[section]] : [];
    const updatedList = currentList.filter((_, idx) => idx !== index);
    onSave({ ...student, [section]: updatedList });
    pushLocalNotification(`Deleted entry from ${section}.`);
  };


  const openAddModal = (section, defaultData = {}) => {
    setModalConfig({
      type: section,
      mode: 'add',
      index: null,
      data: defaultData
    });
  };

  const openEditModal = (section, index, currentData) => {
    setModalConfig({
      type: section,
      mode: 'edit',
      index,
      data: { ...currentData }
    });
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    const { type, data } = modalConfig;
    
    // Validations
    if (type === 'education') {
      if (!data.school) return alert("College / School name is required!");
      if (!data.degree) return alert("Degree is required!");
    } else if (type === 'internships') {
      if (!data.company) return alert("Company Name is required!");
      if (!data.role) return alert("Role Name is required!");
    } else if (type === 'projects') {
      if (!data.name) return alert("Project Name is required!");
    } else if (type === 'languages') {
      if (!data.language) return alert("Select a language!");
    } else if (type === 'certifications') {
      if (!data.name || !data.provider) return alert("Certification Name and Provider are required!");
    } else if (type === 'competitiveExams') {
      if (!data.examName || !data.score) return alert("Exam name and Score are required!");
    } else if (type === 'achievements') {
      if (!data.text) return alert("Achievement description is required!");
    }

    handleSaveItem(type, data);
  };

  const profilePhoto = sanitizeProfilePhoto(student.photo);

  const filteredSuggestedSkills = skillsInput.trim()
    ? allSuggestedSkills.filter(s => s.toLowerCase().includes(skillsInput.toLowerCase()) && !skills.map(skill => skill.toLowerCase()).includes(s.toLowerCase()))
    : [];

  return (
    <section className="profile-modern-layout">
      {/* Sticky Left Sidebar */}
      <aside className="sticky-sidebar">
        {/* Profile Summary Card */}
        <div className="profile-header-card">
          <div className="student-photo-wrap">
            {profilePhoto ? (
              <>
                <img 
                  src={profilePhoto} 
                  alt={`${student.name} profile`} 
                  className="student-photo"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="student-photo-blank" style={{ display: "none" }} />
              </>
            ) : (
              <div className="student-photo-blank" />
            )}
            <label className="photo-edit-button" title="Change Photo">
              <FaEdit />
              <input accept="image/*" type="file" onChange={handlePhotoChange} style={{ display: "none" }} />
            </label>
            {profilePhoto && (
              <button
                className="photo-remove-button"
                type="button"
                onClick={handlePhotoRemove}
                title="Remove photo"
                aria-label="Remove profile photo"
              >
                <FaTrash />
              </button>
            )}
          </div>

          <h2>{student.name}</h2>
          <div className="student-role">{student.branch || "Computer Engineering Student"}</div>
          <div className="student-college">{student.college || "Sanghavi College of Engineering"}</div>
          <div className="student-year">Graduating {student.passingYear || student.year || "2026"}</div>

          {/* Profile Completion system */}
          <div className="completion-container">
            <div className="completion-header">
              <span>Profile Completion</span>
              <span>{profileCompletion}%</span>
            </div>
            <div className="completion-bar-outer">
              <div className="completion-bar-inner" style={{ width: `${profileCompletion}%` }}></div>
            </div>
          </div>

          {/* Header Action buttons */}
          <div className="profile-sidebar-actions">
            <button className="primary-button" type="button" onClick={() => openEditModal('header', null, { name: student.name, branch: student.branch, college: student.college, passingYear: student.passingYear || student.year })}>
              <FaEdit /> Edit Header
            </button>
            {uploadedResume ? (
              <a href={uploadedResume.dataUrl} download={uploadedResume.name} className="secondary-button">
                <FaAward /> Download Resume
              </a>
            ) : (
              <button className="secondary-button" type="button" onClick={() => alert("Please upload a resume under the Resume section first.")}>
                <FaAward /> Download Resume
              </button>
            )}
          </div>
        </div>

        {/* AI Assistant panel */}
        <div className="ai-assistant-card">
          <h3><FaRobot /> AI Profile Assistant</h3>
          
          {/* Missing warnings */}
          {missingAlerts.length > 0 && (
            <div className="ai-alerts">
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#1e3a8a", marginBottom: "4px" }}>Suggestions to improve:</div>
              {missingAlerts.slice(0, 2).map((alertItem) => (
                <div className="ai-alert-item" key={alertItem.name}>
                  Missing: {alertItem.name} (+{alertItem.score}%)
                </div>
              ))}
            </div>
          )}

          <div className="ai-actions-list">
            <button className="ai-button" type="button" onClick={generateAISummary}>
              ✨ AI Summary Generator
            </button>
          </div>

          {/* Skill Recommendations */}
          {skillRecs.length > 0 && (
            <div className="ai-recommendations">
              <h4>Recommended Skills</h4>
              <div className="ai-chips">
                {skillRecs.slice(0, 4).map(skill => (
                  <button className="ai-chip" key={skill} type="button" onClick={() => addRecommendedSkill(skill)}>
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Career Role mapping */}
          {careerSuggestions.length > 0 && (
            <div className="ai-recommendations" style={{ borderTop: "none", paddingTop: "8px" }}>
              <h4>Best Career Paths</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {careerSuggestions.map((path, idx) => (
                  <div key={idx} style={{ fontSize: "11px", color: "#1e40af", fontWeight: 600 }}>• {path}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Right Column Section Cards */}
      <div className="modern-profile-sections">
        
        {/* Card 1: Profile Summary */}
        <article className="modern-profile-card">
          <div className="card-header">
            <h3><FaUserGraduate /> Profile Summary</h3>
            <div className="header-actions">
              <button className="action-btn" type="button" onClick={() => openEditModal('summary', null, { about: student.about || "", goal: student.goal || "" })}>
                <FaEdit /> Edit
              </button>
            </div>
          </div>
          <p className="profile-paragraph" style={{ margin: 0 }}>
            {student.about || "No summary added yet. Use the AI Summary Generator in the sidebar to build a professional summary based on your profile details!"}
          </p>
          {student.goal && (
            <p style={{ marginTop: "12px", fontSize: "13px", fontWeight: "700", color: "var(--primary)" }}>
              Target Career Role: {student.goal}
            </p>
          )}
        </article>

        {/* Card 2: Education */}
        <article className="modern-profile-card">
          <div className="card-header">
            <h3><FaGraduationCap /> Education</h3>
            <div className="header-actions">
              <button className="action-btn" type="button" onClick={() => openAddModal('education', { qualification: "Undergraduate", courseType: "Full-time", isCurrent: false })}>
                <FaPlus /> Add
              </button>
            </div>
          </div>
          <div>
            {educationList.length === 0 ? (
              <p className="muted-text" style={{ margin: 0 }}>No education records added yet.</p>
            ) : (
              educationList.map((item, index) => (
                <div className="profile-entry-item" key={index}>
                  <div className="entry-title-row">
                    <h4>{item.school}</h4>
                    <span className="entry-meta">{item.qualification}</span>
                  </div>
                  <div className="entry-subtitle">{item.degree} {item.fieldOfStudy ? `in ${item.fieldOfStudy}` : ""}</div>
                  <div className="entry-duration">{item.startYear} - {item.isCurrent ? "Present" : item.endYear} | {item.courseType}</div>
                  {item.grade && <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--primary)" }}>CGPA / Percentage: {item.grade}</div>}
                  {item.description && <p className="entry-description">{item.description}</p>}
                  <div className="entry-actions-row">
                    <button type="button" onClick={() => openEditModal('education', index, item)} title="Edit Education"><FaEdit /></button>
                    <button type="button" className="delete-btn" onClick={() => handleDeleteItem('education', index)} title="Delete Education"><FaTrash /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        {/* Card 3: Skills */}
        <article className="modern-profile-card">
          <div className="card-header">
            <h3><FaCode /> Skills</h3>
            <div className="header-actions">
              <button className="action-btn" type="button" onClick={() => openAddModal('skills', skills)}>
                <FaPlus /> Manage
              </button>
            </div>
          </div>
          <div className="profile-skills-tags">
            {skills.length === 0 ? (
              <p className="muted-text" style={{ margin: 0 }}>No skills added yet.</p>
            ) : (
              skills.map((skill, index) => (
                <span className="skill-badge" key={index}>
                  {typeof skill === 'object' && skill !== null ? skill.name || skill.skill || String(skill) : String(skill)}
                  <FaTimesCircle onClick={() => handleDeleteItem('skills', index)} title="Remove Skill" />
                </span>
              ))
            )}
          </div>
        </article>

        {/* Card 4: Languages */}
        <article className="modern-profile-card">
          <div className="card-header">
            <h3><FaUniversalAccess /> Languages</h3>
            <div className="header-actions">
              <button className="action-btn" type="button" onClick={() => openAddModal('languages', { read: true, write: true, speak: true })}>
                <FaPlus /> Add
              </button>
            </div>
          </div>
          <div className="language-matrix">
            {languages.length === 0 ? (
              <p className="muted-text" style={{ margin: 0 }}>No languages listed yet.</p>
            ) : (
              languages.map((item, index) => (
                <div className="language-item-card" key={index}>
                  <h4>{item.language}</h4>
                  <div className="proficiencies-badges">
                    {item.read && <span>Read</span>}
                    {item.write && <span>Write</span>}
                    {item.speak && <span>Speak</span>}
                  </div>
                  <div className="entry-actions-row" style={{ marginTop: "12px" }}>
                    <button type="button" onClick={() => openEditModal('languages', index, item)} title="Edit Language"><FaEdit /></button>
                    <button type="button" className="delete-btn" onClick={() => handleDeleteItem('languages', index)} title="Delete Language"><FaTrash /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        {/* Card 5: Internships */}
        <article className="modern-profile-card">
          <div className="card-header">
            <h3><FaBriefcase /> Internships</h3>
            <div className="header-actions">
              <button className="action-btn" type="button" onClick={() => openAddModal('internships', {})}>
                <FaPlus /> Add
              </button>
            </div>
          </div>
          <div>
            {internshipList.length === 0 ? (
              <p className="muted-text" style={{ margin: 0 }}>No internships listed yet.</p>
            ) : (
              internshipList.map((item, index) => (
                <div className="profile-entry-item" key={index}>
                  <div className="entry-title-row">
                    <h4>{item.role}</h4>
                    <span className="entry-meta">{item.duration || "Internship"}</span>
                  </div>
                  <div className="entry-subtitle">{item.company} {item.location ? `· ${item.location}` : ""}</div>
                  {item.projectName && <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>Project: {item.projectName}</div>}
                  {item.description && <p className="entry-description">{item.description}</p>}
                  {item.skillsUsed && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                      {String(item.skillsUsed).split(',').map((sk, idx) => (
                        <span key={idx} style={{ fontSize: "11px", background: "#f1f5f9", padding: "3px 8px", borderRadius: "4px" }}>{sk.trim()}</span>
                      ))}
                    </div>
                  )}
                  {item.projectUrl && (
                    <div style={{ marginTop: "8px", fontSize: "12px" }}>
                      <a href={item.projectUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", fontWeight: 700 }}>Project URL</a>
                    </div>
                  )}
                  <div className="entry-actions-row">
                    <button type="button" onClick={() => openEditModal('internships', index, item)} title="Edit Internship"><FaEdit /></button>
                    <button type="button" className="delete-btn" onClick={() => handleDeleteItem('internships', index)} title="Delete Internship"><FaTrash /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        {/* Card 6: Projects */}
        <article className="modern-profile-card">
          <div className="card-header">
            <h3><FaTools /> Projects</h3>
            <div className="header-actions">
              <button className="action-btn" type="button" onClick={() => openAddModal('projects', {})}>
                <FaPlus /> Add
              </button>
            </div>
          </div>
          <div>
            {projectList.length === 0 ? (
              <p className="muted-text" style={{ margin: 0 }}>No projects listed yet.</p>
            ) : (
              projectList.map((item, index) => (
                <div className="profile-entry-item" key={index}>
                  <div className="entry-title-row">
                    <h4>{item.name}</h4>
                    <span className="entry-meta">{item.duration || "Project"}</span>
                  </div>
                  {item.techStack && <div className="entry-subtitle">Tech Stack: {item.techStack}</div>}
                  {item.description && <p className="entry-description">{item.description}</p>}
                  
                  <div style={{ display: "flex", gap: "15px", marginTop: "8px", fontSize: "12px" }}>
                    {item.githubLink && <a href={item.githubLink} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", fontWeight: 700 }}>GitHub</a>}
                    {item.liveLink && <a href={item.liveLink} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", fontWeight: 700 }}>Live Link</a>}
                  </div>

                  {item.keySkills && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                      {String(item.keySkills).split(',').map((sk, idx) => (
                        <span key={idx} style={{ fontSize: "11px", background: "#f1f5f9", padding: "3px 8px", borderRadius: "4px" }}>{sk.trim()}</span>
                      ))}
                    </div>
                  )}

                  <div className="entry-actions-row">
                    <button type="button" onClick={() => openEditModal('projects', index, item)} title="Edit Project"><FaEdit /></button>
                    <button type="button" className="delete-btn" onClick={() => handleDeleteItem('projects', index)} title="Delete Project"><FaTrash /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        {/* Card 7: Certifications */}
        <article className="modern-profile-card">
          <div className="card-header">
            <h3><FaAward /> Certifications</h3>
            <div className="header-actions">
              <button className="action-btn" type="button" onClick={() => openAddModal('certifications', { year: "2026" })}>
                <FaPlus /> Add
              </button>
            </div>
          </div>
          <div>
            {certificationList.length === 0 ? (
              <p className="muted-text" style={{ margin: 0 }}>No certifications listed yet.</p>
            ) : (
              certificationList.map((item, index) => (
                <div className="profile-entry-item" key={index}>
                  <div className="entry-title-row">
                    <h4>{item.name}</h4>
                    <span className="entry-meta">{item.year}</span>
                  </div>
                  <div className="entry-subtitle">Issued by: {item.provider}</div>
                  {item.certificateUrl && (
                    <div style={{ marginTop: "6px", fontSize: "12px" }}>
                      <a href={item.certificateUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", fontWeight: 700 }}>View Certificate</a>
                    </div>
                  )}
                  <div className="entry-actions-row">
                    <button type="button" onClick={() => openEditModal('certifications', index, item)} title="Edit Certification"><FaEdit /></button>
                    <button type="button" className="delete-btn" onClick={() => handleDeleteItem('certifications', index)} title="Delete Certification"><FaTrash /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        {/* Card 8: Achievements */}
        <article className="modern-profile-card">
          <div className="card-header">
            <h3><FaLightbulb /> Achievements</h3>
            <div className="header-actions">
              <button className="action-btn" type="button" onClick={() => openAddModal('achievements', {})}>
                <FaPlus /> Add
              </button>
            </div>
          </div>
          <div className="profile-multi-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {achievements.length === 0 ? (
              <p className="muted-text" style={{ margin: 0 }}>No achievements added yet.</p>
            ) : (
              achievements.map((item, index) => (
                <div key={index} className="profile-entry-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f8fafc", border: "1px solid var(--line)", borderRadius: "10px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>
                    ⭐ {item}
                  </div>
                  <div className="entry-actions-row" style={{ marginTop: 0 }}>
                    <button type="button" onClick={() => openEditModal('achievements', index, { text: item })} title="Edit Achievement"><FaEdit /></button>
                    <button type="button" className="delete-btn" onClick={() => handleDeleteItem('achievements', index)} title="Delete Achievement"><FaTrash /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        {/* Card 9: Competitive Exams */}
        <article className="modern-profile-card">
          <div className="card-header">
            <h3><FaBrain /> Competitive Exams</h3>
            <div className="header-actions">
              <button className="action-btn" type="button" onClick={() => openAddModal('competitiveExams', { year: "2026" })}>
                <FaPlus /> Add
              </button>
            </div>
          </div>
          <div>
            {competitiveExams.length === 0 ? (
              <p className="muted-text" style={{ margin: 0 }}>No competitive exam scores added yet.</p>
            ) : (
              competitiveExams.map((item, index) => (
                <div className="profile-entry-item" key={index}>
                  <div className="entry-title-row">
                    <h4>{item.examName}</h4>
                    <span className="entry-meta">{item.year}</span>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--primary)" }}>Score / Percentile: {item.score}</div>
                  <div className="entry-actions-row">
                    <button type="button" onClick={() => openEditModal('competitiveExams', index, item)} title="Edit Exam"><FaEdit /></button>
                    <button type="button" className="delete-btn" onClick={() => handleDeleteItem('competitiveExams', index)} title="Delete Exam"><FaTrash /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        {/* Card 10: Resume */}
        <article className="modern-profile-card">
          <div className="card-header">
            <h3><FaFileContract /> Resume PDF</h3>
          </div>
          <div>
            {uploadedResume ? (
              <div className="resume-uploaded-badge">
                <div className="resume-badge-left">
                  <FaFileContract />
                  <div>
                    <div style={{ fontSize: "14px", color: "var(--ink)" }}>{uploadedResume.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "500" }}>Uploaded on {uploadedResume.uploadedAt} · {uploadedResume.size}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <a href={uploadedResume.dataUrl} download={uploadedResume.name} className="primary-button compact-button" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Download</a>
                  <button className="danger-button" type="button" onClick={handleResumeRemove} style={{ padding: "8px 12px" }}><FaTrash /></button>
                </div>
              </div>
            ) : (
              <div style={{ border: "2px dashed var(--line)", padding: "30px", borderRadius: "12px", textAlign: "center" }}>
                <FaCloudUploadAlt style={{ fontSize: "40px", color: "var(--primary)", marginBottom: "12px" }} />
                <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "var(--ink)" }}>Upload Resume File</h4>
                <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "var(--muted)" }}>Accepts PDF files up to 5MB</p>
                <label className="primary-button" style={{ display: "inline-block", cursor: "pointer" }}>
                  Choose PDF File
                  <input type="file" onChange={handleResumeUpload} accept=".pdf" style={{ display: "none" }} />
                </label>
              </div>
            )}
          </div>
        </article>

        {/* Card 11: Social Links */}
        <article className="modern-profile-card">
          <div className="card-header">
            <h3><FaUserShield /> Social Links</h3>
            <div className="header-actions">
              <button className="action-btn" type="button" onClick={() => openEditModal('socials', null, socialLinks)}>
                <FaEdit /> Edit Links
              </button>
            </div>
          </div>
          <div className="socials-display-row">
            {socialLinks.linkedin && <a className="social-link-badge" href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
            {socialLinks.github && <a className="social-link-badge" href={socialLinks.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
            {socialLinks.portfolio && <a className="social-link-badge" href={socialLinks.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a>}
            {socialLinks.twitter && <a className="social-link-badge" href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>}
            {!socialLinks.linkedin && !socialLinks.github && !socialLinks.portfolio && !socialLinks.twitter && (
              <p className="muted-text" style={{ margin: 0 }}>No social links connected yet.</p>
            )}
          </div>
        </article>

        {/* Card 12: Career Preferences */}
        <article className="modern-profile-card">
          <div className="card-header">
            <h3><FaFilter /> Career Preferences</h3>
            <div className="header-actions">
              <button className="action-btn" type="button" onClick={() => openEditModal('preferences', null, careerPreferences)}>
                <FaEdit /> Edit Preferences
              </button>
            </div>
          </div>
          <div className="preferences-display-grid">
            <div className="preference-item-view">
              <span>Target Role</span>
              <strong>{careerPreferences.targetRole || "Not specified"}</strong>
            </div>
            <div className="preference-item-view">
              <span>Target Location</span>
              <strong>{careerPreferences.targetLocation || "Not specified"}</strong>
            </div>
            <div className="preference-item-view">
              <span>Desired Salary</span>
              <strong>{careerPreferences.preferredSalary ? `${careerPreferences.preferredSalary} LPA` : "Not specified"}</strong>
            </div>
            <div className="preference-item-view">
              <span>Desired Job Type</span>
              <strong>{careerPreferences.jobType || "Not specified"}</strong>
            </div>
          </div>
        </article>
      </div>

      {/* Generic validation forms Modal Dialog */}
      {modalConfig.type && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1000, position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}>
          <section className="job-modal" style={{ maxWidth: "600px", width: "100%", padding: "24px", borderRadius: "16px", background: "#fff", display: "flex", flexDirection: "column" }}>
            <div style={{ paddingBottom: "16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "#0f172a" }}>
                {modalConfig.mode === 'add' ? 'Add' : 'Edit'} {String(modalConfig.type).charAt(0).toUpperCase() + String(modalConfig.type).slice(1)} Details
              </h2>
              <button className="icon-button" type="button" onClick={() => setModalConfig({ type: null, mode: 'add', index: null, data: {} })} aria-label="Close" style={{ fontSize: "20px" }}>
                <FaTimesCircle />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="profile-modal-form" style={{ marginTop: "16px", maxHeight: "450px", overflowY: "auto" }}>
              
              {/* Header Modal */}
              {modalConfig.type === 'header' && (
                <>
                  <label>
                    Student Name*
                    <input type="text" value={modalConfig.data.name || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, name: e.target.value } })} required />
                  </label>
                  <label>
                    Branch*
                    <input type="text" placeholder="Ex: Computer Engineering" value={modalConfig.data.branch || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, branch: e.target.value } })} required />
                  </label>
                  <label>
                    College*
                    <input type="text" placeholder="Ex: Sanghavi College of Engineering" value={modalConfig.data.college || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, college: e.target.value } })} required />
                  </label>
                  <label>
                    Graduation Year*
                    <select value={modalConfig.data.passingYear || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, passingYear: e.target.value } })} required>
                      <option value="">Select Year</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </label>
                </>
              )}

              {/* Summary Modal */}
              {modalConfig.type === 'summary' && (
                <>
                  <label>
                    Profile Summary*
                    <textarea rows="6" placeholder="Describe your background, skills, and goals" value={modalConfig.data.about || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, about: e.target.value } })} required />
                  </label>
                  <label>
                    Target Career Goal
                    <input type="text" placeholder="Ex: Frontend Developer, SDE Intern" value={modalConfig.data.goal || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, goal: e.target.value } })} />
                  </label>
                </>
              )}

              {/* Education Modal */}
              {modalConfig.type === 'education' && (
                <>
                  <div className="form-group-row">
                    <label>
                      Qualification*
                      <select value={modalConfig.data.qualification || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, qualification: e.target.value } })} required>
                        <option value="10th">10th</option>
                        <option value="12th">12th</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Postgraduate">Postgraduate</option>
                      </select>
                    </label>
                    <label>
                      Degree Title*
                      <input type="text" placeholder="Ex: B.Tech Computer Engineering" value={modalConfig.data.degree || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, degree: e.target.value } })} required />
                    </label>
                  </div>
                  <label>
                    College / School Name*
                    <input type="text" placeholder="Ex: Boston University" value={modalConfig.data.school || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, school: e.target.value } })} required />
                  </label>
                  <label>
                    University Name
                    <input type="text" placeholder="Ex: Pune University" value={modalConfig.data.university || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, university: e.target.value } })} />
                  </label>
                  <div className="form-group-row">
                    <label>
                      CGPA / Percentage*
                      <input type="text" placeholder="Ex: 8.63 CGPA, 82%" value={modalConfig.data.grade || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, grade: e.target.value } })} required />
                    </label>
                    <label>
                      Course Type*
                      <select value={modalConfig.data.courseType || "Full-time"} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, courseType: e.target.value } })} required>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Distance">Distance</option>
                      </select>
                    </label>
                  </div>
                  <div className="form-group-row">
                    <label>
                      Start Year*
                      <select value={modalConfig.data.startYear || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, startYear: e.target.value } })} required>
                        <option value="">Select Year</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </label>
                    <label>
                      End Year (Expected)*
                      <select value={modalConfig.data.endYear || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, endYear: e.target.value } })} disabled={modalConfig.data.isCurrent} required={!modalConfig.data.isCurrent}>
                        <option value="">Select Year</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="checkbox-row">
                    <input type="checkbox" checked={modalConfig.data.isCurrent || false} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, isCurrent: e.target.checked, endYear: e.target.checked ? "Present" : "" } })} />
                    Currently Studying here
                  </label>
                  <label>
                    Description / Course Highlights
                    <textarea rows="3" placeholder="Subjects studied, awards, etc." value={modalConfig.data.description || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, description: e.target.value } })} />
                  </label>
                </>
              )}

              {/* Skills Modal */}
              {modalConfig.type === 'skills' && (
                <>
                  <label>
                    Add Skills Tag
                    <div className="skill-autocomplete-container">
                      <input 
                        type="text" 
                        placeholder="Type skill name (ex: React, Python)..." 
                        value={skillsInput} 
                        onChange={(e) => {
                          setSkillsInput(e.target.value);
                          setShowSkillsSuggestions(true);
                        }}
                        onFocus={() => setShowSkillsSuggestions(true)}
                      />
                      {showSkillsSuggestions && filteredSuggestedSkills.length > 0 && (
                        <div className="skill-autocomplete-dropdown">
                          {filteredSuggestedSkills.map(suggested => (
                            <div key={suggested} onClick={() => {
                              const nextSkills = [...skills, suggested];
                              setModalConfig({ ...modalConfig, data: nextSkills });
                              setSkillsInput("");
                              setShowSkillsSuggestions(false);
                            }}>
                              {suggested}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                  <div style={{ marginTop: "12px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "700", marginBottom: "8px" }}>Active Skills tags (click to remove):</div>
                    <div className="profile-skills-tags">
                      {(Array.isArray(modalConfig.data) ? modalConfig.data : skills).map((sk, idx) => (
                        <span key={idx} className="skill-badge" style={{ cursor: "pointer" }} onClick={() => {
                          const currentSkills = Array.isArray(modalConfig.data) ? modalConfig.data : skills;
                          const nextSkills = currentSkills.filter((_, i) => i !== idx);
                          setModalConfig({ ...modalConfig, data: nextSkills });
                        }}>
                          {sk} ×
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Languages Modal */}
              {modalConfig.type === 'languages' && (
                <>
                  <label>
                    Language Select*
                    <select value={modalConfig.data.language || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, language: e.target.value } })} required>
                      <option value="">Select language</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Marathi">Marathi</option>
                      <option value="German">German</option>
                      <option value="Japanese">Japanese</option>
                      <option value="French">French</option>
                    </select>
                  </label>
                  <label>
                    Proficiencies Level:
                    <div className="proficiency-checkboxes-group">
                      <label className="checkbox-row" style={{ marginTop: 0 }}>
                        <input type="checkbox" checked={modalConfig.data.read ?? true} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, read: e.target.checked } })} />
                        Read
                      </label>
                      <label className="checkbox-row" style={{ marginTop: 0 }}>
                        <input type="checkbox" checked={modalConfig.data.write ?? true} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, write: e.target.checked } })} />
                        Write
                      </label>
                      <label className="checkbox-row" style={{ marginTop: 0 }}>
                        <input type="checkbox" checked={modalConfig.data.speak ?? true} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, speak: e.target.checked } })} />
                        Speak
                      </label>
                    </div>
                  </label>
                </>
              )}

              {/* Internships Modal */}
              {modalConfig.type === 'internships' && (
                <>
                  <div className="form-group-row">
                    <label>
                      Company Name*
                      <input type="text" placeholder="Ex: Google" value={modalConfig.data.company || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, company: e.target.value } })} required />
                    </label>
                    <label>
                      Role Title*
                      <input type="text" placeholder="Ex: Software Engineer Intern" value={modalConfig.data.role || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, role: e.target.value } })} required />
                    </label>
                  </div>
                  <div className="form-group-row">
                    <label>
                      Duration (Duration)*
                      <input type="text" placeholder="Ex: 3 months, 6 months" value={modalConfig.data.duration || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, duration: e.target.value } })} required />
                    </label>
                    <label>
                      Location
                      <input type="text" placeholder="Ex: Remote, Mumbai, Hybrid" value={modalConfig.data.location || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, location: e.target.value } })} />
                    </label>
                  </div>
                  <label>
                    Project Name
                    <input type="text" placeholder="Ex: Backend REST APIs implementation" value={modalConfig.data.projectName || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, projectName: e.target.value } })} />
                  </label>
                  <label>
                    Skills Used (Comma separated)
                    <input type="text" placeholder="Ex: Java, Spring Boot, MySQL" value={modalConfig.data.skillsUsed || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, skillsUsed: e.target.value } })} />
                  </label>
                  <label>
                    Project URL
                    <input type="url" placeholder="Ex: https://project.com" value={modalConfig.data.projectUrl || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, projectUrl: e.target.value } })} />
                  </label>
                  <label>
                    Internship Description
                    <textarea rows="4" placeholder="Describe achievements, responsibilities, tools used" value={modalConfig.data.description || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, description: e.target.value } })} />
                  </label>
                </>
              )}

              {/* Projects Modal */}
              {modalConfig.type === 'projects' && (
                <>
                  <div className="form-group-row">
                    <label>
                      Project Name*
                      <input type="text" placeholder="Ex: Placer AI Portal" value={modalConfig.data.name || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, name: e.target.value } })} required />
                    </label>
                    <label>
                      Duration
                      <input type="text" placeholder="Ex: 2 months" value={modalConfig.data.duration || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, duration: e.target.value } })} />
                    </label>
                  </div>
                  <label>
                    Technology Stack
                    <input type="text" placeholder="Ex: React, Node.js, MongoDB" value={modalConfig.data.techStack || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, techStack: e.target.value } })} />
                  </label>
                  <div className="form-group-row">
                    <label>
                      GitHub Link
                      <input type="url" placeholder="Ex: https://github.com/..." value={modalConfig.data.githubLink || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, githubLink: e.target.value } })} />
                    </label>
                    <label>
                      Live Demo Link
                      <input type="url" placeholder="Ex: https://demo.com" value={modalConfig.data.liveLink || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, liveLink: e.target.value } })} />
                    </label>
                  </div>
                  <label>
                    Key Skills (Comma separated)
                    <input type="text" placeholder="Ex: State management, API integration" value={modalConfig.data.keySkills || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, keySkills: e.target.value } })} />
                  </label>
                  <label>
                    Project Description
                    <textarea rows="4" placeholder="Detail tech implementation, features, challenges solved" value={modalConfig.data.description || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, description: e.target.value } })} />
                  </label>
                </>
              )}

              {/* Certifications Modal */}
              {modalConfig.type === 'certifications' && (
                <>
                  <label>
                    Certification Title Name*
                    <input type="text" placeholder="Ex: AWS Certified Cloud Practitioner" value={modalConfig.data.name || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, name: e.target.value } })} required />
                  </label>
                  <label>
                    Provider / Issuing Organization*
                    <input type="text" placeholder="Ex: Amazon Web Services" value={modalConfig.data.provider || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, provider: e.target.value } })} required />
                  </label>
                  <div className="form-group-row">
                    <label>
                      Certification Year
                      <select value={modalConfig.data.year || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, year: e.target.value } })}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </label>
                    <label>
                      Credential URL
                      <input type="url" placeholder="Ex: https://verify.org/..." value={modalConfig.data.certificateUrl || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, certificateUrl: e.target.value } })} />
                    </label>
                  </div>
                </>
              )}

              {/* Achievements Modal */}
              {modalConfig.type === 'achievements' && (
                <label>
                  Achievement Description*
                  <textarea rows="4" placeholder="Ex: Won 1st place in National Level Smart India Hackathon 2025" value={modalConfig.data.text || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, text: e.target.value } })} required />
                </label>
              )}

              {/* Competitive Exams Modal */}
              {modalConfig.type === 'competitiveExams' && (
                <>
                  <label>
                    Exam Title Name*
                    <input type="text" placeholder="Ex: GATE CS, JEE Advanced, CAT" value={modalConfig.data.examName || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, examName: e.target.value } })} required />
                  </label>
                  <div className="form-group-row">
                    <label>
                      Score / Percentile*
                      <input type="text" placeholder="Ex: 99.4 Percentile, 650 Gate Score" value={modalConfig.data.score || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, score: e.target.value } })} required />
                    </label>
                    <label>
                      Year of Exam
                      <select value={modalConfig.data.year || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, year: e.target.value } })}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </label>
                  </div>
                </>
              )}

              {/* Social Links Modal */}
              {modalConfig.type === 'socials' && (
                <>
                  <label>
                    LinkedIn URL
                    <input type="url" placeholder="https://linkedin.com/in/..." value={modalConfig.data.linkedin || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, linkedin: e.target.value } })} />
                  </label>
                  <label>
                    GitHub URL
                    <input type="url" placeholder="https://github.com/..." value={modalConfig.data.github || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, github: e.target.value } })} />
                  </label>
                  <label>
                    Portfolio Link
                    <input type="url" placeholder="https://myportfolio.me" value={modalConfig.data.portfolio || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, portfolio: e.target.value } })} />
                  </label>
                  <label>
                    Twitter / X Link
                    <input type="url" placeholder="https://x.com/..." value={modalConfig.data.twitter || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, twitter: e.target.value } })} />
                  </label>
                </>
              )}

              {/* Career Preferences Modal */}
              {modalConfig.type === 'preferences' && (
                <>
                  <div className="form-group-row">
                    <label>
                      Target Role Title
                      <input type="text" placeholder="Ex: Frontend Engineer" value={modalConfig.data.targetRole || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, targetRole: e.target.value } })} />
                    </label>
                    <label>
                      Target Location
                      <input type="text" placeholder="Ex: Pune, Bangalore, Remote" value={modalConfig.data.targetLocation || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, targetLocation: e.target.value } })} />
                    </label>
                  </div>
                  <div className="form-group-row">
                    <label>
                      Desired Salary (LPA)
                      <input type="number" placeholder="Ex: 8" value={modalConfig.data.preferredSalary || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, preferredSalary: e.target.value } })} />
                    </label>
                    <label>
                      Desired Job Type
                      <select value={modalConfig.data.jobType || ""} onChange={(e) => setModalConfig({ ...modalConfig, data: { ...modalConfig.data, jobType: e.target.value } })}>
                        <option value="">Select type</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Internship">Internship</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </label>
                  </div>
                </>
              )}

              <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button className="secondary-button" type="button" onClick={() => setModalConfig({ type: null, mode: 'add', index: null, data: {} })}>Cancel</button>
                <button className="primary-button" type="submit"><FaSave /> Save Changes</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

function RecommendationsSection({ student, items, onAction }) {
  const branch = student?.branch || "Your branch";
  const skills = Array.isArray(student?.skills) ? student.skills.filter(Boolean) : cleanList(student?.skills);
  const topRecommendation = items[0];
  const focusAreas = [
    { label: "Profile branch", value: branch, icon: <FaBolt /> },
    { label: "Current skill signal", value: skills.slice(0, 3).join(", ") || "Add more role-specific skills", icon: <FaTools /> },
    { label: "Best-fit direction", value: topRecommendation?.futureRole || "Career focus", icon: <FaBrain /> }
  ];

  return (
    <section className="recommendation-layout">
      <aside className="panel recommendation-sidebar">
        <div className="panel-title compact-title">
          <div>
            <h2><FaRobot /> AI Career Guide</h2>
            <p>Recommendations are generated from the student's branch, skills, goals and profile completion.</p>
          </div>
        </div>

        <div className="recommendation-highlight">
          <span className="recommendation-highlight-label">Best near-term path</span>
          <strong>{topRecommendation?.futureRole || "Build a stronger role focus"}</strong>
          <p>{topRecommendation?.reason || "Complete more profile sections to unlock more tailored recommendations."}</p>
        </div>

        <div className="recommendation-focus-list">
          {focusAreas.map((item) => (
            <article key={item.label}>
              <span className="setting-icon">{item.icon}</span>
              <div>
                <strong>{item.label}</strong>
                <p>{item.value}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="recommendation-roadmap">
          <h3>What to implement next</h3>
          <ul>
            <li>One full project with auth, CRUD and deployment</li>
            <li>Add measurable outcomes to your resume</li>
            <li>Use AI as a debugging and planning assistant</li>
          </ul>
        </div>
      </aside>

      <div className="recommendation-grid">
        {items.map((item) => (
          <article className="recommendation-card recommendation-detail-card" key={item.title}>
            <div className="recommendation-card-top">
              <div className="metric-icon indigo"><FaRobot /></div>
              <div>
                <span className="status-pill applied">{item.futureRole}</span>
                <h3>{item.title}</h3>
                <p>{item.reason}</p>
              </div>
            </div>

            <div className="progress-track"><span style={{ width: `${item.score}%` }} /></div>
            <strong className="recommendation-score">{item.score}% AI readiness</strong>

            <div className="recommendation-chip-group">
              {item.requiredSkills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>

            <div className="recommendation-scope">
              <h4>Scope</h4>
              <p>{item.scope}</p>
            </div>

            <div className="recommendation-columns">
              <div>
                <h4>How to use AI</h4>
                <ul>
                  {item.aiUse.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>Student implementation</h4>
                <ul>
                  {item.implementation.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>Learn next</h4>
                <ul>
                  {item.learnNext.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>Improve first</h4>
                <ul>
                  {item.improveFirst.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button className="secondary-button" type="button" onClick={() => onAction(item.action)}>{item.action}</button>
          </article>
        ))}
        {items.length === 0 && <EmptyState text="No AI recommendations match your search." />}
      </div>
    </section>
  );
}

function DocumentsSection({ documents, onDelete, onUpload, onView }) {
  const getFileIcon = (type = "") => {
    const t = type.toLowerCase();
    if (t.includes("pdf")) return <FaFileAlt className="doc-type-icon pdf-icon" style={{ color: "#ef4444" }} />;
    if (t.includes("image") || t.includes("png") || t.includes("jpg") || t.includes("jpeg")) {
      return <FaFileAlt className="doc-type-icon img-icon" style={{ color: "#06b6d4" }} />;
    }
    if (t.includes("word") || t.includes("doc") || t.includes("docx")) {
      return <FaFileAlt className="doc-type-icon word-icon" style={{ color: "#2563eb" }} />;
    }
    return <FaFileAlt className="doc-type-icon default-icon" style={{ color: "#64748b" }} />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <section className="document-grid">
      <label className="upload-tile clickable-upload-card">
        <FaCloudUploadAlt className="upload-icon" />
        <span>Upload Document</span>
        <p className="upload-subtext">PDF, DOCX, PNG, JPG up to 5MB</p>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          style={{ display: "none" }}
          onChange={(event) => {
            onUpload(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>

      {documents.map((document) => (
        <article className="document-card" key={document.id}>
          <div className="document-preview-box">
            {getFileIcon(document.type)}
            <span className="doc-size-badge">{formatFileSize(document.size)}</span>
          </div>

          <div className="document-details">
            <h3 className="document-name" title={document.name}>
              {document.name}
            </h3>
            <div className="document-meta-row">
              <span className="doc-type-label">{String(document.type || "").split("/")[1]?.toUpperCase() || "DOC"}</span>
              <span className="doc-meta-separator">•</span>
              <span className="doc-date-label">
                {document.uploadedAt ? String(document.uploadedAt).split(",")[0] : "Sample"}
              </span>
            </div>
          </div>

          <div className="document-action-bar">
            <button 
              className="icon-action-btn" 
              type="button" 
              title="View Preview" 
              onClick={() => onView(document)}
            >
              <FaEye />
            </button>
            
            {document.dataUrl ? (
              <a 
                className="icon-action-btn download-btn" 
                href={document.dataUrl} 
                download={document.name} 
                title="Download File"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                <FaCloudUploadAlt style={{ transform: "rotate(180deg)", fontSize: "14px" }} />
              </a>
            ) : (
              <button 
                className="icon-action-btn download-btn disabled" 
                type="button" 
                title="Download (Sample File)" 
                onClick={() => alert("This is a sample document. Upload a file to enable downloading.")}
              >
                <FaCloudUploadAlt style={{ transform: "rotate(180deg)", fontSize: "14px", opacity: 0.5 }} />
              </button>
            )}

            <button 
              className="icon-action-btn delete-btn" 
              type="button" 
              title="Delete Document" 
              onClick={() => onDelete(document)}
            >
              <FaTrash />
            </button>
          </div>
        </article>
      ))}

      {documents.length === 0 && <EmptyState text="No documents match your search." />}
    </section>
  );
}

function NotificationsSection({ notifications, onDelete, onClearAll, onMarkRead }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {notifications.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
          <button 
            className="secondary-button compact-button" 
            type="button" 
            onClick={() => onMarkRead(null)}
            style={{ fontSize: "12px", padding: "6px 12px" }}
          >
            Mark All as Read
          </button>
          <button 
            className="danger-button compact-button" 
            type="button" 
            onClick={onClearAll}
            style={{ fontSize: "12px", padding: "6px 12px", background: "var(--red)", border: "none", color: "#fff", cursor: "pointer", borderRadius: "6px" }}
          >
            Clear All
          </button>
        </div>
      )}
      <section className="notification-list">
        {notifications.map((item, index) => (
          <article className={`notification-card ${item.read ? "read" : "unread"}`} key={item.id || `${item.message}-${index}`}>
            <div className="metric-icon amber"><FaBell /></div>
            <div style={{ flex: 1 }}>
              <h3>{item.sender ? `${item.sender}: ${item.message}` : item.message}</h3>
              <p>{item.read ? "Seen" : "New"} - {item.createdAt || `${index + 1} hour ago`}</p>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {!item.read && onMarkRead && (
                <button
                  className="icon-action-btn"
                  type="button"
                  title="Mark as read"
                  aria-label="Mark as read"
                  onClick={() => onMarkRead(item)}
                  style={{ color: "var(--green)", border: "none", background: "rgba(34, 197, 94, 0.1)", fontSize: "12px", cursor: "pointer", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}
                >
                  ✓
                </button>
              )}
              <button
                className="icon-button danger-icon"
                type="button"
                title="Delete notification"
                aria-label="Delete notification"
                onClick={() => onDelete(item)}
                style={{ cursor: "pointer" }}
              >
                <FaTrash />
              </button>
            </div>
          </article>
        ))}
        {notifications.length === 0 && <EmptyState text="No notifications match your search." />}
      </section>
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="empty-state">{text}</div>;
}

function SettingsSection({ preferences, onSettingChange, onDeleteAccount }) {
  const settingCards = [
    {
      key: "emailAlerts",
      title: "Email alerts",
      text: "Receive placement updates, approvals and job activity on email.",
      icon: <FaEnvelope />
    },
    {
      key: "smsReminders",
      title: "SMS reminders",
      text: "Get interview reminders and deadline nudges on mobile.",
      icon: <FaMobileAlt />
    },
    {
      key: "publicProfile",
      title: "Public profile",
      text: "Allow recruiters to view your profile snapshot and core skills.",
      icon: <FaUserShield />
    },
    {
      key: "weeklyDigest",
      title: "Weekly digest",
      text: "Bundle matching jobs, application trends and mentor updates in one summary.",
      icon: <FaRobot />
    },
    {
      key: "reducedMotion",
      title: "Reduced motion",
      text: "Tone down hover and transition effects for a calmer dashboard.",
      icon: <FaUniversalAccess />
    },
    {
      key: "compactView",
      title: "Compact view",
      text: "Fit more dashboard content on screen with tighter spacing.",
      icon: <FaBriefcase />
    }
  ];

  return (
    <section className="settings-layout">
      <section className="settings-grid">
        {settingCards.map((item) => (
          <label className="setting-row toggle-card" key={item.key}>
            <div className="setting-copy">
              <span className="setting-icon">{item.icon}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences[item.key]}
              onChange={(event) => onSettingChange(item.key, event.target.checked, item.title)}
            />
          </label>
        ))}
      </section>

      <article className="panel danger-zone">
        <div className="panel-title compact-title">
          <div>
            <h2>Delete Account</h2>
            <p>This removes your login and student record from the project permanently.</p>
          </div>
        </div>
        <div className="danger-zone-actions">
          <button className="danger-button" type="button" onClick={onDeleteAccount}>
            <FaTrash /> Delete Account
          </button>
        </div>
      </article>
    </section>
  );
}

function ResumeBuilderSection({ student, atsScore, onSave, pushNotification }) {
  const [uploadedResume, setUploadedResume] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("placer_uploaded_resume") || "null");
    } catch (e) {
      return null;
    }
  });

  const handleResumeRemove = () => {
    const confirmRemove = window.confirm("Are you sure you want to remove your resume PDF?");
    if (!confirmRemove) return;
    localStorage.removeItem("placer_uploaded_resume");
    setUploadedResume(null);
    if (onSave) {
      onSave({ ...student, resume: null });
    }
    pushNotification("Resume PDF removed.");
  };
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const finalScore = atsScore;

  const goalLower = (student.goal || "").toLowerCase();
  let requiredKeywords = [];
  if (goalLower.includes("data") || goalLower.includes("analyst")) {
    requiredKeywords = ["Python", "SQL", "Excel", "Power BI", "Statistics"];
  } else if (goalLower.includes("full") || goalLower.includes("stack")) {
    requiredKeywords = ["React", "Node.js", "REST API", "MongoDB", "System Design"];
  } else if (goalLower.includes("back") || goalLower.includes("engineer") || goalLower.includes("java")) {
    requiredKeywords = ["Java", "Spring Boot", "SQL", "Microservices", "DSA"];
  } else {
    requiredKeywords = ["React", "JavaScript", "HTML", "CSS", "Git"];
  }

  const rawSkills = Array.isArray(student.skills) 
    ? student.skills 
    : (student.skills ? String(student.skills).split(',') : []);
  const skills = rawSkills.filter(Boolean);
  const studentSkillsLower = skills.map((s) => String(s).toLowerCase());
  const foundKeywords = requiredKeywords.filter(kw => studentSkillsLower.some(skill => skill.includes(kw.toLowerCase()) || kw.toLowerCase().includes(skill)));
  const missingKeywords = requiredKeywords.filter(kw => !studentSkillsLower.some(skill => skill.includes(kw.toLowerCase()) || kw.toLowerCase().includes(skill)));

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      pushNotification("Please upload a PDF file only.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resumeData = {
        name: file.name,
        uploadedAt: new Date().toLocaleString(),
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        dataUrl: reader.result
      };
      setUploadedResume(resumeData);
      localStorage.setItem("placer_uploaded_resume", JSON.stringify(resumeData));
      if (onSave) {
        onSave({ ...student, resume: file.name });
      }
      pushNotification(`Resume "${file.name}" uploaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  const handleOptimizeClick = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowOptimizeModal(true);
      pushNotification("ATS analysis complete! Resume and profile optimization insights updated.");
    }, 1200);
  };

  const educationList = cleanEducationList(toEducationList(student.education, student));
  const projectList = cleanList(student.projects);
  const internshipList = cleanInternshipList(toInternshipList(student.internships));
  const certificationList = cleanList(student.certifications);

  const downloadResumeAsPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      pushNotification("Pop-up blocker prevented printing. Please allow pop-ups.");
      return;
    }
    
    const resumeHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${student.name} - Resume</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              color: #1e293b;
              line-height: 1.5;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              font-size: 28px;
              font-weight: 800;
              margin: 0 0 5px 0;
              color: #0f172a;
            }
            .subtitle {
              font-size: 14px;
              color: #2563eb;
              font-weight: 600;
              margin-bottom: 16px;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 12px;
            }
            .contact-info {
              display: flex;
              gap: 15px;
              flex-wrap: wrap;
              font-size: 13px;
              color: #475569;
              margin-bottom: 24px;
            }
            h2 {
              font-size: 16px;
              color: #1e3a8a;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
              margin-top: 24px;
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-weight: 700;
            }
            .item {
              margin-bottom: 16px;
            }
            .item-header {
              display: flex;
              justify-content: space-between;
              font-weight: 700;
              color: #0f172a;
              font-size: 14px;
            }
            .item-subheader {
              display: flex;
              justify-content: space-between;
              color: #64748b;
              font-size: 12px;
              margin-bottom: 6px;
            }
            .description {
              font-size: 13px;
              color: #334155;
              margin: 0;
            }
            .skills-list {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            .skill-tag {
              background: #f1f5f9;
              padding: 4px 10px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
              color: #334155;
            }
            ul {
              margin: 0;
              padding-left: 20px;
            }
            li {
              font-size: 13px;
              color: #334155;
              margin-bottom: 6px;
            }
            @media print {
              body {
                padding: 0;
              }
              @page {
                margin: 20mm;
              }
            }
          </style>
        </head>
        <body>
          <h1>${student.name}</h1>
          <div class="subtitle">${student.branch} | ${student.year}</div>
          <div class="contact-info">
            <span><strong>Email:</strong> ${student.email}</span>
            <span><strong>Phone:</strong> ${student.phone}</span>
            ${student.cgpa ? `<span><strong>CGPA:</strong> ${student.cgpa}</span>` : ""}
          </div>
          
          ${student.about ? `
            <h2>Professional Summary</h2>
            <p class="description" style="text-align: justify;">${student.about}</p>
          ` : ""}
          
          ${educationList && educationList.length > 0 ? `
            <h2>Education</h2>
            ${educationList.map(edu => `
              <div class="item">
                <div class="item-header">
                  <span>${edu.school || "Institution"}</span>
                  <span>${edu.grade ? `CGPA/Grade: ${edu.grade}` : ""}</span>
                </div>
                <div class="item-subheader">
                  <span>${edu.degree} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</span>
                  <span>${edu.startYear || edu.startMonth ? `${edu.startMonth} ${edu.startYear} - ` : ""}${edu.endMonth || edu.endYear ? `${edu.endMonth} ${edu.endYear}` : "Present"}</span>
                </div>
                ${edu.description ? `<p class="description">${edu.description}</p>` : ""}
              </div>
            `).join("")}
          ` : ""}

          ${internshipList && internshipList.length > 0 ? `
            <h2>Work Experience</h2>
            ${internshipList.map(intern => `
              <div class="item">
                <div class="item-header">
                  <span>${intern.role || "Intern"}</span>
                  <span>${intern.location || ""}</span>
                </div>
                <div class="item-subheader">
                  <span>${intern.company || ""}</span>
                  <span>${intern.startMonth ? `${intern.startMonth} ` : ""}${intern.startYear} - ${intern.endMonth || intern.endYear ? `${intern.endMonth} ${intern.endYear}` : "Present"}</span>
                </div>
                ${intern.description ? `<p class="description">${intern.description}</p>` : ""}
              </div>
            `).join("")}
          ` : ""}

          ${projectList && projectList.length > 0 ? `
            <h2>Projects</h2>
            ${projectList.map(proj => `
              <div class="item">
                <div class="item-header">
                  <span>${typeof proj === 'string' ? proj : proj.name || ""}</span>
                </div>
                ${typeof proj !== 'string' && proj.description ? `<p class="description">${proj.description}</p>` : ""}
              </div>
            `).join("")}
          ` : ""}

          ${skills && skills.length > 0 && skills.some(Boolean) ? `
            <h2>Skills</h2>
            <div class="skills-list">
              ${skills.filter(Boolean).map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join("")}
            </div>
          ` : ""}

          ${certificationList && certificationList.length > 0 && certificationList.some(Boolean) ? `
            <h2>Certifications</h2>
            <ul>
              ${certificationList.filter(Boolean).map(cert => `<li>${cert}</li>`).join("")}
            </ul>
          ` : ""}
        </body>
      </html>
    `;
    
    printWindow.document.write(resumeHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Compile Dynamic Optimization Suggestions
  const suggestions = [];
  if (missingKeywords.length > 0) {
    suggestions.push({
      title: "Integrate target keywords",
      text: `Add missing industry-standard terms: ${missingKeywords.join(", ")} to your skills or project descriptions to pass automatic ATS filters.`
    });
  }
  if (!student.about) {
    suggestions.push({
      title: "Add professional summary",
      text: "A brief 2-3 sentence introduction at the top of your resume highlighting your core skills, year of study, and goals helps engage recruiters."
    });
  }
  if (educationList.length === 0) {
    suggestions.push({
      title: "Add complete education details",
      text: "Detail your degree, CGPA/marks, and passing year. ATS systems scan for academic credentials dynamically."
    });
  }
  if (projectList.length === 0) {
    suggestions.push({
      title: "Add resume-ready projects",
      text: "Include 2-3 project cards demonstrating practical skills. Describe the stack and your specific contribution."
    });
  }
  if (internshipList.length === 0) {
    suggestions.push({
      title: "Include work experience or simulation credentials",
      text: "Practical internships, student association jobs, or client simulations demonstrate corporate-ready values."
    });
  }
  suggestions.push({
    title: "Keep resume formatting clean",
    text: "Use standard fonts (Inter, Arial, Calibri) and a clean single-column structure to ensure the parser extracts fields correctly."
  });

  return (
    <section className="resume-layout">
      {/* Hidden PDF file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        style={{ display: "none" }}
      />

      <div className="panel-title">
        <div>
          <h2><FaFileContract /> Resume & ATS Analyzer</h2>
          <p>Optimize your resume for applicant tracking systems.</p>
        </div>
      </div>
      <div className="ats-score-card">
        <div className="ats-circle" style={{ "--score": `${finalScore}%` }}>
          <div className="ats-circle-inner">
            <strong>{finalScore}%</strong>
            <span>ATS Score</span>
          </div>
        </div>
        <div className="ats-details">
          <h3>Profile Analysis</h3>
          <p>Based on your selected career goal ({student.goal || "your profile"}), your current skills and projects give you a solid foundation. Make sure to include exact keyword matches in your actual resume file.</p>
          {uploadedResume && (
            <div className="resume-uploaded-badge" style={{ marginTop: "12px", background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--ink)", display: "inline-flex", alignItems: "center", gap: "6px" }}>📄 {uploadedResume.name} ({uploadedResume.size})</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <a href={uploadedResume.dataUrl} download={uploadedResume.name} className="primary-button compact-button" style={{ textDecoration: "none", fontSize: "11px", padding: "4px 8px", color: "#fff", borderRadius: "4px" }}>Download</a>
                <button className="danger-button compact-button" type="button" onClick={handleResumeRemove} style={{ fontSize: "11px", padding: "4px 8px", background: "var(--red)", border: "none", color: "#fff", borderRadius: "4px", cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          )}
          <div className="keyword-chips" style={{ marginTop: "12px" }}>
            {foundKeywords.map(kw => (
              <span className="found" key={`found-${kw}`}><FaCheckCircle /> {kw}</span>
            ))}
            {missingKeywords.map(kw => (
              <span className="missing" key={`miss-${kw}`}><FaTimesCircle /> {kw}</span>
            ))}
          </div>
        </div>
      </div>
      
      {isAnalyzing && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", margin: "24px 0", padding: "16px", background: "rgba(37,99,235,0.05)", border: "1px dashed var(--primary)", borderRadius: "12px" }}>
          <div className="ats-scan-spinner" style={{ width: "24px", height: "24px", margin: 0 }}></div>
          <span style={{ fontWeight: 600, color: "var(--primary)" }}>Scanning uploaded files and profile keywords...</span>
        </div>
      )}

      <div className="placeholder-grid" style={{ marginTop: "24px" }}>
        <article onClick={handleUploadClick}>
          <FaCloudUploadAlt />
          <strong>Upload PDF</strong>
          <span>{uploadedResume ? `Selected: ${uploadedResume.name}` : "Scan your existing resume"}</span>
        </article>
        <article onClick={() => setShowPreviewModal(true)}>
          <FaRobot />
          <strong>Auto-Generate</strong>
          <span>Create from profile data</span>
        </article>
        <article onClick={handleOptimizeClick}>
          <FaEdit />
          <strong>Optimize</strong>
          <span>Fix missing keywords</span>
        </article>
      </div>

      {/* Auto-Generate Resume Preview Modal */}
      {showPreviewModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1000, position: "fixed", top: 0, left: 0, right: 0, bottom: 0, overflowY: "auto", padding: "40px 20px" }}>
          <section className="job-modal" style={{ maxWidth: "800px", width: "100%", padding: "24px", borderRadius: "16px", background: "#fff", display: "flex", flexDirection: "column" }}>
            <div style={{ paddingBottom: "16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "#0f172a" }}>Resume Preview</h2>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0 0" }}>Generated from your student profile data</p>
              </div>
              <button className="icon-button" type="button" onClick={() => setShowPreviewModal(false)} aria-label="Close" style={{ fontSize: "20px" }}>
                <FaTimesCircle />
              </button>
            </div>
            
            <div className="resume-preview-container">
              <div className="resume-paper">
                <h1>{student.name}</h1>
                <div className="resume-subtitle">{student.branch} | {student.year}</div>
                <div className="resume-contact">
                  <span><strong>Email:</strong> {student.email}</span>
                  <span><strong>Phone:</strong> {student.phone}</span>
                  {student.cgpa && <span><strong>CGPA:</strong> {student.cgpa}</span>}
                </div>
                
                {student.about && (
                  <>
                    <h2>Professional Summary</h2>
                    <p style={{ textAlign: "justify" }}>{student.about}</p>
                  </>
                )}
                
                {educationList.length > 0 && (
                  <>
                    <h2>Education</h2>
                    {educationList.map((edu, idx) => (
                      <div className="resume-item" key={`edu-${idx}`}>
                        <div className="resume-item-header">
                          <span>{edu.school || "Institution"}</span>
                          <span>{edu.grade ? `CGPA/Grade: ${edu.grade}` : ""}</span>
                        </div>
                        <div className="resume-item-subheader">
                          <span>{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</span>
                          <span>{edu.startYear || edu.startMonth ? `${edu.startMonth} ${edu.startYear} - ` : ""}${edu.endMonth || edu.endYear ? `${edu.endMonth} ${edu.endYear}` : "Present"}</span>
                        </div>
                        {edu.description && <p>{edu.description}</p>}
                      </div>
                    ))}
                  </>
                )}

                {internshipList.length > 0 && (
                  <>
                    <h2>Work Experience</h2>
                    {internshipList.map((intern, idx) => (
                      <div className="resume-item" key={`intern-${idx}`}>
                        <div className="resume-item-header">
                          <span>{intern.role || "Intern"}</span>
                          <span>{intern.location || ""}</span>
                        </div>
                        <div className="resume-item-subheader">
                          <span>{intern.company || ""}</span>
                          <span>{intern.startMonth ? `${intern.startMonth} ` : ""}${intern.startYear} - ${intern.endMonth || intern.endYear ? `${intern.endMonth} ${intern.endYear}` : "Present"}</span>
                        </div>
                        {intern.description && <p>{intern.description}</p>}
                      </div>
                    ))}
                  </>
                )}

                {projectList.length > 0 && (
                  <>
                    <h2>Projects</h2>
                    {projectList.map((proj, idx) => (
                      <div className="resume-item" key={`proj-${idx}`}>
                        <div className="resume-item-header">
                          <span>{typeof proj === 'string' ? proj : proj.name || ""}</span>
                        </div>
                        {typeof proj !== 'string' && proj.description && <p>{proj.description}</p>}
                      </div>
                    ))}
                  </>
                )}

                {skills.length > 0 && skills.some(Boolean) && (
                  <>
                    <h2>Skills</h2>
                    <div className="resume-skills">
                      {skills.filter(Boolean).map(skill => (
                        <span className="resume-skill-tag" key={skill}>{skill.trim()}</span>
                      ))}
                    </div>
                  </>
                )}

                {certificationList.length > 0 && certificationList.some(Boolean) && (
                  <>
                    <h2>Certifications</h2>
                    <ul style={{ margin: 0, paddingLeft: "20px" }}>
                      {certificationList.filter(Boolean).map((cert, idx) => (
                        <li key={`cert-${idx}`} style={{ fontSize: "12px", color: "#475569" }}>{cert}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>

            <div style={{ paddingTop: "16px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button className="secondary-button" type="button" onClick={() => setShowPreviewModal(false)}>Close</button>
              <button className="primary-button" type="button" onClick={downloadResumeAsPDF}>Download PDF</button>
            </div>
          </section>
        </div>
      )}

      {/* ATS Keyword Optimizer Modal */}
      {showOptimizeModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1000, position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}>
          <section className="job-modal" style={{ maxWidth: "600px", width: "100%", padding: "24px", borderRadius: "16px", background: "#fff", display: "flex", flexDirection: "column" }}>
            <div style={{ paddingBottom: "16px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "#0f172a" }}>ATS Scanner Feedback</h2>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0 0" }}>Analysis based on target goal: {student.goal || "Not Specified"}</p>
              </div>
              <button className="icon-button" type="button" onClick={() => setShowOptimizeModal(false)} aria-label="Close" style={{ fontSize: "20px" }}>
                <FaTimesCircle />
              </button>
            </div>

            <div style={{ padding: "16px 0", maxHeight: "450px", overflowY: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "24px", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid var(--line)", marginBottom: "20px" }}>
                <div className="ats-circle" style={{ width: "90px", height: "90px", "--score": `${finalScore}%`, margin: 0 }}>
                  <div className="ats-circle-inner" style={{ width: "74px", height: "74px" }}>
                    <strong style={{ fontSize: "18px" }}>{finalScore}%</strong>
                  </div>
                </div>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", color: "#0f172a" }}>
                    {finalScore >= 80 ? "Highly Optimized!" : finalScore >= 60 ? "Good Foundation (Needs Tuning)" : "Critical Improvements Needed"}
                  </h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: 1.4 }}>
                    {uploadedResume 
                      ? `Scanned uploaded file: "${uploadedResume.name}". Formatting structure is standard.`
                      : "No PDF resume uploaded yet. Analyzing current profile parameters as fallback."
                    }
                  </p>
                </div>
              </div>

              <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#0f172a" }}>Keyword Alignment</h4>
              <div className="keyword-chips" style={{ marginBottom: "20px" }}>
                {foundKeywords.map(kw => (
                  <span className="found" key={`opt-found-${kw}`}><FaCheckCircle /> {kw}</span>
                ))}
                {missingKeywords.map(kw => (
                  <span className="missing" key={`opt-miss-${kw}`}><FaTimesCircle /> {kw}</span>
                ))}
              </div>

              <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#0f172a" }}>Improvement Suggestions</h4>
              <div className="ats-suggestions-list">
                {suggestions.map((sug, idx) => (
                  <div className="ats-suggestion-item" key={`sug-${idx}`}>
                    <strong>{sug.title}</strong>
                    <span>{sug.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ paddingTop: "16px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
              <button className="primary-button" type="button" onClick={() => setShowOptimizeModal(false)}>Acknowledge & Close</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function MockInterviewSection({ pushNotification }) {
  const mockQuestions = useMemo(() => ({
    "Frontend Developer": [
      "Explain the difference between Virtual DOM and Real DOM, and how React uses it to optimize performance.",
      "What are React Hooks? Explain useState and useEffect with practical examples.",
      "Describe how you would optimize a React application that is rendering too slowly.",
      "What is the Box Model in CSS? How does box-sizing: border-box affect it?",
      "Explain the concept of closures in JavaScript and provide a common use case."
    ],
    "Data Analyst": [
      "Explain the difference between a LEFT JOIN and an INNER JOIN in SQL.",
      "How would you handle missing values in a dataset before performing analysis?",
      "Describe a time when you used Power BI or Tableau to visualize a complex dataset.",
      "What is the difference between variance and standard deviation?",
      "Explain how you would write a Python script using pandas to group data by category and find the average."
    ],
    "Full Stack Developer": [
      "Explain the MVC architecture and how it applies to a Node.js + React stack.",
      "What is a REST API? Describe the differences between GET, POST, PUT, and DELETE methods.",
      "How do you secure a web application against Cross-Site Scripting (XSS) and SQL Injection?",
      "Explain how JSON Web Tokens (JWT) work for authentication.",
      "What is the purpose of Docker, and how does it differ from a Virtual Machine?"
    ],
    "Backend Engineer": [
      "Explain the CAP theorem and its implications for distributed databases.",
      "What are microservices? Describe the pros and cons compared to a monolithic architecture.",
      "How do you implement caching in a backend system to improve performance? (e.g., Redis)",
      "Explain the difference between synchronous and asynchronous processing in backend code.",
      "Write a SQL query conceptually to find the second highest salary from an Employee table."
    ]
  }), []);

  const [role, setRole] = useState("Frontend Developer");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setSubmitted(false);
    setAnswer("");
    const maxIndex = mockQuestions[newRole].length - 1;
    setQuestionIndex(Math.floor(Math.random() * (maxIndex + 1)));
  };

  const nextQuestion = () => {
    setSubmitted(false);
    setAnswer("");
    const maxIndex = mockQuestions[role].length - 1;
    let newIndex = Math.floor(Math.random() * (maxIndex + 1));
    if (newIndex === questionIndex && maxIndex > 0) {
      newIndex = newIndex === maxIndex ? 0 : newIndex + 1;
    }
    setQuestionIndex(newIndex);
  };

  const currentQuestion = mockQuestions[role][questionIndex];

  return (
    <section className="mock-interview-container">
      <div className="panel-title">
        <div>
          <h2><FaMicrophone /> AI Mock Interview</h2>
          <p>Practice technical questions with instant AI feedback.</p>
        </div>
      </div>
      
      <div className="mock-role-selector">
        <div>
          <h3>Select Target Role</h3>
          <p className="muted-text">We'll adjust the difficulty and topics based on this role.</p>
        </div>
        <select value={role} onChange={(e) => handleRoleChange(e.target.value)}>
          <option>Frontend Developer</option>
          <option>Data Analyst</option>
          <option>Full Stack Developer</option>
          <option>Backend Engineer</option>
        </select>
      </div>

      <div className="mock-question-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0 }}><FaRobot /> Question {questionIndex + 1} of {mockQuestions[role].length}</h3>
          <button className="link-button" onClick={nextQuestion}>Skip / Next Question</button>
        </div>
        <p style={{ fontSize: "16px", marginBottom: "16px" }}><strong>{currentQuestion}</strong></p>
        <textarea 
          placeholder="Type your answer here as if you are speaking to the interviewer..." 
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitted}
        />
        {!submitted ? (
          <button className="primary-button" type="button" onClick={() => { setSubmitted(true); if(pushNotification) pushNotification("Answer submitted for AI review."); }}>Submit Answer</button>
        ) : (
          <div className={`mock-feedback ${answer.length < 50 ? 'needs-improvement' : ''}`}>
            {answer.length < 50 ? (
              <div>
                <strong>Needs more depth</strong>
                <p>Your answer is too brief. Mention how React batches updates and uses a diffing algorithm (reconciliation) to minimize reflows.</p>
              </div>
            ) : (
              <div>
                <strong>Great response!</strong>
                <p>You covered the key points well. Next time, try to add a short real-world example of when the Virtual DOM is particularly useful.</p>
              </div>
            )}
          </div>
        )}
        
        {submitted && (
          <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
            <button className="secondary-button" type="button" onClick={nextQuestion}>Next Question</button>
          </div>
        )}
      </div>
    </section>
  );
}

function MentorConnectSection({ pushNotification }) {
  const mentors = [
    { name: "Rahul Verma", company: "Amazon", role: "SDE II", domain: "Backend & Systems" },
    { name: "Sneha Patil", company: "Google", role: "Product Manager", domain: "Product Strategy" },
    { name: "Karan Desai", company: "TCS", role: "Tech Lead", domain: "Enterprise Java" },
    { name: "Aisha Khan", company: "Microsoft", role: "Frontend Engineer", domain: "React & Web" },
    { name: "Vikram Singh", company: "Infosys", role: "Data Scientist", domain: "Machine Learning" }
  ];

  const [activeModal, setActiveModal] = useState(null); // { type: 'message' | 'call', mentor: Object }
  const [modalText, setModalText] = useState("");

  const handleAction = (type, mentor) => {
    setActiveModal({ type, mentor });
    setModalText("");
  };

  const handleSend = () => {
    if (!activeModal) return;
    const actionName = activeModal.type === 'message' ? 'Message sent' : 'Call request sent';
    pushNotification(`${actionName} to ${activeModal.mentor.name} successfully!`);
    setActiveModal(null);
  };

  return (
    <section>
      <div className="panel-title">
        <div>
          <h2><FaUserTie /> Mentor & Alumni Connect</h2>
          <p>Reach out to alumni working in top companies for guidance and referrals.</p>
        </div>
      </div>
      
      <div className="mentor-grid">
        {mentors.map((mentor) => (
          <article className="mentor-card" key={mentor.name}>
            <div className="mentor-avatar">{mentor.name.slice(0, 1)}</div>
            <h3>{mentor.name}</h3>
            <p>{mentor.role}</p>
            <div className="mentor-company">
              <FaBuilding /> {mentor.company}
            </div>
            <p className="muted-text" style={{ fontSize: "13px", marginBottom: "20px" }}>Expertise: {mentor.domain}</p>
            <div className="mentor-actions">
              <button className="secondary-button" type="button" onClick={() => handleAction('message', mentor)}>Message</button>
              <button className="primary-button" type="button" onClick={() => handleAction('call', mentor)}>Request Call</button>
            </div>
          </article>
        ))}
      </div>

      {activeModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1000, position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}>
          <section className="job-modal" style={{ maxWidth: "500px", padding: "32px", borderRadius: "20px" }}>
            <div className="panel-title">
              <div>
                <h2>{activeModal.type === 'message' ? `Message ${activeModal.mentor.name}` : `Request Call with ${activeModal.mentor.name}`}</h2>
                <p>{activeModal.mentor.role} at {activeModal.mentor.company}</p>
              </div>
              <button className="icon-button" type="button" onClick={() => setActiveModal(null)} aria-label="Close">
                <FaTimesCircle />
              </button>
            </div>
            
            <div className="modal-body" style={{ marginTop: "24px" }}>
              {activeModal.type === 'message' ? (
                <>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>Your Message</label>
                  <textarea 
                    autoFocus
                    placeholder="Hi! I am a junior developer interested in your work at..." 
                    value={modalText}
                    onChange={(e) => setModalText(e.target.value)}
                    style={{ width: "100%", minHeight: "120px", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1", resize: "none", fontSize: "15px" }}
                  />
                </>
              ) : (
                <>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>Preferred Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={modalText}
                    onChange={(e) => setModalText(e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "15px", marginBottom: "16px" }}
                  />
                  <p className="muted-text" style={{ fontSize: "13px" }}>Mentors usually respond to scheduling requests within 48 hours.</p>
                </>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
              <button className="secondary-button" type="button" onClick={() => setActiveModal(null)}>Cancel</button>
              <button className="primary-button" type="button" onClick={handleSend} disabled={!modalText}>
                {activeModal.type === 'message' ? 'Send Message' : 'Confirm Request'}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function SkillsModal({ currentSkills, onClose, onSave }) {
  const [inputValue, setInputValue] = useState("");
  const [skills, setSkills] = useState([...currentSkills]);

  const suggestedSkills = [
    "Programming Languages", "Data Engineering", "Data Science", 
    "Query Languages", "Full-Stack Development", "React.js", 
    "Machine Learning", "System Design"
  ];

  const handleAddSkill = (skill) => {
    if (!skill.trim()) return;
    const trimmed = skill.trim();
    if (!skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill(inputValue);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1000, position: "fixed", top: 0, left: 0, right: 0, bottom: 0, overflowY: "auto", padding: "40px 20px" }}>
      <section className="job-modal skills-modal" style={{ maxWidth: "600px", width: "100%", padding: "0", borderRadius: "16px", overflow: "hidden", background: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", margin: 0, color: "#0f172a" }}>Add skill</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close" style={{ fontSize: "20px" }}>
            <FaTimesCircle />
          </button>
        </div>
        
        <div style={{ padding: "24px" }}>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>* Indicates required</p>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#334155" }}>Skill*</label>
          <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px 16px", background: "#fff" }}>
            <FaFilter style={{ color: "#64748b", marginRight: "12px", fontSize: "14px" }} />
            <input 
              autoFocus
              placeholder="Skill (ex: Project Management)" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ border: "none", outline: "none", width: "100%", fontSize: "15px", background: "transparent" }}
            />
          </div>

          <div className="suggested-skills-box">
            <h4>Suggested based on your profile</h4>
            <div className="suggested-skills-chips">
              {suggestedSkills.filter(s => !skills.includes(s)).map(s => (
                <button key={s} type="button" onClick={() => handleAddSkill(s)}>
                  {s} <FaPlus style={{ fontSize: "12px" }} />
                </button>
              ))}
            </div>
          </div>

          {skills.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#0f172a" }}>Skills to add</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {skills.map(s => (
                  <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#e2e8f0", padding: "6px 12px", borderRadius: "16px", fontSize: "13px", fontWeight: "500", color: "#334155" }}>
                    {s}
                    <FaTimesCircle style={{ cursor: "pointer", color: "#64748b" }} onClick={() => setSkills(skills.filter(item => item !== s))} />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", background: "#f8fafc" }}>
          <button className="primary-button" type="button" onClick={() => onSave(skills)} style={{ padding: "8px 24px", borderRadius: "24px" }}>Save</button>
        </div>
      </section>
    </div>
  );
}

export default StudentDashboard;
