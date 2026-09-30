const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

/**
 * Checks the PostgreSQL database health endpoint (/health/db).
 */
export const checkDatabaseHealth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_URL}/health/db`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "Accept": "application/json"
      }
    });

    clearTimeout(timeoutId);
    const data = await response.json().catch(() => null);

    if (data && data.database === "connected") {
      return { dbConnected: true, dbStatus: "Connected" };
    }
    return { dbConnected: false, dbStatus: "Disconnected" };
  } catch (err) {
    return { dbConnected: false, dbStatus: "Disconnected" };
  }
};

/**
 * Checks the FastAPI backend health endpoint (/health) and database health (/health/db).
 * Returns connection status and latency details.
 */
export const checkBackendHealth = async () => {
  const startTime = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_URL}/health`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "Accept": "application/json"
      }
    });

    clearTimeout(timeoutId);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    if (response.ok) {
      const data = await response.json();
      if (data && data.status === "ok") {
        // Also check DB connectivity
        const dbResult = await checkDatabaseHealth();

        return {
          connected: true,
          status: "Connected",
          dbConnected: dbResult.dbConnected,
          dbStatus: dbResult.dbStatus,
          api: "FastAPI",
          responseTime,
          data
        };
      }
    }

    return {
      connected: false,
      status: "Disconnected",
      dbConnected: false,
      dbStatus: "Disconnected",
      api: "FastAPI",
      responseTime: null,
      error: `HTTP ${response.status}`
    };
  } catch (err) {
    // Graceful error handling for backend offline
    return {
      connected: false,
      status: "Disconnected",
      dbConnected: false,
      dbStatus: "Disconnected",
      api: "FastAPI",
      responseTime: null,
      error: err.name === "AbortError" ? "Timeout" : "Network Error"
    };
  }
};
