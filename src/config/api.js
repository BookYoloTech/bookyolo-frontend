// Centralized API configuration
// Automatically uses localhost for local development, Vercel for production
// Updated: Complete frontend refresh - Fixed localhost detection timing issue

const getApiBase = () => {
  // Check if VITE_API_BASE is explicitly set (highest priority)
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  
  // Auto-detect: use localhost if running locally, otherwise use Vercel
  // Check window.location - this should work if window is available
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return "http://localhost:8000";
    }
  }
  
  // Default to Vercel for production
  return "https://bookyolo-backend.vercel.app";
};

// Function that always gets the current API base (re-evaluates each time)
const getCurrentApiBase = () => {
  // Always re-check window.location to handle timing issues
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return "http://localhost:8000";
    }
  }
  
  // Check env var
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  
  // Default to Vercel
  return "https://bookyolo-backend.vercel.app";
};

// Export API_BASE as a Proxy that always evaluates fresh
// This ensures it checks window.location at access time, not module load time
export const API_BASE = new Proxy({}, {
  get(target, prop) {
    // Always get fresh value
    const base = getCurrentApiBase();
    
    // Handle string conversion for template literals
    if (prop === Symbol.toPrimitive) {
      return (hint) => hint === 'number' ? NaN : base;
    }
    if (prop === 'toString' || prop === 'valueOf') {
      return () => base;
    }
    
    // Handle common string methods
    if (prop === 'includes') {
      return (str) => base.includes(str);
    }
    if (prop === 'replace') {
      return (search, replace) => base.replace(search, replace);
    }
    if (prop === 'startsWith') {
      return (str) => base.startsWith(str);
    }
    if (prop === 'endsWith') {
      return (str) => base.endsWith(str);
    }
    if (prop === 'length') {
      return base.length;
    }
    if (prop === 'charAt' || prop === 'substring' || prop === 'slice' || prop === 'indexOf') {
      return base[prop].bind(base);
    }
    
    // For any other property, get it from the string
    const strValue = String(base);
    const value = strValue[prop];
    return typeof value === 'function' ? value.bind(strValue) : value;
  }
});

// Add debug logging in development
if (typeof window !== 'undefined') {
  const logConfig = () => {
    try {
      const hostname = window.location?.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        console.log("🔍 API Configuration:");
        console.log("  - Current URL:", window.location.href);
        console.log("  - Hostname:", hostname);
        console.log("  - API_BASE:", String(API_BASE));
        console.log("  - Using:", API_BASE.includes('localhost') ? 'LOCAL (http://localhost:8000)' : 'VERCEL (https://bookyolo-backend.vercel.app)');
        
        if (!API_BASE.includes('localhost')) {
          console.error("❌ ERROR: API_BASE is pointing to Vercel but running on localhost!");
          console.error("❌ This will cause CORS errors.");
          console.error("❌ Solution: Hard refresh (Ctrl+Shift+R) or restart dev server");
        }
      }
    } catch (e) {
      // Ignore errors
    }
  };
  
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    logConfig();
  } else {
    window.addEventListener('DOMContentLoaded', logConfig);
    window.addEventListener('load', logConfig);
  }
  setTimeout(logConfig, 0);
  setTimeout(logConfig, 100);
}
