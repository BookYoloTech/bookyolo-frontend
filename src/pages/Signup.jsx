import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function Signup() {
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "", agreeToTerms: false
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
      
      // Redirect to login page
      window.location.href = "/login";
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-accent rounded-2xl blur-2xl opacity-30" />
        <div className="relative bg-white rounded-2xl shadow-2xl ring-1 border-accent p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-1.5 w-1.5 rounded-full bg-button" />
              <div className="h-1.5 w-1.5 rounded-full bg-button" />
              <div className="h-1.5 w-1.5 rounded-full bg-button" />
              <span className="text-lg font-bold text-primary ml-2">BookYolo</span>
            </div>
            <h2 className="text-xl font-bold text-primary">Join BookYolo</h2>
            <p className="text-sm text-primary opacity-70">Create your account to get started</p>
          </div>

          {err && <div className="mb-3 text-sm text-red-600">{err}</div>}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">Full name</label>
              <input className="w-full px-3 py-2.5 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-sm text-primary"
                name="fullName" value={form.fullName} onChange={onChange} required />
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
              <span className="text-xs text-primary">I agree to the Terms and Privacy</span>
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