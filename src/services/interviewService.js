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
// STUDENT INTERVIEW APIs
// ==========================================

export const getMyInterviews = async () => {
  const response = await fetch(`${API_URL}/student/interviews`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const getMyInterview = async (interviewId) => {
  const response = await fetch(`${API_URL}/student/interviews/${interviewId}`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// ==========================================
// RECRUITER INTERVIEW APIs
// ==========================================

export const getRecruiterInterviews = async () => {
  const response = await fetch(`${API_URL}/recruiter/interviews`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const scheduleInterview = async (applicationId, interviewData) => {
  const response = await fetch(`${API_URL}/recruiter/applications/${applicationId}/interview`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(interviewData)
  });
  return handleResponse(response);
};

export const updateInterview = async (interviewId, interviewData) => {
  const response = await fetch(`${API_URL}/recruiter/interviews/${interviewId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(interviewData)
  });
  return handleResponse(response);
};

export const cancelInterview = async (interviewId) => {
  const response = await fetch(`${API_URL}/recruiter/interviews/${interviewId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};
