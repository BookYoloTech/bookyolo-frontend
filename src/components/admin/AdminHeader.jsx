import { useState, useEffect } from "react";
import logo from '../../assets/main-logo.jpg';

export default function AdminHeader({ onLogout }) {
  const [adminUser, setAdminUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const user = localStorage.getItem("admin_user");
    if (user) {
      setAdminUser(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-accent sticky top-0 z-50">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src={logo} 
              alt="BookYolo" 
              className="h-8 sm:h-10 w-auto"
            />
            <span className="text-xs sm:text-sm bg-button text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">Admin</span>
          </button>

          {/* Admin Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* System Status */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-primary">System Online</span>
              <span className="text-xs text-primary opacity-70">Last updated: {currentTime.toLocaleTimeString()}</span>
            </div>

            {/* Admin User Info */}
            {adminUser && (
              <div className="hidden md:flex items-center space-x-2 bg-accent rounded-full px-3 py-1">
                <div className="w-6 h-6 bg-button text-white rounded-full flex items-center justify-center text-xs font-bold">
                  A
                </div>
                <span className="text-sm text-primary font-medium">{adminUser.full_name}</span>
                <span className="text-xs text-primary opacity-70">{adminUser.email}</span>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-button text-white font-medium rounded-lg hover:opacity-90 shadow-sm transition-opacity"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
