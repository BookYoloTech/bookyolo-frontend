import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../../config/api";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");


  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    if (!sessionId) {
      setStatus("error");
      setMessage("No session ID provided");
      return;
    }

    // Verify payment and upgrade user
    verifyPayment(sessionId);
  }, [searchParams, navigate]);

  const verifyPayment = async (sessionId) => {
    try {
      const token = localStorage.getItem("by_token");
      
      if (!token) {
        setStatus("error");
        setMessage("Session expired. Please log in again.");
        return;
      }

      
      const response = await fetch(`${API_BASE}/stripe/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ session_id: sessionId }),
      });


      if (response.ok) {
        setStatus("success");
        setMessage("Payment successful! Your premium subscription is now active.");
        
        // Redirect to account page after successful payment
        setTimeout(() => {
          navigate("/plan-status", { replace: true });
        }, 2000);
      } else {
        const errorData = await response.json();
        setStatus("error");
        setMessage(`Payment verification failed: ${errorData.detail || "Unknown error"}`);
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {status === "loading" && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
              <p className="text-gray-600">Please wait while we confirm your subscription...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Your premium subscription is now active</li>
                  <li>• You have 300 additional scans per year</li>
                  <li>• Redirecting to account page...</li>
                </ul>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Error</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/plan-status")}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Account
                </button>
                <button
                  onClick={() => navigate("/scan")}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back to Scan
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
