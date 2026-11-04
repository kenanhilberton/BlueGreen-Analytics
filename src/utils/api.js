// Backend ünvanı. Vercel-də VITE_API_URL env dəyişəni ilə dəyişmək olar.
// Env təyin edilməyibsə, mövcud Render backend istifadə olunur.
const rawBaseUrl = import.meta.env.VITE_API_URL || 'https://esg-backend-seven.vercel.app';

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');
