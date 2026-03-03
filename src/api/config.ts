const isDev = import.meta.env.DEV;

export const API_BASE_URL = isDev
  ? "http://localhost:3001/api" // Local dev server
  : "/.netlify/functions"; // Production Netlify

export const getApiUrl = (endpoint: string, queryParams?: string) =>
  `${API_BASE_URL}/${endpoint}${queryParams !== undefined ? `?${queryParams}` : ""}`;
