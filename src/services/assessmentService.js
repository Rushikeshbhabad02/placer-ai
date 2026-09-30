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
// STUDENT ASSESSMENT APIs
// ==========================================

export const getStudentAssessments = async () => {
  const response = await fetch(`${API_URL}/student/assessments`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const getStudentAssessment = async (assessmentId) => {
  const response = await fetch(`${API_URL}/student/assessments/${assessmentId}`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const submitAssessment = async (assessmentId, submitData) => {
  const response = await fetch(`${API_URL}/student/assessments/${assessmentId}/submit`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(submitData)
  });
  return handleResponse(response);
};

export const getMyAssessmentResults = async () => {
  const response = await fetch(`${API_URL}/student/assessment-results`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// ==========================================
// RECRUITER ASSESSMENT APIs
// ==========================================

export const createAssessment = async (assessmentData) => {
  const response = await fetch(`${API_URL}/recruiter/assessments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(assessmentData)
  });
  return handleResponse(response);
};

export const getRecruiterAssessments = async () => {
  const response = await fetch(`${API_URL}/recruiter/assessments`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const getAssessmentResults = async (assessmentId) => {
  const response = await fetch(`${API_URL}/recruiter/assessments/${assessmentId}/results`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};
