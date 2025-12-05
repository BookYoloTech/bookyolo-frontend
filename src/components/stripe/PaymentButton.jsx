import { useState } from "react";
import { API_BASE } from "../../config/api";

export default function PaymentButton({ user, onPaymentSuccess, className = "" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    if (!user) {
      setError("Please log in to upgrade");
      return;
    }

    // Double-check token exists
    const token = localStorage.getItem("by_token");
    if (!token) {
      setError("Please log in to upgrade");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/stripe/create-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create checkout session");
      }

      const { checkout_url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = checkout_url;
    } catch (err) {
      setError(err.message || "Payment setup failed");
    } finally {
      setLoading(false);
    }
  };

  // Don't show upgrade button if user is already premium
  if (user?.plan === "premium" && user?.subscription_status === "active") {
    return null;
  }

  return (
    <div className={className}>
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className={`bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl ${className.includes('!w-auto') ? 'py-1.5 px-3 text-xs' : 'w-full py-3 px-6'}`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {className.includes('!w-auto') ? 'Setting up...' : 'Setting up payment...'}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <svg className={`${className.includes('!w-auto') ? 'w-3 h-3 mr-1' : 'w-5 h-5 mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            {className.includes('!w-auto') ? 'Upgrade - $20/year' : 'Upgrade to Premium - $20/year'}
          </div>
        )}
      </button>
      {!className.includes('!w-auto') && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          300 additional scans per year • Cancel anytime
        </p>
      )}
    </div>
  );
}
