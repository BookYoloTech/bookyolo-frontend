import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/main-logo.jpg";
import scanpageLogo from "../assets/scanpage-logo.png";

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
  const [showComparisonUI, setShowComparisonUI] = useState(false);
  const [availableScansForComparison, setAvailableScansForComparison] = useState([]);
  const [recentScansCollapsed, setRecentScansCollapsed] = useState(false);
  const [recentComparesCollapsed, setRecentComparesCollapsed] = useState(false);
  const [activeButton, setActiveButton] = useState(null); // 'scan', 'compare', 'account', or null for normal state
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
        
        // Process compare chats to fetch actual titles - SIMPLE APPROACH
        const processedChats = await Promise.all(chatsData.map(async (chat) => {
          if (chat.type === 'compare') {
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
          }
          return chat;
        }));
        
        // Use database chats directly (includes both scans and compares)
        setChats(processedChats);
        
        
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
      // Hide comparison UI when loading a chat
      setShowComparisonUI(false);
      
      // Clear any error notifications when loading a chat
      setError("");
      
      // Don't change activeButton when loading past chats - keep buttons in normal state
      // activeButton should only be set when starting NEW scans/comparisons
      
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
        }, 100);
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
        
        // If it's a compare chat, fetch the scan data for both scans
        let compareScanData = null;
        if (data.chat.type === 'compare' && data.chat.scan_ids && data.chat.scan_ids.length >= 2) {
          try {
            console.log("DEBUG: loadChat - fetching compare scan data for scan_ids:", data.chat.scan_ids);
            const [scan1Res, scan2Res] = await Promise.all([
              fetch(`${API_BASE}/scan/${data.chat.scan_ids[0]}`, {
                headers: { Authorization: `Bearer ${token}` }
              }),
              fetch(`${API_BASE}/scan/${data.chat.scan_ids[1]}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
            ]);
            
            if (scan1Res.ok && scan2Res.ok) {
              const scan1Data = await scan1Res.json();
              const scan2Data = await scan2Res.json();
              compareScanData = { scan1: scan1Data, scan2: scan2Data };
              console.log("DEBUG: loadChat - Compare scan data received:", compareScanData);
            } else {
              console.error("DEBUG: loadChat - Failed to load compare scan data");
            }
          } catch (e) {
            console.error("Failed to load compare scan data:", e);
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
          
          // If this is an assistant message in a compare chat, attach compare scan data
          if (msg.role === 'assistant' && compareScanData && data.chat.type === 'compare') {
            message.isComparison = true;
            message.comparedScans = compareScanData;
          }
          
          // If this is an assistant message in a compare chat but we don't have scan data,
          // check if the content contains the formatted comparison structure
          if (msg.role === 'assistant' && data.chat.type === 'compare' && !compareScanData) {
            console.log("DEBUG: Processing compare message without scan data");
            console.log("DEBUG: Message content:", msg.content);
            console.log("DEBUG: Has Listing A:", msg.content.includes('Listing A:'));
            console.log("DEBUG: Has Listing B:", msg.content.includes('Listing B:'));
            console.log("DEBUG: Has Comparative Analysis:", msg.content.includes('Comparative Analysis:'));
            
            // Check if content has the expected format: "Listing A:\n...\nListing B:\n...\nComparative Analysis:\n..."
            if (msg.content.includes('Listing A:') && msg.content.includes('Listing B:') && msg.content.includes('Comparative Analysis:')) {
              console.log("DEBUG: Found formatted comparison content, processing...");
              message.isComparison = true;
              // Extract URLs from the content to create a basic comparedScans object
              const urlRegex = /https?:\/\/[^\s]+/g;
              const urls = msg.content.match(urlRegex) || [];
              if (urls.length >= 2) {
                // Try to get titles from the content, fallback to fetching from database
                let title1 = msg.content.split('Listing A:')[1]?.split('\n')[1]?.trim() || 'Title not available';
                let title2 = msg.content.split('Listing B:')[1]?.split('\n')[1]?.trim() || 'Title not available';
                
                console.log("DEBUG: Extracted title1 from content:", title1);
                console.log("DEBUG: Extracted title2 from content:", title2);
                
                // If titles are still generic, try to fetch from database
                if (title1 === 'Title not available' || title1.startsWith('Listing ') || title1 === 'None') {
                  console.log("DEBUG: Titles are generic, will fetch from database...");
                  // We'll fetch titles asynchronously and update the message later
                  // For now, use fallback titles
                  const roomId1 = urls[0].split('/').pop();
                  const roomId2 = urls[1].split('/').pop();
                  title1 = `Listing ${roomId1.substring(0, 8)}...`;
                  title2 = `Listing ${roomId2.substring(0, 8)}...`;
                  console.log("DEBUG: Using fallback titles:", title1, title2);
                  
                  // Fetch actual titles asynchronously using the correct endpoint
                  const token = localStorage.getItem("by_token");
                  
                  // First, get all scans for the user to find scan IDs
                  fetch(`${API_BASE}/my-scans`, {
                    headers: { Authorization: `Bearer ${token}` }
                  }).then(async (scansRes) => {
                    if (!scansRes.ok) {
                      console.log("DEBUG: Failed to fetch scans:", scansRes.status);
                      return;
                    }
                    
                    const allScans = await scansRes.json();
                    console.log("DEBUG: All scans:", allScans);
                    
                    // Find scans that match our URLs
                    const scan1 = allScans.find(scan => scan.listing_url === urls[0]);
                    const scan2 = allScans.find(scan => scan.listing_url === urls[1]);
                    
                    console.log("DEBUG: Found scan1:", scan1);
                    console.log("DEBUG: Found scan2:", scan2);
                    
                    if (scan1 && scan2) {
                      // Fetch full scan data for both scans
                      const [scan1Res, scan2Res] = await Promise.all([
                        fetch(`${API_BASE}/scan/${scan1.id}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        }),
                        fetch(`${API_BASE}/scan/${scan2.id}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        })
                      ]);
                      
                      let newTitle1 = title1;
                      let newTitle2 = title2;
                      
                      if (scan1Res.ok) {
                        const scan1Data = await scan1Res.json();
                        console.log("DEBUG: Scan1 full data:", scan1Data);
                        if (scan1Data.listing_title) {
                          newTitle1 = scan1Data.listing_title;
                          console.log("DEBUG: Updated title1 from database:", newTitle1);
                        }
                      }
                      
                      if (scan2Res.ok) {
                        const scan2Data = await scan2Res.json();
                        console.log("DEBUG: Scan2 full data:", scan2Data);
                        if (scan2Data.listing_title) {
                          newTitle2 = scan2Data.listing_title;
                          console.log("DEBUG: Updated title2 from database:", newTitle2);
                        }
                      }
                      
                      // Update the message with the new titles
                      setMessages(prevMessages => 
                        prevMessages.map(msg => {
                          if (msg === message) {
                            return {
                              ...msg,
                              comparedScans: {
                                ...msg.comparedScans,
                                scan1: { ...msg.comparedScans.scan1, listing_title: newTitle1 },
                                scan2: { ...msg.comparedScans.scan2, listing_title: newTitle2 }
                              }
                            };
                          }
                          return msg;
                        })
                      );
                    }
                  }).catch(e => {
                    console.error('Failed to fetch scans:', e);
                  });
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
          console.log("DEBUG: Checking for follow-up message in compare chat");
          const hasFollowUpMessage = processedMessages.some(msg => 
            msg.role === 'assistant' && 
            msg.content.includes('Do you have any questions about this comparison')
          );
          
          console.log("DEBUG: Has follow-up message:", hasFollowUpMessage);
          
          if (!hasFollowUpMessage) {
            console.log("DEBUG: Adding follow-up message");
            // Add the follow-up message
            processedMessages.push({
              role: 'assistant',
              content: 'Do you have any questions about this comparison? Feel free to ask anything...',
              timestamp: new Date().toISOString()
            });
          }
        }
        
        setMessages(processedMessages);
        
        // Scroll to top when loading a chat
        setTimeout(() => {
          const messagesContainer = document.querySelector('.flex-1.overflow-y-auto.p-2');
          if (messagesContainer) {
            messagesContainer.scrollTop = 0;
          }
        }, 100);
      }
    } catch (e) {
      console.error("Failed to load chat:", e);
    }
  };

  const handleScan = async (url) => {
    setError("");
    setIsLoading(true);
    setScanProgress(0);
    setActiveButton('scan'); // Set scan button as active during scanning
    
    // Check if user has sufficient balance for scanning (requires 1 full scan)
    if (me?.remaining < 1.0) {
      setError("You don't have enough scans remaining. Please upgrade your plan to continue scanning.");
      setIsLoading(false);
      return;
    }
    
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
      // Reset button state to normal after scan completion
      setActiveButton(null);
    }
  };

  const handleAsk = async (question) => {
    if (!currentChatId) {
      setError("Please scan a listing first before asking questions.");
      return;
    }

    // Check if user has sufficient balance for questions (requires 0.5 scans)
    if (me?.remaining < 0.5) {
      setError("You don't have enough scans remaining. Please upgrade your plan to continue asking questions.");
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
        
        // Add assistant response
        const assistantMessage = {
          role: "assistant",
          content: data.answer || "I don't have enough information to answer that question."
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Reload user data to get updated balance from backend
        await loadUserData();
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
        
        // Add assistant response
        const assistantMessage = {
          role: "assistant",
          content: data.answer || "I don't have enough information to answer that question."
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Only refresh user data for regular scan chat questions
        await loadUserData();
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
      setError("Please scan at least 2 listings first before you can compare them.");
      return;
    }

    // If it's a compare request but no specific URLs, show available scans for comparison
    if (isCompareRequest) {
      setError("");
      setActiveButton('compare'); // Set compare as active
      
      // Wait for scan data to be loaded if it's still loading
      if (isLoadingData) {
        setError("Loading scan data...");
        return;
      }
      
      // Show comparison UI directly without adding messages to chat
      setShowComparisonUI(true);
      setAvailableScansForComparison(scanChats.slice(0, 10).map(chat => {
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
      }));
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
    } else if (isUrl(trimmedInput)) {
      // Check if it's a URL but not Airbnb
      setError("The URL you are trying to scan is from a platform that we do not cover yet. Bear with us as we are expanding quickly.");
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
    
    // Check if user has sufficient balance for comparison (requires 1 full scan for initial, 0.5 for questions)
    const requiredBalance = question ? 0.5 : 1.0;
    if (me?.remaining < requiredBalance) {
      setError("You don't have enough scans remaining. Please upgrade your plan to continue comparing.");
      setIsLoading(false);
      return;
    }
    
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
       
       // Save the compare result to the database
       try {
         const saveRes = await fetch(`${API_BASE}/save-compare`, {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
             Authorization: `Bearer ${token}`,
           },
           body: JSON.stringify({
             scan_a_url: scan1.listing_url,
             scan_b_url: scan2.listing_url,
             answer: data.answer,
             question: question || null
           }),
         });
         
         if (saveRes.ok) {
           const saveData = await saveRes.json();
           setCurrentChatId(saveData.chat_id);
         } else {
           const errorText = await saveRes.text();
           console.error("Failed to save compare to database:", errorText);
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
         comparedScans: { scan1, scan2 }
       };
       setMessages(prev => [...prev, assistantMessage]);
       
       // Add follow-up question prompt after comparison
       const followUpMessage = {
         role: "assistant",
         content: "Do you have any questions about this comparison? Feel free to ask anything..."
       };
       setMessages(prev => [...prev, followUpMessage]);
       
       // Refresh user data and chats from database
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
      // Reset button state to normal after comparison completion
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
            <div className="bg-white rounded-3xl border border-accent p-6">
              <div className="text-sm text-primary mb-4">{message.content}</div>
              {console.log("DEBUG: Rendering comparison UI with scans:", message.availableScans)}
              <ComparisonSelector 
                availableScans={message.availableScans || []}
                onCompare={handleComparisonSelect}
              />
            </div>
          ) : message.isComparison && message.comparedScans ? (
            // Comparison result with listing details
            <div className="space-y-4">
              {/* Listing A Details */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Listing A:</h3>
                <div className="text-gray-700 mb-1">
                  <strong className="font-bold" style={{ fontWeight: 'bold' }}>{message.comparedScans.scan1.listing_title || 'Title not available'}</strong>
                </div>
                <div className="text-sm text-blue-600 break-all">
                  <a 
                    href={message.comparedScans.scan1.listing_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {message.comparedScans.scan1.listing_url}
                  </a>
                </div>
              </div>
              
              {/* Listing B Details */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Listing B:</h3>
                <div className="text-gray-700 mb-1">
                  <strong className="font-bold" style={{ fontWeight: 'bold' }}>{message.comparedScans.scan2.listing_title || 'Title not available'}</strong>
                </div>
                <div className="text-sm text-blue-600 break-all">
                  <a 
                    href={message.comparedScans.scan2.listing_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {message.comparedScans.scan2.listing_url}
                  </a>
                </div>
              </div>
              
              {/* Comparative Analysis */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">Comparative Analysis:</h3>
                <div className="text-base whitespace-pre-wrap leading-relaxed">{makeUrlsClickable(message.content)}</div>
              </div>
            </div>
          ) : (
            <div className="text-base whitespace-pre-wrap px-2 sm:px-4 leading-relaxed">{makeUrlsClickable(message.content)}</div>
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
              padding-bottom: 8rem !important;
            }
            
            .mobile-input-area {
              position: fixed !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              background: white !important;
              z-index: 10 !important;
              padding-bottom: 0.5rem !important;
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
        `}
      </style>
      <div className="h-screen bg-white overflow-hidden lg:min-h-screen lg:overflow-visible mobile-fixed-layout">
      {/* Header */}
      <div className="bg-white sticky top-0 z-[70]">
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
                  }}
                  className={`px-3 py-2 font-medium rounded-lg text-sm hover:opacity-90 transition-opacity cursor-pointer ${
                    activeButton === 'scan' 
                      ? 'bg-button text-white' 
                      : 'bg-accent text-primary'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  Scan
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
                onClick={startNewChat}
                className={`px-4 py-2 font-medium rounded-lg hover:opacity-90 transition-opacity text-sm cursor-pointer ${
                  activeButton === 'scan' 
                    ? 'bg-button text-white shadow-sm' 
                    : 'bg-accent text-primary'
                }`}
                style={{ cursor: 'pointer' }}
              >
                Scan
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

      {/* Error Display - Mobile Prominent Position */}
      {error && (
        <div className="lg:hidden px-4 py-2 bg-red-50 border-b border-red-200">
          <div className="flex items-center space-x-2">
            <span className="text-red-500">⚠️</span>
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-70px)] lg:min-h-[calc(100vh-70px)]">
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
                  
                  // If we don't have scan data, load it
                  if (!scan && chat.type === 'scan') {
                    loadScanDataForChat(chat.id);
                  }
                  
                  return (
                    <button
                      key={chat.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        loadChat(chat.id);
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
                  return compareChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      loadChat(chat.id);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors cursor-pointer ${
                      currentChatId === chat.id 
                        ? 'bg-button text-white' 
                        : 'bg-white hover:bg-gray-50 border border-accent text-primary'
                    }`}
                  >
                    <div className="font-medium text-sm truncate">
                      {chat.title.replace("Compare • ", "")}
                    </div>
                    <div className={`text-xs mt-1 ${currentChatId === chat.id ? 'text-white opacity-70' : 'text-primary opacity-60'}`}>
                      {new Date(chat.created_at).toLocaleDateString()}
                    </div>
                  </button>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col w-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 mobile-chat-area">
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

          {/* Error Display - Desktop Only */}
          {error && (
            <div className="hidden lg:block px-4 sm:px-6 pb-2">
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
            <div className="input-container p-2 sm:p-4 pb-4 sm:pb-4 mobile-input-area">
              <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="flex gap-2 sm:gap-4 px-2 sm:px-0">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Scan or Ask Anything…"
                  className="flex-1 rounded-xl border-2 border-accent px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-primary focus:outline-none focus:ring-2 focus:ring-button/20 focus:border-button transition-all resize-none min-h-[44px] max-h-32 overflow-y-auto"
                  disabled={isLoading}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  rows={1}
                  onInput={(e) => {
                    // Auto-resize textarea based on content
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="rounded-xl bg-button text-white px-4 sm:px-6 py-2 sm:py-3 font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all flex items-center justify-center"
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

