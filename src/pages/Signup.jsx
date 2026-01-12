import { useState, useEffect } from "react";
import { useNotification } from "../contexts/NotificationContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import logo from "../assets/Bookyolo-logo.jpg";

import { API_BASE } from "../config/api";

export default function Signup() {
  const { showSuccess, showError } = useNotification();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "", email: "", password: "", confirmPassword: "", agreeToTerms: false, agreeToPrivacy: false
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [referralCode, setReferralCode] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check for referral code in URL parameters
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref);
      console.log('Referral code detected:', ref);
    }
  }, [searchParams]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    
    // Validate both checkboxes are checked
    if (!form.agreeToTerms || !form.agreeToPrivacy) {
      setErr("Please agree to both Terms of Service and Privacy Policy to continue.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Signup failed");
      
      // Track referral if referral code exists
      if (referralCode && json.user_id) {
        try {
          console.log('Tracking referral:', { referralCode, user_email: form.email, user_id: json.user_id });
          const referralResponse = await fetch(`${API_BASE}/referral/track-signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              referral_code: referralCode,
              user_email: form.email,
              user_id: json.user_id
            }),
          });
          
          if (referralResponse.ok) {
            const referralResult = await referralResponse.json();
            console.log('Referral tracked successfully:', referralResult);
          } else {
            console.error('Referral tracking failed:', await referralResponse.text());
          }
        } catch (referralErr) {
          console.error('Failed to track referral:', referralErr);
          // Don't fail the signup if referral tracking fails
        }
      } else {
        console.log('No referral tracking - referralCode:', referralCode, 'user_id:', json.user_id);
      }
      
      // Account created successfully - redirect to email verification page
      navigate('/email-verification');
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
          <div className="text-center mb-8">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center justify-center mb-6 mx-auto hover:opacity-80 transition-opacity cursor-pointer"
            >
              <img 
                src={logo} 
                alt="BookYolo" 
                className="h-12 w-auto"
              />
            </button>
          </div>

          {err && <div className="mb-3 text-sm text-red-600">{err}</div>}
          
          {referralCode && (
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span className="text-sm text-blue-800 font-medium">You were referred by a friend! 🎉</span>
              </div>
            </div>
          )}

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
              <div className="relative">
                <input 
                  className="w-full px-3 py-2.5 pr-10 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-sm text-primary"
                  type={showPassword ? "text" : "password"}
                  name="password" 
                  value={form.password} 
                  onChange={onChange} 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary opacity-50 hover:opacity-100 focus:outline-none transition-opacity"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L3 3m3.29 3.29L3 3m0 0l3.29 3.29m13.72 0L21 21m-3.29-3.29L21 21m0 0l-3.29-3.29M21 21l-3.29-3.29" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1.5">Confirm password</label>
              <div className="relative">
                <input 
                  className="w-full px-3 py-2.5 pr-10 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-sm text-primary"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword" 
                  value={form.confirmPassword} 
                  onChange={onChange} 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary opacity-50 hover:opacity-100 focus:outline-none transition-opacity"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0L3 3m3.29 3.29L3 3m0 0l3.29 3.29m13.72 0L21 21m-3.29-3.29L21 21m0 0l-3.29-3.29M21 21l-3.29-3.29" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <input type="checkbox" name="agreeToTerms" checked={form.agreeToTerms} onChange={onChange}
                  className="h-4 w-4 text-button border-accent rounded mt-0.5" required />
                <label className="text-xs text-primary cursor-pointer">
                  I agree to the <a href="https://bookyolo.com/terms-of-services" target="_blank" rel="noopener noreferrer" className="text-primary opacity-70 hover:opacity-100 font-medium cursor-pointer">Terms of Service</a>
                </label>
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" name="agreeToPrivacy" checked={form.agreeToPrivacy} onChange={onChange}
                  className="h-4 w-4 text-button border-accent rounded mt-0.5" required />
                <label className="text-xs text-primary cursor-pointer">
                  I agree to the <a href="https://bookyolo.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary opacity-70 hover:opacity-100 font-medium cursor-pointer">Privacy Policy</a>
                </label>
              </div>
            </div>
            <button disabled={loading}
              className="w-full py-2.5 bg-button text-button rounded-lg font-semibold hover:opacity-90 cursor-pointer disabled:cursor-not-allowed">
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