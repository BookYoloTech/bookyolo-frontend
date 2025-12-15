import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminStats from "../components/admin/AdminStats";
import RecentActivity from "../components/admin/RecentActivity";
import RevenueChart from "../components/admin/RevenueChart";
import { API_BASE } from "../config/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }
    
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        navigate("/admin/login");
        return;
      }

      const [statsRes, activityRes] = await Promise.all([
        fetch(`${API_BASE}/admin/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/admin/dashboard/recent-activity`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!statsRes.ok || !activityRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const statsData = await statsRes.json();
      const activityData = await activityRes.json();

      setStats(statsData);
      setRecentActivity(activityData.activities);
    } catch (e) {
      setError(e.message);
      if (e.message.includes("401") || e.message.includes("403")) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-button mx-auto"></div>
          <p className="mt-4 text-primary">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/admin/login")}
            className="px-4 py-2 bg-button text-button rounded-lg hover:opacity-90"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Header */}
      <AdminHeader onLogout={handleLogout} />
      
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar 
          currentPage="dashboard" 
          onAddUser={() => navigate("/admin/users")}
        />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Dashboard</h1>
            <p className="text-primary opacity-70">
              Welcome to your BookYolo admin dashboard. Monitor key metrics and recent activity.
            </p>
          </div>

          {/* Stats Cards */}
          {stats && <AdminStats stats={stats} />}

          {/* Charts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Revenue Overview */}
            <RevenueChart stats={stats} />
            
            {/* Recent Activity */}
            <RecentActivity 
              activities={recentActivity} 
              onViewAll={() => navigate("/admin/scans")}
            />
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-primary mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate("/admin/users")}
                className="p-6 bg-white border border-accent rounded-xl hover:border-button transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-button text-white rounded-lg flex items-center justify-center">
                    <span className="text-lg">👥</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">Add New User</h4>
                    <p className="text-sm text-primary opacity-70">Create user account</p>
                  </div>
                </div>
              </button>


              <button
                onClick={() => navigate("/admin/analytics")}
                className="p-6 bg-white border border-accent rounded-xl hover:border-button transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-button text-white rounded-lg flex items-center justify-center">
                    <span className="text-lg">📊</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">View Reports</h4>
                    <p className="text-sm text-primary opacity-70">Analytics & insights</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
