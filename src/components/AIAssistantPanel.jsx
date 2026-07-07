import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  X, 
  Minus, 
  CornerDownLeft, 
  Sparkles,
  Maximize2
} from 'lucide-react';

export default function AIAssistantPanel() {
  const { askAiAssistant, currentUser, businessType, activeRole } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    if (activeRole === 'vendor') {
      setChatMessages([
        {
          sender: 'ai',
          text: "Hello! I am your NeuroBiz Vendor Copilot. I can help you manage procurement requests, active contracts, shipment status, and SME order fulfillment."
        }
      ]);
    } else {
      setChatMessages([
        {
          sender: 'ai',
          text: "Hello! I am your NeuroBiz Business Copilot. Ask me about inventory burn-rates, pending vendor orders, seasonal reorders, or today's operational summary."
        }
      ]);
    }
  }, [activeRole]);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen, isMinimized]);

  if (!currentUser) return null;

  const handleSendMessage = async (text) => {
    if (!text.trim() || isAiResponding) return;

    // User message
    const updated = [...chatMessages, { sender: 'user', text }];
    setChatMessages(updated);
    setChatInput('');
    setIsAiResponding(true);

    try {
      const response = await askAiAssistant(text);
      setChatMessages(prev => [...prev, { sender: 'ai', text: response }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [
        ...prev, 
        { sender: 'ai', text: `Connection issue: ${err.message || err}` }
      ]);
    } finally {
      setIsAiResponding(false);
    }
  };

  const presetQuestions = activeRole === 'vendor' ? [
    'Show pending procurement requests',
    'Which contracts need fulfillment?',
    "Show today's deliveries",
    'Which SMEs am I serving?',
    "Summarize today's vendor operations"
  ] : [
    'Which products are running low?',
    'Which vendor has pending requests?',
    'What should I reorder?',
    "Summarize today's business."
  ];

  return (
    <>
      {/* 1. Floating Circular Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => { setIsOpen(true); setIsMinimized(false); }}
            className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white flex items-center justify-center shadow-xl shadow-indigo-550/20 hover:shadow-indigo-500/35 border border-indigo-400/20 cursor-pointer group"
          >
            <Brain className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 2. Side-out panel container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`fixed right-6 bottom-6 z-50 w-96 glass border border-slate-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col transition-all duration-300 ${
              isMinimized ? 'h-14' : 'h-[500px]'
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-950/80 to-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Brain className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    NeuroBiz Copilot <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  </h3>
                  {!isMinimized && <p className="text-[9px] text-slate-500 capitalize leading-none mt-0.5">{currentUser.businessType} node active</p>}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-md cursor-pointer transition-colors"
                  title={isMinimized ? 'Expand Panel' : 'Minimize Panel'}
                >
                  {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-md cursor-pointer transition-colors"
                  title="Close Assistant"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Body & Input (hidden when minimized) */}
            {!isMinimized && (
              <>
                {/* Conversations Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col scrollbar-thin">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white self-end rounded-tr-none font-medium'
                          : 'bg-slate-900/90 border border-slate-850 text-slate-350 self-start rounded-tl-none font-medium'
                      }`}
                    >
                      {msg.sender === 'ai' ? (
                        <div className="space-y-1 whitespace-pre-wrap">
                          {msg.text.split('\n').map((line, lIdx) => {
                            if (line.startsWith('- ')) {
                              return <p key={lIdx} className="pl-3 border-l border-indigo-500/20">{line}</p>;
                            }
                            if (line.startsWith('### ')) {
                              return <h4 key={lIdx} className="font-bold text-indigo-300 text-[11px] mt-1">{line.replace('### ', '')}</h4>;
                            }
                            return <p key={lIdx}>{line}</p>;
                          })}
                        </div>
                      ) : (
                        <p>{msg.text}</p>
                      )}
                    </div>
                  ))}
                  {isAiResponding && (
                    <div className="flex justify-start">
                      <div className="bg-slate-900 border border-slate-850 rounded-2xl rounded-tl-none px-3.5 py-2 text-slate-400 text-xs flex items-center gap-1">
                        <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                        <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
                        <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce delay-300"></span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Preset Chips */}
                <div className="p-3 border-t border-slate-850/80 bg-slate-900/20 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {presetQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[9px] font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Input Area */}
                <div className="p-3 border-t border-slate-850 bg-slate-950/40 relative">
                  <input
                    type="text"
                    disabled={isAiResponding}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
                    placeholder={isAiResponding ? "AI is typing..." : "Query inventory, reorder updates, risk tags..."}
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    disabled={isAiResponding || !chatInput.trim()}
                    onClick={() => handleSendMessage(chatInput)}
                    className="absolute right-5 top-5 p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    <CornerDownLeft className="h-3 w-3" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
