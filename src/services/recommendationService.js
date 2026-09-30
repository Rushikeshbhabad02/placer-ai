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
 * Fetch top AI-style job recommendations for the current authenticated student.
 */
export const getRecommendations = async (limit = 10) => {
  const response = await fetch(`${API_URL}/student/recommendations?limit=${limit}`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

/**
 * Fetch detailed match analysis for a specific job against current student profile.
 */
export const getJobMatch = async (jobId) => {
  const response = await fetch(`${API_URL}/student/jobs/${jobId}/match`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

/**
 * Recruiter candidate matches for a specific job.
 */
export const getRecruiterCandidateMatches = async (jobId, limit = 10) => {
  const response = await fetch(`${API_URL}/recruiter/jobs/${jobId}/candidate-matches?limit=${limit}`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};
