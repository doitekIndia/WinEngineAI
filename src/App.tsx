import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, ShieldAlert, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const checkHealth = async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setIsConfigured(data.isConfigured);
    } catch (err) {
      console.error("Health check failed", err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages([...newMessages, data]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages([...newMessages, { role: "assistant", content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isConfigured === false) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl text-center">
          <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-4">API Key Required</h1>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            To use Llama 3.3 70B via Groq, you need to add your <strong>GROQ_API_KEY</strong> to the Secrets panel.
          </p>
          <div className="bg-zinc-950 p-4 rounded-2xl text-left border border-zinc-800 mb-8">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Instructions:</p>
            <ol className="text-xs text-zinc-400 space-y-2 list-decimal ml-4">
              <li>Open <strong>Settings</strong> (⚙️) in the top right.</li>
              <li>Go to <strong>Secrets</strong>.</li>
              <li>Add <code>GROQ_API_KEY</code> with your key from Groq Console.</li>
              <li>The app will rebuild automatically.</li>
            </ol>
          </div>
          <a 
            href="https://console.groq.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors"
          >
            Get Groq API Key
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-700 selection:text-white">
      {/* Header */}
      <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Bot className="text-black" size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Groq Llama Chat</h1>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">llama-3.3-70b-versatile</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-zinc-900 rounded-md border border-zinc-800">
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center border border-zinc-800 shadow-2xl"
            >
              <Sparkles className="text-white w-10 h-10" />
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-white">How can I help you today?</h2>
              <p className="text-zinc-500 text-lg">Experience the speed of Llama 3.3 70B on Groq's LPU inference engine.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {[
                "Explain quantum computing in simple terms",
                "Write a Python script to scrape a website",
                "Help me plan a 3-day trip to Tokyo",
                "What are the best practices for React 19?"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); }}
                  className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-left text-sm text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 transition-all group"
                >
                  <span className="group-hover:text-white transition-colors">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-zinc-800" : "bg-white"}`}>
                {msg.role === "user" ? <User size={16} className="text-zinc-400" /> : <Bot size={16} className="text-black" />}
              </div>
              <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl ${msg.role === "user" ? "bg-zinc-900 text-white" : "bg-zinc-900/30 border border-zinc-800 text-zinc-200"}`}>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
              <Bot size={16} className="text-black" />
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
              <Loader2 size={16} className="text-zinc-500 animate-spin" />
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Llama is thinking...</span>
            </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-8 bg-gradient-to-t from-zinc-950 to-transparent">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-3xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200"></div>
          <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden focus-within:border-zinc-700 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Message Llama 3.3..."
              className="flex-1 bg-transparent py-4 px-6 text-sm outline-none placeholder:text-zinc-600"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 mr-2 bg-white text-black rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-[10px] text-center mt-4 text-zinc-600 font-medium uppercase tracking-[0.2em]">
            Powered by Groq LPU™ Inference Engine
          </p>
        </div>
      </footer>
    </div>
  );
}
