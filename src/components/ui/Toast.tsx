import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/ui.store';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  error: <AlertCircle className="w-5 h-5 text-rose-500" />,
  info: <Info className="w-5 h-5 text-indigo-500" />,
};

const bgColors = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-200',
  warning: 'bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-200',
  error: 'bg-rose-50 border-rose-200 text-rose-950 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-200',
  info: 'bg-indigo-50 border-indigo-200 text-indigo-950 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-200',
};

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
            className={`flex items-start gap-3 p-4 border rounded-xl shadow-lg pointer-events-auto backdrop-blur-sm ${bgColors[toast.type]}`}
          >
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 text-sm font-medium pr-1">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
