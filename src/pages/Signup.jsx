import { useState } from "react";
import { useNotification } from "../contexts/NotificationContext";

const API_BASE = import.meta.env.VITE_API_BASE || "https://bookyolo-backend.vercel.app";

export default function Signup() {
  const { showSuccess, showError } = useNotification();
  const [form, setForm] = useState({
    firstName: "", email: "", password: "", confirmPassword: "", agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Signup failed");
      
      // Account created successfully
      showSuccess("Account created successfully! Please check your email to verify your account.");
      
      // Clear form
      setForm({
        firstName: "", email: "", password: "", confirmPassword: "", agreeToTerms: false
      });
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-6 sm:p-8">
          <div className="text-center mb-6">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center justify-center gap-2 mb-3 mx-auto hover:opacity-80 transition-opacity"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-button" />
              <div className="h-1.5 w-1.5 rounded-full bg-button" />
              <div className="h-1.5 w-1.5 rounded-full bg-button" />
              <span className="text-lg font-bold text-primary ml-2">BookYolo</span>
            </button>
            <h2 className="text-xl font-bold text-primary">Create Your Account to Get Started</h2>
          </div>

          {err && <div className="mb-3 text-sm text-red-600">{err}</div>}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">First name</label>
              <input className="w-full px-3 py-2.5 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-sm text-primary"
                name="firstName" value={form.firstName} onChange={onChange} required />
            </div>
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
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">Confirm password</label>
              <input className="w-full px-3 py-2.5 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-sm text-primary"
                type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} required />
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" name="agreeToTerms" checked={form.agreeToTerms} onChange={onChange}
                className="h-4 w-4 text-button border-accent rounded" required />
              <span className="text-xs text-primary">
                I agree to the <a href="/terms" className="text-button hover:underline font-medium">Terms of Use</a>
              </span>
            </div>
            <button disabled={loading}
              className="w-full py-2.5 bg-button text-button rounded-lg font-semibold hover:opacity-90">
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-primary opacity-70 hover:opacity-100 font-medium">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}