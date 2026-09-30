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

const handleResponse = async (response) => {
  if (response.status === 204) {
    return true;
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.detail || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    throw error;
  }
  return data;
};

// ==========================================
// 1. STUDENT PROFILE APIs
// ==========================================

export const getStudentProfile = async () => {
  const response = await fetch(`${API_URL}/student/profile`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const updateStudentProfile = async (profileData) => {
  const response = await fetch(`${API_URL}/student/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });
  return handleResponse(response);
};

// ==========================================
// 2. EDUCATION APIs
// ==========================================

export const getEducation = async () => {
  const response = await fetch(`${API_URL}/student/education`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const addEducation = async (educationData) => {
  const response = await fetch(`${API_URL}/student/education`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(educationData)
  });
  return handleResponse(response);
};

export const updateEducation = async (educationId, educationData) => {
  const response = await fetch(`${API_URL}/student/education/${educationId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(educationData)
  });
  return handleResponse(response);
};

export const deleteEducation = async (educationId) => {
  const response = await fetch(`${API_URL}/student/education/${educationId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// ==========================================
// 3. SKILLS APIs
// ==========================================

export const getSkills = async () => {
  const response = await fetch(`${API_URL}/student/skills`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const addSkill = async (skillData) => {
  const response = await fetch(`${API_URL}/student/skills`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(skillData)
  });
  return handleResponse(response);
};

export const deleteSkill = async (skillId) => {
  const response = await fetch(`${API_URL}/student/skills/${skillId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// ==========================================
// 4. PROJECTS APIs
// ==========================================

export const getProjects = async () => {
  const response = await fetch(`${API_URL}/student/projects`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const addProject = async (projectData) => {
  const response = await fetch(`${API_URL}/student/projects`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(projectData)
  });
  return handleResponse(response);
};

export const updateProject = async (projectId, projectData) => {
  const response = await fetch(`${API_URL}/student/projects/${projectId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(projectData)
  });
  return handleResponse(response);
};

export const deleteProject = async (projectId) => {
  const response = await fetch(`${API_URL}/student/projects/${projectId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// ==========================================
// 5. RESUME METADATA APIs
// ==========================================

export const getResumes = async () => {
  const response = await fetch(`${API_URL}/student/resumes`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const addResumeMetadata = async (resumeData) => {
  const response = await fetch(`${API_URL}/student/resumes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(resumeData)
  });
  return handleResponse(response);
};

export const deleteResumeMetadata = async (resumeId) => {
  const response = await fetch(`${API_URL}/student/resumes/${resumeId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// ==========================================
// 6. DASHBOARD STATISTICS API
// ==========================================

export const getStudentDashboardStats = async () => {
  const response = await fetch(`${API_URL}/student/dashboard`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};
