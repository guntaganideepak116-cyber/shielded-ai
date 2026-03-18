import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Shield, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface FreeChatbotProps {
  scanData: {
    score: number;
    issues: any[];
  } | null;
  domain: string;
}

const FreeChatbot = ({ scanData, domain }: FreeChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (domain) {
        const greeting = `Hi! I see you scanned ${domain}. Score: ${scanData?.score || 0}/100. How can I help with fixes?`;
        setMessages([{ role: 'ai', content: greeting }]);
      } else {
        const genericGreeting = "Hi! I'm SECURESHIELD AI. I can help you secure your website, explain .htaccess fixes, or help with cPanel. How can I help today?";
        setMessages([{ role: 'ai', content: genericGreeting }]);
      }
    }
  }, [isOpen, domain, scanData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'YOUR_FREE_GEMINI_KEY') {
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'ai', 
            content: "⚠️ Gemini API Key not found! Please add 'VITE_GEMINI_API_KEY' to your .env file to enable responses." 
          }]);
          setIsLoading(false);
        }, 1000);
        return;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `CONTEXT: User is asking about website security. ${domain ? `They scanned ${domain} with score ${scanData?.score || 0}. Issues: ${JSON.stringify(scanData?.issues || [])}.` : ''} Question: ${userMsg}. Guide them about security headers, SSL, WordPress plugins, or server configuration. Keep answers short, actionable, and professional. Answer in Telugu if detected or requested.`
            }]
          }]
        })
      });

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble connecting to AI right now. Please try again or check your API key.";
      
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error) {
      console.error('Gemini API Error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: "An error occurred while connecting to the AI. Please verify your internet connection or API key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Bubble - ALWAYS VISIBLE AT BOTTOM RIGHT */}
      <motion.button
        className="fixed bottom-6 right-6 z-[9999] w-16 h-16 rounded-full bg-gradient-to-tr from-[#667eea] to-[#764ba2] shadow-[0_0_30px_rgba(102,126,234,0.4)] flex items-center justify-center text-white cursor-pointer ring-4 ring-white/10 hover:shadow-[0_0_50px_rgba(102,126,234,0.6)]"
        whileHover={{ scale: 1.15, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0, opacity: 0, y: 100 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
      >
        <div className="absolute inset-0 rounded-full animate-ping bg-primary/20 pointer-events-none" />
        <MessageCircle className="w-8 h-8 relative z-10" />
        <span className="absolute top-0 right-0 w-5 h-5 bg-green-500 rounded-full border-4 border-slate-900 z-20" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden">
            {/* Backdrop */}
            <motion.div 
              className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              className="absolute bottom-4 right-4 w-full max-w-[92vw] sm:max-w-md h-[80vh] flex flex-col pointer-events-none"
              initial={{ y: 500, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 500, opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            >
              <div className="flex-1 glass-card-strong border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto overflow-hidden rounded-[2rem] bg-slate-900/95">
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-white tracking-tight">SECURESHIELD AI</h3>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest leading-none">
                          {domain ? `${domain} • Protected` : 'Always Active'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="p-2 hover:bg-white/10 rounded-full transition-all text-white/70 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 font-body" ref={scrollRef}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-br from-primary to-blue-600 text-white rounded-tr-none shadow-lg shadow-primary/20 font-medium' 
                          : 'bg-white/5 backdrop-blur-sm text-white/90 border border-white/10 rounded-tl-none shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-5 border-t border-white/10 bg-black/20">
                  <div className="relative flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask me anything..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/10 transition-all font-body"
                    />
                    <button
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      className="p-3.5 bg-primary rounded-xl text-white hover:bg-primary/80 transition-all disabled:opacity-30 disabled:scale-95 active:scale-90 shadow-lg shadow-primary/30"
                    >
                      <Send className="w-5 h-5 translate-x-0.5 -translate-y-0.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-[10px] text-white/30 font-body flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary/70" />
                      Powered by Gemini 1.5
                    </p>
                    <button className="text-[9px] text-primary/60 hover:text-primary transition-colors font-bold uppercase tracking-wider">
                      Terms of Service
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FreeChatbot;
