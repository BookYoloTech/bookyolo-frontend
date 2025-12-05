import React, { useState, useEffect } from 'react';
import logo from '../assets/main-logo.jpg';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from "../config/api";

export default function PlanStatus({ me, meLoading, onUsageChanged }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');
  
  // Edit Profile states
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [editProfileError, setEditProfileError] = useState('');
  const [editProfileSuccess, setEditProfileSuccess] = useState('');
  
  // Delete Account states
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // Referral states
  const [referralStats, setReferralStats] = useState(null);
  const [referralLoading, setReferralLoading] = useState(false);

  useEffect(() => {
    const initialLoadUserData = async () => {
      const token = localStorage.getItem("by_token");
      if (!token) {
        navigate('/login');
        return;
      }

      // Use passed me prop if available, otherwise fetch
      if (me && !meLoading) {
        // Structure the data to match what the UI expects
        const structuredUser = {
          user: {
            ...me.user,
            remaining: me.remaining,
            used: me.used,
            subscription_status: me.subscription_status,
            subscription_expires: me.subscription_expires
          }
        };
        setUser(structuredUser);
        setLoading(false);
        
        // Only check referral stats for non-premium users (no artificial delay)
        if (me.plan !== 'premium' && me.user?.id) {
          // Double-check by calling referral stats (this also triggers auto-grant)
          // This ensures premium is granted even if /me didn't catch it
          try {
            const statsResponse = await fetch(`${API_BASE}/referral/stats/${me.user.id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            
            if (statsResponse.ok) {
              const stats = await statsResponse.json();
              
              // If premium was granted, refresh user data immediately (no delay)
              if (stats.has_premium && stats.plan === 'premium') {
                console.log('Premium granted via referral stats! Refreshing user data...');
                const refreshResponse = await fetch(`${API_BASE}/me`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                
                if (refreshResponse.ok) {
                  const refreshedData = await refreshResponse.json();
                  const refreshedUser = {
                    user: {
                      ...refreshedData.user,
                      remaining: refreshedData.remaining,
                      used: refreshedData.used,
                      subscription_status: refreshedData.subscription_status,
                      subscription_expires: refreshedData.subscription_expires
                    }
                  };
                  setUser(refreshedUser);
                  // Notify parent to refresh
                  if (onUsageChanged) onUsageChanged();
                }
              }
            }
          } catch (err) {
            console.error('Error checking referral stats:', err);
          }
        }
        return;
      }

      // Fallback: fetch if me prop not available
      try {
        const response = await fetch(`${API_BASE}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          // Structure the data to match what the UI expects
          const structuredUser = {
            user: {
              ...userData.user,
              remaining: userData.remaining,
              used: userData.used,
              subscription_status: userData.subscription_status,
              subscription_expires: userData.subscription_expires
            }
          };
          setUser(structuredUser);
          
          // Only check referral stats for non-premium users
          if (userData.plan !== 'premium' && userData.user?.id) {
            try {
              const statsResponse = await fetch(`${API_BASE}/referral/stats/${userData.user.id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              
              if (statsResponse.ok) {
                const stats = await statsResponse.json();
                
                // If premium was granted, refresh user data immediately (no delay)
                if (stats.has_premium && stats.plan === 'premium') {
                  console.log('Premium granted via referral stats! Refreshing user data...');
                    const refreshResponse = await fetch(`${API_BASE}/me`, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    });
                    
                    if (refreshResponse.ok) {
                      const refreshedData = await refreshResponse.json();
                      const refreshedUser = {
                        user: {
                          ...refreshedData.user,
                          remaining: refreshedData.remaining,
                          used: refreshedData.used,
                          subscription_status: refreshedData.subscription_status,
                          subscription_expires: refreshedData.subscription_expires
                        }
                      };
                      setUser(refreshedUser);
                    }
                }
              }
            } catch (err) {
              console.error('Error checking referral stats:', err);
            }
          }
        } else {
          setError('Failed to load user data');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    initialLoadUserData();
  }, [navigate, me, meLoading, onUsageChanged]);

  const handleLogout = () => {
    localStorage.removeItem("by_token");
    localStorage.removeItem("by_user");
    navigate('/login');
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/signup?ref=${user?.user?.id || 'user'}`;
    navigator.clipboard.writeText(referralLink).then(() => {
      alert('Referral link copied to clipboard!');
    });
  };

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
        // Structure the data to match what the UI expects
        const structuredUser = {
          user: {
            ...userData.user,
            remaining: userData.remaining,
            used: userData.used,
            subscription_status: userData.subscription_status,
            subscription_expires: userData.subscription_expires
          }
        };
        setUser(structuredUser);
        console.log('User data refreshed:', structuredUser);
      } else {
        setError('Failed to load user data');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const loadReferralStats = async () => {
    if (!user?.user?.id) return;
    
    setReferralLoading(true);
    try {
      const token = localStorage.getItem("by_token");
      console.log('Loading referral stats for user:', user.user.id);
      
      const response = await fetch(`${API_BASE}/referral/stats/${user.user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const stats = await response.json();
        console.log('Referral stats loaded:', stats);
        setReferralStats(stats);
        
        // If premium was just granted, refresh user data
        if (stats.has_premium && stats.plan === 'premium') {
          console.log('Premium granted! Refreshing user data...');
          await loadUserData();
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to load referral stats:', response.status, errorText);
      }
    } catch (err) {
      console.error('Error loading referral stats:', err);
    } finally {
      setReferralLoading(false);
    }
  };


  const handleReferralModalOpen = () => {
    setShowReferralModal(true);
    loadReferralStats();
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText('help@bookyolo.com');
    alert('Email address copied to clipboard!');
  };

  const handleCancelSubscription = async () => {
    if (!user) {
      setCancelError("Please log in to cancel subscription");
      return;
    }

    // Confirm cancellation
    const confirmed = window.confirm(
      "Are you sure you want to cancel your subscription? " +
      "Your premium access will continue until the end of your current billing period, " +
      "but your subscription will not renew automatically."
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("by_token");
    if (!token) {
      setCancelError("Please log in to cancel subscription");
      return;
    }

    setCancelLoading(true);
    setCancelError('');
    setCancelSuccess('');

    try {
      const response = await fetch(`${API_BASE}/stripe/cancel-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to cancel subscription");
      }

      const data = await response.json();
      setCancelSuccess(data.message || "Subscription cancellation scheduled successfully");
      
      // Refresh user data to reflect the cancellation
      const userResponse = await fetch(`${API_BASE}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }
    } catch (err) {
      console.error("Error canceling subscription:", err);
      setCancelError(err.message || "Failed to cancel subscription. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user) {
      setUpgradeError("Please log in to upgrade");
      return;
    }

    const token = localStorage.getItem("by_token");
    if (!token) {
      setUpgradeError("Please log in to upgrade");
      return;
    }

    setUpgradeLoading(true);
    setUpgradeError('');

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
      setUpgradeError(err.message || "Payment setup failed");
    } finally {
      setUpgradeLoading(false);
    }
  };


  const handleUpdateProfile = async (formData) => {
    const token = localStorage.getItem("by_token");
    if (!token) {
      setEditProfileError("Please log in to update your profile");
      return;
    }

    setEditProfileLoading(true);
    setEditProfileError('');
    setEditProfileSuccess('');

    try {
      const response = await fetch(`${API_BASE}/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }

      const data = await response.json();
      
      // Refresh user data to get updated scan balance
      const meResponse = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (meResponse.ok) {
        const userData = await meResponse.json();
        console.log("DEBUG: Profile update - data.user:", data.user);
        console.log("DEBUG: Profile update - userData from /me:", userData);
        
        // Update both the user data and scan balance correctly
        // The /me endpoint returns { user: {...}, remaining: 271, used: 79 }
        const updatedUser = {
          ...data.user,  // Keep the updated profile data
          remaining: userData.remaining,  // Update scan balance from /me
          used: userData.used  // Update used scans from /me
        };
        
        console.log("DEBUG: Setting user state with:", updatedUser);
        setUser({ user: updatedUser });
        
        console.log("DEBUG: Profile update - final user state:", { 
          user: {
            ...data.user,
            remaining: userData.remaining,
            used: userData.used
          }
        });
      } else {
        // Fallback: Update the user state with the correct structure
        setUser({
          user: data.user
        });
      }
      
      setEditProfileSuccess("Profile updated successfully!");
      setShowEditProfile(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setEditProfileSuccess(''), 3000);
    } catch (err) {
      setEditProfileError(err.message || "Failed to update profile");
    } finally {
      setEditProfileLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteAccountError("Please type 'DELETE' to confirm");
      return;
    }

    const token = localStorage.getItem("by_token");
    if (!token) {
      setDeleteAccountError("Please log in to delete your account");
      return;
    }

    setDeleteAccountLoading(true);
    setDeleteAccountError('');

    try {
      const response = await fetch(`${API_BASE}/delete-account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ confirm_text: deleteConfirmText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete account");
      }

      // Account deleted successfully, redirect to login
      localStorage.removeItem("by_token");
      localStorage.removeItem("by_user");
      navigate('/login');
    } catch (err) {
      setDeleteAccountError(err.message || "Failed to delete account");
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your account...</p>
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
              className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isPremium = user?.user?.plan === 'premium';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate('/scan')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
            <button 
              onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Logout
            </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Account Header */}
            <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">
                {user?.user?.full_name ? user.user.full_name.charAt(0).toUpperCase() : 'U'}
              </span>
              </div>
            {user?.user?.full_name && (
              <p className="text-lg font-bold text-gray-800 mt-2">{user.user.full_name}</p>
            )}
            {user?.user?.email && (
              <p className="text-sm text-gray-600 mt-1">{user.user.email}</p>
            )}
            </div>

          {/* Current Plan & Scan Balance */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan & Usage</h2>
            <div className="space-y-4">
                  <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isPremium 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {isPremium ? 'BookYolo Premium' : 'BookYolo Free'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                <span className="text-gray-600">Remaining Scans</span>
                <span className={`font-semibold ${(user?.user?.remaining || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {user?.user?.remaining || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Scans Used</span>
                <span className="font-semibold text-gray-900">{user?.user?.used || 0}</span>
                  </div>
                  {isPremium && user?.user?.subscription_expires && (
                    <div className="flex justify-between items-center">
                  <span className="text-gray-600">Expires on</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(user.user.subscription_expires).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Upgrade Error */}
            {upgradeError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {upgradeError}
              </div>
            )}

            {/* Cancel Subscription Error/Success */}
            {cancelError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {cancelError}
              </div>
            )}
            {cancelSuccess && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                {cancelSuccess}
              </div>
            )}

            {/* Upgrade/Downgrade Button */}
            {!isPremium ? (
              <button
                onClick={handleUpgrade}
                disabled={upgradeLoading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold flex flex-col items-center justify-center gap-1 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {upgradeLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Setting up payment...
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      Upgrade to BookYolo Premium
                    </div>
                    <div className="text-sm font-normal opacity-90">
                      300 extra scans per year for $20/year
                </div>
                  </>
                )}
              </button>
            ) : null}

            {/* Cancel Subscription Button - Only show for paid premium users */}
            {isPremium && user?.user?.subscription_id && (
              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading || user?.user?.subscription_status === 'cancel_at_period_end'}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {cancelLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Canceling subscription...
                  </>
                ) : user?.user?.subscription_status === 'cancel_at_period_end' ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Subscription Canceled (Active Until Expiry)
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Subscription
                  </>
                )}
              </button>
            )}

            {/* Referral Link - Only show for non-premium users */}
            {!isPremium && (
              <button
                onClick={handleReferralModalOpen}
                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share with 3 Friends and Get BookYolo Premium for Free
              </button>
            )}

            {/* Edit Profile */}
            <button
              onClick={() => setShowEditProfile(true)}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>

            {/* Contact Support */}
            <button
              onClick={() => setShowContactModal(true)}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
              </svg>
              Contact Support
            </button>

            {/* Delete Account */}
            <button
              onClick={() => setShowDeleteAccount(true)}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Account
            </button>
              </div>

          {/* Legal Links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a 
                href="https://bookyolo.com/terms-of-services" 
                className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>
              <a 
                href="https://bookyolo.com/privacy-policy" 
                className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
              <a 
                href="https://bookyolo.com/cookie-policy" 
                className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cookie Policy
              </a>
                  </div>
            
            {/* Disclaimer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 leading-relaxed max-w-2xl mx-auto">
                BookYolo is an Independent AI Engine that analyzes public vacation rental, hotel and hospitality listing information. We are not affiliated with, endorsed by or sponsored by any online travel agency. All trademarks remain the property of their respective owners. BookYolo does not guarantee booking outcomes. Always double-check before booking.
              </p>
                  </div>
                  </div>
                </div>
              </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 bg-opacity-90 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
            
            {/* Success Message */}
            {editProfileSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">{editProfileSuccess}</p>
              </div>
            )}
            
            {/* Error Message */}
            {editProfileError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{editProfileError}</p>
              </div>
            )}
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = {
                full_name: formData.get('full_name'),
                email: formData.get('email'),
                new_password: formData.get('new_password') || null,
                confirm_password: formData.get('confirm_password') || null,
              };
              handleUpdateProfile(data);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    defaultValue={user?.user?.full_name || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={user?.user?.email || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    name="new_password"
                    placeholder="Leave blank to keep current"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirm_password"
                    placeholder="Confirm new password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProfile(false);
                    setEditProfileError('');
                    setEditProfileSuccess('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                  <button
                  type="submit"
                  disabled={editProfileLoading}
                  className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                  {editProfileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <div className="fixed inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 bg-opacity-90 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Account</h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
            
            {/* Error Message */}
            {deleteAccountError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{deleteAccountError}</p>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type "DELETE" to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
            
            <div className="flex gap-3">
                <button
                onClick={() => {
                  setShowDeleteAccount(false);
                  setDeleteAccountError('');
                  setDeleteConfirmText('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
              >
                Cancel
                </button>
                <button
                onClick={handleDeleteAccount}
                disabled={deleteAccountLoading || deleteConfirmText !== 'DELETE'}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                {deleteAccountLoading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
      )}

      {/* Contact Support Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 bg-opacity-90 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v10a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Support</h3>
              <p className="text-gray-600">Get help from our support team</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Email us at:</p>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">help@bookyolo.com</span>
                  <button
                    onClick={copyEmailToClipboard}
                    className="text-gray-900 hover:text-gray-700 text-sm font-medium cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => window.open('https://mail.google.com/mail/?view=cm&fs=1&to=help@bookyolo.com&su=BookYolo Support Request&body=Hi BookYolo Team,%0D%0A%0D%0AI need help with:%0D%0A%0D%0A[Please describe your question or issue here]%0D%0A%0D%0AThank you!', '_blank')}
              className="w-full bg-gray-900 text-white text-center py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Open Gmail
            </button>

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full mt-3 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 bg-opacity-90 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Share BookYolo</h3>
              <p className="text-gray-600">Share with 3 friends and get BookYolo Premium for free!</p>
            </div>

            {/* Referral Stats */}
            {referralLoading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                <p className="text-gray-600 mt-2">Loading stats...</p>
              </div>
            ) : referralStats ? (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{referralStats.referral_count}</div>
                      <div className="text-sm text-gray-600">Referrals</div>
                    </div>
                  </div>
                  
                  {referralStats.has_premium ? (
                    <div className="bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-medium">
                      🎉 You have BookYolo Premium!
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      {referralStats.referrals_needed > 0 
                        ? `${referralStats.referrals_needed} more referral${referralStats.referrals_needed > 1 ? 's' : ''} needed for Premium`
                        : 'You qualify for Premium!'
                      }
                    </div>
                  )}
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (referralStats.referral_count / 3) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Progress to Premium</p>
                  </div>
                </div>
              </div>
            ) : null}
            
            <div className="space-y-4">
              {/* Referral Link */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Your referral link:</p>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 text-sm break-all">
                    {window.location.origin}/signup?ref={user?.user?.id}
                  </span>
                  <button
                    onClick={copyReferralLink}
                    className="text-gray-900 hover:text-gray-700 text-sm font-medium ml-2 flex-shrink-0 cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>

              
              {/* Social Sharing */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Share on:</p>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`https://x.com/intent/tweet?text=Hey! Just found this: BookYolo. It's an AI travel tool that uncovers all the hidden details of rentals and hotels. You get the full story before booking — no more surprises when you arrive.&url=${encodeURIComponent(`${window.location.origin}/signup?ref=${user?.user?.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/signup?ref=${user?.user?.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Hey! Just found this: BookYolo. It's an AI travel tool that uncovers all the hidden details of rentals and hotels. You get the full story before booking — no more surprises when you arrive. ${window.location.origin}/signup?ref=${user?.user?.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    WhatsApp
                  </a>
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=&su=Check out BookYolo&body=Hey! Just found this: BookYolo. It's an AI travel tool that uncovers all the hidden details of rentals and hotels. You get the full story before booking — no more surprises when you arrive. ${window.location.origin}/signup?ref=${user?.user?.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v10a2 2 0 00-2 2z" />
                    </svg>
                    Email
                  </a>
        </div>
      </div>
            </div>

            <button
              onClick={() => setShowReferralModal(false)}
              className="w-full mt-6 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
