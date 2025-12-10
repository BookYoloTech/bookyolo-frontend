import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function AdminSidebar({ currentPage, onAddUser }) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  const menuItems = [
    { id: "dashboard", label: "Dashboard", path: "/admin/dashboard" },
    { id: "users", label: "User Management", path: "/admin/users" },
    { id: "scans", label: "Scan Management", path: "/admin/scans" },
    { id: "missing-listings", label: "Missing Listings", path: "/admin/missing-listings" },
    { id: "manually-added-listings", label: "Manually Added Listings", path: "/admin/manually-added-listings" },
    { id: "analytics", label: "Analytics", path: "/admin/analytics" },
    { id: "settings", label: "Settings", path: "/admin/settings" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <aside className="w-64 bg-white border-r border-accent min-h-screen">
      <div className="p-3 sm:p-4">
        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-primary opacity-70 uppercase tracking-wide mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button 
              onClick={onAddUser}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm bg-accent text-primary rounded-lg hover:bg-button hover:text-white transition-colors"
            >
              <span>+</span>
              Add User
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-sm font-semibold text-primary opacity-70 uppercase tracking-wide mb-3">
            Navigation
          </h3>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? "bg-button text-white"
                    : "text-primary hover:bg-accent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>{item.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* System Status */}
        <div className="mt-8 p-3 bg-accent rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-primary">System Online</span>
          </div>
          <p className="text-xs text-primary opacity-70">
            Last updated: {currentTime.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </aside>
  );
}
