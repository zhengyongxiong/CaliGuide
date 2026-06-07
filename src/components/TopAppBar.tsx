import { useState, useRef, useEffect } from 'react';
import { Languages, Search, ArrowLeft, Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page } from '../types';
import { useI18n } from '../i18n';
import NotificationPanel from './NotificationPanel';

interface TopAppBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  onNavigate?: (page: Page, params?: any) => void;
}

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { code: 'yue', label: '粤语', flag: '🇭🇰' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export default function TopAppBar({ title, showBack, onBack, onNavigate }: TopAppBarProps) {
  const { lang, setLang } = useI18n();
  const [showLanguages, setShowLanguages] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLanguages(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code: string) => {
    setLang(code);
    setShowLanguages(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 glass border-b border-outline-variant/50">
      <div className="max-w-2xl mx-auto flex justify-between items-center px-4 h-14">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors"
            >
              <ArrowLeft size={22} className="text-on-surface" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-on-surface">{title}</h1>
        </div>

        <div className="flex items-center gap-1">
          {/* Notification Panel */}
          <NotificationPanel />

          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setShowLanguages(!showLanguages)}
              className="p-2 rounded-full hover:bg-surface-variant transition-colors"
            >
              <Languages size={20} className="text-on-surface-variant" />
            </button>

            <AnimatePresence>
              {showLanguages && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-outline-variant overflow-hidden z-50"
                >
                  <div className="p-2 border-b border-outline-variant bg-surface-variant/50">
                    <div className="flex items-center gap-2 px-2 py-1">
                      <Globe size={14} className="text-primary" />
                      <span className="text-xs font-medium text-on-surface-variant">Language</span>
                    </div>
                  </div>
                  <div className="p-1">
                    {LANGUAGES.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          lang === language.code
                            ? 'bg-primary-light text-primary font-medium'
                            : 'hover:bg-surface-variant text-on-surface'
                        }`}
                      >
                        <span className="text-lg">{language.flag}</span>
                        <span className="flex-1 text-left">{language.label}</span>
                        {lang === language.code && <Check size={16} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Button */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('home', { search: '' })}
              className="p-2 rounded-full hover:bg-surface-variant transition-colors"
            >
              <Search size={20} className="text-on-surface-variant" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
