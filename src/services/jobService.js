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

export const getStudentJobs = async ({ search, location, job_type, skills } = {}) => {
  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  if (location) queryParams.append("location", location);
  if (job_type) queryParams.append("job_type", job_type);
  if (skills) queryParams.append("skills", skills);

  const queryString = queryParams.toString();
  const url = `${API_URL}/student/jobs${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const getStudentJob = async (jobId) => {
  const response = await fetch(`${API_URL}/student/jobs/${jobId}`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const applyForJob = async (jobId) => {
  const response = await fetch(`${API_URL}/student/jobs/${jobId}/apply`, {
    method: "POST",
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};
