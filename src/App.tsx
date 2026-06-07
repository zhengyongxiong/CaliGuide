/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Page } from './types';
import Navigation from './components/Navigation';
import TopAppBar from './components/TopAppBar';
import Home from './pages/Home';
import Guide from './pages/Guide';
import Forum from './pages/Forum';
import Chatbot from './pages/Chatbot';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Events from './pages/Events';
import About from './pages/About';
import Help from './pages/Help';
import AuthPage from './pages/AuthPage';
import { useAuth } from './context/AuthContext';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant font-medium">Loading CaliGuide...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  const handleNavigate = (page: Page, params?: { guideId?: string | null; postId?: string | null; search?: string }) => {
    if (params?.guideId !== undefined) setSelectedGuideId(params.guideId);
    if (params?.postId !== undefined) setSelectedPostId(params.postId);
    setCurrentPage(page);
  };

  const pageTitles: Record<Page, string> = {
    home: 'CaliGuide',
    guide: 'Guides',
    forum: 'Community',
    chatbot: 'CaliBot',
    profile: 'Profile',
    admin: 'Admin',
    events: 'Events',
    about: 'About',
    help: 'Help',
  };

  // Show back button when in detail views or sub-pages
  const showBackButton = currentPage === 'guide' ||
    currentPage === 'admin' ||
    currentPage === 'about' ||
    currentPage === 'help' ||
    (currentPage === 'forum' && selectedPostId !== null);

  const handleBack = () => {
    // Clear selections first
    if (selectedPostId) {
      setSelectedPostId(null);
      return;
    }
    if (selectedGuideId) {
      setSelectedGuideId(null);
      setCurrentPage('guide');
      return;
    }
    // Navigate back based on current page
    switch (currentPage) {
      case 'admin':
        setCurrentPage('profile');
        break;
      case 'about':
      case 'help':
      case 'guide':
        setCurrentPage('home');
        break;
      default:
        setCurrentPage('home');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'guide':
        return <Guide guideId={selectedGuideId} onNavigate={handleNavigate} />;
      case 'forum':
        return <Forum onNavigate={handleNavigate} selectedPostId={selectedPostId} />;
      case 'chatbot':
        return <Chatbot />;
      case 'profile':
        return <Profile onNavigate={handleNavigate} />;
      case 'admin':
        return <AdminDashboard />;
      case 'events':
        return <Events onNavigate={handleNavigate} />;
      case 'about':
        return <About onNavigate={handleNavigate} />;
      case 'help':
        return <Help onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopAppBar
        title={pageTitles[currentPage]}
        showBack={showBackButton}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />

      <main className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage + (selectedGuideId || '') + (selectedPostId || '')}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {!showBackButton && (
        <Navigation
          currentPage={currentPage}
          onPageChange={(page) => handleNavigate(page)}
        />
      )}
    </div>
  );
}
