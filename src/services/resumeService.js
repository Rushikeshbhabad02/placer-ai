import { getStoredToken } from "./authService";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const getAuthHeaders = (isMultipart = false) => {
  const token = getStoredToken();
  const headers = {};
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
    headers["Accept"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
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
// RESUME UPLOAD & MANAGEMENT APIs
// ==========================================

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/student/resumes/upload`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: formData
  });
  return handleResponse(response);
};

export const getResumes = async () => {
  const response = await fetch(`${API_URL}/student/resumes`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const deleteResume = async (resumeId) => {
  const response = await fetch(`${API_URL}/student/resumes/${resumeId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// ==========================================
// ATS ANALYSIS APIs
// ==========================================

export const analyzeResume = async (resumeId, jobId = null) => {
  const url = `${API_URL}/student/resumes/${resumeId}/analyze${jobId ? `?job_id=${jobId}` : ""}`;
  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(jobId ? { job_id: jobId } : {})
  });
  return handleResponse(response);
};

export const getResumeAnalysis = async (resumeId) => {
  const response = await fetch(`${API_URL}/student/resumes/${resumeId}/analysis`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};
