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
// STUDENT APPLICATION APIs
// ==========================================

export const getMyApplications = async () => {
  const response = await fetch(`${API_URL}/student/applications`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const getMyApplication = async (applicationId) => {
  const response = await fetch(`${API_URL}/student/applications/${applicationId}`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const withdrawApplication = async (applicationId) => {
  const response = await fetch(`${API_URL}/student/applications/${applicationId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// ==========================================
// RECRUITER APPLICATION APIs
// ==========================================

export const getRecruiterApplications = async () => {
  const response = await fetch(`${API_URL}/recruiter/applications`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const getRecruiterApplication = async (applicationId) => {
  const response = await fetch(`${API_URL}/recruiter/applications/${applicationId}`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await fetch(`${API_URL}/recruiter/applications/${applicationId}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  return handleResponse(response);
};
