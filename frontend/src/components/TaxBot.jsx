import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, User, ArrowRight, HelpCircle, Loader2, Check } from 'lucide-react';
import { apiFetch } from '../utils';

const QUICK_QUESTIONS = [
  'How do I calculate US withholding tax savings?',
  'Why choose Singapore HoldCo for SaaS?',
  'What documents are needed for TRC & Form 10F?',
  'How to use HoldCo Simulator?'
];

function cleanRawText(t) {
  if (!t) return '';
  return t
    .replace(/\\\[([\s\S]*?)\\\]/g, '$1')
    .replace(/\\\(([\s\S]*?)\\\)/g, '$1')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\\[|\\\]|\\\(|\\\)/g, '')
    .trim();
}

// Helper to render bold text and bullet points cleanly
function FormattedMessage({ text, isUser }) {
  if (isUser) {
    return <p className="whitespace-pre-wrap">{text}</p>;
  }

  const cleaned = cleanRawText(text);
  const lines = cleaned.split('\n');

  return (
    <div className="space-y-1.5 text-xs sm:text-sm text-gray-800 leading-relaxed">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-1" />;

        // Header lines (### or **)
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
          const heading = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={index} className="font-bold text-gray-900 text-xs sm:text-sm mt-2 mb-1 text-emerald-800">
              {renderBoldText(heading)}
            </h4>
          );
        }

        // Bullet point lines (- or * or •)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
          const bulletContent = trimmed.replace(/^[-*•]\s*/, '');
          return (
            <div key={index} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span className="flex-1">{renderBoldText(bulletContent)}</span>
            </div>
          );
        }

        // Numbered lists (1. or 2.)
        const numMatch = trimmed.match(/^(\d+)\.\s*(.+)/);
        if (numMatch) {
          return (
            <div key={index} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                {numMatch[1]}
              </span>
              <span className="flex-1">{renderBoldText(numMatch[2])}</span>
            </div>
          );
        }

        // Regular paragraph with bolding
        return (
          <p key={index} className="py-0.5">
            {renderBoldText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Convert **bold** and *italic* tokens
function renderBoldText(text) {
  // First clean *Example:* to Example:
  const cleaned = text.replace(/\*([^*]+)\*/g, '$1');
  const parts = cleaned.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function TaxBot({ onNavigateTab }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '**Welcome to TaxGlobe AI Advisory.**\n\nI can help you with:\n- **DTAA Withholding Tax Calculations** (US, SG, UAE, UK)\n- **International HoldCo Structuring** (Singapore vs UAE vs Delaware)\n- **TRC & Form 10F Compliance**\n\nHow may I assist your cross-border tax strategy today?',
      time: 'Just now'
    }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, loading]);

  async function handleSend(textToSend) {
    const q = (textToSend || input).trim();
    if (!q || loading) return;

    const userMsg = {
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: q,
          history: messages
        })
      });

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: res.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `⚠️ **Advisory Connection Issue**\n${err.message || 'Unable to reach AI tax service.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="glass rounded-3xl shadow-2xl border border-white/80 w-[92vw] max-w-sm sm:max-w-md h-[540px] flex flex-col mb-4 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 px-5 py-3.5 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    TaxGlobe AI Advisor
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-normal">GPT 120B</span>
                  </h3>
                  <p className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> International Tax & DTAA
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white/50">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                      <Bot className="w-4 h-4 text-emerald-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      m.sender === 'user'
                        ? 'bg-emerald-500 text-white rounded-tr-none text-xs sm:text-sm'
                        : 'glass text-gray-800 border border-white/80 rounded-tl-none'
                    }`}
                  >
                    <FormattedMessage text={m.text} isUser={m.sender === 'user'} />
                    <span
                      className={`block text-[10px] mt-1.5 text-right font-medium ${
                        m.sender === 'user' ? 'text-emerald-100' : 'text-gray-400'
                      }`}
                    >
                      {m.time}
                    </span>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                    <Bot className="w-4 h-4 text-emerald-600 animate-pulse" />
                  </div>
                  <div className="glass rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm border border-white/80 flex items-center gap-2 text-xs text-gray-600">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    Structuring tax advisory answer...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-3 py-2 bg-emerald-50/70 border-t border-emerald-100/50 flex gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="whitespace-nowrap bg-white text-[11px] text-emerald-700 font-medium px-2.5 py-1 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors shrink-0 shadow-2xs"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white/80 border-t border-gray-100 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about DTAA, WHT, HoldCo structures..."
                value={input}
                onChange={e => setInput(e.target.value)}
                className="input-field text-xs py-2 bg-white"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="btn-primary p-2.5 rounded-xl shrink-0 disabled:opacity-40 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        className="glass rounded-full p-3.5 sm:px-4 sm:py-3 shadow-xl border border-emerald-300 bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center gap-2 hover:shadow-emerald-500/25 transition-all group"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-300 ring-2 ring-emerald-600 animate-ping" />
        </div>
        <span className="hidden sm:inline font-semibold text-xs tracking-wide">
          {open ? 'Close TaxBot' : 'Tax AI Advisor'}
        </span>
      </motion.button>
    </div>
  );
}
