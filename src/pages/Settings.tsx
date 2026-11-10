import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { useUIStore } from '../stores/ui.store';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import {
  Moon,
  Sun,
  Trash2,
  Camera,
  Save,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const { user, profile, updateProfile, deleteAccount, isLoading: authLoading } = useAuthStore();
  const { theme, setTheme, addToast } = useUIStore();
  const navigate = useNavigate();

  const [username, setUsername] = useState(profile?.username || '');
  const [defaultGenCount, setDefaultGenCount] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (profile?.username) setUsername(profile.username);
    
    const count = localStorage.getItem('defaultGenCount');
    if (count) {
      setDefaultGenCount(parseInt(count, 10));
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      addToast('Username cannot be empty', 'warning');
      return;
    }
    
    try {
      await updateProfile({ username: username.trim() });
      addToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update username.', 'error');
    }
  };

  const handleGenCountChange = (count: number) => {
    setDefaultGenCount(count);
    localStorage.setItem('defaultGenCount', String(count));
    addToast(`Default generation count set to ${count}`, 'success');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check size limit (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      addToast('Avatar file size must be less than 2MB.', 'warning');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`;

      // Upload file to Supabase avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Save public URL in profile
      await updateProfile({ avatar_url: publicUrl });
      addToast('Profile avatar uploaded successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      addToast('Failed to upload avatar. Check your storage bucket setup.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      addToast('Your account was successfully deleted.', 'success');
      navigate('/auth');
    } catch (err: any) {
      addToast(err.message || 'Failed to delete account.', 'error');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
          User Settings
        </h1>
        <p className="text-sm text-gray-555 dark:text-gray-400 mt-1">
          Update your profile preferences, display styling, and manage your account.
        </p>
      </div>

      {/* Profile Section */}
      <div className="neo-glass-card-static p-6 space-y-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-50 border-b border-gray-100 dark:border-gray-805 pb-3">
          Profile Details
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar Picture */}
          <div className="relative group">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-black text-3xl shadow-sm">
                {profile?.username ? profile.username.substring(0, 2).toUpperCase() : 'AI'}
              </div>
            )}
            
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-750 text-white flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-all">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          <form onSubmit={handleSaveProfile} className="flex-1 w-full space-y-4">
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={authLoading}
            />
            <Button
              type="submit"
              variant="primary"
              className="gap-2"
              isLoading={authLoading}
            >
              <Save className="w-4 h-4" /> Update Name
            </Button>
          </form>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="neo-glass-card-static p-6 space-y-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-50 border-b border-gray-100 dark:border-gray-805 pb-3">
          App Preferences
        </h3>

        {/* Theme select */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 block">
              Color Theme
            </span>
            <span className="text-xs text-gray-500">
              Switch between dark and light modes.
            </span>
          </div>

          <div className="flex bg-gray-100 dark:bg-darkBg p-1 rounded-xl border border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setTheme('light')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                theme === 'light'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                theme === 'dark'
                  ? 'bg-darkSurface text-indigo-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> Dark
            </button>
          </div>
        </div>

        {/* Default Gen count */}
        <div className="flex flex-col gap-2 pt-2">
          <div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 block">
              Default AI Card Count
            </span>
            <span className="text-xs text-gray-500">
              Default count used in flashcard generator modes.
            </span>
          </div>

          <div className="flex gap-2">
            {[5, 10, 15, 20].map((num) => (
              <button
                key={num}
                onClick={() => handleGenCountChange(num)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all active:scale-[0.98] ${
                  defaultGenCount === num
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'bg-white dark:bg-darkSurface border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dangerous Section */}
      <div className="neo-glass-card-rose p-6 space-y-4">
        <h3 className="text-base font-bold text-rose-600 dark:text-rose-455 border-b border-rose-50 dark:border-rose-950/20 pb-3">
          Danger Zone
        </h3>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 block">
              Delete Account
            </span>
            <span className="text-xs text-gray-500">
              Permanently delete all your flashcards, decks, and profile study data.
            </span>
          </div>
          
          <Button
            onClick={() => setIsDeleteModalOpen(true)}
            variant="danger"
            className="gap-1.5 text-xs py-2 self-start sm:self-center"
          >
            <Trash2 className="w-4 h-4" /> Delete Account
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 text-rose-950 rounded-xl dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-200">
            <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0" />
            <div className="text-xs leading-relaxed font-semibold">
              Warning: This action is irreversible. All of your custom decks, flashcards, study history, and strengths logs will be deleted forever.
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            Are you absolutely sure you want to proceed with deleting your account?
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              isLoading={isDeleting}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
