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
// RECRUITER PROFILE APIs
// ==========================================

export const getRecruiterProfile = async () => {
  const response = await fetch(`${API_URL}/recruiter/profile`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const updateRecruiterProfile = async (profileData) => {
  const response = await fetch(`${API_URL}/recruiter/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });
  return handleResponse(response);
};

// ==========================================
// JOB MANAGEMENT APIs
// ==========================================

export const getRecruiterJobs = async () => {
  const response = await fetch(`${API_URL}/recruiter/jobs`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const getRecruiterJob = async (jobId) => {
  const response = await fetch(`${API_URL}/recruiter/jobs/${jobId}`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const createJob = async (jobData) => {
  const response = await fetch(`${API_URL}/recruiter/jobs`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(jobData)
  });
  return handleResponse(response);
};

export const updateJob = async (jobId, jobData) => {
  const response = await fetch(`${API_URL}/recruiter/jobs/${jobId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(jobData)
  });
  return handleResponse(response);
};

export const deleteJob = async (jobId) => {
  const response = await fetch(`${API_URL}/recruiter/jobs/${jobId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// ==========================================
// DASHBOARD STATS API
// ==========================================

export const getRecruiterDashboardStats = async () => {
  const response = await fetch(`${API_URL}/recruiter/dashboard`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};
