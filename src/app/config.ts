const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // In browser, use environment variable or fallback to localhost
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }
  // In server-side, use environment variable or fallback to localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

export const API_URL = getApiUrl(); 