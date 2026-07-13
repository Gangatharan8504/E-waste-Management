import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, AlertTriangle, Recycle, Globe, Leaf, Zap, ShieldAlert, BadgeDollarSign, LifeBuoy } from "lucide-react";
import api from "../services/api";

function EcoBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // chat, identify, disposal, savings
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Tab 1: Identify State
  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [condition, setCondition] = useState("");
  const [idResult, setIdResult] = useState(null);
  const [decisionResult, setDecisionResult] = useState(null);
  const [loadingIdentify, setLoadingIdentify] = useState(false);

  // Tab 2: Disposal State
  const [disposalDevice, setDisposalDevice] = useState("");
  const [disposalQty, setDisposalQty] = useState(1);
  const [disposalResult, setDisposalResult] = useState(null);
  const [valueResult, setValueResult] = useState(null);
  const [loadingDisposal, setLoadingDisposal] = useState(false);

  // Tab 3: Savings State
  const [savingsDevice, setSavingsDevice] = useState("");
  const [savingsQty, setSavingsQty] = useState(1);
  const [savingsResult, setSavingsResult] = useState(null);
  const [loadingSavings, setLoadingSavings] = useState(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const [userRequests, setUserRequests] = useState([]);

  const fetchUserRequests = async () => {
    try {
      const res = await api.get("/requests/my");
      setUserRequests(res.data);
    } catch (err) {
      console.error("Failed to load user requests for suggestion chips:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserRequests();
      if (activeTab === "chat" && messages.length === 0) {
        loadChatHistory();
      }
    }
  }, [isOpen, activeTab]);

  const loadChatHistory = async () => {
    try {
      const res = await api.get("/ai/chat/history");
      const history = [];
      res.data.forEach((msg) => {
        history.push({ sender: "user", text: msg.prompt, id: msg.id + "_u" });
        history.push({ sender: "ai", text: msg.response, id: msg.id + "_a" });
      });
      if (history.length === 0) {
        history.push({
          sender: "ai",
          text: "Hi! I am EcoBot, your smart e-waste management assistant. Ask me questions about recycling electronics, or use the tabs above to classify devices and calculate environmental savings!",
          id: "welcome"
        });
      }
      setMessages(history);
    } catch (err) {
      console.error("Failed to load chat history:", err);
      setMessages([
        {
          sender: "ai",
          text: "Hi! I am EcoBot, your smart e-waste management assistant. Ask me questions about recycling electronics, or use the tabs above to classify devices and calculate environmental savings!",
          id: "welcome"
        }
      ]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText("");
    setMessages((prev) => [...prev, { sender: "user", text: userText, id: Date.now() }]);
    setIsTyping(true);

    try {
      const res = await api.post("/ai/chat", { prompt: userText });
      setMessages((prev) => [...prev, { sender: "ai", text: res.data.response, id: Date.now() + 1 }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Oops! I encountered an error. Please try again.", id: Date.now() + 1 }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleIdentify = async (e) => {
    e.preventDefault();
    if (!productName.trim() || !brand.trim()) return;

    setLoadingIdentify(true);
    setIdResult(null);
    setDecisionResult(null);

    try {
      const [idRes, decRes] = await Promise.all([
        api.post("/ai/identify", { productName, brand, productDescription: productDesc, condition }),
        api.post("/ai/decision", { productName, brand, productDescription: productDesc, condition })
      ]);
      setIdResult(idRes.data);
      setDecisionResult(decRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze device.");
    } finally {
      setLoadingIdentify(false);
    }
  };

  const handleDisposalAndValue = async (e) => {
    e.preventDefault();
    if (!disposalDevice.trim()) return;

    setLoadingDisposal(true);
    setDisposalResult(null);
    setValueResult(null);

    try {
      const [dispRes, valRes] = await Promise.all([
        api.post("/ai/disposal", { deviceType: disposalDevice }),
        api.post("/ai/value", { deviceType: disposalDevice, quantity: parseInt(disposalQty) })
      ]);
      setDisposalResult(dispRes.data);
      setValueResult(valRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to get disposal guide.");
    } finally {
      setLoadingDisposal(false);
    }
  };

  const handleSavings = async (e) => {
    e.preventDefault();
    if (!savingsDevice.trim()) return;

    setLoadingSavings(true);
    setSavingsResult(null);

    try {
      const res = await api.post("/ai/impact", {
        deviceType: savingsDevice,
        quantity: parseInt(savingsQty)
      });
      setSavingsResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to calculate environmental savings.");
    } finally {
      setLoadingSavings(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 font-sans flex flex-col items-end">
      {/* Floating Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
          }}
          className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-full p-4 shadow-xl flex items-center gap-2 group transition duration-300 transform hover:scale-105"
        >
          <Bot className="h-6 w-6 animate-pulse" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out font-semibold text-sm">
            EcoBot AI Assistant
          </span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-[calc(100vw-2rem)] md:w-96 h-[80vh] md:h-[600px] flex flex-col overflow-hidden transition-all duration-300 animate-slide-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-2 rounded-xl">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">EcoBot AI</h3>
                <span className="text-[10px] text-emerald-100 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-ping"></span>
                  Active Recycling Advisor
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-gray-50 border-b text-[10px] font-bold text-gray-500 overflow-x-auto">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 min-w-[70px] py-3 text-center transition border-b-2 ${
                activeTab === "chat" ? "border-emerald-600 text-emerald-600 bg-white" : "border-transparent hover:text-gray-700"
              }`}
            >
              Assistant
            </button>
            <button
              onClick={() => setActiveTab("identify")}
              className={`flex-1 min-w-[70px] py-3 text-center transition border-b-2 ${
                activeTab === "identify" ? "border-emerald-600 text-emerald-600 bg-white" : "border-transparent hover:text-gray-700"
              }`}
            >
              Identify
            </button>
            <button
              onClick={() => setActiveTab("disposal")}
              className={`flex-1 min-w-[70px] py-3 text-center transition border-b-2 ${
                activeTab === "disposal" ? "border-emerald-600 text-emerald-600 bg-white" : "border-transparent hover:text-gray-700"
              }`}
            >
              Disposal
            </button>
            <button
              onClick={() => setActiveTab("savings")}
              className={`flex-1 min-w-[70px] py-3 text-center transition border-b-2 ${
                activeTab === "savings" ? "border-emerald-600 text-emerald-600 bg-white" : "border-transparent hover:text-gray-700"
              }`}
            >
              Savings
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {/* CHAT TAB */}
            {activeTab === "chat" && (
              <div className="flex flex-col h-full justify-between">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[430px]">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-emerald-600 text-white rounded-br-none shadow-sm"
                            : "bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-100 text-gray-400 rounded-2xl rounded-bl-none px-4 py-2.5 text-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Active user requests suggestion chips */}
                {userRequests.length > 0 && (
                  <div className="px-1 py-1.5 border-t border-gray-100 mt-2">
                    <span className="text-[9px] font-bold text-gray-400 block mb-1 tracking-wider">
                      ASK ABOUT YOUR PENDING DEVICES:
                    </span>
                    <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
                      {userRequests.map((req) => (
                        <button
                          key={req.id}
                          type="button"
                          onClick={() => {
                            setInputText(`What is the status of my request ID #${req.id} for the ${req.brand} ${req.deviceType}?`);
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2.5 py-1.5 rounded-xl border border-emerald-150 whitespace-nowrap transition shadow-sm"
                        >
                          Status of {req.deviceType} (#{req.id})?
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSend} className="flex gap-2 pt-3 bg-gray-50 mt-auto">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask about e-waste recycling..."
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white rounded-xl p-2 hover:bg-emerald-700 transition"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            )}

            {/* IDENTIFY TAB */}
            {activeTab === "identify" && (
              <div className="space-y-4">
                <form onSubmit={handleIdentify} className="space-y-3 bg-white p-4 rounded-2xl shadow-sm border">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">Device Name</label>
                      <input
                        type="text"
                        placeholder="iPhone 11"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full border rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">Brand</label>
                      <input
                        type="text"
                        placeholder="Apple"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full border rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">Condition</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full border rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    >
                      <option value="">Select Condition</option>
                      <option value="Functional">Functional (Working)</option>
                      <option value="Minor Defects">Minor Defects (e.g. Scratched)</option>
                      <option value="Broken">Damaged (Not Working)</option>
                      <option value="Dead">Dead (Completely non-functional)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">Description</label>
                    <textarea
                      placeholder="e.g. cracked glass, battery bloat"
                      value={productDesc}
                      onChange={(e) => setProductDesc(e.target.value)}
                      className="w-full border rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none h-12 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingIdentify}
                    className="w-full bg-emerald-600 text-white rounded-xl py-2 text-xs font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {loadingIdentify ? "Analyzing Device..." : "Identify & Decide"}
                  </button>
                </form>

                {idResult && decisionResult && (
                  <div className="bg-white p-4 rounded-2xl shadow-sm border space-y-4 animate-fade-in text-xs">
                    {/* Identification block */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
                        <Recycle className="h-4 w-4 text-emerald-600" />
                        E-Waste Identification Report
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 p-2 rounded-xl">
                          <span className="text-[9px] text-gray-400 block">CATEGORY</span>
                          <span className="font-bold text-gray-700">{idResult.category}</span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-xl">
                          <span className="text-[9px] text-gray-400 block">E-WASTE TYPE</span>
                          <span className="font-bold text-gray-700">{idResult.eWasteCategory}</span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-xl">
                          <span className="text-[9px] text-gray-400 block">HAZARD INDEX</span>
                          <span className={`font-bold flex items-center gap-1 ${
                            idResult.hazardLevel?.toLowerCase() === "high" ? "text-red-600" :
                            idResult.hazardLevel?.toLowerCase() === "medium" ? "text-amber-600" : "text-green-600"
                          }`}>
                            <AlertTriangle className="h-3 w-3" />
                            {idResult.hazardLevel}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-xl">
                          <span className="text-[9px] text-gray-400 block">RECYCLABLE</span>
                          <span className="font-bold text-gray-700">{idResult.recyclablePercentage}</span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-xl">
                          <span className="text-[9px] text-gray-400 block">EST. REMAINING LIFE</span>
                          <span className="font-bold text-gray-700">{idResult.remainingLife}</span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-xl">
                          <span className="text-[9px] text-gray-400 block">CONFIDENCE SCORE</span>
                          <span className="font-bold text-emerald-700">{idResult.confidenceScore}</span>
                        </div>
                      </div>
                      <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                        <span className="text-[9px] text-emerald-800 font-bold block mb-0.5">VALUABLE MATERIALS</span>
                        <p className="text-emerald-700 leading-relaxed font-semibold">{idResult.valuableMaterials}</p>
                      </div>
                    </div>

                    {/* Decision block */}
                    <div className="border-t pt-3 space-y-2">
                      <h4 className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
                        <LifeBuoy className="h-4 w-4 text-emerald-600" />
                        EcoBot Recommendation
                      </h4>
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                        <span className="text-[10px] font-bold text-emerald-800 block">ACTION RECOMMENDED:</span>
                        <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase shadow-sm">
                          {decisionResult.recommendation}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-xl border">
                        {decisionResult.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DISPOSAL TAB */}
            {activeTab === "disposal" && (
              <div className="space-y-4">
                <form onSubmit={handleDisposalAndValue} className="space-y-3 bg-white p-4 rounded-2xl shadow-sm border">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">
                      Device / Item Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Laptop chassis, CRT Monitor"
                      value={disposalDevice}
                      onChange={(e) => setDisposalDevice(e.target.value)}
                      className="w-full border rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">
                      Quantity (For Value Estimation)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={disposalQty}
                      onChange={(e) => setDisposalQty(e.target.value)}
                      className="w-full border rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingDisposal}
                    className="w-full bg-emerald-600 text-white rounded-xl py-2 text-xs font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    {loadingDisposal ? "Fetching Disposal Guides..." : "Get Disposal Guidelines"}
                  </button>
                </form>

                {disposalResult && valueResult && (
                  <div className="bg-white p-4 rounded-2xl shadow-sm border space-y-4 animate-fade-in text-xs">
                    {/* Safe Disposal Guide */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4 text-emerald-600" />
                        Safe Disposal Guide
                      </h4>
                      <div className="bg-gray-50 p-2.5 rounded-xl border">
                        <span className="text-[9px] text-gray-500 font-bold block mb-1">STEP-BY-STEP STEPS</span>
                        <p className="text-gray-600 whitespace-pre-line leading-relaxed">{disposalResult.steps}</p>
                      </div>
                      <div className="bg-red-50 p-2.5 rounded-xl border border-red-100">
                        <span className="text-[9px] text-red-800 font-bold block mb-0.5">HAZARD WARNINGS</span>
                        <p className="text-red-700 leading-relaxed">{disposalResult.hazardWarnings}</p>
                      </div>
                      <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                        <span className="text-[9px] text-amber-800 font-bold block mb-0.5">BATTERY HANDLING</span>
                        <p className="text-amber-700 leading-relaxed">{disposalResult.batteryPrecautions}</p>
                      </div>
                      <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                        <span className="text-[9px] text-blue-800 font-bold block mb-0.5">DATA WIPING RECOMMENDATIONS</span>
                        <p className="text-blue-700 leading-relaxed">{disposalResult.dataWiping}</p>
                      </div>
                    </div>

                    {/* Value Estimation */}
                    <div className="border-t pt-3 space-y-2">
                      <h4 className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
                        <BadgeDollarSign className="h-4 w-4 text-emerald-600" />
                        Recycling Value Estimation
                      </h4>
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2.5 rounded-xl">
                        <span className="text-[9px] font-bold text-emerald-800 block">EST. RECYCLING VALUE</span>
                        <span className="font-bold text-emerald-700 text-sm">{valueResult.estimatedValue}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 p-2.5 rounded-xl border">
                          <span className="text-[9px] text-gray-500 font-bold block mb-0.5">RECOVERABLE RAW MATERIAL</span>
                          <p className="text-gray-600 leading-relaxed">{valueResult.recoverableMaterials}</p>
                        </div>
                        <div className="bg-gray-50 p-2.5 rounded-xl border">
                          <span className="text-[9px] text-gray-500 font-bold block mb-0.5">REUSABLE COMPONENTS</span>
                          <p className="text-gray-600 leading-relaxed">{valueResult.reusableComponents}</p>
                        </div>
                      </div>
                      <p className="text-[9px] text-gray-400 italic text-center">
                        Note: Materials recovery rates and dollar values are AI estimates based on global averages.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SAVINGS TAB */}
            {activeTab === "savings" && (
              <div className="space-y-4">
                <form onSubmit={handleSavings} className="space-y-3 bg-white p-4 rounded-2xl shadow-sm border">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">
                      Device Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Notebook computer"
                      value={savingsDevice}
                      onChange={(e) => setSavingsDevice(e.target.value)}
                      className="w-full border rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={savingsQty}
                      onChange={(e) => setSavingsQty(e.target.value)}
                      className="w-full border rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingSavings}
                    className="w-full bg-emerald-600 text-white rounded-xl py-2 text-xs font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    {loadingSavings ? "Computing Impact..." : "Calculate Savings"}
                  </button>
                </form>

                {savingsResult && (
                  <div className="bg-white p-4 rounded-2xl shadow-sm border space-y-3 animate-fade-in text-xs">
                    <h4 className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
                      <Leaf className="h-4 w-4 text-emerald-600" />
                      Environmental Impact Dashboard
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 flex flex-col justify-between">
                        <div className="flex items-center gap-1 text-emerald-800 font-bold text-[10px]">
                          <Globe className="h-3 w-3 text-emerald-600" />
                          CO₂ AVOIDED
                        </div>
                        <span className="font-bold text-emerald-700 text-sm mt-1">{savingsResult.co2Saved}</span>
                      </div>
                      <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100 flex flex-col justify-between">
                        <div className="flex items-center gap-1 text-amber-800 font-bold text-[10px]">
                          <Zap className="h-3 w-3 text-amber-600" />
                          ENERGY SAVED
                        </div>
                        <span className="font-bold text-amber-700 text-sm mt-1">{savingsResult.energySaved}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border space-y-1.5">
                      <span className="text-[10px] text-gray-500 font-bold block mb-1">RECOVERED MATERIALS</span>
                      <div className="flex justify-between border-b pb-1 font-medium text-gray-600">
                        <span>Plastic</span>
                        <span className="font-bold text-gray-700">{savingsResult.plasticRecovered}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1 font-medium text-gray-600">
                        <span>Copper</span>
                        <span className="font-bold text-gray-700">{savingsResult.copperRecovered}</span>
                      </div>
                      <div className="flex justify-between font-medium text-gray-600">
                        <span>Aluminum</span>
                        <span className="font-bold text-gray-700">{savingsResult.aluminumRecovered}</span>
                      </div>
                    </div>
                    <div className="bg-emerald-50/30 p-2.5 rounded-xl border">
                      <span className="text-[9px] text-emerald-800 font-bold block mb-0.5">ECOLOGICAL ANALYSIS</span>
                      <p className="text-gray-600 leading-relaxed italic">{savingsResult.summary}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EcoBot;
