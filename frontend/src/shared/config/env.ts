const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;

export const API_BASE_URL = (rawApiUrl && rawApiUrl.trim() !== ''
  ? rawApiUrl.trim()
  : 'http://localhost:3000'
).replace(/\/+$/, '');
