import {
  Home as HomeIcon,
  MessageSquare,
  Bot,
  UserCircle,
  Calendar
} from 'lucide-react';
import { Page } from '../types';
import { motion } from 'motion/react';
import { useI18n } from '../i18n';

interface NavigationProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const { t } = useI18n();

  const tabs = [
    { id: 'home' as Page, label: t('nav.home'), icon: HomeIcon },
    { id: 'forum' as Page, label: t('nav.forum'), icon: MessageSquare },
    { id: 'events' as Page, label: 'Events', icon: Calendar },
    { id: 'chatbot' as Page, label: t('nav.chatbot'), icon: Bot },
    { id: 'profile' as Page, label: t('nav.profile'), icon: UserCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 glass border-t border-outline-variant/50 pb-safe">
      <div className="max-w-2xl mx-auto flex justify-around items-center px-2 py-2">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onPageChange(tab.id)}
              className="relative flex flex-col items-center justify-center px-3 py-1.5 min-w-[56px]"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-x-2 -top-1 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <div className={`relative flex flex-col items-center gap-0.5 transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`}>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isActive ? "currentColor" : "none"}
                />
                <span className={`text-[9px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
