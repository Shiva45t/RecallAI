import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { db } from '../lib/dexie';
import type { LocalProfile } from '../lib/dexie';

interface AuthState {
  user: any | null;
  profile: LocalProfile | null;
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<LocalProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  setOnlineStatus: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Listen for online status changes
  window.addEventListener('online', () => get().setOnlineStatus(true));
  window.addEventListener('offline', () => get().setOnlineStatus(false));

  const syncProfileLocally = async (profile: LocalProfile) => {
    try {
      await db.profiles.put(profile);
    } catch (e) {
      console.error('Failed to sync profile to local Dexie Cache', e);
    }
  };

  const loadProfile = async (userId: string): Promise<LocalProfile | null> => {
    // Attempt local load first
    let localProfile = await db.profiles.get(userId);
    
    if (get().isOnline) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          // If profile does not exist in Supabase but user exists, we upsert a new profile
          if (error.code === 'PGRST116') {
            // Retrieve session to check for Google OAuth metadata (full_name, avatar_url)
            const { data: sessionData } = await supabase.auth.getSession();
            const userMetadata = sessionData.session?.user?.user_metadata;
            const googleUsername = userMetadata?.full_name || userMetadata?.name || userMetadata?.email?.split('@')[0];
            const googleAvatar = userMetadata?.avatar_url;

            const newProfile: LocalProfile = {
              id: userId,
              username: localProfile?.username || googleUsername || 'New User',
              avatar_url: localProfile?.avatar_url || googleAvatar || null,
              streak_count: localProfile?.streak_count || 0,
              last_studied_at: localProfile?.last_studied_at || null,
              total_cards_studied: localProfile?.total_cards_studied || 0,
              created_at: localProfile?.created_at || new Date().toISOString()
            };
            const { error: insertError } = await supabase.from('profiles').insert(newProfile);
            if (!insertError) {
              await syncProfileLocally(newProfile);
              return newProfile;
            }
          }
          console.error('Error fetching Supabase profile:', error);
        } else if (data) {
          const profile: LocalProfile = {
            id: data.id,
            username: data.username,
            avatar_url: data.avatar_url,
            streak_count: data.streak_count || 0,
            last_studied_at: data.last_studied_at,
            total_cards_studied: data.total_cards_studied || 0,
            created_at: data.created_at
          };
          await syncProfileLocally(profile);
          return profile;
        }
      } catch (e) {
        console.error('Supabase fetch failed, fallback to local', e);
      }
    }
    return localProfile || null;
  };

  return {
    user: null,
    profile: null,
    isLoading: true,
    error: null,
    isOnline: navigator.onLine,

    setOnlineStatus: (status) => {
      set({ isOnline: status });
    },

    initialize: async () => {
      set({ isLoading: true });
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const profile = await loadProfile(session.user.id);
          set({ user: session.user, profile, isLoading: false });
        } else {
          set({ user: null, profile: null, isLoading: false });
        }

        // Set up reactive auth subscription
        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            const profile = await loadProfile(session.user.id);
            set({ user: session.user, profile, isLoading: false });
          } else {
            // Clear local user-specific caches on logout
            await db.profiles.clear();
            await db.decks.clear();
            await db.cards.clear();
            await db.study_sessions.clear();
            await db.card_reviews.clear();
            await db.sync_queue.clear();
            set({ user: null, profile: null, isLoading: false });
          }
        });
      } catch (err: any) {
        set({ error: err.message, isLoading: false });
      }
    },

    signIn: async (email, password) => {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
      if (data.user) {
        const profile = await loadProfile(data.user.id);
        set({ user: data.user, profile, isLoading: false });
      }
    },

    signUp: async (email, password, username) => {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });
      if (error) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
      if (data.user) {
        const newProfile: LocalProfile = {
          id: data.user.id,
          username,
          avatar_url: null,
          streak_count: 0,
          last_studied_at: null,
          total_cards_studied: 0,
          created_at: new Date().toISOString()
        };

        // Cache profile locally immediately
        await syncProfileLocally(newProfile);

        // If email confirmation is enabled in Supabase, session will be null
        if (!data.session) {
          set({ isLoading: false });
          throw new Error('A verification link has been sent to your email. Please verify your account before logging in.');
        }

        // If auto-logged in (email confirmation disabled), save profile to Supabase
        const { error: profileError } = await supabase.from('profiles').insert(newProfile);
        if (profileError) {
          console.error('Failed to create profile in Supabase:', profileError);
        }

        set({ user: data.user, profile: newProfile, isLoading: false });
      }
    },

    signInWithGoogle: async () => {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      });
      if (error) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
    },

    signOut: async () => {
      set({ isLoading: true });
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during signOut:', error);
      }
      // Resetting states (onAuthStateChange takes care of clearing tables)
      set({ user: null, profile: null, isLoading: false });
    },

    updateProfile: async (updates) => {
      const { profile, user, isOnline } = get();
      if (!profile || !user) return;

      const updatedProfile = { ...profile, ...updates };

      // Apply locally
      await db.profiles.put(updatedProfile);
      set({ profile: updatedProfile });

      // If online, sync to Supabase
      if (isOnline) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (error) {
          console.error('Failed to sync profile updates to Supabase:', error);
          // Queue sync mutation if write fails
          await db.sync_queue.add({
            table_name: 'profiles',
            action: 'UPDATE',
            record_id: user.id,
            payload: updates,
            created_at: Date.now()
          });
        }
      } else {
        // Queue sync mutation
        await db.sync_queue.add({
          table_name: 'profiles',
          action: 'UPDATE',
          record_id: user.id,
          payload: updates,
          created_at: Date.now()
        });
      }
    },

    deleteAccount: async () => {
      const { user } = get();
      if (!user) return;
      
      // Delete user's profile and related rows in Supabase
      // Note: Cascade deletes will remove cards/decks if configured, but let's clear DB explicitly
      await supabase.rpc('delete_user'); // Call custom function or let user request cascade
      
      // Since administrative users deletion is protected, we can delete their data:
      if (get().isOnline) {
        // Standard cascade trigger on delete is clean, but let's delete explicitly if RPC not present:
        await supabase.from('profiles').delete().eq('id', user.id);
      }

      await get().signOut();
    }
  };
});
