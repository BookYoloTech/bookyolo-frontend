import { useCallback, useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import EmailVerification from "./pages/EmailVerification";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./components/dashboard";
import PaymentSuccess from "./components/stripe/PaymentSuccess";
import PaymentCancel from "./components/stripe/PaymentCancel";
import PlanStatus from "./pages/PlanStatus";

// Admin Components
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminScans from "./pages/AdminScans";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";
import AdminMissingListings from "./pages/AdminMissingListings";
import AdminManuallyAddedListings from "./pages/AdminManuallyAddedListings";

const ScanPage = lazy(() => import("./pages/ScanPage"));

import { API_BASE } from "./config/api";

export default function App() {
  // Force redeploy - backend URL updated
  const [token, setToken] = useState(localStorage.getItem("by_token") || "");
  const [me, setMe] = useState(null);
  const [meReloadKey, setMeReloadKey] = useState(0); // bump to re-fetch /me
  const [meLoading, setMeLoading] = useState(false);
  const [authFailed, setAuthFailed] = useState(false); // Track if authentication has failed

  // Debug Speed Insights
  useEffect(() => {
    console.log('SpeedInsights component mounted');
    return () => console.log('SpeedInsights component unmounted');
  }, []);

  const reloadMe = useCallback(async () => {
    const t = localStorage.getItem("by_token");
    if (!t) { setMe(null); setAuthFailed(false); return; }
    setMeLoading(true);
    setAuthFailed(false);
    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (!res.ok) {
        // If we get a 401 or 404, the user account doesn't exist or token is invalid
        if (res.status === 401 || res.status === 404) {
          localStorage.removeItem("by_token");
          localStorage.removeItem("by_user");
          setToken("");
          setMe(null);
          setAuthFailed(true);
          return;
        }
        const errorText = await res.text();
        throw new Error(errorText);
      }
      const json = await res.json();
      setMe(json);
      setAuthFailed(false);
    } catch (e) {
      // Clear token on any error to force re-authentication
      localStorage.removeItem("by_token");
      localStorage.removeItem("by_user");
      setToken("");
      setMe(null);
      setAuthFailed(true);
    } finally {
      setMeLoading(false);
    }
  }, []);

  useEffect(() => { reloadMe(); }, [reloadMe, token, meReloadKey]);

  const handleLogout = () => {
    localStorage.removeItem("by_token");
    localStorage.removeItem("by_user");
    setToken("");
    setMe(null);
    setAuthFailed(false);
  };

  const handleUsageChanged = () => setMeReloadKey(k => k + 1);

  const requireAuth = (el) => {
    const token = localStorage.getItem("by_token");
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    
    // Only redirect to login if authentication has actually failed
    if (authFailed) {
      return <Navigate to="/login" replace />;
    }
    
    return el;
  };

  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
        <Route
          path="/"
          element={
            <Homepage
              apiBase={API_BASE}
              token={token}
              me={me}
              meLoading={meLoading}
              onLogout={handleLogout}
              onUsageChanged={handleUsageChanged}
            />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/plan-status" element={requireAuth(<PlanStatus me={me} meLoading={meLoading} onUsageChanged={handleUsageChanged} />)} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/scans" element={<AdminScans />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/missing-listings" element={<AdminMissingListings />} />
        <Route path="/admin/manually-added-listings" element={<AdminManuallyAddedListings />} />
        
        <Route 
          path="/scan" 
          element={
            <Suspense fallback={
              <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-button mx-auto"></div>
                  <p className="mt-4 text-primary">Loading Scanner...</p>
                </div>
              </div>
            }>
              {requireAuth(<ScanPage me={me} meLoading={meLoading} />)}
            </Suspense>
          } 
        />
        <Route
          path="/dashboard"
          element={requireAuth(<Dashboard apiBase={API_BASE} token={token} me={me} onLogout={handleLogout} />)}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <SpeedInsights />
    </NotificationProvider>
  );
}
