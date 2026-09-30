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
 * Execute natural language semantic vector search for active jobs.
 */
export const semanticSearchJobs = async (query, limit = 10) => {
  const encodedQuery = encodeURIComponent(query || "");
  const response = await fetch(`${API_URL}/student/jobs/semantic-search?q=${encodedQuery}&limit=${limit}`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

/**
 * Get direct semantic similarity score between student profile and a target job.
 */
export const getSemanticJobMatch = async (jobId) => {
  const response = await fetch(`${API_URL}/student/jobs/${jobId}/semantic-match`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

/**
 * Trigger bulk vector reindexing for all active PostgreSQL jobs (Admin only).
 */
export const triggerAdminReindex = async () => {
  const response = await fetch(`${API_URL}/admin/vector/jobs/reindex`, {
    method: "POST",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};
