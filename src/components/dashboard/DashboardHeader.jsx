import React from 'react';
import logo from '../../assets/main-logo.jpg';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  const goToHome = () => {
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={goToHome}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img 
              src={logo} 
              alt="BookYolo" 
              className="h-8 w-auto"
            />
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">PROPERTY REALITY CHECK</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-primary-700">
              Plan: {user?.plan === 'premium' ? 'Premium' : 'Free'}
            </span>
            {user?.plan !== 'premium' && (
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-xs bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700"
              >
                Upgrade
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="text-primary-700 hover:text-primary-600 text-sm"
            >
              Logout
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-primary-700 hidden sm:block">
              {user?.user?.email || 'User'}
            </span>
            <button className="text-primary-700 hover:text-primary-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0012 0c0-1.003-.21-1.96-.59-2.808A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;