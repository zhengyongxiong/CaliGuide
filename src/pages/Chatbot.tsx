import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { motion } from 'motion/react';
import { chatApi } from '../lib/api';
import { useI18n } from '../i18n';

export default function Chatbot() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatApi.history()
      .then((history) => {
        if (history.length > 0) {
          setMessages(history);
        } else {
          setMessages([{
            role: 'bot',
            content: 'Hello! I am CaliBot, your guide through the immigration process. How can I help you navigate your journey today?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
        }
      })
      .catch(() => {
        setMessages([{
          role: 'bot',
          content: 'Hello! I am CaliBot, your guide through the immigration process. How can I help you navigate your journey today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      })
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input;
    setInput('');
    setIsLoading(true);

    try {
      const data = await chatApi.send(messageText);
      const botMessage: ChatMessage = {
        role: 'bot',
        content: data.text || "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages((prev) => [...prev, {
        role: 'bot',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await chatApi.clear();
      setMessages([{
        role: 'bot',
        content: 'Chat history cleared. How can I help you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch (e) {
      console.error('Failed to clear history:', e);
    }
  };

  const suggestions = [
    t('chatbot.suggestion1'),
    t('chatbot.suggestion2'),
    t('chatbot.suggestion3'),
    t('chatbot.suggestion4'),
  ];

  if (loadingHistory) {
    return (
      <div className="pt-20 pb-24 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-16 pb-28 flex flex-col h-[100dvh]">
      {/* Bot Intro */}
      <div className="flex flex-col items-center justify-center py-6 shrink-0">
        <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mb-3">
          <Bot size={28} className="text-primary" />
        </div>
        <h1 className="text-xl font-semibold text-on-surface">{t('chatbot.title')}</h1>
        <p className="text-sm text-on-surface-variant text-center max-w-xs mt-1 px-4">
          {t('chatbot.subtitle')}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span className="px-3 py-1 bg-success-container text-success rounded-full text-[10px] font-medium">
            {t('chatbot.online')}
          </span>
          <button
            onClick={handleClearHistory}
            className="px-3 py-1 bg-error-container text-error rounded-full text-[10px] font-medium hover:opacity-80 transition-opacity flex items-center gap-1"
          >
            <Trash2 size={10} /> {t('chatbot.clearHistory')}
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-grow overflow-y-auto px-4 space-y-4 flex flex-col no-scrollbar"
      >
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-primary text-white' : 'bg-primary-light text-primary'
            }`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`p-3 rounded-xl ${
              msg.role === 'user'
                ? 'bg-primary text-white rounded-tr-sm'
                : 'bg-white border border-outline-variant rounded-tl-sm'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <span className={`text-[10px] mt-1.5 block ${
                msg.role === 'user' ? 'text-white/70 text-right' : 'text-on-surface-variant'
              }`}>
                {msg.timestamp}
              </span>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2 max-w-[85%]">
            <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-primary" />
            </div>
            <div className="bg-white p-3 rounded-xl rounded-tl-sm border border-outline-variant">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        {/* Suggestion Chips */}
        {messages.length < 3 && !isLoading && (
          <div className="flex flex-wrap gap-2 pt-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s)}
                className="bg-white border border-primary text-primary px-3 py-1.5 rounded-full text-xs font-medium hover:bg-primary-light transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 w-full px-4 z-[90] bg-gradient-to-t from-background via-background to-background/80 pt-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-outline-variant rounded-xl p-2 flex items-center gap-2 shadow-xl">
            <button className="text-on-surface-variant p-2 hover:bg-surface-variant rounded-lg transition-colors">
              <PlusCircle size={20} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-grow bg-transparent border-none focus:ring-0 text-sm py-2 px-1"
              placeholder={t('chatbot.placeholder')}
              type="text"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-primary text-white w-9 h-9 flex items-center justify-center rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
