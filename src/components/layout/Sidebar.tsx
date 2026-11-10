import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUIStore } from '../../stores/ui.store';
import { useAuthStore } from '../../stores/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  BarChart3,
  Settings,
  X,
  GraduationCap
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { path: '/decks', label: 'My Decks', icon: <Layers className="w-5 h-5" /> },
  { path: '/generate', label: 'AI Flashcards', icon: <Sparkles className="w-5 h-5 text-amber-500" /> },
  { path: '/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export const Sidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { profile } = useAuthStore();
  const location = useLocation();

  const handleLinkClick = () => {
    setSidebarOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col border-r-2 border-slate-900 bg-white/75 backdrop-blur-md px-4 py-6 dark:border-r-2 dark:border-white dark:bg-darkSurface/65">
      {/* Brand Logo */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <GraduationCap className="w-8 h-8" />
          <span className="text-2xl font-extrabold tracking-tight">
            Recall<span className="text-violet-600 dark:text-violet-400">AI</span>
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                isActive
                  ? 'border-2 border-slate-900 bg-indigo-500 text-white shadow-[2.5px_2.5px_0px_0px_#0f172a] translate-x-[-2px] translate-y-[-2px] dark:border-2 dark:border-white dark:shadow-[2.5px_2.5px_0px_0px_#fff]'
                  : 'text-gray-655 hover:bg-gray-100/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-100'
              }`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile Details */}
      {profile && (
        <div className="mt-auto border-t border-gray-100 dark:border-gray-800 pt-4 flex items-center gap-3">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="h-10 w-10 rounded-full object-cover border-2 border-slate-900 dark:border-indigo-500 shadow-[1.5px_1.5px_0px_0px_#0f172a] dark:shadow-none"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold border-2 border-slate-900 dark:border-indigo-500/20 text-sm shadow-[1.5px_1.5px_0px_0px_#0f172a] dark:shadow-none">
              {profile.username ? profile.username.substring(0, 2).toUpperCase() : 'AI'}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-250 truncate">
              {profile.username || 'Learner'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Streak: {profile.streak_count} 🔥
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:block w-64 flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer (Collapsible) */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-64 max-w-xs h-full z-10"
            >
              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
