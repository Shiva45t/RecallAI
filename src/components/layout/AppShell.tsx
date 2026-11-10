import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Toast } from '../ui/Toast';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { QuickCaptureModal } from '../capture/QuickCaptureModal';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Activate background offline sync engine
  useOfflineSync();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-transparent relative">
      {/* Background blobs for premium glassmorphism effect in Light Theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25 dark:opacity-5 z-0">
        <div className="absolute top-[5%] left-[15%] w-[400px] h-[400px] rounded-full bg-indigo-400/40 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[15%] right-[5%] w-[450px] h-[450px] rounded-full bg-violet-400/40 blur-[130px] animate-pulse" style={{ animationDuration: '15s' }} />
        <div className="absolute top-[45%] right-[25%] w-[350px] h-[350px] rounded-full bg-emerald-400/30 blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Sidebar Nav: Desktop sticky left & Mobile sliding drawer */}
      <Sidebar />

      {/* Primary viewport content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden z-10">
        <Header />

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 pb-24 md:pb-8">
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </main>

        {/* Bottom Nav: Mobile viewport sticky footer shortcuts */}
        <BottomNav />
      </div>

      {/* Toast alerts overlay container */}
      <Toast />

      {/* Floating Quick Capture Action button & modal overlay */}
      <QuickCaptureModal />
    </div>
  );
};
