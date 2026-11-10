import React from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { useUIStore } from '../../stores/ui.store';
import { Menu, Sun, Moon, WifiOff, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, profile, isOnline, signOut } = useAuthStore();
  const { theme, toggleTheme, toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b-2 border-slate-900 bg-white/75 px-4 backdrop-blur-md dark:border-b-2 dark:border-white dark:bg-darkSurface/65">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-extrabold text-xl md:hidden text-indigo-600 dark:text-indigo-400">
          Recall<span className="text-violet-600 dark:text-violet-400">AI</span>
        </span>
      </div>

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="absolute top-16 left-0 right-0 bg-rose-500 text-white text-xs py-1 px-4 text-center flex items-center justify-center gap-2 animate-pulse shadow-md z-30 font-medium">
          <WifiOff className="w-3.5 h-3.5" /> Working Offline. Changes will sync when reconnecting.
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2 text-gray-500 hover:bg-gray-150 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {user && (
          <div className="flex items-center gap-3 border-l border-gray-150 dark:border-gray-800 pl-3">
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80"
              onClick={() => navigate('/settings')}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="h-8 w-8 rounded-full object-cover border-2 border-slate-900 dark:border-indigo-500 shadow-[1px_1px_0px_0px_#0f172a] dark:shadow-none"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold border-2 border-slate-900 dark:border-indigo-500/20 text-xs shadow-[1px_1px_0px_0px_#0f172a] dark:shadow-none">
                  {profile?.username ? profile.username.substring(0, 2).toUpperCase() : 'AI'}
                </div>
              )}
              <span className="hidden sm:inline text-sm font-semibold text-gray-700 dark:text-gray-300">
                {profile?.username || 'Learner'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl p-2 text-gray-500 hover:bg-gray-150 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
