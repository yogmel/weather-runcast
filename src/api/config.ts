const isDev = import.meta.env.DEV;

const API_BASE_URL = isDev
  ? "/api" // Local dev server
  : "/.netlify/functions"; // Production Netlify

export const getApiUrl = (endpoint: string, queryParams?: string) =>
  `${API_BASE_URL}/${endpoint}${queryParams !== undefined ? `?${queryParams}` : ""}`;
