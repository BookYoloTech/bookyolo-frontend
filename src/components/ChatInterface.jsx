import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Bookyolo-logo.jpg";

const API_BASE = import.meta.env.VITE_API_BASE || "https://bookyolo-backend.vercel.app";

const labelStyle = (label) => {
  const map = {
    "Outstanding Stay": { bg: "bg-green-500", text: "text-white" },
    "Excellent Stay": { bg: "bg-yellow-green-500", text: "text-white" },
    "Looks Legit": { bg: "bg-yellow-green-500", text: "text-white" },
    "Probably OK": { bg: "bg-yellow-500", text: "text-white" },
    "A Bit Risky": { bg: "bg-orange-500", text: "text-white" },
    "Looks Sketchy": { bg: "bg-red-500", text: "text-white" },
    "Travel Trap": { bg: "bg-red-500", text: "text-white" },
    "Booking Nightmare": { bg: "bg-red-500", text: "text-white" },
    "Insufficient Data": { bg: "bg-gray-500", text: "text-white" },
  };
  return map[label] || { bg: "bg-gray-500", text: "text-white" };
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
                {scan.listing_title || scan.location || scan.listing_url.replace("https://www.airbnb.com/rooms/", "Room ")}
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
                {scan.listing_title || scan.location || scan.listing_url.replace("https://www.airbnb.com/rooms/", "Room ")}
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
  const [scanData, setScanData] = useState({});

  // Helper function to get scan data from current messages
  const getScanDataFromCurrentMessages = useCallback((chatId) => {
    console.log("DEBUG: getScanDataFromCurrentMessages called for chatId:", chatId);
    console.log("DEBUG: currentChatId:", currentChatId);
    console.log("DEBUG: messages length:", messages.length);
    console.log("DEBUG: messages:", messages);
    
    // If this is the current chat, look in the current messages
    if (currentChatId === chatId) {
      const scanMessage = messages.find(msg => msg.role === 'assistant' && msg.scanData);
      console.log("DEBUG: Found scanMessage:", scanMessage);
      if (scanMessage) {
        console.log("DEBUG: scanMessage.scanData:", scanMessage.scanData);
        console.log("DEBUG: listing_title:", scanMessage.scanData.listing_title);
        console.log("DEBUG: location:", scanMessage.scanData.location);
      }
      return scanMessage ? scanMessage.scanData : null;
    }
    return null;
  }, [currentChatId, messages]);

  // Helper function to load scan data for a specific chat
  const loadScanDataForChat = useCallback(async (chatId) => {
    try {
      const token = localStorage.getItem("by_token");
      if (!token) return null;
      
      // First get the chat details to find scan_id
      const chatRes = await fetch(`${API_BASE}/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        console.log("DEBUG: loadScanDataForChat - chat data:", chatData);
        
        if (chatData.chat.type === 'scan' && chatData.chat.scan_id) {
          // Now fetch the scan data
          const scanRes = await fetch(`${API_BASE}/scan/${chatData.chat.scan_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (scanRes.ok) {
            const scanData = await scanRes.json();
            console.log("DEBUG: loadScanDataForChat - scan data loaded:", scanData);
            console.log("DEBUG: loadScanDataForChat - listing_title:", scanData.listing_title);
            console.log("DEBUG: loadScanDataForChat - location:", scanData.location);
            
            // Update the scanData state
            setScanData(prev => ({
              ...prev,
              [chatId]: scanData
            }));
            
            return scanData;
          }
        }
      }
    } catch (e) {
      console.error("Failed to load scan data for chat:", e);
    }
    return null;
  }, []);

 // Store scan data for sidebar display
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
      
      if (r1.ok) {
        const userData = await r1.json();
        setMe(userData);
        
        console.log("DEBUG: User data loaded:", userData);
        console.log("DEBUG: Remaining scans:", userData.remaining);
        
        // Check for low scan balance (will be handled in UI component)
        if (userData.remaining <= 5 && userData.remaining > 0) {
          console.log("DEBUG: Low scan balance detected:", userData.remaining);
        } else {
          console.log("DEBUG: Scan balance OK. Remaining:", userData.remaining);
        }
      }
      if (r2.ok) {
        const chatsData = await r2.json();
        console.log("DEBUG: All chats loaded:", chatsData);
        console.log("DEBUG: First chat structure:", chatsData[0]);
        console.log("DEBUG: Chat fields:", chatsData[0] ? Object.keys(chatsData[0]) : "No chats");
        
        // Preserve local compare chats when updating chats from database
        setChats(prevChats => {
          const localCompareChats = prevChats.filter(chat => 
            chat.type === 'compare' && chat.id.startsWith('compare-')
          );
          return [...localCompareChats, ...chatsData];
        });
        
        // The /chats endpoint doesn't return scan_id, so we can't load scan data here
        // We'll load it when needed in the sidebar or when a chat is opened
        console.log("DEBUG: Skipping scan data loading in loadUserData - scan_id not available in /chats endpoint");
      }
    } catch (e) {
      console.error("Failed to load user data:", e);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const loadChat = async (chatId) => {
    try {
      // Close sidebar on mobile when selecting a chat
      setSidebarOpen(false);
      
      // Check if this is a local compare chat (not in database)
      const localCompareChat = chats.find(chat => chat.id === chatId && chat.type === 'compare' && chat.id.startsWith('compare-'));
      
      if (localCompareChat) {
        // Handle local compare chat
        setCurrentChatId(chatId);
        setCurrentScan(null);
        
        // Create messages for the compare chat
        const compareMessages = [
          {
            role: "user",
            content: `Compare: ${localCompareChat.scan1.listing_title || localCompareChat.scan1.location} vs ${localCompareChat.scan2.listing_title || localCompareChat.scan2.location}`,
            timestamp: localCompareChat.created_at
          },
          {
            role: "assistant",
            content: localCompareChat.result,
            timestamp: localCompareChat.created_at,
            isComparison: true,
            comparedScans: { 
              scan1: localCompareChat.scan1, 
              scan2: localCompareChat.scan2 
            }
          }
        ];
        
        setMessages(compareMessages);
        return;
      }
      
      // Handle database chats
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
            console.log("DEBUG: loadChat - fetching scan data for scan_id:", data.chat.scan_id);
            const scanRes = await fetch(`${API_BASE}/scan/${data.chat.scan_id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log("DEBUG: loadChat - scan response status:", scanRes.status);
            if (scanRes.ok) {
              scanData = await scanRes.json();
              console.log("DEBUG: loadChat - Scan data received:", scanData);
              console.log("DEBUG: loadChat - listing_title:", scanData.listing_title);
              console.log("DEBUG: loadChat - location:", scanData.location);
              console.log("DEBUG: loadChat - All keys:", Object.keys(scanData));
              setCurrentScan(scanData);
            } else {
              console.error("DEBUG: loadChat - Failed to load scan data, status:", scanRes.status);
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
          
          // Determine message type for user messages
          if (msg.role === 'user') {
            if (data.chat.type === 'scan' && index > 0) {
              // User messages after the first one in a scan chat are questions
              message.messageType = "question";
            } else if (data.chat.type === 'compare') {
              // User messages in compare chats are compare requests
              message.messageType = "compare";
            } else if (index === 0) {
              // First user message is usually a scan request
              message.messageType = "scan";
            }
          }
          
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
    
    // Low scan balance warning is now handled in the UI component
    
    // Validate URL
    if (!url || !url.trim()) {
      setError("Please provide a valid URL to scan.");
      setIsLoading(false);
      return;
    }

    // Check if this chat already has a scan
    if (currentChatId && messages.some(msg => msg.scanData)) {
      setError("This chat is dedicated to the property you just scanned. Click on New Scan to scan a new property.");
      setIsLoading(false);
      return;
    }

    // Add user message
    const userMessage = { role: "user", content: `Scan ${url}`, messageType: "scan" };
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
        const errorData = await res.json().catch(() => ({ detail: "Unknown error occurred" }));
        console.error("Scan failed:", res.status, errorData);
        
        // Handle specific error cases with custom messages
        if (res.status === 400) {
          // Non-Airbnb URL or insufficient reviews
          throw new Error(errorData.detail || "Invalid request");
        } else if (res.status === 402) {
          // Scan limit reached
          throw new Error(errorData.detail || "Scan limit reached");
        } else if (res.status === 404) {
          // Listing not found
          throw new Error(errorData.detail || "Listing not found");
        } else if (res.status === 409) {
          // Already scanned
          throw new Error(errorData.detail || "Already scanned");
        } else {
          throw new Error(errorData.detail || `HTTP ${res.status}: ${errorData.detail || "Unknown error"}`);
        }
      }
      
      const data = await res.json();
      setCurrentChatId(data.chat_id);
      setCurrentScan(data.scan);
      setScanProgress(100);
      
      // Add assistant response with scan result
      const assistantMessage = {
        role: "assistant",
        content: "", // No content - only show the detailed scan result
        scanData: data.scan
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Add post-scan message
      const postScanMessage = {
        role: "assistant",
        content: "Do you have any questions about this? Feel free to ask anything..."
      };
      setMessages(prev => [...prev, postScanMessage]);
      
      // Refresh user data to update scan count and chats
      await loadUserData();
    } catch (e) {
      console.error("Scan error:", e);
      setError(e.message || String(e));
      
      // Add error message with specific formatting for different error types
      let errorContent = e.message;
      
      // Format specific error messages to be more user-friendly
      if (e.message.includes("platform that we do not cover yet")) {
        errorContent = e.message; // Keep the exact message from backend
      } else if (e.message.includes("does not have information about this property")) {
        errorContent = e.message; // Keep the exact message from backend
      } else if (e.message.includes("not seem to have enough information and reviews")) {
        errorContent = e.message; // Keep the exact message from backend
      } else if (e.message.includes("no more scans left") || e.message.includes("few scans left")) {
        errorContent = e.message; // Keep the exact message from backend
      } else if (e.message.includes("already scanned this listing")) {
        errorContent = e.message; // Keep the exact message from backend
      } else {
        errorContent = `Sorry, I couldn't scan that listing. ${e.message}`;
      }
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: errorContent,
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
    const userMessage = { role: "user", content: question, messageType: "question" };
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
      const userMessage = { role: "user", content: text, messageType: "compare" };
      setMessages(prev => [...prev, userMessage]);
      
      // Wait for scan data to be loaded if it's still loading
      if (isLoadingData) {
        setError("Loading scan data...");
        return;
      }
      
      // Add assistant response with comparison options
      const assistantMessage = {
        role: "assistant",
        content: "I can help you compare your scanned listings. Here are your available scans:",
        showComparisonUI: true,
        availableScans: scanChats.slice(0, 10).map(chat => {
          // Try to get scan data from current messages first, then from scanData state
          const scan = getScanDataFromCurrentMessages(chat.id) || scanData[chat.id];
          
          // If we don't have scan data, load it
          if (!scan && chat.type === 'scan') {
            loadScanDataForChat(chat.id);
          }
          
          console.log("DEBUG: Compare selector chat", chat.id, "scan data:", scan);
          
          return {
            id: chat.id,
            listing_url: chat.title.replace("Scan • ", ""),
            listing_title: scan?.listing_title,
            location: scan?.location,
            created_at: chat.created_at
          };
        })
      };
      console.log("DEBUG: Adding comparison UI message:", assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);
      return;
    }

    // If specific URLs are provided, proceed with comparison
    const urls = text.match(/https?:\/\/[^\s]+/g) || [];
    if (urls.length >= 2) {
      setError("");
      setIsLoading(true);
      
      // Add user message
      const userMessage = { role: "user", content: text, messageType: "compare" };
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
       
       // Create a compare chat entry for Recent Compares sidebar
       const compareChat = {
         id: `compare-${Date.now()}`, // Generate unique ID
         type: 'compare',
         title: `Compare • ${scan1.listing_title || scan1.location} vs ${scan2.listing_title || scan2.location}`,
         created_at: new Date().toISOString(),
         scan1: scan1,
         scan2: scan2,
         result: data.answer
       };
       
       // Add to chats state - same as Recent Scans
       setChats(prev => [compareChat, ...prev]);
       
       // Refresh user data to update scan count
       await loadUserData();
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
    const isWarning = message.isWarning;
    const isQuestion = isUser && message.messageType === "question";
    
    return (
      <div key={index} className={`flex ${isUser && !isQuestion ? 'justify-end' : 'justify-start'} mb-6`}>
        <div className={`max-w-4xl w-full ${
          isUser && !isQuestion
            ? 'bg-button text-button rounded-2xl px-4 py-3 ml-auto max-w-3xl' 
            : isQuestion
            ? 'bg-gray-100 text-gray-800 rounded-2xl px-4 py-3 max-w-3xl'
            : isError
            ? 'bg-red-50 text-red-700 border border-red-200 rounded-2xl px-4 py-3 max-w-3xl'
            : isWarning
            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-2xl px-4 py-3 max-w-3xl'
            : 'bg-white'
        }`}>
          {!isUser && !isError && !isWarning && !isQuestion && message.scanData ? (
            // Detailed scan result display
            <div className="bg-white rounded-2xl border border-accent p-4 sm:p-6">
              {/* Information */}
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
                  <div className="text-primary font-medium text-sm sm:text-base">{message.scanData.listing_title || "Property Listing"}</div>
                  <span className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${labelStyle(message.scanData.label).bg} ${labelStyle(message.scanData.label).text}`}>
                    {message.scanData.label}
                  </span>
                </div>
                {message.scanData.location && (
                  <div className="text-primary mb-2 text-sm sm:text-base">{message.scanData.location}</div>
                )}
                <div className="text-primary underline break-all text-xs sm:text-sm">{message.scanData.listing_url}</div>
              </div>

              {/* What To Expect */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base font-semibold text-primary mb-2 sm:mb-3">What To Expect</h3>
                <div className="text-primary leading-relaxed">
                  {message.scanData.what_to_expect && message.scanData.expectation_fit 
                    ? `${message.scanData.what_to_expect} ${message.scanData.expectation_fit}`
                    : message.scanData.what_to_expect || message.scanData.expectation_fit || "Standard expectations for this type of listing"
                  }
                </div>
              </div>

              {/* Recent Changes */}
              {message.scanData.recent_changes && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-sm sm:text-base font-semibold text-primary mb-2 sm:mb-3">Recent Changes</h3>
                  <div className="text-primary">{message.scanData.recent_changes}</div>
                </div>
              )}

              {/* Deep Inspection Analysis */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base font-semibold text-primary mb-2 sm:mb-3">Deep Inspection Analysis</h3>
                <div className="text-primary mb-4">
                  This place passed {message.scanData.inspection_score || "92"} out of 100 inspection checks.
                </div>
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
              {console.log("DEBUG: Rendering comparison UI with scans:", message.availableScans)}
              <ComparisonSelector 
                availableScans={message.availableScans || []}
                onCompare={handleComparisonSelect}
              />
            </div>
          ) : (
            <div className="text-sm whitespace-pre-wrap break-all">{message.content}</div>
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
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          {/* Mobile Layout */}
          <div className="lg:hidden">
            {/* Top Row: Logo + Menu */}
            <div className="flex justify-between items-center mb-3">
              <button
                onClick={() => navigate("/")}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <img 
                  src={logo} 
                  alt="BookYolo" 
                  className="h-8 w-auto"
                />
              </button>
              
              <div className="flex items-center space-x-3">
                {typeof me?.remaining === "number" && (
                  <div className="text-sm text-primary">
                    <span className="font-semibold">
                      {me.remaining % 1 === 0 ? me.remaining : me.remaining.toFixed(1)}
                    </span> scans left
                  </div>
                )}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Bottom Row: Navigation */}
            <div className="flex justify-center space-x-2">
              <button
                onClick={startNewChat}
                className="flex-1 max-w-24 px-3 py-2.5 bg-accent text-primary font-medium rounded-lg text-sm hover:opacity-90 transition-opacity"
              >
                New Scan
              </button>
              <button
                onClick={() => handleCompare("compare")}
                className="flex-1 max-w-24 px-3 py-2.5 bg-accent text-primary font-medium rounded-lg text-sm hover:opacity-90 transition-opacity"
              >
                Compare
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("by_token");
                  localStorage.removeItem("by_user");
                  navigate("/login");
                }}
                className="flex-1 max-w-24 px-3 py-2.5 bg-button text-white font-medium rounded-lg text-sm hover:opacity-90 transition-opacity"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex justify-between items-center">
            {/* Left: Scan Balance */}
            <div className="flex items-center space-x-4">
              {typeof me?.remaining === "number" && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-accent rounded-full px-3 py-1">
                    <div className="w-2 h-2 bg-button rounded-full"></div>
                    <span className="text-sm text-primary">
                      <span className="font-semibold">
                        {me.remaining % 1 === 0 ? me.remaining : me.remaining.toFixed(1)}
                      </span> 
                      <span> scans left</span>
                    </span>
                  </div>
                  
                  {/* Low Scan Balance Warning */}
                  {me.remaining <= 5 && me.remaining > 0 && (
                    <div className="flex items-center space-x-2 bg-yellow-100 border border-yellow-300 rounded-full px-3 py-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-yellow-700">
                        Low balance
                      </span>
                      <button 
                        onClick={() => window.open('https://bookyolo-frontend.vercel.app/pricing', '_blank')}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-2 py-1 rounded-full transition-colors"
                      >
                        Upgrade
                      </button>
                    </div>
                  )}
                  
                  {/* Zero Scan Balance Warning */}
                  {me.remaining <= 0 && (
                    <div className="flex items-center space-x-2 bg-red-100 border border-red-300 rounded-full px-3 py-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-red-700">
                        No scans left
                      </span>
                      <button 
                        onClick={() => window.open('https://bookyolo-frontend.vercel.app/pricing', '_blank')}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-full transition-colors"
                      >
                        Upgrade
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Center: BookYolo Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img 
                src={logo} 
                alt="BookYolo" 
                className="h-10 w-auto"
              />
            </button>
            
            {/* Right: Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={startNewChat}
                className="px-4 py-2 bg-accent text-primary font-medium rounded-lg hover:opacity-90 transition-opacity text-sm"
              >
                New Scan
              </button>
              
              <button
                onClick={() => handleCompare("compare")}
                className="px-4 py-2 bg-accent text-primary font-medium rounded-lg hover:opacity-90 transition-opacity text-sm"
              >
                Compare
              </button>
              
              <button
                onClick={() => {
                  localStorage.removeItem("by_token");
                  localStorage.removeItem("by_user");
                  navigate("/login");
                }}
                className="px-4 py-2 bg-button text-white font-medium rounded-lg hover:opacity-90 shadow-sm transition-opacity text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)] lg:h-[calc(100vh-80px)]">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          w-80 border-r border-accent bg-accent p-4 h-full flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Property Scans Section - 2/3 height */}
          <div className="flex-1 flex flex-col mb-4" style={{height: 'calc(66.67% - 1rem)'}}>
            <h3 className="text-lg font-semibold text-primary mb-3">Property Scans</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {chats.filter(chat => chat.type === 'scan').map((chat) => {
                // Try to get scan data from current messages first, then from scanData state
                const scan = getScanDataFromCurrentMessages(chat.id) || scanData[chat.id];
                
                // If we don't have scan data, load it
                if (!scan && chat.type === 'scan') {
                  loadScanDataForChat(chat.id);
                }
                
                return (
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
                      {scan?.listing_title || scan?.location || chat.title.replace("Scan • ", "")}
                    </div>
                    <div className={`text-xs mt-1 ${currentChatId === chat.id ? 'text-button opacity-70' : 'text-primary opacity-60'}`}>
                      {scan?.location || new Date(chat.created_at).toLocaleDateString()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Recent Compares Section - 1/3 height */}
          <div className="flex-1 flex flex-col" style={{height: 'calc(33.33% - 1rem)'}}>
            <h3 className="text-lg font-semibold text-primary mb-3">Recent Compares</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {chats.filter(chat => chat.type === 'compare').map((chat) => (
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
                    {chat.title || "Property Comparison"}
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
        <div className="flex-1 flex flex-col w-full lg:w-auto">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="max-w-md">
                  <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4">
                    Welcome to BookYolo AI Engine
                  </h2>
                  <p className="text-primary opacity-70 mb-6 text-sm sm:text-base">
                    Paste any Airbnb property URL to scan it
                  </p>
                  <div className="text-xs sm:text-sm text-primary opacity-60 space-y-2">
                    <p><strong>Ask any question:</strong></p>
                    <p>• Is this property clean overall?</p>
                    <p>• Is this a good place for families?</p>
                    <p>• How is the WiFi?</p>
                    <p>• Have you noted any issues regarding street noise?</p>
                    <p>• How is the kitchen?</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto w-full">
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Loading Progress */}
          {isLoading && scanProgress > 0 && (
            <div className="px-4 sm:px-6 pb-2">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between text-xs sm:text-sm text-primary mb-2">
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
            <div className="px-4 sm:px-6 pb-2">
              <div className="max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500">⚠️</span>
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="border-t border-accent p-3 sm:p-6">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="flex gap-2 sm:gap-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste an Airbnb property URL to scan and ask any questions..."
                  className="flex-1 rounded-xl border-2 border-accent px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-primary focus:outline-none focus:ring-2 focus:ring-button/20 focus:border-button transition-all"
                  disabled={isLoading}
                  rows="2"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="rounded-xl bg-button text-button px-4 sm:px-6 py-2 sm:py-3 font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                      <span className="text-xs sm:text-sm hidden sm:inline">Processing...</span>
                    </div>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
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

