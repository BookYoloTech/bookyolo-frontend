import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const labelStyle = (label) => {
  const map = {
    "Outstanding Stay": { bg: "bg-blue-500", text: "text-white", icon: "⭐" },
    "Excellent Stay": { bg: "bg-green-500", text: "text-white", icon: "✨" },
    "Looks Legit": { bg: "bg-emerald-500", text: "text-white", icon: "✅" },
    "Probably OK": { bg: "bg-yellow-500", text: "text-white", icon: "👍" },
    "A Bit Risky": { bg: "bg-orange-500", text: "text-white", icon: "⚠️" },
    "Looks Sketchy": { bg: "bg-red-500", text: "text-white", icon: "🚩" },
    "Travel Trap": { bg: "bg-red-600", text: "text-white", icon: "🚨" },
    "Booking Nightmare": { bg: "bg-red-800", text: "text-white", icon: "💀" },
    "Insufficient Data": { bg: "bg-gray-500", text: "text-white", icon: "❓" },
  };
  return map[label] || { bg: "bg-gray-500", text: "text-white", icon: "❓" };
};

export default function ScanPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [me, setMe] = useState(null);
  const [myScans, setMyScans] = useState([]);
  const [q, setQ] = useState("");
  const [qLoading, setQLoading] = useState(false);
  const [qError, setQError] = useState("");
  const [qMessages, setQMessages] = useState([]);
  const [cA, setCA] = useState("");
  const [cB, setCB] = useState("");
  const [cQ, setCQ] = useState("");
  const [cLoading, setCLoading] = useState(false);
  const [cError, setCError] = useState("");
  const [cAnswer, setCAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const tickRef = useRef(null);

  // Check authentication and load data
  useEffect(() => {
    const token = localStorage.getItem("by_token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    // Load user data in background
    refreshMeAndScans();
  }, [navigate]);

  // Smooth progress for scan
  useEffect(() => {
    if (isScanning) {
      tickRef.current = setInterval(() => {
        setScanProgress((p) => (p < 90 ? p + 2 : 90));
      }, 120);
    }
    return () => clearInterval(tickRef.current);
  }, [isScanning]);

  const refreshMeAndScans = useCallback(async () => {
    try {
      const token = localStorage.getItem("by_token");
      if (!token) return;
      
      const [r1, r2] = await Promise.all([
        fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/my-scans`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (r1.ok) setMe(await r1.json());
      if (r2.ok) setMyScans(await r2.json());
    } catch (e) {
      // Failed to refresh user data
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleScan = async () => {
    setError("");
    setResult(null);
    setQMessages([]);
    const listing_url = url.trim();
    if (!listing_url) return;

    setIsScanning(true);
    setScanProgress(0);
    try {
      const token = localStorage.getItem("by_token");
      const res = await fetch(`${API_BASE}/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listing_url }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      
      const json = await res.json();
      setResult(json);
      setScanProgress(100);
      await refreshMeAndScans();
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanProgress(0), 800);
    }
  };

  const ask = async () => {
    setQError("");
    const text = q.trim();
    if (!text) return;

    setQMessages((m) => [...m, { role: "user", text }]);
    setQ("");
    setQLoading(true);
    try {
      const token = localStorage.getItem("by_token");
      const res = await fetch(`${API_BASE}/question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const json = await res.json();
      setQMessages((m) => [...m, { role: "assistant", text: json.answer || "" }]);
      await refreshMeAndScans();
    } catch (e) {
      setQError(e.message || String(e));
    } finally {
      setQLoading(false);
    }
  };

  const doCompare = async () => {
    setCError("");
    setCAnswer("");
    setCLoading(true);
    try {
      const token = localStorage.getItem("by_token");
      const res = await fetch(`${API_BASE}/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scan_a_url: cA, scan_b_url: cB, question: cQ || null }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const json = await res.json();
      setCAnswer(json.answer || "");
      await refreshMeAndScans();
    } catch (e) {
      setCError(e.message || String(e));
    } finally {
      setCLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-accent sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                <div className="h-2 w-2 rounded-full bg-button" />
                <div className="h-2 w-2 rounded-full bg-button" />
                <div className="h-2 w-2 rounded-full bg-button" />
              </button>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-primary">Book</span>
                <span className="text-xl font-bold text-primary">Yolo</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-button"></div>
                  <span className="text-sm text-primary">Loading...</span>
                </div>
              ) : (
                <>
                  {typeof me?.remaining === "number" && (
                    <div className="hidden sm:flex items-center space-x-2 bg-accent rounded-full px-3 py-1">
                      <div className="w-2 h-2 bg-button rounded-full"></div>
                      <span className="text-sm text-primary">
                        <span className="font-semibold">{me.remaining}</span> scans left
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      localStorage.removeItem("by_token");
                      navigate("/");
                    }}
                    className="px-4 py-2 bg-button text-button font-medium rounded-lg hover:opacity-90 shadow-sm transition-opacity"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              AI-Powered Airbnb Analysis
            </h1>
            <p className="text-xl text-primary max-w-2xl mx-auto">
              Get instant insights into any Airbnb listing. Our AI analyzes reviews, amenities, and more to help you book with confidence.
            </p>
          </div>

          {/* Scan Input Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-accent p-8 mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-primary mb-2">
                  Airbnb Listing URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.airbnb.com/rooms/12345678"
                  className="w-full rounded-xl border-2 border-accent px-4 py-4 text-base text-primary focus:outline-none focus:ring-4 focus:ring-button/20 focus:border-button transition-all"
                />
              </div>
              <button
                onClick={handleScan}
                disabled={isScanning || !url.trim()}
                className="rounded-xl bg-button text-button px-8 py-4 font-semibold shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {isScanning ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Scanning...</span>
                  </div>
                ) : (
                  "🔍 Scan Now"
                )}
              </button>
            </div>

            {isScanning && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-primary mb-2">
                  <span>Analyzing listing...</span>
                  <span>{scanProgress}%</span>
                </div>
                <div className="w-full bg-accent h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-button transition-all duration-300 ease-out" 
                    style={{ width: `${scanProgress}%` }} 
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">⚠️</span>
                  <span className="font-medium">Error:</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Recent Scans */}
            {myScans.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-primary mb-3">Recent scans</div>
                <div className="flex flex-wrap gap-2">
                  {myScans.slice(0, 8).map((s) => (
                    <button
                      key={s.id}
                      className="text-xs px-3 py-2 rounded-full border border-accent hover:bg-accent transition-colors text-primary"
                      title={s.listing_url}
                      onClick={() => setUrl(s.listing_url)}
                    >
                      {s.listing_url.replace("https://www.airbnb.com/rooms/", "Room ")}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          {result && (
            <div className="bg-white rounded-3xl shadow-xl border border-accent p-8 mb-8">
              {/* Result Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <a 
                    className="text-primary opacity-70 hover:opacity-100 hover:underline break-all text-sm font-medium" 
                    href={result.listing_url} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    {result.listing_url}
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{labelStyle(result.label).icon}</span>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${labelStyle(result.label).bg} ${labelStyle(result.label).text}`}>
                    {result.label}
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-accent rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-primary mb-2">Analysis Summary</h3>
                <p className="text-primary">{result.inspection_summary}</p>
              </div>

              {/* Key Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-4 border border-accent">
                  <div className="text-sm font-semibold text-primary opacity-70 uppercase tracking-wide mb-2">What to Expect</div>
                  <div className="text-primary">{result.what_to_expect || "No specific expectations noted"}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-accent">
                  <div className="text-sm font-semibold text-primary opacity-70 uppercase tracking-wide mb-2">Expectation Fit</div>
                  <div className="text-primary">{result.expectation_fit || "Standard expectations"}</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-accent">
                  <div className="text-sm font-semibold text-primary opacity-70 uppercase tracking-wide mb-2">Recent Changes</div>
                  <div className="text-primary">{result.recent_changes || "Stable"}</div>
                </div>
              </div>

              {/* Watch-outs */}
              {result.watch_outs && result.watch_outs.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                    <span className="text-red-500 mr-2">⚠️</span>
                    Watch-outs
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.watch_outs.slice(0, 6).map((w, i) => (
                      <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">{w}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inspection Categories */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-primary mb-4">Detailed Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(result.categories || []).map((c, i) => (
                    <div 
                      key={i} 
                      className={`rounded-xl border-2 p-4 transition-all ${
                        c.triggered 
                          ? "border-orange-300 bg-orange-50 shadow-md" 
                          : "border-green-200 bg-green-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-primary">{c.category}</div>
                        <div className="flex items-center space-x-2">
                          {c.triggered ? (
                            <>
                              <span className="text-orange-500">⚠️</span>
                              <span className="text-xs font-bold uppercase tracking-wide bg-orange-500 text-white rounded-full px-2 py-1">
                                Issues Found
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-green-500">✅</span>
                              <span className="text-xs font-bold uppercase tracking-wide bg-green-500 text-white rounded-full px-2 py-1">
                                All Clear
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {c.triggered && (c.signals || []).length > 0 && (
                        <div className="space-y-2">
                          {c.signals.map((s, j) => (
                            <div key={j} className="bg-white rounded-lg p-2 border border-orange-200">
                              <div className="text-xs font-semibold text-orange-800">{s.flag}</div>
                              <div className="text-sm text-gray-700">{s.note}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-up Chat */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-blue-500 mr-2">💬</span>
                  Ask Follow-up Questions
                </h3>

                {qMessages.length > 0 && (
                  <div className="mb-4 space-y-3 max-h-64 overflow-y-auto">
                    {qMessages.map((m, idx) => (
                      <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          m.role === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="text-sm">{m.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Is the noise mentioned recent or older?"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && ask()}
                  />
                  <button
                    onClick={ask}
                    disabled={qLoading || !q.trim()}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {qLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Asking...</span>
                      </div>
                    ) : (
                      "Ask"
                    )}
                  </button>
                </div>
                {qError && (
                  <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                    Error: {qError}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Compare Section */}
          {myScans.length > 1 && (
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-purple-500 mr-3">⚖️</span>
                Compare Listings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Listing</label>
                  <select 
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={cA} 
                    onChange={(e) => setCA(e.target.value)}
                  >
                    <option value="">Select first listing</option>
                    {myScans.map((s) => (
                      <option key={s.id} value={s.listing_url}>
                        {s.listing_url.replace("https://www.airbnb.com/rooms/", "Room ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Second Listing</label>
                  <select 
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={cB} 
                    onChange={(e) => setCB(e.target.value)}
                  >
                    <option value="">Select second listing</option>
                    {myScans.map((s) => (
                      <option key={s.id} value={s.listing_url}>
                        {s.listing_url.replace("https://www.airbnb.com/rooms/", "Room ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                  className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What should we compare? (e.g., quiet sleep, early check-in)"
                  value={cQ}
                  onChange={(e) => setCQ(e.target.value)}
                />
                <button
                  onClick={doCompare}
                  disabled={cLoading || !cA || !cB}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {cLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Comparing...</span>
                    </div>
                  ) : (
                    "Compare"
                  )}
                </button>
              </div>

              {cError && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  Error: {cError}
                </div>
              )}
              
              {cAnswer && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Comparison Result</h4>
                  <p className="text-gray-700">{cAnswer}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
