import { useState } from "react";
import { API_BASE } from "../../config/api";

export default function TestUpgradeButton({ user, onUpgrade, className = "" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTestUpgrade = async () => {
    if (!user) {
      setError("Please log in to test upgrade");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("by_token");
      const response = await fetch(`${API_BASE}/stripe/simulate-webhook`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upgrade account");
      }

      const result = await response.json();
      
      if (onUpgrade) {
        onUpgrade();
      }
      
      // Refresh the page to show updated status
      window.location.reload();
    } catch (err) {
      setError(err.message || "Test upgrade failed");
    } finally {
      setLoading(false);
    }
  };

  // Only show in development
  if (import.meta.env.PROD) {
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
        onClick={handleTestUpgrade}
        disabled={loading}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Testing...
          </div>
        ) : (
          "🧪 Test Upgrade to Premium"
        )}
      </button>
      <p className="text-xs text-gray-500 mt-1 text-center">
        Development only - Simulates webhook
      </p>
    </div>
  );
}
