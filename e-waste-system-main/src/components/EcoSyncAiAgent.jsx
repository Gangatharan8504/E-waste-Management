import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, HelpCircle, Settings, Key, Check } from "lucide-react";
import api from "../services/api";

function EcoSyncAiAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchUserRequests = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/requests/my");
          setRequests(res.data);
        } catch (err) {
          console.error("AI failed to load user requests", err);
        }
      }
    };
    if (isOpen) {
      fetchUserRequests();
    }
  }, [isOpen]);
  const [grokApiKey, setGrokApiKey] = useState(() => localStorage.getItem("grok_api_key") || "");
  const [apiKeyInput, setApiKeyInput] = useState(grokApiKey);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I am your EcoSync AI Agent. ♻️ I can help you identify e-waste, explain our pickup process, or guide you on data security. What would you like to know today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    { label: "What items do you accept?", query: "what items do you accept" },
    { label: "Is my device e-waste?", query: "is my device e-waste" },
    { label: "How does pickup work?", query: "how does pickup work" },
    { label: "Data security tips", query: "data security tips" }
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, showSettings]);

  const saveApiKey = (e) => {
    e.preventDefault();
    localStorage.setItem("grok_api_key", apiKeyInput);
    setGrokApiKey(apiKeyInput);
    setShowSettings(false);
  };

  const getLocalResponse = (query) => {
    const q = query.toLowerCase();

    if (q.includes("status") || q.includes("track") || q.includes("my request") || q.includes("my pickup")) {
      if (requests.length === 0) {
        return "You don't have any active e-waste pickup requests yet. Would you like me to help you schedule one?";
      }

      let summary = "Here is the current status of your e-waste pickup requests:\n\n";
      requests.forEach((req, idx) => {
        const dateStr = req.scheduledDate ? ` scheduled for **${req.scheduledDate}**` : "";
        const timeStr = req.scheduledTime ? ` at **${req.scheduledTime}**` : "";
        summary += `${idx + 1}. **Request #${req.id}** [${req.deviceType} - ${req.brand}]:\n`;
        summary += `   • Status: **${req.status}**\n`;
        if (req.scheduledDate || req.scheduledTime) {
          summary += `   • Schedule:${dateStr}${timeStr}\n`;
        }
        if (req.adminNotes) {
          summary += `   • Team Note: *"${req.adminNotes}"*\n`;
        }
        summary += "\n";
      });
      return summary;
    }

    if (q.includes("accept") || q.includes("items") || q.includes("categories")) {
      return "We accept a wide range of electronic waste (e-waste), including:\n\n• **Computers & Laptops** (CPUs, monitors, keyboards)\n• **Mobile Devices** (Phones, tablets, chargers)\n• **Home Appliances** (Microwaves, TVs, fans)\n• **Entertainment** (Consoles, DVD players, speakers)\n\n*Note: We do not accept hazardous chemical waste or broken mercury thermometers.*";
    }
    if (q.includes("is my device") || q.includes("e-waste") || q.includes("ewaste") || q.includes("identify")) {
      return "Generally, any device with a **battery, power cord, or electrical plug** that is broken, outdated, or no longer used is considered e-waste. Common examples include old keyboards, dead power banks, non-functional TVs, and obsolete smartphones. Recycling them keeps toxic lead and mercury out of landfills!";
    }
    if (q.includes("pickup") || q.includes("work") || q.includes("process") || q.includes("schedule")) {
      return "Disposing of your e-waste is simple:\n\n1. **Submit Request:** Go to the 'Create Pickup' page, enter details, pin your location, and submit.\n2. **Admin Review:** Our team will review the device details and schedule a pickup slot.\n3. **Collection:** A certified collection partner will arrive at your door to gather the devices safely.\n4. **Recycle:** The items are safely dismantled and processed at licensed recycling centers.";
    }
    if (q.includes("data") || q.includes("security") || q.includes("privacy") || q.includes("safe")) {
      return "Your privacy is extremely important. Before handing over computers, laptops, or mobile phones:\n\n• **Back up** any important files to cloud storage or an external hard drive.\n• **Perform a Factory Reset** on phones and tablets.\n• **Degauss/Format** hard drives if possible. Our certified recycling partners also perform physical destruction of storage components to ensure zero data leakage.";
    }
    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      return "Hi there! 👋 How can I help you with your e-waste recycling today?";
    }
    if (q.includes("thank") || q.includes("thanks")) {
      return "You're welcome! Thank you for choosing EcoSync and helping protect our environment! 🌍💚";
    }

    return "That's an interesting question! As an E-waste Recycling AI, I recommend scheduling a pickup request for any unwanted electronics. Recycling them ensures that valuable metals are recovered and toxic substances are kept safe. \n\nIs there anything specific you would like to know about our collection slots or accepted items?";
  };

  const handleSend = async (textToSend) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");

    setIsTyping(true);

    // Check if real Grok key is available
    if (grokApiKey.trim()) {
      try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${grokApiKey}`
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: "You are EcoSync AI, an expert e-waste recycling assistant. You answer questions about electronic waste recycling, disposal policies, accepted items, data privacy, and doorstep collections. Keep answers concise, friendly, and structured. " +
                         "The logged-in user's current requests are: " + JSON.stringify(requests) + ". " +
                         "If they ask to track or check the status of their requests, use this list to give them a personalized response summarizing their request status (Pending, Approved/Accepted, Scheduled, Completed, Rejected). Refer to requests by ID, and tell them date/time details if scheduled."
              },
              {
                role: "user",
                content: textToSend
              }
            ],
            model: "grok-beta",
            stream: false
          })
        });

        if (!response.ok) {
          throw new Error("Grok API response error");
        }

        const data = await response.json();
        const responseText = data.choices[0].message.content;

        setIsTyping(false);
        const aiMsg = {
          id: Date.now() + 1,
          sender: "ai",
          text: responseText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
        return;
      } catch (err) {
        console.error("Grok API Call failed, falling back to local model: ", err);
      }
    }

    // Local simulated response fallback
    setTimeout(() => {
      setIsTyping(false);
      const responseText = getLocalResponse(textToSend);
      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: responseText + (grokApiKey.trim() ? "" : "\n\n*(Running in Local Heuristics Mode. Configure a Grok API Key in settings for real-time model access)*"),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Bubble Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer"
        >
          {/* Active Ping Effect */}
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <MessageSquare className="w-6 h-6" />
          <span className="absolute right-16 bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md">
            Ask EcoSync AI Agent ♻️
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] h-[550px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slide-up">
          
          {/* Premium Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-5 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  EcoSync AI Agent <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                </h4>
                <span className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> 
                  {grokApiKey.trim() ? "Powered by Grok" : "Online Recycling Expert"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`text-emerald-100 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition cursor-pointer ${
                  showSettings ? "bg-white/20 text-white" : ""
                }`}
                title="Configure Grok API Key"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowSettings(false);
                }}
                className="text-emerald-100 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings ? (
            <div className="flex-1 p-6 bg-gray-50 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <Key className="w-4 h-4" /> Configure Grok API Key
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Enter your xAI (Grok) API Key below. When configured, queries are sent directly to Grok for intelligent, real-time responses. If left empty, the chatbot falls back to our local heuristics model.
                </p>
                <form onSubmit={saveApiKey} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Grok API Key</label>
                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="xai-..."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Save Configuration
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setApiKeyInput(grokApiKey);
                        setShowSettings(false);
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
              <div className="text-[10px] text-center text-gray-400 border-t border-gray-100 pt-4">
                API keys are stored securely in local storage.
              </div>
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all duration-200 ${
                        msg.sender === "user"
                          ? "bg-emerald-600 text-white rounded-tr-none"
                          : "bg-white text-gray-800 border border-gray-100 rounded-tl-none whitespace-pre-line"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}

                {/* Simulated Typing Indicator */}
                {isTyping && (
                  <div className="flex flex-col items-start">
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center shadow-sm">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick suggestions */}
              {messages.length === 1 && !isTyping && (
                <div className="px-4 py-2.5 border-t border-gray-50 bg-white">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-emerald-500" /> Suggestions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPrompts.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => handleSend(p.query)}
                        className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1.5 rounded-full hover:bg-emerald-100 active:scale-95 transition-all duration-200 text-left cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Form input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputText);
                }}
                className="p-3 border-t border-gray-100 bg-white flex gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask me anything about e-waste..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition disabled:opacity-50 disabled:hover:bg-emerald-600 cursor-pointer flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

        </div>
      )}
    </div>
  );
}

export default EcoSyncAiAgent;
