"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Mic, Sparkles, Loader2 } from 'lucide-react';
import { useCattleStore } from '@/store/cattleStore';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your CattleOS assistant. I have access to your farm data. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);

  const { cattle, productionLogs } = useCattleStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getAiResponse = (userText: string) => {
    const text = userText.toLowerCase();
    
    if (text.includes('how many') || text.includes('total cattle')) {
      return `You currently have ${cattle.length} cattle in your herd.`;
    }
    
    if (text.includes('production') || text.includes('milk')) {
      const totalMilk = productionLogs.reduce((acc: number, log) => acc + Number(log.yield || 0), 0);
      return `Total milk production recorded is ${totalMilk.toFixed(1)} liters across all logs.`;
    }

    if (text.includes('health') || text.includes('sick')) {
      const sickCount = cattle.filter(c => c.status === 'Sick').length;
      return sickCount > 0 
        ? `I noticed ${sickCount} cattle are currently marked as Sick. You should check the Health module for details.`
        : `All your cattle are currently marked as Healthy! Great job!`;
    }

    if (text.includes('hi') || text.includes('hello')) {
      return "Hello! I'm here to help you manage your farm efficiently. Ask me about your herd size, production, or health status!";
    }

    return "I'm not sure about that yet, but I'm learning more about your farm every day! You can ask me about your herd size or production trends.";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    const userText = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAiResponse(userText),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-6 w-[400px] bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-black/5 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 bg-patch-black text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-grass-green/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-grass-green flex items-center justify-center shadow-lg">
                  <Sparkles size={24} className="text-white animate-pulse" />
                </div>
                <div>
                  <h4 className="font-black text-lg">CattleOS Assistant</h4>
                  <p className="text-[10px] uppercase tracking-widest text-white/50 font-black">Online • Analyzing Herd Data</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors relative z-10">
                <X size={28} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-6 h-[450px] overflow-y-auto space-y-6 bg-ivory/50">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm border ${
                    msg.sender === 'user' 
                      ? 'bg-patch-black text-white rounded-tr-none border-transparent' 
                      : 'bg-white text-black rounded-tl-none border-black/5 font-medium'
                  }`}>
                    {msg.text}
                    <p className={`text-[9px] mt-2 font-bold uppercase tracking-wider ${msg.sender === 'user' ? 'text-white/40' : 'text-black/20'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-3xl rounded-tl-none shadow-sm border border-black/5 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-grass-green" />
                    <span className="text-xs font-bold text-black/40 uppercase tracking-widest">Assistant is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-black/5">
              <div className="flex items-center gap-3 bg-black/5 p-2 rounded-3xl">
                <button className="p-3 rounded-2xl bg-white text-black/20 hover:text-grass-green transition-colors shadow-sm">
                  <Mic size={20} />
                </button>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about herd production..." 
                  className="flex-1 bg-transparent px-2 py-3 text-sm font-bold border-none outline-none"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-3 rounded-2xl bg-patch-black text-white shadow-lg disabled:opacity-20 transition-opacity"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        suppressHydrationWarning
        className={`w-20 h-20 rounded-[32px] flex items-center justify-center text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 hover:scale-110 active:scale-95 group ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-patch-black'
        }`}
      >
        {isOpen ? <X size={36} /> : (
          <div className="relative">
            <MessageSquare size={36} />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-grass-green rounded-full border-4 border-patch-black group-hover:animate-ping"></div>
          </div>
        )}
      </button>
    </div>
  );
};
