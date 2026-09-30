// Service layer for PLACER-AI frontend logic
// Designed for seamless migration to FastAPI REST endpoints later.

import { mockJobs, mockSkillGaps, mockInterviews, mockAssessments } from "../data/mockData";
import { safeGetItem } from "../utils/storage";

// Simulated network latency helper for asynchronous state demonstration
const simulateDelay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch personalized AI job recommendations based on student profile.
 */
export async function getRecommendations(student) {
  await simulateDelay(400);
  const jobs = safeGetItem("placer_jobs", mockJobs);
  const studentSkills = (student?.skills || []).map((s) => String(s).toLowerCase());

  return jobs.map((job) => {
    const matched = (job.skills || []).filter((sk) =>
      studentSkills.some((st) => st.includes(sk.toLowerCase()) || sk.toLowerCase().includes(st))
    );
    const missing = (job.skills || []).filter((sk) => !matched.includes(sk));
    const matchScore = Math.min(
      95,
      Math.max(60, 60 + matched.length * 10 - missing.length * 5)
    );

    return {
      ...job,
      match: job.match || matchScore,
      matchedSkills: matched.length ? matched : (job.skills ? job.skills.slice(0, 3) : []),
      missingSkills: missing.length ? missing : (job.missingSkills || ["Docker"]),
      whyRecommended: job.whyRecommended || `Your skills match key requirements for ${job.role}.`
    };
  });
}

/**
 * Fetch detailed match analytics breakdown for a specific job & student profile.
 */
export async function getJobMatchDetails(job, student) {
  await simulateDelay(350);
  const studentSkills = (student?.skills || []).map((s) => String(s).toLowerCase());
  const jobSkills = job?.skills || ["Python", "SQL", "React"];

  const matched = jobSkills.filter((sk) =>
    studentSkills.some((st) => st.includes(sk.toLowerCase()) || sk.toLowerCase().includes(st))
  );

  const skillsMatchScore = Math.round((matched.length / Math.max(1, jobSkills.length)) * 100) || 85;

  return {
    jobId: job?.id || "job-101",
    jobTitle: job?.role || "Python Developer",
    company: job?.company || "ABC Technologies",
    overallMatch: job?.match || 92,
    breakdown: {
      skillsMatch: skillsMatchScore,
      educationMatch: student?.cgpa && parseFloat(student.cgpa) >= 8.0 ? 92 : 85,
      projectMatch: (student?.projects || []).length > 0 ? 88 : 75,
      experienceMatch: 85,
      preferenceMatch: 92
    },
    whyMatches: [
      `Strong alignment in core skill areas (${matched.join(", ") || "Technical Skills"})`,
      `Relevant computer engineering & project coursework`,
      `Verified CGPA of ${student?.cgpa || "9.0+"} satisfies academic criteria`,
      `Preferred role '${student?.preferredRole || "Developer"}' matches posting category`
    ],
    missingSkills: job?.missingSkills || ["Docker", "AWS"],
    recommendedLearning: [
      { title: "Docker Basics", link: "https://docker.com", duration: "3 hours" },
      { title: "AWS Fundamentals", link: "https://aws.amazon.com", duration: "5 hours" },
      { title: "RESTful API Standards", link: "https://restfulapi.net", duration: "2 hours" }
    ]
  };
}

/**
 * Perform skill gap analysis comparing current profile against market demands.
 */
export async function getSkillGap(student) {
  await simulateDelay(300);
  const currentSkills = student?.skills && student.skills.length ? student.skills : mockSkillGaps.currentSkills;

  return {
    ...mockSkillGaps,
    currentSkills
  };
}

/**
 * Simulated ATS Resume analysis algorithm comparing text against a job description.
 */
export async function analyzeResume(resumeFile, jobDescription) {
  await simulateDelay(800);
  const jdText = (jobDescription || "").toLowerCase();
  
  const targetKeywords = ["Python", "SQL", "React", "Django", "Docker", "AWS", "REST API", "DSA", "Git"];
  const matched = targetKeywords.filter((kw) => jdText.includes(kw.toLowerCase()) || Math.random() > 0.4);
  const missing = targetKeywords.filter((kw) => !matched.includes(kw));

  const overallScore = Math.min(95, Math.max(65, 70 + matched.length * 3));

  return {
    atsScore: overallScore,
    breakdown: {
      overall: overallScore,
      keywordMatch: Math.min(98, overallScore + 2),
      skillsMatch: Math.min(96, overallScore + 4),
      experienceMatch: Math.min(90, overallScore - 4),
      educationMatch: 92,
      formatting: 90,
      projectRelevance: 86
    },
    matchedKeywords: matched.length ? matched : ["Python", "SQL", "React", "Django"],
    missingKeywords: missing.length ? missing : ["Docker", "AWS", "REST API"],
    strengths: [
      "Strong technical skills structure aligned with job requirements",
      "Relevant academic background in Computer Engineering",
      "Clean document structure with clear section headings"
    ],
    improvements: [
      "Include explicit experience bullets mentioning Docker & containerization",
      "Add REST API architecture keywords to project descriptions",
      "Quantify project achievements with metrics (e.g., 'improved performance by 25%')"
    ]
  };
}

/**
 * Natural language semantic job search UI service handler.
 */
export async function searchJobs(query, filters = {}) {
  await simulateDelay(400);
  const allJobs = safeGetItem("placer_jobs", mockJobs);
  const q = (query || "").toLowerCase();

  return allJobs.filter((job) => {
    const textMatch =
      !q ||
      job.role.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      (job.skills || []).some((s) => s.toLowerCase().includes(q));

    const locMatch = !filters.location || filters.location === "All" || job.location.includes(filters.location);
    const typeMatch = !filters.type || filters.type === "All" || job.type === filters.type;

    return textMatch && locMatch && typeMatch;
  }).map((job) => ({
    ...job,
    semanticMatchReason: q
      ? `Matches natural language query '${query}' based on skill requirements and location criteria.`
      : "Recommended based on profile relevance."
  }));
}

/**
 * Interview management service.
 */
export async function getInterviews() {
  await simulateDelay(250);
  return safeGetItem("placer_interviews", mockInterviews);
}

export async function scheduleInterview(newInterview) {
  await simulateDelay(350);
  const currentInterviews = safeGetItem("placer_interviews", mockInterviews);
  const updated = [newInterview, ...currentInterviews];
  localStorage.setItem("placer_interviews", JSON.stringify(updated));
  return updated;
}

/**
 * Assessment management service.
 */
export async function getAssessments() {
  await simulateDelay(250);
  return safeGetItem("placer_assessments", mockAssessments);
}

export async function submitAssessmentResult(resultData) {
  await simulateDelay(400);
  const existingResults = safeGetItem("placer_assessment_results", []);
  const updated = [resultData, ...existingResults];
  localStorage.setItem("placer_assessment_results", JSON.stringify(updated));
  return updated;
}

// ==========================================
// STEP 14: REAL FASTAPI + RAG + OLLAMA SERVICES
// ==========================================

import { getStoredToken } from "./authService";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const getAuthHeaders = () => {
  const token = getStoredToken();
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

/**
 * Check local Ollama AI engine health status.
 */
export async function getAIHealth() {
  try {
    const response = await fetch(`${API_URL}/ai/health`, {
      method: "GET",
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      return { available: false, model: "llama3.2", message: "AI service unreachable" };
    }
    return await response.json();
  } catch (err) {
    return { available: false, model: "llama3.2", message: "Local AI service is offline." };
  }
}

/**
 * Send natural language question to RAG student AI assistant.
 */
export async function askAI(question) {
  try {
    const response = await fetch(`${API_URL}/student/ai/chat`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ question })
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        answer: data.detail || "Error connecting to AI assistant.",
        sources: [],
        grounded: false,
        ai_available: false
      };
    }
    return data;
  } catch (err) {
    return {
      answer: "Local AI service is currently unavailable. Please ensure Ollama is running.",
      sources: [],
      grounded: false,
      ai_available: false
    };
  }
}

/**
 * Request job-specific AI analysis and match explanation.
 */
export async function analyzeJobWithAI(jobId, question = null) {
  try {
    const response = await fetch(`${API_URL}/student/jobs/${jobId}/ai-analysis`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ question: question || "" })
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        job_id: jobId,
        answer: data.detail || "Error retrieving job match analysis.",
        match_score: null,
        missing_skills: [],
        sources: [],
        grounded: false,
        ai_available: false
      };
    }
    return data;
  } catch (err) {
    return {
      job_id: jobId,
      answer: "Local AI service is currently unavailable.",
      match_score: null,
      missing_skills: [],
      sources: [],
      grounded: false,
      ai_available: false
    };
  }
}

