import { useState } from "react";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Login failed");
      
      localStorage.setItem("by_token", json.token);
      localStorage.setItem("by_user", JSON.stringify(json.user));
      
      // Login successful
      
      // Refresh the page to update the app state
      window.location.href = "/";
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotMessage("Please enter your email address");
      return;
    }

    setForgotLoading(true);
    setForgotMessage("");
    
    try {
      const res = await fetch(`${API_BASE}/auth/password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const json = await res.json();
      
      if (res.ok) {
        setForgotMessage("If the email exists, a password reset link has been sent. Please check your email.");
        setForgotEmail("");
      } else {
        throw new Error(json.detail || "Failed to send reset email");
      }
    } catch (e) {
      setForgotMessage(e.message || "An error occurred");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-accent rounded-2xl blur-2xl opacity-30" />
        <div className="relative bg-white backdrop-blur-sm rounded-2xl shadow-2xl ring-1 border-accent p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-1.5 w-1.5 rounded-full bg-button" />
              <div className="h-1.5 w-1.5 rounded-full bg-button" />
              <div className="h-1.5 w-1.5 rounded-full bg-button" />
              <span className="text-lg font-bold text-primary ml-2">BookYolo</span>
            </div>
            <h2 className="text-xl font-bold text-primary">Welcome back</h2>
            <p className="text-sm text-primary opacity-70">Sign in to continue</p>
          </div>

          {err && <div className="mb-3 text-sm text-red-600">{err}</div>}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">Email address</label>
              <input className="w-full px-3 py-2.5 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-sm text-primary"
                type="email" name="email" value={form.email} onChange={onChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">Password</label>
              <input className="w-full px-3 py-2.5 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-sm text-primary"
                type="password" name="password" value={form.password} onChange={onChange} required />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={onChange}
                  className="h-4 w-4 text-button border-accent rounded" />
                <span className="text-sm text-primary">Remember me</span>
              </div>
              <button 
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-primary opacity-70 hover:opacity-100 font-medium"
              >
                Forgot password?
              </button>
            </div>
            <button disabled={loading}
              className="w-full py-2.5 bg-button text-button rounded-lg font-semibold hover:opacity-90">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm space-y-2">
            <div>
              Don't have an account?{" "}
              <a href="/signup" className="text-primary opacity-70 hover:opacity-100 font-medium">Sign up</a>
            </div>
            <div>
              <a href="/admin/login" className="text-primary opacity-50 hover:opacity-70 text-xs">
                Admin Login
              </a>
            </div>
          </div>

          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold text-primary mb-2">Reset your password</h3>
                <p className="text-sm text-primary opacity-70 mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1.5">Email address</label>
                    <input 
                      className="w-full px-3 py-2.5 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-sm text-primary"
                      type="email" 
                      value={forgotEmail} 
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your email"
                      required 
                    />
                  </div>
                  
                  {forgotMessage && (
                    <div className={`text-sm p-3 rounded-lg ${
                      forgotMessage.includes('sent') 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {forgotMessage}
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotEmail("");
                        setForgotMessage("");
                      }}
                      className="flex-1 py-2.5 border border-accent text-primary rounded-lg font-medium hover:bg-accent"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-2.5 bg-button text-button rounded-lg font-semibold disabled:opacity-50 hover:opacity-90"
                    >
                      {forgotLoading ? "Sending..." : "Send reset link"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
