const getApiUrl = () => {
  // Use environment variable in both browser and server-side
  // In production, it will use the deployed backend URL
  // In development, it will fallback to localhost
  return process.env.NEXT_PUBLIC_API_URL || 'https://task-backend-2-w0d1.onrender.com';
};

export const API_URL = getApiUrl();