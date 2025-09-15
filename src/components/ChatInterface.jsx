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

// Helper function to detect if input is an Airbnb URL
const isAirbnbUrl = (text) => {
  return text.includes('airbnb.com/rooms/') || text.includes('airbnb.') && text.includes('rooms');
};

// Helper function to detect compare request
const isCompareRequest = (text) => {
  return text.toLowerCase().includes('compare') && isAirbnbUrl(text);
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
  const [myScans, setMyScans] = useState([]);
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
      
      const [r1, r2, r3] = await Promise.all([
        fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/my-scans`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/chats`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      
      if (r1.ok) setMe(await r1.json());
      if (r2.ok) setMyScans(await r2.json());
      if (r3.ok) setChats(await r3.json());
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
        setMessages(data.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at
        })));
        
        // If it's a scan chat, load the scan data
        if (data.chat.type === 'scan' && data.chat.scan_id) {
          // Get scan data from myScans or fetch it
          const scanData = myScans.find(s => s.id === data.chat.scan_id);
          if (scanData) {
            setCurrentScan(scanData);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load chat:", e);
    }
  };

  const handleScan = async (url) => {
    setError("");
    setIsLoading(true);
    setScanProgress(0);
    
    // Add user message
    const userMessage = { role: "user", content: `Scan ${url}` };
    setMessages(prev => [...prev, userMessage]);

    try {
      const token = localStorage.getItem("by_token");
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
      
      await loadUserData(); // Refresh data
    } catch (e) {
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
    // Extract URLs from compare request
    const urls = text.match(/https?:\/\/[^\s]+/g) || [];
    if (urls.length < 2) {
      setError("Please provide two Airbnb URLs to compare.");
      return;
    }

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

  const renderMessage = (message, index) => {
    const isUser = message.role === "user";
    const isError = message.isError;
    
    return (
      <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-3xl px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : isError
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-gray-100 text-gray-900'
        }`}>
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          
          {/* Render scan data if present */}
          {message.scanData && (
            <div className="mt-4 p-4 bg-white/10 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{labelStyle(message.scanData.label).icon}</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${labelStyle(message.scanData.label).bg} ${labelStyle(message.scanData.label).text}`}>
                  {message.scanData.label}
                </span>
              </div>
              <div className="text-sm opacity-90">
                <a 
                  href={message.scanData.listing_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:underline break-all"
                >
                  {message.scanData.listing_url}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="text-gray-600">Loading...</span>
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
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-gray-900">Book</span>
                <span className="text-xl font-bold text-gray-900">Yolo</span>
              </div>
            </button>
            
            <div className="flex items-center space-x-4">
              {typeof me?.remaining === "number" && (
                <div className="hidden sm:flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold">{me.remaining}</span> scans left
                  </span>
                </div>
              )}
              
              <button
                onClick={startNewChat}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                New Chat
              </button>
              
              <button
                onClick={() => {
                  localStorage.removeItem("by_token");
                  navigate("/");
                }}
                className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:opacity-90 shadow-sm transition-opacity"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Chats</h3>
            <div className="space-y-2">
              {chats.slice(0, 10).map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => loadChat(chat.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentChatId === chat.id 
                      ? 'bg-blue-100 border border-blue-200' 
                      : 'bg-white hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {chat.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(chat.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {myScans.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Scans</h3>
              <div className="space-y-1">
                {myScans.slice(0, 8).map((scan) => (
                  <button
                    key={scan.id}
                    className="w-full text-left text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 transition-colors text-gray-600"
                    title={scan.listing_url}
                    onClick={() => setInput(scan.listing_url)}
                  >
                    {scan.listing_url.replace("https://www.airbnb.com/rooms/", "Room ")}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="max-w-md">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Welcome to BookYolo Chat
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Paste an Airbnb URL to scan, ask questions about listings, or compare properties - all in one conversation!
                  </p>
                  <div className="text-sm text-gray-500 space-y-2">
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
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Analyzing listing...</span>
                  <span>{scanProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300 ease-out" 
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
          <div className="border-t border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste an Airbnb URL to scan, ask a question, or request a comparison..."
                  className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="rounded-xl bg-blue-500 text-white px-6 py-3 font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
