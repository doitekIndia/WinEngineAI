import React, { useState, useRef, useEffect } from "react";
import { Send, Terminal, Cpu, Shield, Globe, HelpCircle, Loader2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Message, AssistResponse } from "../utils/types";
import { ResponseCard } from "./ResponseCard";

export const ChatUI: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data: AssistResponse = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I've analyzed your request using ${data.detectedAgents.length} specialized agents.`,
        assistResponse: data,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-zinc-900 p-2 rounded-xl">
            <Terminal className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 uppercase tracking-tighter">WinEngine AI</h1>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Multi-Agent System v1.0</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-red-100 border-2 border-white flex items-center justify-center" title="Error Diagnosis"><Cpu size={12} className="text-red-500" /></div>
            <div className="w-6 h-6 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center" title="Optimization"><Zap size={12} className="text-amber-500" /></div>
            <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center" title="Network"><Globe size={12} className="text-emerald-500" /></div>
            <div className="w-6 h-6 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center" title="Security"><Shield size={12} className="text-purple-500" /></div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <HelpCircle size={48} className="text-zinc-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-zinc-900 mb-2">How can I help you today?</h2>
              <p className="text-sm text-zinc-500">Ask about error codes, performance issues, network problems, or system tweaks.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              {["Fix BSOD 0x0000001", "Boost FPS in games", "WiFi not working", "Disable telemetry"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-xs font-medium text-zinc-600 bg-white border border-zinc-200 px-4 py-3 rounded-xl hover:border-zinc-900 transition-all text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] ${msg.role === "user" ? "bg-zinc-900 text-white p-4 rounded-2xl rounded-tr-none" : "w-full"}`}>
                {msg.role === "user" ? (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-zinc-900 rounded-lg flex items-center justify-center">
                        <Terminal size={12} className="text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Assistant Response</span>
                    </div>
                    
                    {msg.assistResponse ? (
                      <div>
                        {msg.assistResponse.results.map((result, idx) => (
                          <ResponseCard key={idx} result={result} />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm">
                        <p className="text-sm text-zinc-600 leading-relaxed">{msg.content}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm flex items-center gap-3">
              <Loader2 size={18} className="text-zinc-400 animate-spin" />
              <span className="text-xs text-zinc-500 font-medium">Orchestrating agents...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-zinc-200">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Describe your Windows issue or error code..."
            className="w-full bg-zinc-100 border-none rounded-2xl py-4 pl-6 pr-16 text-sm focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 bg-zinc-900 text-white px-4 rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-zinc-400 text-center mt-4 uppercase tracking-widest font-medium">
          Powered by Gemini 2.0 Flash & Multi-Agent Orchestration
        </p>
      </div>
    </div>
  );
};
