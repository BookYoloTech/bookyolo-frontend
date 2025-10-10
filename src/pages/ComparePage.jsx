import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/main-logo.jpg';

const API_BASE = import.meta.env.VITE_API_BASE || "https://bookyolo-backend.vercel.app";

// Comparison Selector Component
const ComparisonSelector = ({ availableScans, onCompare }) => {
  const [selectedScan1, setSelectedScan1] = useState("");
  const [selectedScan2, setSelectedScan2] = useState("");
  const [question, setQuestion] = useState("");
  const [isComparing, setIsComparing] = useState(false);

  const handleCompare = async () => {
    if (!selectedScan1 || !selectedScan2 || selectedScan1 === selectedScan2) return;
    
    setIsComparing(true);
    try {
      const scan1 = availableScans.find(s => s.id === selectedScan1);
      const scan2 = availableScans.find(s => s.id === selectedScan2);
      await onCompare(scan1, scan2, question);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Listing A</label>
          <select 
            className="w-full rounded-xl border-2 border-accent px-4 py-3 text-base text-primary focus:outline-none focus:ring-2 focus:ring-button/20 focus:border-button cursor-pointer"
            value={selectedScan1} 
            onChange={(e) => setSelectedScan1(e.target.value)}
          >
            <option value="">Select listing A</option>
            {availableScans.map((scan) => (
              <option key={scan.id} value={scan.id}>
                {scan.listing_title || scan.location || scan.listing_url.replace("https://www.airbnb.com/rooms/", "Room ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Listing B</label>
          <select 
            className="w-full rounded-xl border-2 border-accent px-4 py-3 text-base text-primary focus:outline-none focus:ring-2 focus:ring-button/20 focus:border-button cursor-pointer"
            value={selectedScan2} 
            onChange={(e) => setSelectedScan2(e.target.value)}
          >
            <option value="">Select listing B</option>
            {availableScans.map((scan) => (
              <option key={scan.id} value={scan.id}>
                {scan.listing_title || scan.location || scan.listing_url.replace("https://www.airbnb.com/rooms/", "Room ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-primary mb-2">Comparison Question (Optional)</label>
        <input
          className="w-full rounded-xl border-2 border-accent px-4 py-3 text-base text-primary focus:outline-none focus:ring-2 focus:ring-button/20 focus:border-button cursor-pointer"
          placeholder="e.g. which is better for families?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

      <button
        onClick={handleCompare}
        disabled={isComparing || !selectedScan1 || !selectedScan2 || selectedScan1 === selectedScan2}
        className="w-full rounded-xl bg-button text-button px-6 py-3 font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all"
      >
        {isComparing ? "Comparing..." : "Compare Listings"}
      </button>
    </div>
  );
};

export default function ComparePage() {
  const navigate = useNavigate();
  const [availableScans, setAvailableScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);

  useEffect(() => {
    loadAvailableScans();
  }, []);

  const loadAvailableScans = async () => {
    const token = localStorage.getItem("by_token");
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/my-scans`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableScans(data.scans || []);
      } else {
        setError('Failed to load scans');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async (scan1, scan2, question = "") => {
    const token = localStorage.getItem("by_token");
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setIsComparing(true);
      setError('');

      const response = await fetch(`${API_BASE}/chat/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scan_id_1: scan1.id,
          scan_id_2: scan2.id,
          question: question || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Comparison failed");
      }

      const data = await response.json();
      setComparisonResult({
        scan1,
        scan2,
        content: data.comparison,
        chatId: data.chat_id
      });

    } catch (e) {
      setError(e.message || "Comparison failed");
    } finally {
      setIsComparing(false);
    }
  };

  const makeUrlsClickable = (text) => {
    if (!text) return text;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-button transition-colors"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-button"></div>
          <span className="text-primary">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={logo} alt="BookYolo" className="h-8 w-auto" />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/scan')}
                className="px-4 py-2 text-primary hover:text-button transition-colors"
              >
                Scan
              </button>
              <button
                onClick={() => navigate('/plan-status')}
                className="px-4 py-2 text-primary hover:text-button transition-colors"
              >
                Account
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("by_token");
                  localStorage.removeItem("by_user");
                  navigate('/login');
                }}
                className="px-4 py-2 text-primary hover:text-button transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Compare Listings</h1>
          <p className="text-gray-600">Select two listings to compare their features and get insights</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-2xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {availableScans.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No scans available for comparison</div>
            <button
              onClick={() => navigate('/scan')}
              className="bg-button text-button px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
            >
              Scan Your First Listing
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Comparison Selector */}
            <div className="bg-white rounded-2xl border border-accent p-6">
              <h2 className="text-xl font-semibold text-primary mb-4">Select Listings to Compare</h2>
              <ComparisonSelector 
                availableScans={availableScans}
                onCompare={handleCompare}
              />
            </div>

            {/* Comparison Result */}
            {comparisonResult && (
              <div className="bg-white rounded-2xl border border-accent p-4 sm:p-6">
                {/* Listing A Information */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
                    <div className="text-primary font-medium text-sm sm:text-base" style={{ fontWeight: '600' }}>
                      Listing A: {comparisonResult.scan1.listing_title || 'Title not available'}
                    </div>
                  </div>
                  <a 
                    href={comparisonResult.scan1.listing_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline break-all text-xs sm:text-sm hover:text-button transition-colors"
                  >
                    {comparisonResult.scan1.listing_url}
                  </a>
                </div>
                
                {/* Listing B Information */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
                    <div className="text-primary font-medium text-sm sm:text-base" style={{ fontWeight: '600' }}>
                      Listing B: {comparisonResult.scan2.listing_title || 'Title not available'}
                    </div>
                  </div>
                  <a 
                    href={comparisonResult.scan2.listing_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline break-all text-xs sm:text-sm hover:text-button transition-colors"
                  >
                    {comparisonResult.scan2.listing_url}
                  </a>
                </div>
                
                {/* Comparative Analysis */}
                <div className="pt-4 border-t border-accent">
                  <h3 className="text-sm sm:text-base font-semibold text-primary mb-2 sm:mb-3">Comparative Analysis</h3>
                  <div className="text-primary leading-relaxed whitespace-pre-wrap">{makeUrlsClickable(comparisonResult.content)}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
