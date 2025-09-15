import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "https://bookyolo-backend.vercel.app";

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

// Helper function to detect if input is an Airbnb URL
const isAirbnbUrl = (text) => {
  return text.includes('airbnb.com/rooms/') || text.includes('airbnb.') && text.includes('rooms');
};

// Helper function to detect compare request
const isCompareRequest = (text) => {
  return text.toLowerCase().includes('compare') && isAirbnbUrl(text);
};

// Comparison Selector Component
const ComparisonSelector = ({ availableScans, onCompare }) => {
  const [selectedScan1, setSelectedScan1] = useState("");
  const [selectedScan2, setSelectedScan2] = useState("");
  const [question, setQuestion] = useState("");
  const [isComparing, setIsComparing] = useState(false);

  const handleCompare = async () => {
    if (!selectedScan1 || !selectedScan2) {
      return;
    }
    
    if (selectedScan1 === selectedScan2) {
      return;
    }

    setIsComparing(true);
    const scan1 = availableScans.find(s => s.id.toString() === selectedScan1);
    const scan2 = availableScans.find(s => s.id.toString() === selectedScan2);
    
    await onCompare(scan1, scan2, question);
    setIsComparing(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">First Listing</label>
          <select 
            className="w-full rounded-xl border-2 border-accent px-4 py-3 text-base text-primary focus:outline-none focus:ring-2 focus:ring-button/20 focus:border-button"
            value={selectedScan1} 
            onChange={(e) => setSelectedScan1(e.target.value)}
          >
            <option value="">Select first listing</option>
            {availableScans.map((scan) => (
              <option key={scan.id} value={scan.id}>
                {scan.listing_url.replace("https://www.airbnb.com/rooms/", "Room ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Second Listing</label>
          <select 
            className="w-full rounded-xl border-2 border-accent px-4 py-3 text-base text-primary focus:outline-none focus:ring-2 focus:ring-button/20 focus:border-button"
            value={selectedScan2} 
            onChange={(e) => setSelectedScan2(e.target.value)}
          >
            <option value="">Select second listing</option>
            {availableScans.map((scan) => (
              <option key={scan.id} value={scan.id}>
                {scan.listing_url.replace("https://www.airbnb.com/rooms/", "Room ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-primary mb-2">Comparison Question (Optional)</label>
        <input
          className="w-full rounded-xl border-2 border-accent px-4 py-3 text-base text-primary focus:outline-none focus:ring-2 focus:ring-button/20 focus:border-button"
          placeholder="e.g., Which is better for families? Which has better location?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

      <button
        onClick={handleCompare}
        disabled={isComparing || !selectedScan1 || !selectedScan2 || selectedScan1 === selectedScan2}
        className="w-full rounded-xl bg-button text-button px-6 py-3 font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isComparing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Comparing...</span>
          </div>
        ) : (
          "Compare Listings"
        )}
      </button>
    </div>
  );
};

const ChatInterface = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentScan, setCurrentScan] = useState(null);
  const [me, setMe] = useState(null);
  const [chats, setChats] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  
  const messagesEndRef = useRef(null);
  const tickRef = useRef(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check authentication and load data
  useEffect(() => {
    const token = localStorage.getItem("by_token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    loadUserData();
  }, [navigate]);

  // Smooth progress for scan
  useEffect(() => {
    if (isLoading && scanProgress > 0) {
      tickRef.current = setInterval(() => {
        setScanProgress((p) => (p < 90 ? p + 2 : 90));
      }, 120);
    }
    return () => clearInterval(tickRef.current);
  }, [isLoading, scanProgress]);

  const loadUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("by_token");
      if (!token) return;
      
      const [r1, r2] = await Promise.all([
        fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/chats`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      
      if (r1.ok) setMe(await r1.json());
      if (r2.ok) setChats(await r2.json());
    } catch (e) {
      console.error("Failed to load user data:", e);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const loadChat = async (chatId) => {
    try {
      const token = localStorage.getItem("by_token");
      const res = await fetch(`${API_BASE}/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setCurrentChatId(chatId);
        
        // If it's a scan chat, fetch the scan data
        let scanData = null;
        if (data.chat.type === 'scan' && data.chat.scan_id) {
          try {
            const scanRes = await fetch(`${API_BASE}/scan/${data.chat.scan_id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (scanRes.ok) {
              scanData = await scanRes.json();
              console.log("DEBUG: Scan data received:", scanData);
              console.log("DEBUG: Location in scan data:", scanData.location);
              setCurrentScan(scanData);
            }
          } catch (e) {
            console.error("Failed to load scan data:", e);
          }
        }
        
        // Process messages and add scan data to the first assistant message if it's a scan chat
        const processedMessages = data.messages.map((msg, index) => {
          const message = {
            role: msg.role,
            content: msg.content,
            timestamp: msg.created_at
          };
          
          // If this is the first assistant message in a scan chat, attach scan data
          if (msg.role === 'assistant' && index === 0 && scanData && data.chat.type === 'scan') {
            message.scanData = scanData;
          }
          
          return message;
        });
        
        setMessages(processedMessages);
      }
    } catch (e) {
      console.error("Failed to load chat:", e);
    }
  };

  const handleScan = async (url) => {
    setError("");
    setIsLoading(true);
    setScanProgress(0);
    
    // Validate URL
    if (!url || !url.trim()) {
      setError("Please provide a valid URL to scan.");
      setIsLoading(false);
      return;
    }

    // Add user message
    const userMessage = { role: "user", content: `Scan ${url}` };
    setMessages(prev => [...prev, userMessage]);

    try {
      const token = localStorage.getItem("by_token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      console.log("Scanning URL:", url);
      const res = await fetch(`${API_BASE}/chat/new-scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listing_url: url }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Scan failed:", res.status, errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      setCurrentChatId(data.chat_id);
      setCurrentScan(data.scan);
      setScanProgress(100);
      
      // Add assistant response with scan result
      const assistantMessage = {
        role: "assistant",
        content: `Scan ready. Label: ${data.scan.label}. ${data.scan.inspection_summary}`,
        scanData: data.scan
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Refresh user data to update scan count and chats
      await loadUserData();
    } catch (e) {
      console.error("Scan error:", e);
      setError(e.message || String(e));
      // Add error message
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Sorry, I couldn't scan that listing. ${e.message}`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setScanProgress(0), 800);
    }
  };

  const handleAsk = async (question) => {
    if (!currentChatId) {
      setError("Please scan a listing first before asking questions.");
      return;
    }

    setError("");
    setIsLoading(true);
    
    // Add user message
    const userMessage = { role: "user", content: question };
    setMessages(prev => [...prev, userMessage]);

    try {
      const token = localStorage.getItem("by_token");
      const res = await fetch(`${API_BASE}/chat/${currentChatId}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      
      // Add assistant response
      const assistantMessage = {
        role: "assistant",
        content: data.answer || "I don't have enough information to answer that question."
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      await loadUserData(); // Refresh data
    } catch (e) {
      setError(e.message || String(e));
      // Add error message
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Sorry, I couldn't answer that question. ${e.message}`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async (text) => {
    // Check if user is asking for comparison
    const isCompareRequest = text.toLowerCase().includes('compare');
    
    // Get scan chats for comparison
    const scanChats = chats.filter(chat => chat.type === 'scan');
    
    if (isCompareRequest && scanChats.length < 2) {
      setError("You need at least 2 scanned listings to compare. Please scan more listings first.");
      return;
    }

    // If it's a compare request but no specific URLs, show available scans for comparison
    if (isCompareRequest) {
      setError("");
      
      // Add user message
      const userMessage = { role: "user", content: text };
      setMessages(prev => [...prev, userMessage]);
      
      // Add assistant response with comparison options
      const assistantMessage = {
        role: "assistant",
        content: "I can help you compare your scanned listings. Here are your available scans:",
        showComparisonUI: true,
        availableScans: scanChats.slice(0, 10).map(chat => ({
          id: chat.id,
          listing_url: chat.title.replace("Scan • ", ""),
          created_at: chat.created_at
        }))
      };
      setMessages(prev => [...prev, assistantMessage]);
      return;
    }

    // If specific URLs are provided, proceed with comparison
    const urls = text.match(/https?:\/\/[^\s]+/g) || [];
    if (urls.length >= 2) {
      setError("");
      setIsLoading(true);
      
      // Add user message
      const userMessage = { role: "user", content: text };
      setMessages(prev => [...prev, userMessage]);

      try {
        const token = localStorage.getItem("by_token");
        const res = await fetch(`${API_BASE}/compare`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            scan_a_url: urls[0], 
            scan_b_url: urls[1], 
            question: text.replace(/https?:\/\/[^\s]+/g, '').trim() || null 
          }),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        
        const data = await res.json();
        
        // Add assistant response
        const assistantMessage = {
          role: "assistant",
          content: data.answer || "I couldn't compare these listings.",
          isComparison: true
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        await loadUserData(); // Refresh data
      } catch (e) {
        setError(e.message || String(e));
        // Add error message
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `Sorry, I couldn't compare those listings. ${e.message}`,
          isError: true
        }]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("Please provide two Airbnb URLs to compare, or just say 'compare' to see your available scans.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const trimmedInput = input.trim();
    setInput("");

    // Determine what type of request this is
    if (isCompareRequest(trimmedInput)) {
      await handleCompare(trimmedInput);
    } else if (isAirbnbUrl(trimmedInput)) {
      await handleScan(trimmedInput);
    } else {
      await handleAsk(trimmedInput);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setCurrentScan(null);
    setError("");
  };

  const handleComparisonSelect = async (scan1, scan2, question = "") => {
    setError("");
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("by_token");
      const res = await fetch(`${API_BASE}/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          scan_a_url: scan1.listing_url, 
          scan_b_url: scan2.listing_url, 
          question: question || null 
        }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      
      // Add assistant response
      const assistantMessage = {
        role: "assistant",
        content: data.answer || "I couldn't compare these listings.",
        isComparison: true,
        comparedScans: { scan1, scan2 }
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      await loadUserData(); // Refresh data
    } catch (e) {
      setError(e.message || String(e));
      // Add error message
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Sorry, I couldn't compare those listings. ${e.message}`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message, index) => {
    const isUser = message.role === "user";
    const isError = message.isError;
    
    return (
      <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
        <div className={`max-w-4xl w-full ${
          isUser 
            ? 'bg-button text-button rounded-2xl px-4 py-3 ml-auto max-w-3xl' 
            : isError
            ? 'bg-red-50 text-red-700 border border-red-200 rounded-2xl px-4 py-3 max-w-3xl'
            : 'bg-white'
        }`}>
          {!isUser && !isError && message.scanData ? (
            // Detailed scan result display
            <div className="bg-white rounded-2xl border border-accent p-6">
              {/* Result Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <a 
                    className="text-primary opacity-70 hover:opacity-100 hover:underline break-all text-sm" 
                    href={message.scanData.listing_url} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    {message.scanData.listing_url}
                  </a>
                  {message.scanData.location && (
                    <div className="text-primary opacity-60 text-sm mt-1">
                      📍 {message.scanData.location}
                    </div>
                  )}
                  {!message.scanData.location && (
                    <div className="text-red-500 text-xs mt-1">
                      DEBUG: No location data found
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{labelStyle(message.scanData.label).icon}</span>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${labelStyle(message.scanData.label).bg} ${labelStyle(message.scanData.label).text}`}>
                    {message.scanData.label}
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <p className="text-primary leading-relaxed">{message.scanData.inspection_summary}</p>
              </div>

                    {/* Expectations */}
                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-primary mb-3">What to Expect</h3>
                      <div className="text-primary leading-relaxed">
                        {message.scanData.what_to_expect && message.scanData.expectation_fit 
                          ? `${message.scanData.what_to_expect} ${message.scanData.expectation_fit}`
                          : message.scanData.what_to_expect || message.scanData.expectation_fit || "Standard expectations for this type of listing"
                        }
                      </div>
                      {message.scanData.recent_changes && (
                        <div className="mt-3 text-sm text-primary opacity-80">
                          <strong>Recent changes:</strong> {message.scanData.recent_changes}
                        </div>
                      )}
                    </div>

              {/* Analysis */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-primary mb-3">Analysis</h3>
                <div className="space-y-4">
                  {(message.scanData.categories || []).map((c, i) => (
                    <div 
                      key={i} 
                      className={`rounded-lg p-4 transition-all ${
                        c.triggered 
                          ? "bg-orange-50 border-l-4 border-orange-400" 
                          : "bg-green-50 border-l-4 border-green-400"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-primary">{c.category}</div>
                        <div className="flex items-center space-x-2">
                          {c.triggered ? (
                            <span className="text-orange-500 text-sm">⚠️ Issues found</span>
                          ) : (
                            <span className="text-green-500 text-sm">✅ All clear</span>
                          )}
                        </div>
                      </div>
                      {c.triggered && (c.signals || []).length > 0 && (
                        <div className="mt-3 space-y-2">
                          {c.signals.map((s, j) => (
                            <div key={j} className="text-sm text-gray-700">
                              <span className="font-medium text-orange-800">{s.flag}:</span> {s.note}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : message.showComparisonUI ? (
            // Comparison UI
            <div className="bg-white rounded-3xl shadow-xl border border-accent p-6">
              <div className="text-sm text-primary mb-4">{message.content}</div>
              <ComparisonSelector 
                availableScans={message.availableScans || []}
                onCompare={handleComparisonSelect}
              />
            </div>
          ) : (
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          )}
        </div>
      </div>
    );
  };

  if (isLoadingData) {
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
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-button" />
                <div className="h-2 w-2 rounded-full bg-button" />
                <div className="h-2 w-2 rounded-full bg-button" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-primary">Book</span>
                <span className="text-xl font-bold text-primary">Yolo</span>
              </div>
            </button>
            
            <div className="flex items-center space-x-4">
              {typeof me?.remaining === "number" && (
                <div className="hidden sm:flex items-center space-x-2 bg-accent rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-button rounded-full"></div>
                  <span className="text-sm text-primary">
                    <span className="font-semibold">{me.remaining}</span> scans left
                  </span>
                </div>
              )}
              
              <button
                onClick={startNewChat}
                className="px-4 py-2 bg-accent text-primary font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                New Chat
              </button>
              
              <button
                onClick={() => {
                  localStorage.removeItem("by_token");
                  navigate("/");
                }}
                className="px-4 py-2 bg-button text-button font-medium rounded-lg hover:opacity-90 shadow-sm transition-opacity"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 border-r border-accent bg-accent p-4 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-primary mb-3">Recent Chats</h3>
            <div className="space-y-2">
              {chats.slice(0, 10).map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => loadChat(chat.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentChatId === chat.id 
                      ? 'bg-button text-button' 
                      : 'bg-white hover:bg-white/70 border border-accent text-primary'
                  }`}
                >
                  <div className="font-medium text-sm truncate">
                    {chat.title}
                  </div>
                  <div className={`text-xs mt-1 ${currentChatId === chat.id ? 'text-button opacity-70' : 'text-primary opacity-60'}`}>
                    {new Date(chat.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="max-w-md">
                  <h2 className="text-2xl font-bold text-primary mb-4">
                    Welcome to BookYolo Chat
                  </h2>
                  <p className="text-primary opacity-70 mb-6">
                    Paste an Airbnb URL to scan, ask questions about listings, or compare properties - all in one conversation!
                  </p>
                  <div className="text-sm text-primary opacity-60 space-y-2">
                    <p><strong>Examples:</strong></p>
                    <p>• "Scan https://airbnb.com/rooms/12345"</p>
                    <p>• "Is this place good for families?"</p>
                    <p>• "Compare https://airbnb.com/rooms/123 with https://airbnb.com/rooms/456"</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Loading Progress */}
          {isLoading && scanProgress > 0 && (
            <div className="px-6 pb-2">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between text-sm text-primary mb-2">
                  <span>Analyzing listing...</span>
                  <span>{scanProgress}%</span>
                </div>
                <div className="w-full bg-accent h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-button transition-all duration-300 ease-out" 
                    style={{ width: `${scanProgress}%` }} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="px-6 pb-2">
              <div className="max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500">⚠️</span>
                    <span>{error}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="border-t border-accent p-6">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste an Airbnb URL to scan, ask a question, or request a comparison..."
                  className="flex-1 rounded-xl border-2 border-accent px-4 py-3 text-base text-primary focus:outline-none focus:ring-2 focus:ring-button/20 focus:border-button transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="rounded-xl bg-button text-button px-6 py-3 font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
