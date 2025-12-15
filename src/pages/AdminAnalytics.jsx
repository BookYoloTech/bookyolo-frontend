import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";
import { API_BASE } from "../config/api";

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }
    
    fetchAnalytics();
  }, [navigate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");

      const response = await fetch(`${API_BASE}/admin/analytics/revenue`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data);
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
          <p className="mt-4 text-primary">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader onLogout={handleLogout} />
      
      <div className="flex">
        <AdminSidebar 
          currentPage="analytics" 
          onAddUser={() => navigate("/admin/users")}
        />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Analytics & Insights</h1>
            <p className="text-primary opacity-70">
              Detailed analytics and performance reports.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Analytics Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-accent p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary">Monthly Revenue</h3>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold">$</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">${analytics.monthly_revenue.toLocaleString()}</div>
                  <div className="text-sm text-primary opacity-70">Estimated monthly revenue</div>
                  <div className="text-sm text-primary opacity-50">Based on {analytics.premium_users} premium users</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-accent p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary">Conversion Rate</h3>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">{analytics.conversion_rate}%</div>
                  <div className="text-sm text-primary opacity-70">Free to Premium conversion</div>
                  <div className="text-sm text-primary opacity-50">{analytics.premium_users} of {analytics.total_users} users</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-accent p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary">Total Scans</h3>
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold">#</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">{analytics.total_scans.toLocaleString()}</div>
                  <div className="text-sm text-primary opacity-70">Scans processed</div>
                  <div className="text-sm text-primary opacity-50">All time total</div>
                </div>
              </div>
            </div>
          )}

          {/* Revenue and Activity Charts */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-accent p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Revenue Trend</h3>
              <div className="h-64">
                <div className="flex items-end justify-between h-48 px-4 pb-4">
                  {[12, 19, 15, 25, 22, 30, 28].map((value, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="bg-button rounded-t-lg w-8 transition-all duration-300"
                        style={{ height: `${(value / 30) * 100}%` }}
                      ></div>
                      <span className="text-xs text-primary opacity-70 mt-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-primary opacity-70 px-4">
                  <span>$0</span>
                  <span>$15k</span>
                  <span>$30k</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-accent p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">User Breakdown</h3>
              <div className="h-64">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-primary">Total Users</span>
                    <span className="text-lg font-bold text-primary">{analytics.total_users}</span>
                  </div>
                  <div className="w-full bg-accent rounded-full h-3">
                    <div className="bg-button h-3 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-primary">Free Users</span>
                    <span className="text-lg font-bold text-primary">{analytics.free_users}</span>
                  </div>
                  <div className="w-full bg-accent rounded-full h-3">
                    <div className="bg-gray-400 h-3 rounded-full" style={{ width: `${analytics.total_users > 0 ? (analytics.free_users / analytics.total_users) * 100 : 0}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-primary">Premium Users</span>
                    <span className="text-lg font-bold text-primary">{analytics.premium_users}</span>
                  </div>
                  <div className="w-full bg-accent rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: `${analytics.total_users > 0 ? (analytics.premium_users / analytics.total_users) * 100 : 0}%` }}></div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{analytics.conversion_rate}%</div>
                      <div className="text-xs text-primary opacity-70">Conversion Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{analytics.total_scans}</div>
                      <div className="text-xs text-primary opacity-70">Total Scans</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
