// Centralized API configuration
// Automatically uses localhost for local development, Vercel for production
const getApiBase = () => {
  // Check if VITE_API_BASE is explicitly set
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  
  // Auto-detect: use localhost if running locally, otherwise use Vercel
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return "http://localhost:8000";
    }
  }
  
  // Default to Vercel for production
  return "https://bookyolo-backend.vercel.app";
};

export const API_BASE = getApiBase();




