import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import ScanSection from './ScanSection';
import UpgradeCard from './UpgradeCard';
import ScanHistory from './ScanHistory';
import PaymentButton from '../stripe/PaymentButton';
import SubscriptionStatus from '../stripe/SubscriptionStatus';

const Dashboard = ({ apiBase, token, me, onLogout }) => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load real scan data
  useEffect(() => {
    const loadScans = async () => {
      if (!token) return;
      
      try {
        const response = await fetch(`${apiBase}/my-scans`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const scanData = await response.json();
          setScans(scanData || []);
        }
      } catch (error) {
        // Failed to load scans
      } finally {
        setLoading(false);
      }
    };

    loadScans();
  }, [apiBase, token]);

  const handleScan = (url) => {
    // This will be handled by the ScanSection component
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100 text-primary-900">
      <DashboardHeader user={me} onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <ScanSection onScan={handleScan} />
            <UpgradeCard />
            
            {/* What We Analyze Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-primary-800 mb-4">What We Analyze</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Review Authenticity",
                  "Cleanliness Reports",
                  "Maintenance Issues",
                  "Comfort & Sleep Quality",
                  "Check-in Experience",
                  "Host Reliability",
                  "Accuracy of Listing",
                  "Safety Concerns",
                  "Value for Money",
                  "Quality Trends"
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="bg-primary-100 p-1 rounded mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-primary-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/3">
            {/* Subscription Status */}
            {me && <SubscriptionStatus user={me} className="mb-6" />}
            
            {/* Payment Button */}
            {me && <PaymentButton user={me} className="mb-6" />}
            
            
            {/* Back to Home Button */}
            <div className="mb-6">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                ← Back to Home
              </button>
            </div>
            
            <ScanHistory scans={scans} loading={loading} />
            
            {/* User Stats Card */}
            {me && (
              <div className="bg-white rounded-lg shadow-md p-4 mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-primary-700">Your Usage</span>
                  <span className="text-xs text-primary-500">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-primary-600">Scans Used:</span>
                    <span className="font-semibold text-primary-800">
                      {me.used || 0} / {me.limits?.total_limit || 50}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-primary-600">Remaining:</span>
                    <span className="font-semibold text-green-600">
                      {me.remaining || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, ((me.used || 0) / (me.limits?.total_limit || 50)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;