import React, { useState, useEffect } from 'react';
import logo from '../assets/Bookyolo-logo.png';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || "https://bookyolo-backend.vercel.app";

export default function PlanStatus() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      const token = localStorage.getItem("by_token");
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setError('Failed to load user data');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("by_token");
    localStorage.removeItem("by_user");
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isPremium = user?.plan === 'premium';
  const planColor = isPremium ? 'green' : 'blue';
  const planIcon = isPremium ? (
    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img 
              src={logo} 
              alt="BookYolo" 
              className="h-8 w-auto"
            />
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">AIRBNB REALITY CHECK</span>
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-primary-700">
              {user?.user?.email || 'User'}
            </span>
            <button 
              onClick={handleLogout}
              className="text-primary-700 hover:text-primary-600 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Plan Status */}
            <div className="text-center mb-8">
              <div className={`w-20 h-20 bg-${planColor}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                {planIcon}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isPremium ? 'Premium Plan' : 'Free Plan'}
              </h1>
              <p className="text-gray-600">
                {isPremium ? 'You have access to all premium features' : 'Upgrade to unlock premium features'}
              </p>
            </div>

            {/* Plan Details */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Plan Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Current Plan:</span>
                    <span className={`font-semibold ${isPremium ? 'text-green-600' : 'text-blue-600'}`}>
                      {isPremium ? 'Premium' : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Scans Used:</span>
                    <span className="font-semibold text-gray-900">
                      {user?.used || 0} / {user?.limits?.total_limit || 50}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Remaining Scans:</span>
                    <span className="font-semibold text-green-600">
                      {user?.remaining || 0}
                    </span>
                  </div>
                  {isPremium && user?.subscription_expires && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Expires:</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(user.subscription_expires).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Usage Progress Bar */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${isPremium ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ 
                      width: `${Math.min(100, ((user?.used || 0) / (user?.limits?.total_limit || 50)) * 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {Math.round(((user?.used || 0) / (user?.limits?.total_limit || 50)) * 100)}% of your scans used
                </p>
              </div>

              {/* Features Comparison */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Annual Scans</span>
                    <span className="font-semibold text-gray-900">
                      {isPremium ? '350' : '50'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">AI Analysis</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Red Flag Detection</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Priority Support</span>
                    <span className={isPremium ? 'text-green-600' : 'text-gray-400'}>
                      {isPremium ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!isPremium && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Upgrade to Premium
                  </button>
                )}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
