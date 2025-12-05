import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";
import { API_BASE } from "../config/api";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: "", email: "", password: "" });
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserData, setEditUserData] = useState({ fullName: "", email: "", password: "", plan: "free", email_verified: false });

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }
    
    fetchUsers();
  }, [navigate, currentPage, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "50"
      });
      
      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`${API_BASE}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.pages);
    } catch (e) {
      setError(e.message);
      if (e.message.includes("401") || e.message.includes("403")) {
        localStorage.removeItem("admin_token");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // User deleted successfully
      fetchUsers(); // Refresh the list
    } catch (e) {
      // Error deleting user
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/admin/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_BASE}/admin/users`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create user");
      }

      // User created successfully
      setShowAddUser(false);
      setNewUser({ fullName: "", email: "", password: "" });
      fetchUsers(); // Refresh the list
    } catch (e) {
      setError(e.message);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditUserData({
      fullName: user.full_name || "",
      email: user.email || "",
      password: "",
      plan: user.plan || "free",
      email_verified: user.email_verified || false
    });
    setShowEditUser(true);
    setError("");
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const updateData = {
        full_name: editUserData.fullName,
        email: editUserData.email,
        plan: editUserData.plan,
        email_verified: editUserData.email_verified
      };
      
      // Only include password if it's provided
      if (editUserData.password && editUserData.password.trim() !== "") {
        updateData.password = editUserData.password;
      }

      const response = await fetch(`${API_BASE}/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update user");
      }

      // User updated successfully
      setShowEditUser(false);
      setEditingUser(null);
      setEditUserData({ fullName: "", email: "", password: "", plan: "free", email_verified: false });
      fetchUsers(); // Refresh the list
    } catch (e) {
      setError(e.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-button mx-auto"></div>
          <p className="mt-4 text-primary">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader onLogout={handleLogout} />
      
      <div className="flex">
        <AdminSidebar 
          currentPage="users" 
          onAddUser={() => setShowAddUser(true)}
        />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">User Management</h1>
            <p className="text-primary opacity-70">
              Manage user accounts and monitor user activity.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Search and Actions */}
          <div className="bg-white rounded-xl border border-accent p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users by email or name..."
                    className="w-full px-4 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-primary"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary opacity-70 hover:opacity-100"
                  >
                    🔍
                  </button>
                </div>
              </form>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowAddUser(true)}
                  className="px-4 py-2 bg-button text-white rounded-lg hover:opacity-90 font-medium"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-accent overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Scans</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-accent transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-button text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {user.full_name ? user.full_name[0].toUpperCase() : "U"}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-primary">{user.full_name}</div>
                            <div className="text-sm text-primary opacity-70">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.plan === 'premium' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                        {user.scan_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary opacity-70">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            user.email_verified ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm text-primary">
                            {user.email_verified ? 'Verified' : 'Unverified'}
                          </span>
                          {user.is_admin && (
                            <span className="ml-2 px-2 py-1 text-xs bg-button text-white rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          {!user.is_admin && (
                            <button 
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-accent px-6 py-3 flex items-center justify-between">
                <div className="text-sm text-primary opacity-70">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-accent rounded text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-accent rounded text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-primary mb-4">Add New User</h3>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">Full Name</label>
                <input 
                  className="w-full px-3 py-2.5 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-sm text-primary"
                  type="text" 
                  value={newUser.fullName} 
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">Email</label>
                <input 
                  className="w-full px-3 py-2.5 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-sm text-primary"
                  type="email" 
                  value={newUser.email} 
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">Password</label>
                <input 
                  className="w-full px-3 py-2.5 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-sm text-primary"
                  type="password" 
                  value={newUser.password} 
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required 
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setShowAddUser(false);
                    setNewUser({ fullName: "", email: "", password: "" });
                  }}
                  className="flex-1 py-2.5 border border-accent text-primary rounded-lg font-medium hover:bg-accent"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-button text-button rounded-lg font-semibold hover:opacity-90"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-primary mb-4">Edit User</h3>
            
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">Full Name</label>
                <input 
                  className="w-full px-3 py-2.5 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-sm text-primary"
                  type="text" 
                  value={editUserData.fullName} 
                  onChange={(e) => setEditUserData({...editUserData, fullName: e.target.value})}
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">Email</label>
                <input 
                  className="w-full px-3 py-2.5 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-sm text-primary"
                  type="email" 
                  value={editUserData.email} 
                  onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">Password (leave blank to keep current)</label>
                <input 
                  className="w-full px-3 py-2.5 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-sm text-primary"
                  type="password" 
                  value={editUserData.password} 
                  onChange={(e) => setEditUserData({...editUserData, password: e.target.value})}
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">Plan</label>
                <select
                  className="w-full px-3 py-2.5 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-sm text-primary"
                  value={editUserData.plan}
                  onChange={(e) => setEditUserData({...editUserData, plan: e.target.value})}
                  required
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editUserData.email_verified}
                    onChange={(e) => setEditUserData({...editUserData, email_verified: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-primary">Email Verified</span>
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setShowEditUser(false);
                    setEditingUser(null);
                    setEditUserData({ fullName: "", email: "", password: "", plan: "free", email_verified: false });
                  }}
                  className="flex-1 py-2.5 border border-accent text-primary rounded-lg font-medium hover:bg-accent"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-button text-button rounded-lg font-semibold hover:opacity-90"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
