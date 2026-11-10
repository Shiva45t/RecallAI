import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toasts: ToastMessage[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => {
  // Detect theme from storage or system preferences
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
  const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  // Apply theme styling on start
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
  }

  return {
    sidebarOpen: false,
    theme: initialTheme,
    toasts: [],

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    toggleTheme: () => {
      const nextTheme = get().theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', nextTheme);
      
      const updateDOM = () => {
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
        }
        set({ theme: nextTheme });
      };

      if ((document as any).startViewTransition) {
        (document as any).startViewTransition(updateDOM);
      } else {
        updateDOM();
      }
    },

    setTheme: (theme) => {
      localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
      set({ theme });
    },

    addToast: (message, type = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      set((state) => ({
        toasts: [...state.toasts, { id, type, message }]
      }));

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        get().removeToast(id);
      }, 4000);
    },

    removeToast: (id) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }
  };
});
