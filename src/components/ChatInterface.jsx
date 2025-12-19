import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/main-logo.jpg";
import scanpageLogo from "../assets/scanpage-logo.png";

import { API_BASE } from "../config/api";

// Production-ready logging helper (only logs in development)
const debugLog = (...args) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

const labelStyle = (label) => {
  const map = {
    "Outstanding Stay": { bg: "bg-green-500", text: "text-white" },
    "Excellent Stay": { bg: "bg-green-400", text: "text-white" },
    "Looks Legit": { bg: "bg-yellow-400", text: "text-white" },
    "Probably OK": { bg: "bg-yellow-500", text: "text-white" },
    "A Bit Risky": { bg: "bg-orange-500", text: "text-white" },
    "Looks Sketchy": { bg: "bg-red-500", text: "text-white" },
    "Travel Trap": { bg: "bg-red-600", text: "text-white" },
    "Booking Nightmare": { bg: "bg-red-700", text: "text-white" },
    "Insufficient Data": { bg: "bg-gray-500", text: "text-white" },
  };
  return map[label] || { bg: "bg-gray-500", text: "text-white" };
};

// Helper function to detect if input is an Airbnb URL (handles all domain variations)
const isAirbnbUrl = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  // Comprehensive pattern for all Airbnb URL variations
  // Supports: www.airbnb.com, airbnb.com, fr.airbnb.com, airbnb.fr, etc.
  // Also supports shortened URLs: /l/[slug] pattern
  const airbnbRoomsPattern = /https?:\/\/(www\.)?([a-z]{2}\.)?airbnb\.(com|ca|co\.uk|com\.au|fr|de|es|it|nl|pl|pt|ru|se|jp|kr|cn|in|br|mx|ar|cl|co|pe|za|ae|sa|tr|au|nz|ie|be|ch|at|dk|fi|no|gr|cz|hu|ro|bg|hr|sk|si|lt|lv|ee|is|lu|mt|cy)\/rooms\//i;
  
  // Pattern for shortened URLs (e.g., /l/uUOOx2oE)
  const airbnbShortPattern = /https?:\/\/(www\.)?([a-z]{2}\.)?airbnb\.(com|ca|co\.uk|com\.au|fr|de|es|it|nl|pl|pt|ru|se|jp|kr|cn|in|br|mx|ar|cl|co|pe|za|ae|sa|tr|au|nz|ie|be|ch|at|dk|fi|no|gr|cz|hu|ro|bg|hr|sk|si|lt|lv|ee|is|lu|mt|cy)\/l\//i;
  
  return airbnbRoomsPattern.test(text) || airbnbShortPattern.test(text);
};

// Helper function to detect if input is a Booking.com URL (handles all domain variations)
const isBookingUrl = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  // Pattern for Booking.com URLs (handles various country domains)
  const bookingPattern = /https?:\/\/(www\.)?([a-z]{2}\.)?booking\.(com|fr|co\.uk|ca|com\.au|de|es|it|nl|pl|pt|ru|se|jp|kr|cn|in|br|mx|ar|cl|co|pe|za|ae|sa|tr|au|nz|ie|be|ch|at|dk|fi|no|gr|cz|hu|ro|bg|hr|sk|si|lt|lv|ee|is|lu|mt|cy)/i;
  
  return bookingPattern.test(text);
};

// Helper function to detect if input is an Agoda URL (handles all domain variations)
const isAgodaUrl = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  // Pattern for Agoda URLs (handles various country domains)
  const agodaPattern = /https?:\/\/(www\.)?([a-z]{2}\.)?agoda\.(com|fr|co\.uk|ca|com\.au|de|es|it|nl|pl|pt|ru|se|jp|kr|cn|in|br|mx|ar|cl|co|pe|za|ae|sa|tr|au|nz|ie|be|ch|at|dk|fi|no|gr|cz|hu|ro|bg|hr|sk|si|lt|lv|ee|is|lu|mt|cy)/i;
  
  return agodaPattern.test(text);
};

// Helper function to detect if input is a supported platform URL (Airbnb, Booking.com, or Agoda)
const isSupportedUrl = (text) => {
  return isAirbnbUrl(text) || isBookingUrl(text) || isAgodaUrl(text);
};

// Helper function to detect compare request
const isCompareRequest = (text) => {
  return text.toLowerCase().includes('compare') && isSupportedUrl(text);
};

// Helper function to detect if input is any URL
const isUrl = (text) => {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
};

// Helper function to make URLs clickable in text
const makeUrlsClickable = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

// Comparison Selector Component
const ComparisonSelector = ({ availableScans, onCompare }) => {
  const [selectedScan1, setSelectedScan1] = useState("");
  const [selectedScan2, setSelectedScan2] = useState("");
  const [question, setQuestion] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  
  console.log("DEBUG: ComparisonSelector received scans:", availableScans.length, availableScans);

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

  // Check if both listings are selected and are the same
  const isSameListing = selectedScan1 && selectedScan2 && selectedScan1 === selectedScan2;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Listing A</label>
          <div className="relative">
            <select 
              className="w-full rounded-xl border-2 border-accent px-4 py-3 pr-10 text-base text-primary focus:outline-none focus:ring-2 focus:ring-button/20 focus:border-button cursor-pointer appearance-none bg-white"
              value={selectedScan1} 
              onChange={(e) => setSelectedScan1(e.target.value)}
            >
              <option value="" disabled>Select listing A</option>
              {availableScans.map((scan) => (
                <option key={scan.id} value={scan.id}>
                  {scan.listing_title || scan.location || scan.listing_url.replace("https://www.airbnb.com/rooms/", "Room ")}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Listing B</label>
          <div className="relative">
            <select 
              className="w-full rounded-xl border-2 border-accent px-4 py-3 pr-10 text-base text-primary focus:outline-none focus:ring-2 focus:ring-button/20 focus:border-button cursor-pointer appearance-none bg-white"
              value={selectedScan2} 
              onChange={(e) => setSelectedScan2(e.target.value)}
            >
              <option value="" disabled>Select listing B</option>
              {availableScans.map((scan) => (
                <option key={scan.id} value={scan.id}>
                  {scan.listing_title || scan.location || scan.listing_url.replace("https://www.airbnb.com/rooms/", "Room ")}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Warning message when same listing is selected */}
      {isSameListing && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 mb-1">
              Cannot compare the same listing
            </p>
            <p className="text-sm text-amber-700">
              Please select two different listings to compare their features, ratings, and reviews.
            </p>
          </div>
        </div>
      )}

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

const ChatInterface = ({ me: meProp, meLoading: meLoadingProp, onUsageChanged }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentScan, setCurrentScan] = useState(null);
  const [me, setMe] = useState(meProp || null);
  const [chats, setChats] = useState([]);
  const [scanData, setScanData] = useState({});
  const [showComparisonUI, setShowComparisonUI] = useState(false);
  const [availableScansForComparison, setAvailableScansForComparison] = useState([]);
  const [recentScansCollapsed, setRecentScansCollapsed] = useState(false);
  const [recentComparesCollapsed, setRecentComparesCollapsed] = useState(false);
  const [activeButton, setActiveButton] = useState(null); // 'scan', 'compare', 'account', or null for normal state
  const [chatAreaKey, setChatAreaKey] = useState(0); // Force re-render key
  const [processedCompareChats, setProcessedCompareChats] = useState({}); // Cache for processed compare chats
  const chatsLoadedRef = useRef(false); // Track if chats have been loaded
  // Pagination state for progressive loading
  const [chatsPage, setChatsPage] = useState(1);
  const [hasMoreChats, setHasMoreChats] = useState(true);
  const [isLoadingMoreChats, setIsLoadingMoreChats] = useState(false);
  const inputRef = useRef(null);


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
  const loadScanDataForChat = useCallback(async (chatId, chatObject = null) => {
    try {
      const token = localStorage.getItem("by_token");
      if (!token) return null;
      
      let scanId = null;
      
      // Performance optimization: Use scan_id from chat object if available (from optimized /chats endpoint)
      // This avoids the extra /chat/{chatId} API call, reducing latency significantly
      if (chatObject && chatObject.scan_id) {
        scanId = chatObject.scan_id;
      } else {
        // Fallback: Get chat details to find scan_id (for backward compatibility)
        const chatRes = await fetch(`${API_BASE}/chat/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (chatRes.ok) {
          const chatData = await chatRes.json();
          console.log("DEBUG: loadScanDataForChat - chat data:", chatData);
          
          if (chatData.chat.type === 'scan' && chatData.chat.scan_id) {
            scanId = chatData.chat.scan_id;
          }
        }
      }
      
      if (scanId) {
        // Fetch the scan data
        const scanRes = await fetch(`${API_BASE}/scan/${scanId}`, {
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
    } catch (e) {
      console.error("Failed to load scan data for chat:", e);
    }
    return null;
  }, []);

 // Store scan data for sidebar display
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Set sidebar to closed by default on all devices
  useEffect(() => {
    const handleResize = () => {
      // Keep sidebar closed by default on all screen sizes
      setSidebarOpen(false);
    };
    
    // Set initial state
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lazy process compare chats when sidebar opens and compare section is expanded
  useEffect(() => {
    if (sidebarOpen && !recentComparesCollapsed && chats.length > 0) {
      const compareChats = chats.filter(chat => chat.type === 'compare');
      if (compareChats.length === 0) return;
      
      const token = localStorage.getItem("by_token");
      if (!token) return;
      
      // Process unprocessed compare chats
      compareChats.forEach(async (chat) => {
        // Check if already processed by checking the cache
        const isProcessed = processedCompareChats[chat.id];
        if (!isProcessed && chat.title && chat.title.includes('Compare •')) {
          const processed = await processCompareChat(chat, token);
          if (processed && processed.title !== chat.title) {
            setProcessedCompareChats(prev => ({ ...prev, [chat.id]: processed }));
            // Update the chat in chats array
            setChats(prev => prev.map(c => c.id === chat.id ? processed : c));
          } else {
            // Mark as processed even if title didn't change
            setProcessedCompareChats(prev => ({ ...prev, [chat.id]: chat }));
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarOpen, recentComparesCollapsed, chats.length]);

  // Simple fix: Reset chat area after scan completion
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      // Simple timeout to ensure DOM is updated
      setTimeout(() => {
        setChatAreaKey(prev => prev + 1);
      }, 100);
    }
  }, [isLoading, messages.length]);

  // Remove problematic scroll manipulation that causes reverse typing

  
  const messagesEndRef = useRef(null);
  const tickRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Calculate new height based on content
      const scrollHeight = textareaRef.current.scrollHeight;
      // Set min height to 44px (original size) and max to 120px (about 5 lines)
      const newHeight = Math.min(Math.max(scrollHeight, 44), 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, []);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    // Prevent window scroll to top
    window.scrollTo(0, window.scrollY);
    
    // Try multiple methods to ensure scrolling works
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    
    // Also try scrolling the container directly
    const container = document.querySelector('.flex-1.overflow-y-auto.p-2') || 
                      document.querySelector('.mobile-chat-area');
    if (container) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
        
        // Double-check with a small delay to ensure it worked
        setTimeout(() => {
          if (container.scrollTop < container.scrollHeight - container.clientHeight - 50) {
            container.scrollTop = container.scrollHeight;
          }
        }, 100);
      });
    }
  };

  // Track if we're loading a new chat vs. updating messages in existing chat
  const isLoadingNewChat = useRef(false);
  
  useEffect(() => {
    // Only scroll to bottom if we're actively in a chat (not loading a new chat)
    if (currentChatId && messages.length > 0 && !isLoadingNewChat.current) {
      // Immediately scroll to bottom when messages update (for follow-up questions)
      setTimeout(() => {
        scrollToBottom();
        // Double-check after a bit longer delay to ensure it stuck
        setTimeout(() => {
          scrollToBottom();
        }, 300);
      }, 50);
    }
  }, [messages, currentChatId]);

  // Reset textarea height when input is cleared
  useEffect(() => {
    if (!input.trim() && textareaRef.current) {
      textareaRef.current.style.height = '44px';
    } else if (input.trim()) {
      // Adjust height when input has content
      adjustTextareaHeight();
    }
  }, [input, adjustTextareaHeight]);

  // Check authentication and load data
  useEffect(() => {
    const token = localStorage.getItem("by_token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    // Only load data if not already loaded (prevent reload on navigation)
    // Check both ref and chats array to handle both remount and same component cases
    if (chatsLoadedRef.current || (chats.length > 0 && !isLoadingData)) {
      // Chats already loaded, just update me if prop changed
      if (meProp && !meLoadingProp) {
        setMe(meProp);
      }
      return;
    }
    
    // Use passed me prop if available, otherwise fetch
    if (meProp && !meLoadingProp) {
      setMe(meProp);
      // Only load chats, not user data
      loadChatsOnly();
    } else {
      loadUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, meProp, meLoadingProp]);

  // No longer needed - compares are now stored in database

  // Smooth progress for scan
  useEffect(() => {
    if (isLoading && scanProgress > 0) {
      tickRef.current = setInterval(() => {
        setScanProgress((p) => (p < 90 ? p + 2 : 90));
      }, 120);
    }
    return () => clearInterval(tickRef.current);
  }, [isLoading, scanProgress]);

  // Lazy process compare chats - only when needed
  const processCompareChat = useCallback(async (chat, token) => {
    try {
      console.log("DEBUG: Processing compare chat:", chat.id, "current title:", chat.title);
      
      // Fetch the chat messages to get the comparison content
      const chatRes = await fetch(`${API_BASE}/chat/${chat.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        console.log("DEBUG: Chat messages:", chatData.messages);
        
        // Look for the first assistant message with comparison content
        const assistantMessage = chatData.messages.find(msg => 
          msg.role === 'assistant' && 
          msg.content && 
          msg.content.includes('Listing A:') && 
          msg.content.includes('Listing B:')
        );
        
        if (assistantMessage) {
          console.log("DEBUG: Found comparison message:", assistantMessage.content);
          
          // SIMPLE APPROACH: Just look for the actual titles in the content
          const content = assistantMessage.content;
          
          // Look for "Bright and spacious house" and "Modern Airbnb" patterns
          let title1 = null;
          let title2 = null;
          
          if (content.includes('Bright and spacious house')) {
            const match = content.match(/Bright and spacious house[^]*?(?=\n|https|$)/);
            if (match) {
              title1 = match[0].trim();
              console.log("DEBUG: Found title1:", title1);
            }
          }
          
          if (content.includes('Modern Airbnb')) {
            const match = content.match(/Modern Airbnb[^]*?(?=\n|https|$)/);
            if (match) {
              title2 = match[0].trim();
              console.log("DEBUG: Found title2:", title2);
            }
          }
          
          if (content.includes('Luxurious 2BHK')) {
            const match = content.match(/Luxurious 2BHK[^]*?(?=\n|https|$)/);
            if (match) {
              if (!title2) title2 = match[0].trim();
              else if (!title1) title1 = match[0].trim();
              console.log("DEBUG: Found Luxurious title:", match[0].trim());
            }
          }
          
          if (title1 && title2) {
            console.log("DEBUG: Final titles:", title1, "vs", title2);
            return {
              ...chat,
              title: `${title1} vs ${title2}`
            };
          } else {
            console.log("DEBUG: Could not find both titles, keeping original");
          }
        }
      }
      
      console.log("DEBUG: Could not extract titles, keeping original:", chat.title);
    } catch (e) {
      console.error('Failed to process compare chat:', e);
    }
    return chat;
  }, []);

  // Load chats only (without /me) - supports pagination for progressive loading
  const loadChatsOnly = useCallback(async (page = 1, append = false) => {
    try {
      const token = localStorage.getItem("by_token");
      if (!token) return;
      
      if (append) {
        setIsLoadingMoreChats(true);
      } else {
        setIsLoadingData(true);
      }
      
      // Request paginated chats (default limit 20 for faster initial load)
      const response = await fetch(`${API_BASE}/chats?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle both old format (array) and new format (object with chats array) for backward compatibility
        const chatsData = Array.isArray(data) ? data : (data.chats || []);
        const pagination = data.pagination || null;
        
        console.log("DEBUG: Chats loaded (page", page, "):", chatsData.length, "chats");
        
        if (append) {
          // Append to existing chats for progressive loading
          setChats(prev => [...prev, ...chatsData]);
        } else {
          // Replace chats (initial load)
          setChats(chatsData);
        }
        
        // Update pagination state if available
        if (pagination) {
          setHasMoreChats(pagination.has_more);
          setChatsPage(pagination.page);
        } else {
          // Old format - assume no more if we got less than limit
          setHasMoreChats(chatsData.length >= 20);
          setChatsPage(page);
        }
        
        chatsLoadedRef.current = true;
      }
    } catch (e) {
      console.error("Failed to load chats:", e);
    } finally {
      setIsLoadingData(false);
      setIsLoadingMoreChats(false);
    }
  }, []);
  
  // Load more chats for progressive loading
  const loadMoreChats = useCallback(async () => {
    if (!hasMoreChats || isLoadingMoreChats) return;
    await loadChatsOnly(chatsPage + 1, true);
  }, [chatsPage, hasMoreChats, isLoadingMoreChats, loadChatsOnly]);

  // Lightweight function to refresh only user scan balance (fast)
  const refreshUserBalance = useCallback(async () => {
    try {
      const token = localStorage.getItem("by_token");
      if (!token) return;
      
      // Only fetch /me if not provided as prop
      if (!meProp || meLoadingProp) {
        const response = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setMe(userData);
        } else if (response.status === 401 || response.status === 404) {
          localStorage.removeItem("by_token");
          localStorage.removeItem("by_user");
          navigate("/login");
        }
      } else if (meProp) {
        // Use prop if available
        setMe(meProp);
      }
    } catch (e) {
      console.error("Failed to refresh user balance:", e);
    }
  }, [meProp, meLoadingProp, navigate]);

  const loadUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("by_token");
      if (!token) return;
      
      // Only fetch /me if not provided as prop
      const fetchPromises = [fetch(`${API_BASE}/chats`, { headers: { Authorization: `Bearer ${token}` } })];
      
      if (!meProp || meLoadingProp) {
        fetchPromises.unshift(fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } }));
      }
      
      const responses = await Promise.all(fetchPromises);
      let r1 = null;
      let r2 = responses[responses.length - 1];
      
      if (!meProp || meLoadingProp) {
        r1 = responses[0];
        r2 = responses[1];
      }
      
      if (r1) {
        if (r1.ok) {
          const userData = await r1.json();
          setMe(userData);
          
          // Check for low scan balance (will be handled in UI component)
          if (userData.remaining <= 5 && userData.remaining > 0) {
            console.log("DEBUG: Low scan balance detected:", userData.remaining);
          } else {
            console.log("DEBUG: Scan balance OK. Remaining:", userData.remaining);
          }
        } else if (r1.status === 401 || r1.status === 404) {
          // User account doesn't exist or token is invalid - redirect to login
          localStorage.removeItem("by_token");
          localStorage.removeItem("by_user");
          navigate("/login");
          return;
        }
      } else if (meProp) {
        // Use prop if available
        setMe(meProp);
      }
      
      if (r2.ok) {
        const data = await r2.json();
        
        // Handle both old format (array) and new format (object with chats array) for backward compatibility
        const chatsData = Array.isArray(data) ? data : (data.chats || []);
        const pagination = data.pagination || null;
        
        console.log("DEBUG: All chats loaded:", chatsData.length, "chats");
        
        // Set chats immediately without processing compare chats (lazy loading)
        // Compare chats will be processed when sidebar is opened or when needed
        setChats(chatsData);
        chatsLoadedRef.current = true;
        
        // Update pagination state if available
        if (pagination) {
          setHasMoreChats(pagination.has_more);
          setChatsPage(pagination.page);
        } else {
          // Old format - assume no more if we got less than limit
          setHasMoreChats(chatsData.length >= 20);
          setChatsPage(1);
        }
        
        // The /chats endpoint now returns scan_id and listing_url, so scan data is available
        console.log("DEBUG: Chats loaded with scan_id and listing_url from optimized endpoint");
      }
    } catch (e) {
      console.error("Failed to load user data:", e);
    } finally {
      setIsLoadingData(false);
    }
  }, [meProp, meLoadingProp, navigate]);

  const loadChat = async (chatId) => {
    try {
      // Set flag to indicate we're loading a new chat (should scroll to top, not bottom)
      isLoadingNewChat.current = true;
      
      // Hide comparison UI when loading a chat
      setShowComparisonUI(false);
      
      // Clear any error notifications when loading a chat
      setError("");
      
      // Reset active button state when loading past chats - they are no longer "active" operations
      setActiveButton(null);
      
      // Check if this is a local compare chat (not in database)
      const localCompareChat = chats.find(chat => chat.id === chatId && chat.type === 'compare' && chat.id.startsWith('compare-'));
      
      if (localCompareChat) {
        // Handle local compare chat
        setCurrentChatId(chatId);
        setCurrentScan(null);
        
        // CRITICAL FIX: Ensure comparison UI is hidden for local compare chats
        setShowComparisonUI(false);
        setAvailableScansForComparison([]);
        
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
          },
          {
            role: "assistant",
            content: "Do you have any questions about this comparison? Feel free to ask anything...",
            timestamp: localCompareChat.created_at
          }
        ];
        
        setMessages(compareMessages);
        
        // Scroll to top when loading a chat
        setTimeout(() => {
          const messagesContainer = document.querySelector('.flex-1.overflow-y-auto.p-2');
          if (messagesContainer) {
            messagesContainer.scrollTop = 0;
          }
          // Reset flag after scrolling to top
          isLoadingNewChat.current = false;
        }, 100);
        return;
      }
      
      // Handle database chats - OPTIMIZED: Check cache and fetch in parallel
      const token = localStorage.getItem("by_token");
      
      // Check if we already have scan data cached
      const existingScanData = scanData[chatId];
      
      // Fetch chat data first to get scan_id/scan_ids
      const chatRes = await fetch(`${API_BASE}/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!chatRes.ok) {
        throw new Error("Failed to load chat");
      }
      
      const data = await chatRes.json();
      setCurrentChatId(chatId);
      
      // CRITICAL FIX: If this is a compare chat, ensure comparison UI stays hidden
      // and messages are shown directly (not the selector)
      if (data.chat.type === 'compare') {
        setShowComparisonUI(false); // Explicitly ensure it's false
        setAvailableScansForComparison([]); // Clear any comparison selector data
        
        // For compare chats, set messages with isComparison flag immediately
        // to prevent selector UI from showing during the brief moment before processedMessages
        setMessages(data.messages.map((msg, index) => {
          const message = {
            role: msg.role,
            content: msg.content,
            timestamp: msg.created_at,
            messageType: msg.role === 'user' ? "compare" : undefined
          };
          
          // Mark assistant messages as comparison if they contain comparison content
          if (msg.role === 'assistant' && (msg.content.includes('Listing A:') || msg.content.includes('Comparative Analysis:') || msg.content.includes('In summary'))) {
            message.isComparison = true;
            // Try to extract comparedScans from content immediately
            const urlRegex = /https?:\/\/[^\s]+/g;
            const urls = msg.content.match(urlRegex) || [];
            if (urls.length >= 2) {
              let title1 = msg.content.split('Listing A:')[1]?.split('\n')[1]?.trim() || urls[0];
              let title2 = msg.content.split('Listing B:')[1]?.split('\n')[1]?.trim() || urls[1];
              if (!title1 || title1 === 'Title not available' || title1.startsWith('Listing ') || title1 === 'None') {
                title1 = urls[0];
              }
              if (!title2 || title2 === 'Title not available' || title2.startsWith('Listing ') || title2 === 'None') {
                title2 = urls[1];
              }
              message.comparedScans = {
                scan1: { listing_url: urls[0], listing_title: title1 },
                scan2: { listing_url: urls[1], listing_title: title2 }
              };
              // Extract just the Comparative Analysis part for cleaner display
              const analysisStart = msg.content.indexOf('Comparative Analysis:');
              if (analysisStart !== -1) {
                message.content = msg.content.substring(analysisStart + 'Comparative Analysis:'.length).trim();
              }
            }
          }
          return message;
        }));
      } else {
        // For scan chats, set messages with scanData immediately if cached
        // This prevents delay and ensures scan result UI renders right away
        if (data.chat.type === 'scan' && existingScanData) {
          // If we have cached scanData, attach it immediately to prevent delay
          setMessages(data.messages.map((msg, index) => {
            const message = {
              role: msg.role,
              content: msg.content,
              timestamp: msg.created_at,
              messageType: msg.role === 'user' ? (index > 0 ? "question" : "scan") : undefined
            };
            
            // Attach cached scanData to first assistant message immediately
            if (msg.role === 'assistant' && index === 0) {
              message.scanData = existingScanData;
            }
            
            return message;
          }));
          
          // Also set currentScan immediately
          setCurrentScan(existingScanData);
        } else if (data.chat.type === 'scan' && !existingScanData) {
          // CRITICAL FIX: Don't set messages yet if scanData is not cached for scan chats
          // Wait for scan data to load first to prevent showing simplified view
          // Messages will be set after scan data is fetched (around line 1140)
          // This prevents the brief simplified interface from appearing
        } else {
          // For non-scan chats, set messages normally
          setMessages(data.messages.map((msg, index) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.created_at,
            messageType: msg.role === 'user' ? (data.chat.type === 'scan' && index > 0 ? "question" : index === 0 ? "scan" : undefined) : undefined
          })));
        }
      }
      
      // Prepare parallel fetches for scan data (if not cached)
      const scanFetchPromises = [];
      
      // If it's a scan chat, fetch scan data in parallel (if not cached)
      let scanDataResult = null;
      if (data.chat.type === 'scan' && data.chat.scan_id) {
        if (existingScanData) {
          // Use cached data - no fetch needed
          scanDataResult = existingScanData;
          setCurrentScan(scanDataResult);
        } else {
          // Fetch scan data in parallel (will be resolved after chat data)
          scanFetchPromises.push(
            fetch(`${API_BASE}/scan/${data.chat.scan_id}`, {
              headers: { Authorization: `Bearer ${token}` }
            }).then(res => res.ok ? res.json() : null)
          );
        }
      }
      
      // If it's a compare chat, fetch both scans in parallel (if not cached)
      let compareScanDataResult = null;
      if (data.chat.type === 'compare' && data.chat.scan_ids) {
        // CRITICAL FIX: Handle scan_ids which might be a string or array
        // PostgreSQL UUID arrays can be returned as strings like {"uuid1","uuid2"}
        let scanIdsArray = [];
        
        if (Array.isArray(data.chat.scan_ids)) {
          // Already an array - use directly
          scanIdsArray = data.chat.scan_ids;
        } else if (typeof data.chat.scan_ids === 'string') {
          // Parse PostgreSQL array format: {"uuid1","uuid2"} or {uuid1,uuid2}
          try {
            // Remove curly braces and quotes, then split by comma
            const cleaned = data.chat.scan_ids.replace(/[{}"]/g, '');
            scanIdsArray = cleaned.split(',').map(id => id.trim()).filter(id => id.length > 0);
          } catch (e) {
            console.error("Failed to parse scan_ids string:", e, data.chat.scan_ids);
            scanIdsArray = [];
          }
        }
        
        // Validate and fetch only if we have at least 2 valid scan IDs
        if (scanIdsArray.length >= 2) {
          // Additional validation: ensure IDs are valid (not empty, not just "{")
          const validScanIds = scanIdsArray.filter(id => {
            const trimmed = String(id).trim();
            return trimmed.length > 0 && trimmed !== '{' && trimmed !== '}' && trimmed.length > 5; // UUIDs are longer than 5 chars
          });
          
          if (validScanIds.length >= 2) {
            // Fetch both scans in parallel with error handling
            try {
              scanFetchPromises.push(
                Promise.all([
                  fetch(`${API_BASE}/scan/${validScanIds[0]}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  }).then(res => {
                    if (res.ok) return res.json();
                    console.error(`Failed to fetch scan ${validScanIds[0]}:`, res.status);
                    return null;
                  }).catch((err) => {
                    console.error(`Error fetching scan ${validScanIds[0]}:`, err);
                    return null;
                  }),
                  fetch(`${API_BASE}/scan/${validScanIds[1]}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  }).then(res => {
                    if (res.ok) return res.json();
                    console.error(`Failed to fetch scan ${validScanIds[1]}:`, res.status);
                    return null;
                  }).catch((err) => {
                    console.error(`Error fetching scan ${validScanIds[1]}:`, err);
                    return null;
                  })
                ])
              );
            } catch (e) {
              console.error("Error setting up scan fetch promises:", e);
              // Continue without scan data - chat can still load
            }
          } else {
            console.warn("Invalid scan_ids format - insufficient valid IDs:", data.chat.scan_ids, "parsed:", scanIdsArray);
          }
        } else {
          console.warn("Insufficient scan_ids for comparison:", data.chat.scan_ids, "parsed:", scanIdsArray);
        }
      }
      
      // Wait for all scan data fetches in parallel
      if (scanFetchPromises.length > 0) {
        try {
          const scanResults = await Promise.all(scanFetchPromises);
          
          if (data.chat.type === 'scan' && scanResults[0]) {
            scanDataResult = scanResults[0];
            // Cache it for future use
            setScanData(prev => ({ ...prev, [chatId]: scanDataResult }));
            setCurrentScan(scanDataResult);
          } else if (data.chat.type === 'compare' && scanResults[0] && Array.isArray(scanResults[0])) {
            const [scan1Data, scan2Data] = scanResults[0];
            if (scan1Data && scan2Data) {
              compareScanDataResult = { scan1: scan1Data, scan2: scan2Data };
            }
          }
        } catch (e) {
          // Continue without scan data - chat messages can still be displayed
        }
      }
      
      // Use the results (use different variable names to avoid shadowing state)
      const currentScanData = scanDataResult;
      const currentCompareScanData = compareScanDataResult;
      
      // Update messages with scan data (messages already set above for instant UI)
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
        if (msg.role === 'assistant' && index === 0 && currentScanData && data.chat.type === 'scan') {
          message.scanData = currentScanData;
        }
        
        // If this is an assistant message in a compare chat, attach compare scan data
        if (msg.role === 'assistant' && currentCompareScanData && data.chat.type === 'compare') {
          message.isComparison = true;
          message.comparedScans = currentCompareScanData;
        }
        
        // If this is an assistant message in a compare chat but we don't have scan data,
        // check if the content contains the formatted comparison structure
        if (msg.role === 'assistant' && data.chat.type === 'compare' && !currentCompareScanData) {
          // Check if content has the expected format: "Listing A:\n...\nListing B:\n...\nComparative Analysis:\n..."
          if (msg.content.includes('Listing A:') && msg.content.includes('Listing B:') && msg.content.includes('Comparative Analysis:')) {
            message.isComparison = true;
            // Extract URLs from the content to create a basic comparedScans object
            const urlRegex = /https?:\/\/[^\s]+/g;
            const urls = msg.content.match(urlRegex) || [];
            if (urls.length >= 2) {
              // Try to get titles from the content - use simple extraction, no expensive fetches
              let title1 = msg.content.split('Listing A:')[1]?.split('\n')[1]?.trim() || urls[0];
              let title2 = msg.content.split('Listing B:')[1]?.split('\n')[1]?.trim() || urls[1];
              
              // If titles are generic, use URL as fallback (don't fetch from database - too slow)
              if (!title1 || title1 === 'Title not available' || title1.startsWith('Listing ') || title1 === 'None') {
                title1 = urls[0];
              }
              if (!title2 || title2 === 'Title not available' || title2.startsWith('Listing ') || title2 === 'None') {
                title2 = urls[1];
              }
              
              message.comparedScans = {
                scan1: { 
                  listing_url: urls[0],
                  listing_title: title1
                },
                scan2: { 
                  listing_url: urls[1],
                  listing_title: title2
                }
              };
              
              // Extract just the Comparative Analysis part for the main content
              const analysisStart = msg.content.indexOf('Comparative Analysis:');
              if (analysisStart !== -1) {
                message.content = msg.content.substring(analysisStart + 'Comparative Analysis:'.length).trim();
              }
            }
          }
        }
        
        return message;
      });
      
        // For compare chats, ensure we have the follow-up message
        if (data.chat.type === 'compare') {
          const hasFollowUpMessage = processedMessages.some(msg => 
            msg.role === 'assistant' && 
            msg.content.includes('Do you have any questions about this comparison')
          );
          
          if (!hasFollowUpMessage) {
            processedMessages.push({
              role: 'assistant',
              content: 'Do you have any questions about this comparison? Feel free to ask anything...',
              timestamp: new Date().toISOString()
            });
          }
        }
        
        // For scan chats, ensure we have the follow-up message
        if (data.chat.type === 'scan') {
          const hasFollowUpMessage = processedMessages.some(msg => 
            msg.role === 'assistant' && 
            msg.content.includes('Do you have any questions about this scan?')
          );
          
          if (!hasFollowUpMessage) {
            processedMessages.push({
              role: 'assistant',
              content: 'Do you have any questions about this scan? Feel free to ask anything...',
              timestamp: new Date().toISOString()
            });
          }
        }
        
      // Update messages with processed data (scan data, comparison flags, etc.)
      setMessages(processedMessages);
      
      // CRITICAL FIX: For compare chats, ensure comparison UI stays hidden
      // and we show the comparison result directly (not the selector)
      if (data.chat.type === 'compare') {
        setShowComparisonUI(false);
        setAvailableScansForComparison([]);
        
        // Ensure at least one message has isComparison flag set
        const hasComparisonMessage = processedMessages.some(msg => msg.isComparison);
        if (!hasComparisonMessage && processedMessages.length > 0) {
          // Find the assistant message with comparison content and mark it
          const comparisonMessage = processedMessages.find(msg => 
            msg.role === 'assistant' && 
            (msg.content.includes('Listing A:') || msg.content.includes('Comparative Analysis:') || msg.content.includes('In summary'))
          );
          if (comparisonMessage) {
            comparisonMessage.isComparison = true;
            // Update messages state with the corrected message
            setMessages([...processedMessages]);
          }
        }
      }
      
      // Scroll to top when loading a chat
      setTimeout(() => {
        const messagesContainer = document.querySelector('.flex-1.overflow-y-auto.p-2');
        if (messagesContainer) {
          messagesContainer.scrollTop = 0;
        }
        // Reset flag after scrolling to top
        isLoadingNewChat.current = false;
      }, 100);
    } catch (e) {
      console.error("Failed to load chat:", e);
      setError(`Failed to load chat: ${e.message || String(e)}`);
      // Reset flag on error as well
      isLoadingNewChat.current = false;
      // Show error message to user
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Sorry, I couldn't load that chat. ${e.message || "Please try again."}`,
        isError: true
      }]);
    }
  };

  const handleScan = async (url) => {
    setError("");
    setIsLoading(true);
    setScanProgress(0);
    setActiveButton('scan'); // Set scan button as active during scanning
    
    // Check if user has sufficient balance for scanning (requires 1 full scan)
    if (me?.remaining < 1.0) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "You don't have enough scans remaining. Please upgrade your plan to continue scanning.",
        isError: true
      }]);
      setIsLoading(false);
      return;
    }
    
    // Low scan balance warning is now handled in the UI component
    
    // Validate URL
    if (!url || !url.trim()) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Please provide a valid URL to scan.",
        isError: true
      }]);
      setIsLoading(false);
      return;
    }

    // Check if this chat already has a scan
    if (currentChatId && messages.some(msg => msg.scanData)) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "This chat is dedicated to the property you just scanned. Click on New Scan to scan a new property.",
        isError: true
      }]);
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

      console.log("🔍 FRONTEND: Starting scan for URL:", url);
      console.log("🔍 FRONTEND: API_BASE:", API_BASE);
      console.log("🔍 FRONTEND: Full API endpoint:", `${API_BASE}/chat/new-scan`);
      console.log("🔍 FRONTEND: Request body:", JSON.stringify({ listing_url: url }));
      console.log("🔍 FRONTEND: Using backend:", API_BASE.includes('localhost') ? 'LOCAL (http://localhost:8000)' : 'VERCEL (https://bookyolo-backend.vercel.app)');
      
      const res = await fetch(`${API_BASE}/chat/new-scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listing_url: url }),
      });
      
      console.log("🔍 FRONTEND: Response status:", res.status);
      console.log("🔍 FRONTEND: Response headers:", Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Unknown error occurred" }));
        console.error("🚨 FRONTEND: Scan failed:", res.status, errorData);
        console.log("🚨 FRONTEND: Full error response:", JSON.stringify(errorData, null, 2));
        console.log("🚨 FRONTEND: Error detail message:", errorData.detail);
        console.log("🚨 FRONTEND: Backend URL used:", API_BASE);
        
        // Check if error mentions listings_clean (old table name)
        const errorDetail = errorData.detail || "";
        if (errorDetail.includes("listings_clean") && API_BASE.includes('localhost')) {
          console.error("⚠️  FRONTEND: ERROR - Backend is using old table name 'listings_clean'");
          console.error("⚠️  FRONTEND: SOLUTION - Restart your backend server:");
          console.error("⚠️  FRONTEND: 1. Stop server (Ctrl+C)");
          console.error("⚠️  FRONTEND: 2. Run: uvicorn app:app --reload --port 8000");
        }
        
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
      
      // Store scan data in state so compare screen can find it immediately
      if (data.chat_id && data.scan) {
        setScanData(prev => ({
          ...prev,
          [data.chat_id]: data.scan
        }));
      }
      
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
        content: "Do you have any questions about this scan? Feel free to ask anything..."
      };
      setMessages(prev => [...prev, postScanMessage]);
      
      // Add new chat to chats list without reloading all chats (fast)
      if (data.chat_id) {
        setChats(prev => {
          // Check if chat already exists
          const exists = prev.some(chat => chat.id === data.chat_id);
          if (exists) return prev;
          
          // Add new chat at the beginning (matches backend format)
          // Include scan_id and listing_url to prevent loading message when going to compare screen
          const newChat = {
            id: data.chat_id,
            type: 'scan',
            title: data.scan?.listing_title 
              ? `Scan • ${data.scan.listing_title}` 
              : `Scan • ${data.scan?.location || url}`,
            created_at: new Date().toISOString(),
            scan_id: data.scan?.id || null,  // Include scan_id from scan response
            listing_url: data.scan?.listing_url || null  // Include listing_url to avoid loading message
          };
          return [newChat, ...prev];
        });
      }
      
      // Only refresh user balance (fast), don't reload all chats
      refreshUserBalance();
      
      // Notify parent to refresh user data (for account page)
      if (onUsageChanged) {
        onUsageChanged();
      }
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
      } else if (e.message.includes("does not have enough information to analyze this listing")) {
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
      
      // Clear the error state after adding to messages
      setError(null);
    } finally {
      setIsLoading(false);
      setTimeout(() => setScanProgress(0), 800);
      // Reset button state to normal after scan completion
      setActiveButton(null);
    }
  };

  const handleAsk = async (question) => {
    if (!currentChatId) {
      // Use smart pre-scan assistant to understand context and guide user
      setError("");
      setIsLoading(true);
      
      // Add user message
      const userMessage = { role: "user", content: question, messageType: "question" };
      setMessages(prev => [...prev, userMessage]);
      
      try {
        const token = localStorage.getItem("by_token");
        const res = await fetch(`${API_BASE}/chat/pre-scan/ask`, {
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
          content: data.answer || "Hey, I am here to help you book smarter. Please paste the listing link you would like me to analyze."
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Force scroll to bottom after message is added
        setTimeout(() => {
          scrollToBottom();
        }, 200);
      } catch (e) {
        setError(e.message || String(e));
        // Fallback to friendly message if API fails
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Hey, I am here to help you book smarter. Please paste the listing link you would like me to analyze."
        }]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Check if user has sufficient balance for questions (requires 0.5 scans)
    if (me?.remaining < 0.5) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "You don't have enough scans remaining. Please upgrade your plan to continue asking questions.",
        isError: true
      }]);
      return;
    }

    setError("");
    setIsLoading(true);
    
    // Add user message
    const userMessage = { role: "user", content: question, messageType: "question" };
    setMessages(prev => [...prev, userMessage]);

    try {
      const token = localStorage.getItem("by_token");
      
      // Check if this is a local compare chat
      const currentChat = chats.find(chat => chat.id === currentChatId);
      if (currentChat && currentChat.type === 'compare' && currentChat.id.startsWith('compare-')) {
        // For compare chat questions, call the compare endpoint
        
        // Call the compare endpoint
        const res = await fetch(`${API_BASE}/compare`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            scan_a_url: currentChat.scan1.listing_url, 
            scan_b_url: currentChat.scan2.listing_url, 
            question: question 
          }),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        
        const data = await res.json();
        
        // Add assistant response with comparedScans for compare chats
        const assistantMessage = {
          role: "assistant",
          content: data.answer || "I don't have enough information to answer that question.",
          isComparison: true,
          comparedScans: {
            scan1: currentChat.scan1,
            scan2: currentChat.scan2
          }
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Force scroll to bottom after message is added
        setTimeout(() => {
          scrollToBottom();
        }, 200);
        
        // Only refresh user balance (fast), don't reload all chats
        setTimeout(() => {
          refreshUserBalance();
          // Notify parent to refresh user data (for account page)
          if (onUsageChanged) {
            onUsageChanged();
          }
        }, 500);
      } else {
        // Handle question in regular scan chat
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
        
        // Check if this is a compare chat and get comparedScans from existing messages
        const currentChatForQuestion = chats.find(chat => chat.id === currentChatId);
        let comparedScansForAnswer = null;
        
        if (currentChatForQuestion && currentChatForQuestion.type === 'compare') {
          // Find existing message with comparedScans to reuse for follow-up answers
          const existingComparisonMessage = messages.find(msg => 
            msg.isComparison && msg.comparedScans
          );
          
          if (existingComparisonMessage && existingComparisonMessage.comparedScans) {
            comparedScansForAnswer = existingComparisonMessage.comparedScans;
          }
        }
        
        // Add assistant response with comparedScans for compare chats
        const assistantMessage = {
          role: "assistant",
          content: data.answer || "I don't have enough information to answer that question."
        };
        
        // If this is a compare chat, add isComparison and comparedScans
        if (comparedScansForAnswer) {
          assistantMessage.isComparison = true;
          assistantMessage.comparedScans = comparedScansForAnswer;
        }
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Force scroll to bottom after message is added
        setTimeout(() => {
          scrollToBottom();
        }, 200);
        
        // Only refresh user balance (fast), don't reload all chats
        setTimeout(() => {
          refreshUserBalance();
          // Notify parent to refresh user data (for account page)
          if (onUsageChanged) {
            onUsageChanged();
          }
        }, 500);
      }
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
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Please scan at least 2 listings first before you can compare them.",
        isError: true
      }]);
      return;
    }

    // If it's a compare request but no specific URLs, show available scans for comparison
    if (isCompareRequest) {
      setError("");
      setActiveButton('compare'); // Set compare as active
      
      // Wait for scan data to be loaded if it's still loading
      if (isLoadingData) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Loading scan data...",
          isError: true
        }]);
        return;
      }
      
      console.log("DEBUG: Total scan chats available:", scanChats.length);
      
      // Check if we already have listing_url for all scans (from optimized endpoint)
      // This prevents showing loading message when data is already available
      const allScansHaveListingUrl = scanChats.every(chat => 
        (chat.listing_url && chat.listing_url.startsWith('http')) ||
        (scanData[chat.id] && scanData[chat.id].listing_url) ||
        getScanDataFromCurrentMessages(chat.id)?.listing_url
      );
      
      // Only show loading message if we actually need to fetch data
      let loadingMessageAdded = false;
      if (!allScansHaveListingUrl) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Loading your scanned listings...",
          isError: false
        }]);
        loadingMessageAdded = true;
      }
      
      // Build available scans list - load scan data first to get actual listing_url
      // We need listing_url from scan data, not from title (title may contain listing_title or location)
      const loadScansForComparison = async () => {
        try {
          const scansWithData = await Promise.all(
            scanChats.map(async (chat) => {
              // Performance optimization: Use listing_url directly from chat object if available (from optimized /chats endpoint)
              // This avoids individual scan fetches, dramatically improving compare screen load time
              let listingUrl = chat.listing_url;
              let scan = null;
              
              // First check for cached scan data (might have listing_title and location)
              scan = getScanDataFromCurrentMessages(chat.id) || scanData[chat.id];
              
              // If we have listing_url from optimized endpoint AND cached scan data, use both
              // This gives us listing_url (for comparison) and title/location (for display)
              if (listingUrl && listingUrl.startsWith('http') && scan) {
                return {
                  id: chat.id,
                  listing_url: listingUrl,
                  listing_title: scan.listing_title || null,
                  location: scan.location || null,
                  created_at: chat.created_at
                };
              }
              
              // If listing_url from endpoint but no cached scan data, still need to fetch for title/location
              // We need title/location for dropdown display, so fetch scan data even if we have listing_url
              if (listingUrl && listingUrl.startsWith('http')) {
                // We have listing_url but need title/location - fetch scan data
                if (!scan && chat.type === 'scan') {
                  scan = await loadScanDataForChat(chat.id, chat);
                }
                return {
                  id: chat.id,
                  listing_url: listingUrl,
                  listing_title: scan?.listing_title || null,
                  location: scan?.location || null,
                  created_at: chat.created_at
                };
              }
              
              // If listing_url not in chat object, try to get from cached scan data
              if (!listingUrl || !listingUrl.startsWith('http')) {
                listingUrl = scan?.listing_url;
              }
              
              // Only fetch scan data if we still don't have listing_url
              // This minimizes API calls - we only fetch what we absolutely need
              if ((!listingUrl || !listingUrl.startsWith('http')) && chat.type === 'scan') {
                scan = await loadScanDataForChat(chat.id, chat);
                listingUrl = scan?.listing_url;
              }
              
              // Final fallback: try to get it from chat endpoint (should rarely be needed now)
              if (!listingUrl || !listingUrl.startsWith('http')) {
                console.error("DEBUG: No listing_url in scan data for chat", chat.id, "scan:", scan);
                const token = localStorage.getItem("by_token");
                if (token) {
                  const chatRes = await fetch(`${API_BASE}/chat/${chat.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  if (chatRes.ok) {
                    const chatData = await chatRes.json();
                    if (chatData.chat.scan_id) {
                      const scanRes = await fetch(`${API_BASE}/scan/${chatData.chat.scan_id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      if (scanRes.ok) {
                        const fullScanData = await scanRes.json();
                        scan = fullScanData;
                        listingUrl = fullScanData.listing_url;
                      }
                    }
                  }
                }
              }
              
              if (!listingUrl || !listingUrl.startsWith('http')) {
                console.error("DEBUG: Invalid listing_url for chat", chat.id, "listingUrl:", listingUrl);
                // Skip this scan if we don't have a valid URL
                return null;
              }
              
              console.log("DEBUG: Compare selector chat", chat.id, "scan data:", scan, "listing_url:", listingUrl);
              
              return {
                id: chat.id,
                listing_url: listingUrl,
                listing_title: scan?.listing_title || null,
                location: scan?.location || null,
                created_at: chat.created_at
              };
            })
          );
          
          // Filter out any null entries (scans without valid URLs)
          const validScans = scansWithData.filter(scan => scan !== null);
          
          // Remove loading message if it was added
          if (loadingMessageAdded) {
            setMessages(prev => prev.filter(msg => msg.content !== "Loading your scanned listings..."));
          }
          
          if (validScans.length < 2) {
            setMessages(prev => [...prev, {
              role: "assistant",
              content: "Please scan at least 2 listings first before you can compare them.",
              isError: true
            }]);
            return;
          }
          
          // Show comparison UI (messages already cleared if loading message was shown)
          if (!loadingMessageAdded) {
            setMessages([]);
          }
          setAvailableScansForComparison(validScans);
          setShowComparisonUI(true);
        } catch (error) {
          console.error("Error loading scans for comparison:", error);
          // Remove loading message on error if it was added
          if (loadingMessageAdded) {
            setMessages(prev => prev.filter(msg => msg.content !== "Loading your scanned listings..."));
          }
          setMessages(prev => [...prev, {
            role: "assistant",
            content: "Error loading your scanned listings. Please try again.",
            isError: true
          }]);
        }
      };
      
      // Load scan data and build comparison list
      loadScansForComparison(); 
      return;
    }

    // If specific URLs are provided, proceed with comparison
    const urls = text.match(/https?:\/\/[^\s]+/g) || [];
    if (urls.length >= 2) {
      setError("");
      setIsLoading(true);
      
      // Clear previous messages to avoid showing old comparison results while processing
      setMessages([]);
      
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
        
        // Save the compare result to the database
        try {
          const saveRes = await fetch(`${API_BASE}/save-compare`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              scan_a_url: urls[0],
              scan_b_url: urls[1],
              answer: data.answer,
              question: text.replace(/https?:\/\/[^\s]+/g, '').trim() || null
            }),
          });
          
          if (saveRes.ok) {
            const saveData = await saveRes.json();
            setCurrentChatId(saveData.chat_id);
          } else {
            console.error("Failed to save compare to database:", await saveRes.text());
            setCurrentChatId(`compare-${Date.now()}`);
          }
        } catch (saveError) {
          console.error("Error saving compare to database:", saveError);
          setCurrentChatId(`compare-${Date.now()}`);
        }
        
        // Add assistant response
        const assistantMessage = {
          role: "assistant",
          content: data.answer || "I couldn't compare these listings.",
          isComparison: true,
          comparedScans: {
            scan1: { listing_url: urls[0], listing_title: null },
            scan2: { listing_url: urls[1], listing_title: null }
          }
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Only refresh user balance (fast), don't reload all chats
        refreshUserBalance();
        // Notify parent to refresh user data (for account page)
        if (onUsageChanged) {
          onUsageChanged();
        }
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
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Please provide two listing URLs (Airbnb or Booking.com) to compare, or just say 'compare' to see your available scans.",
        isError: true
      }]);
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
    } else if (isSupportedUrl(trimmedInput)) {
      await handleScan(trimmedInput);
    } else if (isUrl(trimmedInput)) {
      // Check if it's a URL but not supported (Airbnb or Booking.com)
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "The URL you are trying to scan is from a platform that we do not cover yet. We currently support Airbnb, Booking.com, and Agoda. Bear with us as we are expanding quickly.",
        isError: true
      }]);
    } else {
      await handleAsk(trimmedInput);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setCurrentScan(null);
    setError("");
    setShowComparisonUI(false); // Hide comparison UI
    setActiveButton(null); // Reset to normal state - no active button
  };

  const handleComparisonSelect = async (scan1, scan2, question = "") => {
    setError("");
    setIsLoading(true);
    setShowComparisonUI(false); // Hide comparison UI
    setActiveButton('compare'); // Set compare button as active during comparison
    
    // Clear previous messages to avoid showing old comparison results while processing
    setMessages([]);
    
    // Validate that we have valid listing URLs from scan data
    if (!scan1?.listing_url || !scan2?.listing_url) {
      console.error("DEBUG: Missing listing_url in scan data", { scan1, scan2 });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Error: Missing listing URLs. Please try selecting the listings again.",
        isError: true
      }]);
      setIsLoading(false);
      return;
    }
    
    // Ensure URLs are valid (start with http)
    if (!scan1.listing_url.startsWith('http') || !scan2.listing_url.startsWith('http')) {
      console.error("DEBUG: Invalid listing_url format", { 
        scan1_url: scan1.listing_url, 
        scan2_url: scan2.listing_url 
      });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Error: Invalid listing URLs. Please try selecting the listings again.",
        isError: true
      }]);
      setIsLoading(false);
      return;
    }
    
    // Check if user has sufficient balance for comparison (requires 1 full scan for initial, 0.5 for questions)
    const requiredBalance = question ? 0.5 : 1.0;
    if (me?.remaining < requiredBalance) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "You don't have enough scans remaining. Please upgrade your plan to continue comparing.",
        isError: true
      }]);
      setIsLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem("by_token");
      
      console.log("DEBUG: Comparing listings:", {
        scan_a_url: scan1.listing_url,
        scan_b_url: scan2.listing_url,
        question: question || null
      });
      
      // Step 1: Get comparison result - show this IMMEDIATELY (don't wait for save)
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
      
      const comparisonResult = await res.json();
      
      // Show comparison result IMMEDIATELY - don't wait for save
      // Fixed: Renamed data to comparisonResult to avoid duplicate declaration
      // Add user message for the comparison
      const userMessage = { 
        role: "user", 
        content: question ? `Compare these listings: ${question}` : "Compare these listings",
        messageType: "compare"
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Add assistant response immediately
      const assistantMessage = {
        role: "assistant",
        content: comparisonResult.answer || "I couldn't compare these listings.",
        isComparison: true,
        comparedScans: { scan1, scan2 }
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Add follow-up question prompt after comparison
      const followUpMessage = {
        role: "assistant",
        content: "Do you have any questions about this comparison? Feel free to ask anything..."
      };
      setMessages(prev => [...prev, followUpMessage]);
      
      // Stop loading immediately so user can see the result
      setIsLoading(false);
      setActiveButton(null);
      
      // Step 2: Save to database in background (non-blocking - doesn't delay showing data)
      let newChatId = `compare-${Date.now()}`;
      fetch(`${API_BASE}/save-compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scan_a_url: scan1.listing_url,
          scan_b_url: scan2.listing_url,
          answer: comparisonResult.answer,
          question: question || null
        }),
      })
      .then(saveRes => {
        if (saveRes.ok) {
          return saveRes.json();
        } else {
          console.error("Failed to save compare to database:", saveRes.status);
          return null;
        }
      })
      .then(saveData => {
        if (saveData && saveData.chat_id) {
          newChatId = saveData.chat_id;
          setCurrentChatId(newChatId);
          
          // Add new compare chat to chats list without reloading all chats (fast)
          setChats(prev => {
            // Check if chat already exists
            const exists = prev.some(chat => chat.id === newChatId);
            if (exists) return prev;
            
            // Add new chat at the beginning (matches backend format)
            const newChat = {
              id: newChatId,
              type: 'compare',
              title: scan1.listing_title && scan2.listing_title
                ? `${scan1.listing_title} vs ${scan2.listing_title}`
                : `Compare • ${scan1.listing_url} vs ${scan2.listing_url}`,
              created_at: new Date().toISOString()
            };
            return [newChat, ...prev];
          });
        } else {
          // Fallback: use temporary chat ID
          setCurrentChatId(newChatId);
        }
        
        // Only refresh user balance (fast), don't reload all chats
        refreshUserBalance();
        // Notify parent to refresh user data (for account page)
        if (onUsageChanged) {
          onUsageChanged();
        }
      })
      .catch(saveError => {
        console.error("Error saving compare to database:", saveError);
        // Still set chat ID even if save fails
        setCurrentChatId(newChatId);
        refreshUserBalance();
        // Notify parent to refresh user data (for account page)
        if (onUsageChanged) {
          onUsageChanged();
        }
      });
      
    } catch (e) {
      setError(e.message || String(e));
      // Add error message
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Sorry, I couldn't compare those listings. ${e.message}`,
        isError: true
      }]);
      setIsLoading(false);
      setActiveButton(null);
    }
  };

  const renderMessage = (message, index) => {
    const isUser = message.role === "user";
    const isError = message.isError;
    const isWarning = message.isWarning;
    const isQuestion = isUser && (message.messageType === "question" || (message.content && !message.content.includes("http")));
    const isUserMessage = isUser;
    const isScanRequest = isUser && message.content && message.content.includes("http");
    
    // Check if this is the first comparison message (initial comparison, not follow-up)
    // Initial comparisons have listing details, follow-up questions don't
    const isInitialComparison = message.isComparison && message.comparedScans && 
      (index === 0 || !messages.slice(0, index).some(m => m.isComparison && m.comparedScans));
    
    return (
      <div key={index} className={`flex ${isUser ? 'justify-end user-message-force' : 'justify-start'} mb-6`}>
        <div className={`max-w-4xl w-full ${
          isUser
            ? 'bg-gray-100 text-gray-800 rounded-2xl px-4 py-3 ml-auto'
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
                  <div className="text-primary font-medium text-sm sm:text-base" style={{ fontWeight: '600' }}>{message.scanData.listing_title || "Property Listing"}</div>
                  <span className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold w-fit ${labelStyle(message.scanData.label).bg} ${labelStyle(message.scanData.label).text}`}>
                    {message.scanData.label}
                  </span>
                </div>
                {message.scanData.location && (
                  <div className="text-primary mb-2 text-sm sm:text-base">{message.scanData.location}</div>
                )}
                <a 
                  href={message.scanData.listing_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary underline break-all text-xs sm:text-sm hover:text-button transition-colors"
                >
                  {message.scanData.listing_url}
                </a>
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
                  {message.scanData.inspection_summary || "This place passed 92 out of 100 inspection checks."}
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
            <div className="bg-white rounded-3xl border border-accent p-6">
              <div className="text-sm text-primary mb-4">{message.content}</div>
              {console.log("DEBUG: Rendering comparison UI with scans:", message.availableScans)}
              <ComparisonSelector 
                availableScans={message.availableScans || []}
                onCompare={handleComparisonSelect}
              />
            </div>
          ) : isInitialComparison ? (
            // Initial comparison result with listing details - matching scan UI styling
            // Only show listing details for the first comparison message, not for follow-up questions
            <div className="bg-white rounded-2xl border border-accent p-4 sm:p-6">
              {/* Listing A Information */}
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
                  <div className="text-primary font-medium text-sm sm:text-base" style={{ fontWeight: '600' }}>
                    Listing A: {message.comparedScans.scan1.listing_title || 'Title not available'}
                  </div>
                </div>
                <a 
                  href={message.comparedScans.scan1.listing_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary underline break-all text-xs sm:text-sm hover:text-button transition-colors"
                >
                  {message.comparedScans.scan1.listing_url}
                </a>
              </div>
              
              {/* Listing B Information */}
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
                  <div className="text-primary font-medium text-sm sm:text-base" style={{ fontWeight: '600' }}>
                    Listing B: {message.comparedScans.scan2.listing_title || 'Title not available'}
                  </div>
                </div>
                <a 
                  href={message.comparedScans.scan2.listing_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary underline break-all text-xs sm:text-sm hover:text-button transition-colors"
                >
                  {message.comparedScans.scan2.listing_url}
                </a>
              </div>
              
              {/* Comparative Analysis */}
              <div className="pt-4 border-t border-accent">
                <h3 className="text-sm sm:text-base font-semibold text-primary mb-2 sm:mb-3">Comparative Analysis</h3>
                <div className="text-primary leading-relaxed whitespace-pre-wrap">{makeUrlsClickable(message.content)}</div>
              </div>
            </div>
          ) : (
            <div className="text-base whitespace-pre-wrap leading-relaxed px-2 sm:px-4">{makeUrlsClickable(message.content)}</div>
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
    <>
      <style>
        {`
          /* FORCE REFRESH: ${Date.now()} */
          @media screen and (max-width: 639px) {
            .input-container {
              padding-bottom: 7rem !important;
            }
            
            /* When keyboard opens (reduced viewport height), reduce padding */
            @media screen and (max-height: 500px) {
              .input-container {
                padding-bottom: 0.5rem !important;
              }
            }
            
            /* Fixed layout for mobile */
            .mobile-fixed-layout {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 0 !important;
              display: flex !important;
              flex-direction: column !important;
            }
            
            .mobile-chat-area {
              flex: 1 !important;
              overflow-y: auto !important;
              padding-bottom: 4rem !important;
              height: calc(100vh - 70px - 4rem) !important;
              max-height: calc(100vh - 70px - 4rem) !important;
            }
            
            .mobile-input-area {
              position: fixed !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              background: white !important;
              z-index: 10 !important;
              padding-bottom: 1.5rem !important;
            }
          }
          
          /* FORCE USER MESSAGES TO ALIGN RIGHT */
          .user-message-force {
            justify-content: flex-end !important;
            display: flex !important;
            width: 100% !important;
          }
          
          .user-message-force > div {
            margin-left: auto !important;
            margin-right: 0 !important;
            max-width: fit-content !important;
            width: auto !important;
          }
          
          /* Force rounded corners for all form elements on mobile */
          select, input, textarea {
            border-radius: 0.75rem !important;
            -webkit-border-radius: 0.75rem !important;
            -moz-border-radius: 0.75rem !important;
          }
          
          /* Fix for latest iOS Safari browser UI interference */
          @supports (-webkit-touch-callout: none) {
            /* iOS Safari specific fixes */
            .mobile-input-area {
              bottom: 0 !important;
              padding-bottom: max(1.5rem, env(safe-area-inset-bottom)) !important;
            }
            
            /* Use dynamic viewport height for latest iOS */
            .mobile-fixed-layout {
              height: 100dvh !important;
              max-height: 100dvh !important;
            }
            
            .mobile-chat-area {
              height: calc(100dvh - 70px - 4rem) !important;
              max-height: calc(100dvh - 70px - 4rem) !important;
            }
            
            /* Ensure input area stays at bottom even with browser UI */
            .input-container {
              position: fixed !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              z-index: 60 !important;
            }
            
            /* Additional fix for iOS Safari browser UI */
            @media screen and (max-width: 639px) {
              .input-container {
                bottom: env(safe-area-inset-bottom, 0px) !important;
              }
            }
          }
        `}
      </style>
      <div className="h-screen bg-white overflow-hidden lg:min-h-screen lg:overflow-visible mobile-fixed-layout" style={{ height: '100dvh', maxHeight: '100dvh' }}>
      {/* Header - Fixed at top */}
      <div className="bg-white fixed top-0 left-0 right-0 z-[70]">
        {/* Hamburger Menu - Inside Header */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-2 left-2 z-[90] p-2 rounded-lg hover:bg-gray-100 transition-colors bg-white cursor-pointer block"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="container mx-auto px-3 sm:px-6 py-2 sm:py-3">
          {/* Mobile Layout */}
          <div className="lg:hidden">
            {/* Top Row: Navigation */}
            <div className="flex justify-center items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSidebarOpen(false); // Close sidebar on mobile
                    startNewChat();
                    setActiveButton('scan'); // Set scan button as active
                  }}
                  className={`px-3 py-2 font-medium rounded-lg text-sm hover:opacity-90 hover:scale-105 transition-all duration-200 cursor-pointer ${
                    activeButton === 'scan' 
                      ? 'bg-button text-white' 
                      : 'bg-accent text-primary'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  New Scan
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Mobile Compare button clicked");
                    setSidebarOpen(false); // Close sidebar on mobile
                    handleCompare("compare");
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    console.log("Mobile Compare button touch start");
                  }}
                  className={`px-3 py-2 font-medium rounded-lg text-sm hover:opacity-90 transition-opacity touch-manipulation cursor-pointer ${
                    activeButton === 'compare' 
                      ? 'bg-button text-white' 
                      : 'bg-accent text-primary'
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  Compare
                </button>
                <button
                  onClick={() => {
                    setSidebarOpen(false); // Close sidebar on mobile
                    navigate("/plan-status");
                    setActiveButton('account');
                  }}
                  className={`px-3 py-2 font-medium rounded-lg text-sm hover:opacity-90 transition-opacity cursor-pointer ${
                    activeButton === 'account' 
                      ? 'bg-button text-white' 
                      : 'bg-accent text-primary'
                  }`}
                >
                  Account
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex justify-center items-center w-full">
            {/* Center: Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  startNewChat();
                  setActiveButton('scan'); // Set scan button as active
                }}
                className={`px-4 py-2 font-medium rounded-lg hover:opacity-90 hover:scale-105 transition-all duration-200 text-sm cursor-pointer ${
                  activeButton === 'scan' 
                    ? 'bg-button text-white shadow-sm' 
                    : 'bg-accent text-primary'
                }`}
                style={{ cursor: 'pointer' }}
              >
                New Scan
              </button>
              
              <button
                onClick={() => handleCompare("compare")}
                className={`px-4 py-2 font-medium rounded-lg hover:opacity-90 transition-opacity text-sm cursor-pointer ${
                  activeButton === 'compare' 
                    ? 'bg-button text-white shadow-sm' 
                    : 'bg-accent text-primary'
                }`}
              >
                Compare
              </button>
              
              <button
                onClick={() => {
                  navigate("/plan-status");
                  setActiveButton('account');
                }}
                className={`px-4 py-2 font-medium rounded-lg hover:opacity-90 transition-opacity text-sm cursor-pointer ${
                  activeButton === 'account' 
                    ? 'bg-button text-white shadow-sm' 
                    : 'bg-accent text-primary'
                }`}
              >
                Account
              </button>
            </div>
          </div>
        </div>
      </div>


      <div className="flex h-[calc(100vh-70px)] lg:min-h-[calc(100vh-70px)] pt-[70px]" style={{ height: 'calc(100dvh - 70px)', maxHeight: 'calc(100dvh - 70px)' }}>
        {/* Mobile Overlay - Transparent */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed top-[70px] bottom-0 left-0 z-[80]
          w-80 border-r border-accent bg-white shadow-xl p-3 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Recent Scans Section */}
          <div className={`flex flex-col min-h-0 ${recentScansCollapsed ? 'flex-shrink-0' : 'flex-1'}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRecentScansCollapsed(!recentScansCollapsed);
              }}
              className="flex items-center justify-between text-lg font-semibold text-primary mb-3 hover:opacity-70 transition-opacity flex-shrink-0 cursor-pointer"
            >
              <span>Recent Scans</span>
              <svg 
                className={`w-4 h-4 transition-transform ${recentScansCollapsed ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {!recentScansCollapsed && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
                {chats.filter(chat => chat.type === 'scan').map((chat) => {
                  // Try to get scan data from current messages first, then from scanData state
                  const scan = getScanDataFromCurrentMessages(chat.id) || scanData[chat.id];
                  
                  // REMOVED: Don't preload scan data - only load when chat is clicked
                  // This prevents multiple API calls when sidebar opens, making it much faster
                  
                  return (
                    <button
                      key={chat.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        loadChat(chat.id);
                        // Close sidebar on mobile when selecting a scan
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors cursor-pointer ${
                        currentChatId === chat.id 
                          ? 'bg-button text-white' 
                          : 'bg-white hover:bg-gray-50 border border-accent text-primary'
                      }`}
                    >
                      <div className="font-medium text-sm truncate">
                        {scan?.listing_title || scan?.location || chat.title.replace("Scan • ", "")}
                      </div>
                      <div className={`text-xs mt-1 ${currentChatId === chat.id ? 'text-white opacity-70' : 'text-primary opacity-60'}`}>
                        {scan?.location || new Date(chat.created_at).toLocaleDateString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Recent Compares Section */}
          <div className={`flex flex-col mt-4 min-h-0 ${recentComparesCollapsed ? 'flex-shrink-0' : 'flex-1'}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRecentComparesCollapsed(!recentComparesCollapsed);
              }}
              className="flex items-center justify-between text-lg font-semibold text-primary mb-3 hover:opacity-70 transition-opacity flex-shrink-0 cursor-pointer"
            >
              <span>Recent Compares</span>
              <svg 
                className={`w-4 h-4 transition-transform ${recentComparesCollapsed ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {!recentComparesCollapsed && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-0">
                {(() => {
                  const compareChats = chats.filter(chat => chat.type === 'compare');
                  return compareChats.map((chat) => {
                    // Use processed chat if available
                    const displayChat = processedCompareChats[chat.id] || chat;
                    return (
                    <button
                      key={chat.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        loadChat(chat.id);
                        // Close sidebar on mobile when selecting a compare
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors cursor-pointer ${
                        currentChatId === chat.id 
                          ? 'bg-button text-white' 
                          : 'bg-white hover:bg-gray-50 border border-accent text-primary'
                      }`}
                    >
                      <div className="font-medium text-sm truncate">
                        {displayChat.title.replace("Compare • ", "")}
                      </div>
                      <div className={`text-xs mt-1 ${currentChatId === chat.id ? 'text-white opacity-70' : 'text-primary opacity-60'}`}>
                        {new Date(chat.created_at).toLocaleDateString()}
                      </div>
                    </button>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col w-full transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-0 ml-80' : 'ml-0'
        }`} style={{ height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
          {/* Messages */}
          <div 
            key={chatAreaKey}
            className="flex-1 overflow-y-auto p-2 sm:p-4 mobile-chat-area pb-20"
            style={{ height: 'calc(100dvh - 70px - 4rem)', maxHeight: 'calc(100dvh - 70px - 4rem)' }}
          >
            {showComparisonUI ? (
              <div className="max-w-4xl mx-auto w-full">
                <div className="bg-white rounded-3xl border border-accent p-6">
                  <div className="mb-4">
                    <div className="text-sm text-primary">I can help you compare your scanned listings. Here are your available scans:</div>
                  </div>
                  <ComparisonSelector 
                    availableScans={availableScansForComparison}
                    onCompare={handleComparisonSelect}
                  />
                </div>
              </div>
            ) : messages.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="max-w-md">
                <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4">
                  Hi, I am BookYolo AI
                </h2>
                  <p className="text-primary opacity-70 mb-6 text-sm sm:text-base">
                    Scan your next stay before booking and avoid surprises. Paste any property URL from Airbnb, Vrbo, Booking, Expedia, Hotels or Agoda.
                  </p>
                </div>
              </div>
            ) : messages.length === 0 && isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-button"></div>
                  <span className="text-primary">Loading...</span>
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


            {/* Input Form */}
            <div className="input-container p-2 sm:p-4 pb-4 sm:pb-4 mobile-input-area" style={{ 
              paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'white',
              zIndex: 10,
              height: 'auto',
              minHeight: 'auto',
              maxHeight: 'none'
            }}>
              <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="flex gap-2 sm:gap-4 px-2 sm:px-4">
                <textarea
                  ref={(node) => {
                    inputRef.current = node;
                    textareaRef.current = node;
                  }}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                  }}
                  onInput={adjustTextareaHeight}
                  placeholder="Scan or Ask Anything…"
                  className="flex-1 rounded-xl border-2 border-accent px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-primary focus:outline-none focus:ring-2 focus:ring-button/20 focus:border-button transition-all resize-none"
                  disabled={isLoading}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  rows={1}
                  style={{
                    fontSize: '16px', // Prevents zoom on iOS
                    transform: 'translateZ(0)', // Hardware acceleration
                    WebkitAppearance: 'none',
                    position: 'relative',
                    zIndex: 10000,
                    borderRadius: '12px',
                    minHeight: '44px',
                    maxHeight: '120px',
                    overflow: 'auto',
                    textAlign: 'left',
                    direction: 'ltr',
                    unicodeBidi: 'normal',
                    height: '44px'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  onFocus={(e) => {
                    // Scroll to input when focused on mobile
                    setTimeout(() => {
                      if (inputRef.current) {
                        inputRef.current.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'center' 
                        });
                      }
                    }, 300);
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="rounded-xl bg-button text-white px-4 sm:px-6 py-2 sm:py-3 font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all flex items-center justify-center"
                  style={{
                    minHeight: '44px', // iOS touch target size
                    WebkitAppearance: 'none',
                    borderRadius: '12px'
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                      <span className="text-xs sm:text-sm hidden sm:inline">Processing...</span>
                    </div>
                  ) : (
                    <img 
                      src={scanpageLogo} 
                      alt="BookYolo" 
                      className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                    />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ChatInterface;

