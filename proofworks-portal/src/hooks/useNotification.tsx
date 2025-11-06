import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

function Notification({ message, type = 'info', onClose }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500/20 border-green-500/50 text-green-300',
    error: 'bg-red-500/20 border-red-500/50 text-red-300',
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: '-50%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-20 left-1/2 z-50 px-6 py-4 rounded-lg border backdrop-blur-xl ${colors[type]} flex items-center gap-3 shadow-lg`}
    >
      <CheckCircle2 className="w-5 h-5" />
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function useNotification() {
  const [notification, setNotification] = useState<{
    message: string;
    type?: 'success' | 'error' | 'info';
  } | null>(null);

  const showNotification = (message: string, type?: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
  };

  const NotificationComponent = () => (
    <AnimatePresence>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </AnimatePresence>
  );

  return { showNotification, NotificationComponent };
}

