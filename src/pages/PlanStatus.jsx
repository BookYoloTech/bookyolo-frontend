import React, { useState, useEffect } from 'react';
import logo from '../assets/main-logo.jpg';
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src={logo} 
              alt="BookYolo" 
              className="h-8 w-auto"
            />
            <span className="text-sm font-medium text-gray-900">BookYolo</span>
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.user?.email || 'User'}
            </span>
            <button 
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Plan Status Header */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 ${isPremium ? 'bg-green-100' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {planIcon}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isPremium ? 'Premium Plan' : 'Free Plan'}
            </h1>
            <p className="text-gray-600">
              {isPremium ? 'You have access to all premium features' : 'Upgrade to unlock premium features'}
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Plan Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Usage Overview */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Overview</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Scans Used</span>
                    <span className="font-semibold text-gray-900">
                      {user?.used || 0} / {user?.limits?.total_limit || 50}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Remaining Scans</span>
                    <span className={`font-semibold ${(user?.remaining || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {user?.remaining || 0}
                    </span>
                  </div>
                  {isPremium && user?.subscription_expires && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Expires</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(user.subscription_expires).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Usage Progress */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Progress</h3>
                <div className="space-y-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        (user?.remaining || 0) <= 0 ? 'bg-red-500' : 
                        (user?.remaining || 0) <= 5 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, ((user?.used || 0) / (user?.limits?.total_limit || 50)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {Math.round(((user?.used || 0) / (user?.limits?.total_limit || 50)) * 100)}% of your scans used
                  </p>
                </div>
              </div>

              {/* Plan Features */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Annual Scans</span>
                    <span className="font-semibold text-gray-900">
                      {isPremium ? '350' : '50'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">AI Analysis</span>
                    <span className="text-green-600 font-semibold">✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Red Flag Detection</span>
                    <span className="text-green-600 font-semibold">✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Priority Support</span>
                    <span className={isPremium ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                      {isPremium ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-6">
              {/* Current Plan Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
                <div className="text-center">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    isPremium 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isPremium ? 'Premium' : 'Free'}
                  </div>
                  {!isPremium && (
                    <p className="text-sm text-gray-600 mt-3">
                      Upgrade to get more scans and premium features
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isPremium && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Upgrade to Premium
                  </button>
                )}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Back to Home
                </button>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Scans</span>
                    <span className="font-medium text-gray-900">{user?.used || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan Limit</span>
                    <span className="font-medium text-gray-900">{user?.limits?.total_limit || 50}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Usage</span>
                    <span className="font-medium text-gray-900">
                      {Math.round(((user?.used || 0) / (user?.limits?.total_limit || 50)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
