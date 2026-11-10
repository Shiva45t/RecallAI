import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Layers, Sparkles, BarChart3 } from 'lucide-react';

const mobileItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { path: '/decks', label: 'Decks', icon: <Layers className="w-5 h-5" /> },
  { path: '/generate', label: 'AI Gen', icon: <Sparkles className="w-5 h-5 text-amber-500" /> },
  { path: '/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 h-16 border-t-2 border-slate-900 bg-white/75 px-4 backdrop-blur-md dark:border-t-2 dark:border-white dark:bg-darkSurface/65 md:hidden flex items-center justify-around pb-safe">
      {mobileItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg text-xs font-black transition-all ${
              isActive
                ? 'text-indigo-650 dark:text-indigo-400 scale-105'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
