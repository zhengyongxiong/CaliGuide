import { useState, useEffect } from 'react';
import { Clock, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchHistoryProps {
  onSelect: (query: string) => void;
  onClose: () => void;
}

const SEARCH_HISTORY_KEY = 'caliguide-search-history';
const MAX_HISTORY = 10;

export default function SearchHistory({ onSelect, onClose }: SearchHistoryProps) {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const removeFromHistory = (query: string) => {
    const updated = history.filter((item) => item !== query);
    setHistory(updated);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-outline-variant rounded-xl shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-outline-variant">
        <span className="text-xs font-medium text-on-surface-variant">Recent Searches</span>
        <button
          onClick={clearHistory}
          className="text-xs text-error hover:underline flex items-center gap-1"
        >
          <Trash2 size={12} /> Clear
        </button>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {history.map((query, index) => (
          <motion.div
            key={query}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-variant cursor-pointer group"
            onClick={() => onSelect(query)}
          >
            <Clock size={14} className="text-on-surface-variant flex-shrink-0" />
            <span className="flex-1 text-sm text-on-surface">{query}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFromHistory(query);
              }}
              className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error p-1 transition-opacity"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Helper function to add to search history
export function addToSearchHistory(query: string) {
  if (!query.trim()) return;

  const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
  let history: string[] = [];

  if (saved) {
    try {
      history = JSON.parse(saved);
    } catch {
      history = [];
    }
  }

  // Remove if already exists and add to front
  history = [query.trim(), ...history.filter((item) => item !== query.trim())];

  // Limit history size
  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY);
  }

  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}
