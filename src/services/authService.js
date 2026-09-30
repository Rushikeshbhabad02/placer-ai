const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const TOKEN_KEY = "placer_token";

export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch (e) {
    return null;
  }
};

export const setStoredToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {}
};

export const removeStoredToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {}
};

/**
 * Registers a new user with FastAPI backend.
 */
export const registerUser = async ({ full_name, email, password, role = "student", phone = "" }) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        full_name,
        email,
        password,
        role,
        phone
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Registration failed");
    }
    return data;
  } catch (err) {
    throw err;
  }
};

/**
 * Logs in a user with FastAPI backend and stores JWT access token.
 */
export const loginUser = async ({ email, password }) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Invalid credentials");
    }

    if (data.access_token) {
      setStoredToken(data.access_token);
    }

    const user = {
      ...data.user,
      name: data.user.full_name || data.user.name,
      role: data.user.role
    };

    return { token: data.access_token, user };
  } catch (err) {
    throw err;
  }
};

/**
 * Fetches the currently authenticated user from FastAPI using JWT token.
 */
export const getCurrentUser = async () => {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      removeStoredToken();
      return null;
    }

    const data = await response.json();
    return {
      ...data,
      name: data.full_name || data.name,
      role: data.role
    };
  } catch (err) {
    return null;
  }
};

/**
 * Logs out user by clearing stored JWT access token.
 */
export const logoutUser = () => {
  removeStoredToken();
  try {
    localStorage.removeItem("placer_current_user");
  } catch (e) {}
};
