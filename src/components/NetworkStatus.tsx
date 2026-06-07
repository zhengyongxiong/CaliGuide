import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showMessage, setShowMessage] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowMessage(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && showMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-16 left-0 right-0 z-40 flex justify-center px-4"
        >
          <div className="bg-warning-container text-warning px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
            <WifiOff size={18} />
            <span className="text-sm font-medium">You're offline. Some features may be limited.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
