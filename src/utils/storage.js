export const safeGetItem = (key, fallback = null) => {
  try {
    const value = localStorage.getItem(key);
    if (value === null || value === undefined || value === "undefined" || value === "null") {
      return fallback;
    }
    const parsed = JSON.parse(value);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
};
