import { useState } from "react";
import logo from "../assets/Bookyolo-logo.jpg";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Admin login failed");
      
      // Store admin token separately
      localStorage.setItem("admin_token", json.token);
      localStorage.setItem("admin_user", JSON.stringify(json.user));
      
      // Navigate to admin dashboard
      navigate("/admin/dashboard");
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-accent rounded-2xl blur-2xl opacity-30" />
        <div className="relative bg-white rounded-2xl shadow-2xl ring-1 border-accent p-6 sm:p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center justify-center mb-3 mx-auto hover:opacity-80 transition-opacity"
            >
              <img 
                src={logo} 
                alt="BookYolo" 
                className="h-12 w-auto"
              />
            </button>
            <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
            <p className="text-sm text-primary opacity-70">Sign in to access admin dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">
                Admin Email
              </label>
              <input
                className="w-full px-3 py-2.5 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-sm text-primary"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="admin@bookyolo.ai"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">
                Password
              </label>
              <input
                className="w-full px-3 py-2.5 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-sm text-primary"
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-button text-button rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In as Admin"}
            </button>
          </form>

          {/* Back to User Login */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-primary opacity-70 hover:opacity-100 font-medium cursor-pointer"
            >
              ← Back to User Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
