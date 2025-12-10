import { useState, useEffect } from "react";
import { API_BASE } from "../../config/api";

export default function SubscriptionStatus({ user, onStatusChange }) {
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.subscription_id) {
      fetchSubscriptionDetails();
    }
  }, [user?.subscription_id]);

  const fetchSubscriptionDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("by_token");
      const response = await fetch(`${API_BASE}/subscription/${user.subscription_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const details = await response.json();
        setSubscriptionDetails(details);
      }
    } catch (error) {
      // Failed to fetch subscription details
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50";
      case "past_due":
        return "text-yellow-600 bg-yellow-50";
      case "canceled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            user.subscription_status || "free"
          )}`}
        >
          {user.subscription_status === "active" ? "Premium Active" : 
           user.subscription_status ? user.subscription_status : "Free Plan"}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Plan:</span>
          <span className="font-medium">
            {user.plan === "premium" ? "Premium" : "Free"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Scans Used:</span>
          <span className="font-medium">
            {user.used || 0} / {user.limits?.total_limit || 50}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Remaining:</span>
          <span className="font-medium text-green-600">
            {user.remaining || 0} scans
          </span>
        </div>

        {user.subscription_expires && (
          <div className="flex justify-between">
            <span className="text-gray-600">Expires:</span>
            <span className="font-medium">
              {formatDate(user.subscription_expires)}
            </span>
          </div>
        )}

        {user.subscription_id && (
          <div className="flex justify-between">
            <span className="text-gray-600">Subscription ID:</span>
            <span className="font-mono text-xs text-gray-500">
              {user.subscription_id.substring(0, 12)}...
            </span>
          </div>
        )}
      </div>

      {user.plan === "premium" && user.subscription_status === "active" && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center text-green-600">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">
              Premium features active
            </span>
          </div>
        </div>
      )}

      {user.plan === "free" && user.remaining <= 10 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center text-orange-600">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">
              Running low on scans
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
