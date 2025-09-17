import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';

const API_BASE = import.meta.env.VITE_API_BASE || "https://bookyolo-backend.vercel.app";

export default function Profile({ onClose, onProfileUpdate }) {
  const { showSuccess, showError } = useNotification();
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
      const response = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setEditName({ fullName: userData.full_name || '' });
      } else {
        showError('Failed to load profile');
      }
    } catch (error) {
      showError('Failed to load profile');
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-button mx-auto"></div>
            <p className="mt-4 text-primary">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-primary">Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Info */}
              <div className="text-center">
                <div className="w-20 h-20 bg-button rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-semibold">
                    {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-primary">{user?.full_name || 'User'}</h3>
                <p className="text-gray-600">{user?.email}</p>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Full Name</p>
                      <p className="text-primary">{user?.full_name || 'Not set'}</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('edit-name')}
                      className="text-button hover:text-button/80 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-primary">{user?.email}</p>
                    </div>
                    <span className="text-xs text-gray-500">Cannot change</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Password</p>
                      <p className="text-gray-500">••••••••</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('change-password')}
                      className="text-button hover:text-button/80 text-sm font-medium"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Account Status</p>
                    <p className={`text-sm ${user?.email_verified ? 'text-green-600' : 'text-red-600'}`}>
                      {user?.email_verified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'edit-name' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-primary">Edit Name</h3>
                <p className="text-gray-600">Update your display name</p>
              </div>

              <form onSubmit={handleNameUpdate} className="space-y-4">
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
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-primary">Change Password</h3>
                <p className="text-gray-600">Enter your current password and choose a new one</p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
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
  );
}
