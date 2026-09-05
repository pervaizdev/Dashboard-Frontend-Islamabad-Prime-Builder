"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Trash2, Maximize2, Minimize2, Send, Loader2 } from "lucide-react";
import { chatAPI } from "@/api/chat";

const SESSION_KEY_CHAT = "ipbChatHistory";

export default function IPBChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat history from session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY_CHAT);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        sessionStorage.removeItem(SESSION_KEY_CHAT);
      }
    }
  }, []);

  // Save chat history to session whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(SESSION_KEY_CHAT, JSON.stringify(messages));
    }
  }, [messages]);

  // Listen for property data removal — if it's gone, clear chat too
  useEffect(() => {
    const interval = setInterval(() => {
      const propertyData = sessionStorage.getItem("allPropertyDetails");
      if (!propertyData && messages.length > 0) {
        setMessages([]);
        sessionStorage.removeItem(SESSION_KEY_CHAT);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem(SESSION_KEY_CHAT);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: "user", text: trimmed, timestamp: Date.now() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Always send context because the backend is stateless and needs it for every message.
      // Since we are now sending a pre-computed summary, it is very token-efficient.
      let context = null;
      const propertyData = sessionStorage.getItem("allPropertyDetails");
      if (propertyData) {
        try {
          const props = JSON.parse(propertyData);

          // Use EXACT same logic as dashboard controller
          const groups = { Partner: { count: 0, totalValue: 0, received: 0, remaining: 0, totalInst: 0, paidInst: 0, overdueInst: 0, overdueAmt: 0 } };
          const otherGroup = { count: 0, totalValue: 0, received: 0, remaining: 0, totalInst: 0, paidInst: 0, overdueInst: 0, overdueAmt: 0 };
          let grandTotalValue = 0, grandReceived = 0, grandRemaining = 0;
          let grandOverdueInst = 0, grandOverdueAmt = 0;

          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          // Prepare 12-month skeleton for Collections Over Time
          const monthlyMap = {};
          const monthKeys = [];
          for (let i = 11; i >= 0; i--) {
            const d = new Date(currentYear, currentMonth - i, 1);
            const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            monthKeys.push(k);
            monthlyMap[k] = { label: d.toLocaleString('en-US', { month: 'short', year: 'numeric' }), dp: 0, paid: 0, unpaid: 0, overdue: 0 };
          }

          const perProp = props.map((p) => {
            const tp = Number(p.total_price) || 0;
            const dp = Number(p.down_payment) || 0;
            const paidDp = Number(p.paid_downpayment) || 0;
            // Exact dashboard formula
            const downpaymentReceived = paidDp === dp ? dp : paidDp;

            // Map downpayment to the first installment's month (like the frontend chart)
            const firstInst = p.installments?.[0];
            if (firstInst && firstInst.dueDate) {
              const fDate = new Date(firstInst.dueDate);
              const fKey = `${fDate.getFullYear()}-${String(fDate.getMonth() + 1).padStart(2, "0")}`;
              if (monthlyMap[fKey]) {
                monthlyMap[fKey].dp += downpaymentReceived;
              }
            }

            let paidInstAmt = 0, paidCount = 0, unpaidCount = 0, overdueCount = 0, overdueAmt = 0;
            (p.installments || []).forEach(inst => {
              const amt = Number(inst.amount) || 0;
              const d = new Date(inst.dueDate);
              const isPast = d && d < now;

              let status = "";
              if (inst.status === "paid") { 
                paidInstAmt += amt; 
                paidCount++; 
                status = "paid";
              } else if (isPast) { 
                overdueCount++;
                overdueAmt += amt;
                status = "overdue";
              } else {
                unpaidCount++;
                status = "unpaid";
              }

              // Add to monthly map
              if (d) {
                const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                if (monthlyMap[k]) {
                  monthlyMap[k][status] += amt;
                }
              }
            });

            const totalPaid = parseFloat((downpaymentReceived + paidInstAmt).toFixed(2));
            const rem = parseFloat((tp - totalPaid).toFixed(2));

            grandTotalValue += tp;
            grandReceived += totalPaid;
            grandRemaining += rem;
            grandOverdueInst += overdueCount;
            grandOverdueAmt += overdueAmt;

            const isPartner = (p.allocationType || "").toLowerCase() === "partner";
            const g = isPartner ? groups.Partner : otherGroup;
            g.count++;
            g.totalValue += tp;
            g.received += totalPaid;
            g.remaining += rem;
            g.totalInst += (p.installments || []).length;
            g.paidInst += paidCount;
            g.overdueInst += overdueCount;
            g.overdueAmt += overdueAmt;

            const owners = p.owners?.map((o) => o.ownerName || "Unknown").join(", ");
            return `#${p.property_number}|Bldg:${p.building_name}|Floor:${p.floor}|Type:${p.type}|Alloc:${p.allocationType}|Price:${tp}|Received:${totalPaid}|Remaining:${rem}|Inst:${(p.installments||[]).length}(paid:${paidCount},unpaid:${unpaidCount},overdue:${overdueCount},overdueAmt:${overdueAmt})|Owners:[${owners}]`;
          });

          const fmt = (n) => parseFloat(n.toFixed(2));

          const monthlyContext = monthKeys.map(k => {
            const m = monthlyMap[k];
            return `* ${m.label}: Downpayment: ${fmt(m.dp)} | Paid: ${fmt(m.paid)} | Unpaid: ${fmt(m.unpaid)} | Overdue: ${fmt(m.overdue)}`;
          }).join("\n");

          context = `PRE-COMPUTED SUMMARY (use these numbers directly, do NOT recalculate):
OVERALL: ${props.length} properties | TotalValue: ${fmt(grandTotalValue)} | Received: ${fmt(grandReceived)} | Remaining: ${fmt(grandRemaining)}
CLIENT (non-partner): ${otherGroup.count} properties | TotalValue: ${fmt(otherGroup.totalValue)} | Received: ${fmt(otherGroup.received)} | Remaining: ${fmt(otherGroup.remaining)} | Installments: ${otherGroup.totalInst} (paid: ${otherGroup.paidInst})
PARTNER: ${groups.Partner.count} properties | TotalValue: ${fmt(groups.Partner.totalValue)} | Received: ${fmt(groups.Partner.received)} | Remaining: ${fmt(groups.Partner.remaining)} | Installments: ${groups.Partner.totalInst} (paid: ${groups.Partner.paidInst})

MONTHLY COLLECTIONS (Last 12 Months):
${monthlyContext}

PROPERTY LIST:
${perProp.join("\n")}`;
        } catch {
          context = "Property data failed to parse.";
        }
      } else {
        context = "No property data loaded.";
      }

      // Build history for the API (limited to last 10 messages for speed)
      const historyForAPI = newMessages.slice(-10).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const response = await chatAPI.sendMessage(trimmed, context, historyForAPI);

      if (response.success) {
        const botMessage = {
          role: "assistant",
          text: response.reply,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMsg = {
          role: "assistant",
          text: response.message || "Sorry, something went wrong. Please try again.",
          timestamp: Date.now(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (error) {
      const errorMsg = {
        role: "assistant",
        text: error.message || "Sorry, I couldn't process your request. Please check if API keys are configured.",
        timestamp: Date.now(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format bot text with basic markdown-like formatting
  const formatText = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");
  };

  // Detect RTL text (Urdu/Arabic script)
  const isRTL = (text) => {
    if (!text) return false;
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    // Check if majority of alphabetic chars are RTL
    const rtlChars = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
    return rtlChars > 5;
  };

  return (
    <>
      <style>{`
        @keyframes botPeriodicBounce {
          0%, 75%, 100% {
            transform: translateY(0);
            box-shadow: 0 10px 25px rgba(18, 61, 50, 0.35);
          }
          82% {
            transform: translateY(-24px);
            box-shadow: 0 25px 40px rgba(18, 61, 50, 0.45);
          }
          88% {
            transform: translateY(0);
            box-shadow: 0 10px 25px rgba(18, 61, 50, 0.35);
          }
          93% {
            transform: translateY(-10px);
            box-shadow: 0 16px 30px rgba(18, 61, 50, 0.4);
          }
          97% {
            transform: translateY(-2px);
          }
        }
        .animate-periodic-bounce {
          animation: botPeriodicBounce 5s cubic-bezier(0.28, 0.84, 0.42, 1) infinite;
        }
      `}</style>

      {/* Floating Logo Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 flex h-14 w-14 sm:h-[70px] sm:w-[70px] items-center justify-center rounded-full bg-[#123D32] shadow-[0_10px_30px_rgba(18,61,50,0.35)] z-[999] cursor-pointer transition-transform duration-300 ${
          !isOpen ? "animate-periodic-bounce" : ""
        }`}
        aria-label="Open IPB Assistant"
      >
        <Image
          src="/images/logo.png"
          alt="Company Logo"
          width={36}
          height={36}
          className="object-contain w-8 h-8 sm:w-10 sm:h-10"
        />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div
          className={`fixed z-[1000] flex flex-col bg-white shadow-[0_25px_60px_rgba(0,0,0,0.25)] transition-all duration-300 overflow-hidden ${
            isExpanded
              ? "inset-2 sm:inset-6 lg:inset-10 rounded-2xl"
              : "inset-x-3 bottom-3 top-14 sm:top-auto sm:bottom-24 sm:right-6 sm:left-auto w-auto sm:w-[420px] h-[calc(100vh-70px)] sm:h-[580px] max-h-[640px] rounded-2xl"
          }`}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 sm:gap-3 rounded-t-2xl bg-[#123D32] px-4 py-3 sm:px-5 sm:py-4 shrink-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
              <Image
                src="/images/logo.png"
                alt="IPB"
                width={22}
                height={22}
                className="object-contain w-5 h-5 sm:w-6 sm:h-6"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-[15px] font-bold text-[#E5C476] leading-tight truncate">
                IPB Assistant
              </h3>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                aria-label={isExpanded ? "Minimize" : "Expand"}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={clearChat}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
                aria-label="Clear chat"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-4 space-y-3.5 sm:space-y-4 bg-[#F8FAF9]">
            {/* Welcome message if no messages */}
            {messages.length === 0 && (
              <div className="flex gap-2.5 sm:gap-3 items-start">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#123D32]">
                  <Image
                    src="/images/logo.png"
                    alt="IPB"
                    width={16}
                    height={16}
                    className="object-contain w-4 h-4 sm:w-4.5 sm:h-4.5"
                  />
                </div>
                <div className="rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-sm border border-[#123D32]/5 max-w-[88%] sm:max-w-[85%]">
                  <p className="text-xs sm:text-[13px] text-[#123D32] leading-relaxed">
                    <span className="text-sm sm:text-base">👋</span> Hello there! I am your{" "}
                    <strong className="text-[#C6A15B]">IPB Assistant</strong>. Ask me anything about your properties, installments, owners, or financial data!
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 sm:gap-3 items-start ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                {msg.role !== "user" && (
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#123D32]">
                    <Image
                      src="/images/logo.png"
                      alt="IPB"
                      width={16}
                      height={16}
                      className="object-contain w-4 h-4 sm:w-4.5 sm:h-4.5"
                    />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 max-w-[88%] sm:max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-[#123D32] text-white rounded-tr-md"
                      : msg.isError
                      ? "bg-red-50 border border-red-200 text-red-700 rounded-tl-md"
                      : "bg-white shadow-sm border border-[#123D32]/5 text-[#123D32] rounded-tl-md"
                  }`}
                  dir={isRTL(msg.text) ? "rtl" : "ltr"}
                >
                  {msg.role === "user" ? (
                    <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  ) : (
                    <div
                      className="text-xs sm:text-[13px] leading-relaxed prose-sm"
                      dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2.5 sm:gap-3 items-start">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#123D32]">
                  <Image
                    src="/images/logo.png"
                    alt="IPB"
                    width={16}
                    height={16}
                    className="object-contain w-4 h-4 sm:w-4.5 sm:h-4.5"
                  />
                </div>
                <div className="rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-sm border border-[#123D32]/5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#C6A15B] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full bg-[#C6A15B] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 rounded-full bg-[#C6A15B] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="border-t border-[#123D32]/8 bg-white px-3 py-2.5 sm:px-4 sm:py-3 rounded-b-2xl shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about properties, installments..."
                disabled={isLoading}
                className="flex-1 h-[42px] sm:h-[44px] rounded-xl border border-[#123D32]/10 bg-[#F8FAF9] px-3.5 sm:px-4 text-xs sm:text-[13px] font-medium text-[#123D32] outline-none transition-all duration-200 placeholder:text-[#123D32]/35 focus:border-[#C6A15B] focus:bg-white focus:ring-4 focus:ring-[#C6A15B]/10 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex h-[42px] w-[42px] sm:h-[44px] sm:w-[44px] shrink-0 items-center justify-center rounded-xl bg-[#123D32] text-[#E5C476] transition-all duration-200 hover:bg-[#0C3027] hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
