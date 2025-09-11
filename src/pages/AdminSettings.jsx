import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    siteName: "BookYolo",
    adminEmail: "admin@bookyolo.ai",
    systemVersion: "v17.7.9.9b",
    maintenanceMode: false,
    emailNotifications: true,
    backupSchedule: "daily"
  });

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/admin/login");
  };

  const handleSaveSettings = () => {
    // Settings saved successfully
  };

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader onLogout={handleLogout} />
      
      <div className="flex">
        <AdminSidebar 
          currentPage="settings" 
          onAddUser={() => navigate("/admin/users")}
        />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">System Settings</h1>
            <p className="text-primary opacity-70">
              Configure system settings and preferences.
            </p>
          </div>

          <div className="max-w-2xl space-y-6">
            {/* General Settings */}
            <div className="bg-white rounded-xl border border-accent p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">General Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Admin Email</label>
                  <input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">System Version</label>
                  <input
                    type="text"
                    value={settings.systemVersion}
                    disabled
                    className="w-full px-3 py-2 border border-accent rounded-lg bg-accent text-primary opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* System Controls */}
            <div className="bg-white rounded-xl border border-accent p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">System Controls</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-primary">Maintenance Mode</div>
                    <div className="text-sm text-primary opacity-70">Temporarily disable user access</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-accent peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-button/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-button"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-primary">Email Notifications</div>
                    <div className="text-sm text-primary opacity-70">Send system alerts via email</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-accent peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-button/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-button"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Backup Schedule</label>
                  <select
                    value={settings.backupSchedule}
                    onChange={(e) => setSettings({...settings, backupSchedule: e.target.value})}
                    className="w-full px-3 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-primary"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2 bg-button text-white rounded-lg hover:opacity-90 font-medium"
              >
                Save Settings
              </button>
              <button className="px-6 py-2 border border-accent text-primary rounded-lg hover:bg-accent font-medium">
                Reset to Defaults
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
