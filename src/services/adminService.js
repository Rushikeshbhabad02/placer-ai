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
// ADMIN PROFILE APIs
// ==========================================

export const getAdminProfile = async () => {
  const response = await fetch(`${API_URL}/admin/profile`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const updateAdminProfile = async (profileData) => {
  const response = await fetch(`${API_URL}/admin/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });
  return handleResponse(response);
};

// ==========================================
// ADMIN DASHBOARD STATS API
// ==========================================

export const getAdminDashboard = async () => {
  const response = await fetch(`${API_URL}/admin/dashboard`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// ==========================================
// USER MANAGEMENT APIs
// ==========================================

export const getUsers = async ({ role, is_active, search } = {}) => {
  const queryParams = new URLSearchParams();
  if (role) queryParams.append("role", role);
  if (is_active !== undefined && is_active !== null) queryParams.append("is_active", is_active);
  if (search) queryParams.append("search", search);

  const queryString = queryParams.toString();
  const url = `${API_URL}/admin/users${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const getUser = async (userId) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const updateUserStatus = async (userId, isActive) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ is_active: isActive })
  });
  return handleResponse(response);
};

// ==========================================
// STUDENT MANAGEMENT APIs
// ==========================================

export const getStudents = async () => {
  const response = await fetch(`${API_URL}/admin/students`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const getStudent = async (studentId) => {
  const response = await fetch(`${API_URL}/admin/students/${studentId}`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// ==========================================
// RECRUITER MANAGEMENT APIs
// ==========================================

export const getRecruiters = async () => {
  const response = await fetch(`${API_URL}/admin/recruiters`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const getRecruiter = async (recruiterId) => {
  const response = await fetch(`${API_URL}/admin/recruiters/${recruiterId}`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

// ==========================================
// MENTOR MANAGEMENT APIs
// ==========================================

export const getMentors = async () => {
  const response = await fetch(`${API_URL}/admin/mentors`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const getMentor = async (mentorId) => {
  const response = await fetch(`${API_URL}/admin/mentors/${mentorId}`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};
