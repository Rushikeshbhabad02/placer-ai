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
// MENTOR PROFILE APIs
// ==========================================

export const getMentorProfile = async () => {
  const response = await fetch(`${API_URL}/mentor/profile`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const updateMentorProfile = async (profileData) => {
  const response = await fetch(`${API_URL}/mentor/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });
  return handleResponse(response);
};

// ==========================================
// MENTOR DASHBOARD STATS API
// ==========================================

export const getMentorDashboardStats = async () => {
  const response = await fetch(`${API_URL}/mentor/dashboard`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// ==========================================
// MENTOR APPROVALS APIs
// ==========================================

export const getMentorApprovals = async () => {
  const response = await fetch(`${API_URL}/mentor/approvals`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const getMentorApproval = async (approvalId) => {
  const response = await fetch(`${API_URL}/mentor/approvals/${approvalId}`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const approveStudent = async (approvalId, comments = "") => {
  const response = await fetch(`${API_URL}/mentor/approvals/${approvalId}/approve`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ comments })
  });
  return handleResponse(response);
};

export const rejectStudent = async (approvalId, comments = "") => {
  const response = await fetch(`${API_URL}/mentor/approvals/${approvalId}/reject`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ comments })
  });
  return handleResponse(response);
};
