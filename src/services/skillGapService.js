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

/**
 * Fetch skill gap analysis and learning roadmap for a career target role.
 * e.g. "Python Full Stack Developer", "Data Analyst", etc.
 */
export const getRoleSkillGap = async (targetRole = "Python Full Stack Developer") => {
  const encodedRole = encodeURIComponent(targetRole);
  const response = await fetch(`${API_URL}/student/skill-gap?target_role=${encodedRole}`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

/**
 * Fetch skill gap analysis and targeted learning roadmap for a specific job.
 */
export const getJobSkillGap = async (jobId) => {
  const response = await fetch(`${API_URL}/student/jobs/${jobId}/skill-gap`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};
