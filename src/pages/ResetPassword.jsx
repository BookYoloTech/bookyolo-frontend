import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import logo from "../assets/main-logo.jpg";
import { API_BASE } from "../config/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError("Invalid or missing reset token. Please request a new password reset.");
    }
  }, [token]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.password || !form.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/auth/password-reset-confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token: token,
          new_password: form.password 
        }),
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        if (res.status === 400) {
          setTokenValid(false);
          throw new Error("Invalid or expired reset token. Please request a new password reset.");
        }
        throw new Error(json.detail || "Password reset failed");
      }
      
      setSuccess(true);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-pink-600/20 to-red-600/20 rounded-2xl blur-2xl" />
          <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl ring-1 ring-gray-200/50 p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-800" />
                <div className="h-1.5 w-1.5 rounded-full bg-gray-800" />
                <div className="h-1.5 w-1.5 rounded-full bg-gray-800" />
                <span className="text-lg font-bold text-gray-900 ml-2">BookYolo</span>
              </div>
              <h2 className="text-xl font-bold text-red-600">Invalid Reset Link</h2>
              <p className="text-sm text-gray-600">This password reset link is invalid or has expired</p>
            </div>

            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                {error || "The password reset link you clicked is invalid or has expired. Please request a new password reset."}
              </p>
            </div>

            <div className="space-y-3">
              <a 
                href="/login" 
                className="block w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-center"
              >
                Back to Login
              </a>
              <p className="text-center text-sm text-gray-600">
                Need help?{" "}
                <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                  Try forgot password again
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-green-600/20 rounded-2xl blur-2xl" />
          <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl ring-1 ring-gray-200/50 p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-800" />
                <div className="h-1.5 w-1.5 rounded-full bg-gray-800" />
                <div className="h-1.5 w-1.5 rounded-full bg-gray-800" />
                <span className="text-lg font-bold text-gray-900 ml-2">BookYolo</span>
              </div>
              <h2 className="text-xl font-bold text-green-600">Password Reset Successful!</h2>
              <p className="text-sm text-gray-600">Your password has been updated successfully</p>
            </div>

            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
            </div>

            <a 
              href="/login" 
              className="block w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-center"
            >
              Continue to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-2xl blur-2xl" />
        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl ring-1 ring-gray-200/50 p-6 sm:p-8">
          <div className="text-center mb-6">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center justify-center mb-3 mx-auto hover:opacity-80 transition-opacity"
            >
              <img 
                src={logo} 
                alt="BookYolo" 
                className="h-10 w-auto"
              />
            </button>
            <h2 className="text-xl font-bold text-gray-900">Reset your password</h2>
            <p className="text-sm text-gray-600">Enter your new password below</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input 
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                type="password" 
                name="password" 
                value={form.password} 
                onChange={onChange} 
                placeholder="Enter your new password"
                required 
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <input 
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                type="password" 
                name="confirmPassword" 
                value={form.confirmPassword} 
                onChange={onChange} 
                placeholder="Confirm your new password"
                required 
              />
            </div>
            
            <button 
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? "Updating password..." : "Update password"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            Remember your password?{" "}
            <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">Back to login</a>
          </div>
        </div>
      </div>
    </div>
  );
}
