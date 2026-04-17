import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Shield, Sparkles, Loader2 } from 'lucide-react';
import { useScan } from '@/context/ScanContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const FreeChatbot = () => {
  const { scanData, domain } = useScan();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = domain 
        ? `Hi! I see you scanned ${domain}. Score: ${scanData?.score || 0}/100. Let's fix these vulnerabilities together.`
        : "Hi! I'm SecureWeb AI's security assistant. I'm powered by Groq Llama-3. How can I help you today?";
      setMessages([{ role: 'assistant', content: greeting }]);
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
    
    // Add user message to history
    const updatedMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMessages, // Send full history for interaction
          scanContext: scanData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }

    } catch (error) {
      console.error('Chatbot Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm experiencing a brief neural synchronization issue. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 z-[9999] w-16 h-16 rounded-full bg-gradient-to-tr from-[#00d4ff] to-[#7c3aed] shadow-[0_0_30px_rgba(0,212,255,0.4)] flex items-center justify-center text-white cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
      >
        <div className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
        <MessageCircle className="w-8 h-8 relative z-10" />
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-end justify-end p-4 pointer-events-none">
            <motion.div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              className="relative w-full max-w-md h-[70vh] flex flex-col pointer-events-auto bg-[#0d1424] overflow-hidden rounded-3xl border border-white/20 shadow-2xl"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
            >
              {/* Header */}
              <div className="chatbot-header p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="chatbot-title flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-bold text-white chatbot-name">SecureWeb AI</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white min-h-0">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar" ref={scrollRef}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' ? 'bg-primary text-white' : 'bg-white/10 text-white border border-white/10'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start items-center gap-2">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-[10px] text-white/40 font-mono tracking-tighter">GROQ IS ANALYZING...</span>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your security question..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary min-h-[44px]"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="p-2 bg-primary rounded-xl text-white disabled:opacity-50 min-h-[44px] w-[44px] flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-[10px] text-white/30 mt-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Powered by Groq Llama-3
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FreeChatbot;
