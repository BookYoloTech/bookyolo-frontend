import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

const API_BASE = import.meta.env.VITE_API_BASE || "https://bookyolo-backend.vercel.app";

export default function ProfilePage({ onProfileUpdate }) {
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'edit-name', 'change-password'
  
  // Edit name states
  const [editName, setEditName] = useState({ fullName: '' });
  const [nameLoading, setNameLoading] = useState(false);
  
  // Change password states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('by_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setEditName({ fullName: userData.full_name || '' });
      } else {
        showError('Failed to load profile');
        navigate('/login');
      }
    } catch (error) {
      showError('Failed to load profile');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    if (!editName.fullName.trim()) {
      showError('Name cannot be empty');
      return;
    }

    setNameLoading(true);
    try {
      const token = localStorage.getItem('by_token');
      const response = await fetch(`${API_BASE}/profile/update-name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ full_name: editName.fullName.trim() })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        showSuccess('Name updated successfully!');
        setActiveTab('profile');
        onProfileUpdate?.(updatedUser);
      } else {
        const error = await response.json();
        showError(error.detail || 'Failed to update name');
      }
    } catch (error) {
      showError('Failed to update name');
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword) {
      showError('Please enter your current password');
      return;
    }
    
    if (!passwordForm.newPassword) {
      showError('Please enter a new password');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      showError('New password must be at least 6 characters long');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('by_token');
      const response = await fetch(`${API_BASE}/profile/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword
        })
      });

      if (response.ok) {
        showSuccess('Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setActiveTab('profile');
      } else {
        const error = await response.json();
        showError(error.detail || 'Failed to change password');
      }
    } catch (error) {
      showError('Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-button mx-auto"></div>
          <p className="mt-4 text-primary">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-button" />
                  <div className="h-2 w-2 rounded-full bg-button" />
                  <div className="h-2 w-2 rounded-full bg-button" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-primary">Book</span>
                  <span className="text-xl font-bold text-primary">Yolo</span>
                </div>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-primary">Profile</h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-primary border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-button text-button'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Overview
              </button>
              <button
                onClick={() => setActiveTab('edit-name')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'edit-name'
                    ? 'border-button text-button'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Edit Name
              </button>
              <button
                onClick={() => setActiveTab('change-password')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'change-password'
                    ? 'border-button text-button'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Change Password
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Info */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-button rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-3xl font-semibold">
                      {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold text-primary">{user?.full_name || 'User'}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                </div>

                {/* Profile Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Full Name</p>
                        <p className="text-primary">{user?.full_name || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email Address</p>
                        <p className="text-primary">{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Account Status</p>
                        <p className={`text-sm font-medium ${user?.email_verified ? 'text-green-600' : 'text-red-600'}`}>
                          {user?.email_verified ? 'Verified' : 'Not Verified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Member Since</p>
                        <p className="text-primary">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Stats</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Plan</p>
                        <p className="text-primary capitalize">{user?.plan || 'Free'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Scans Remaining</p>
                        <p className="text-primary">{user?.remaining || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total Scans Used</p>
                        <p className="text-primary">{user?.used || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Subscription Status</p>
                        <p className="text-primary capitalize">{user?.subscription_status || 'None'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'edit-name' && (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-primary">Edit Name</h3>
                  <p className="text-gray-600">Update your display name</p>
                </div>

                <form onSubmit={handleNameUpdate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editName.fullName}
                      onChange={(e) => setEditName({ fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-button focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={nameLoading}
                      className="flex-1 px-4 py-2 bg-button text-white rounded-lg hover:bg-button/90 disabled:opacity-50 transition-colors"
                    >
                      {nameLoading ? 'Updating...' : 'Update Name'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'change-password' && (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-primary">Change Password</h3>
                  <p className="text-gray-600">Enter your current password and choose a new one</p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-button focus:border-transparent"
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-button focus:border-transparent"
                      placeholder="Enter new password"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-button focus:border-transparent"
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('profile');
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="flex-1 px-4 py-2 bg-button text-white rounded-lg hover:bg-button/90 disabled:opacity-50 transition-colors"
                    >
                      {passwordLoading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
