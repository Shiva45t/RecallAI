import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { useDeckStore } from '../stores/deck.store';
import { useUIStore } from '../stores/ui.store';
import { db } from '../lib/dexie';
import type { Deck } from '../types/deck.types';
import { DeckCard } from '../components/decks/DeckCard';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { DeckForm } from '../components/decks/DeckForm';
import {
  Sparkles,
  Flame,
  Layers,
  Calendar,
  Play,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuthStore();
  const { createDeck, loadDecks } = useDeckStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const [dueCount, setDueCount] = useState<number | null>(null);
  const [totalDecksCount, setTotalDecksCount] = useState<number>(0);
  const [recentDecks, setRecentDecks] = useState<Deck[]>([]);
  const [firstDueDeckId, setFirstDueDeckId] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const fetchDashboardStats = async () => {
    if (!user) return;
    try {
      const now = new Date().toISOString();
      
      // Calculate due cards count across all user's decks
      const dueCards = await db.cards
        .where('user_id').equals(user.id)
        .filter((card) => new Date(card.next_review_at) <= new Date(now))
        .toArray();

      setDueCount(dueCards.length);

      // Find the first deck that contains due cards
      if (dueCards.length > 0) {
        setFirstDueDeckId(dueCards[0].deck_id);
      } else {
        setFirstDueDeckId(null);
      }

      // Load total decks count
      const decks = await db.decks.where('user_id').equals(user.id).toArray();
      setTotalDecksCount(decks.length);

      // Fetch top 3 recently modified decks
      const recent = await db.decks
        .where('user_id').equals(user.id)
        .reverse()
        .sortBy('updated_at');
        
      setRecentDecks(recent.slice(0, 3));
    } catch (err) {
      console.error('Failed to load dashboard statistics from local cache:', err);
    }
  };

  useEffect(() => {
    // Load store decks initially
    loadDecks().then(() => {
      fetchDashboardStats();
    });
  }, [user, loadDecks]);

  const handleCreateDeckSubmit = async (data: any) => {
    setFormLoading(true);
    try {
      await createDeck(data);
      addToast('Deck created successfully!', 'success');
      setIsModalOpen(false);
      fetchDashboardStats(); // Refresh count
    } catch (err: any) {
      addToast(err.message || 'Failed to create deck', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleQuickStudyClick = () => {
    if (firstDueDeckId) {
      navigate(`/study/${firstDueDeckId}`);
    } else if (recentDecks.length > 0) {
      navigate(`/study/${recentDecks[0].id}`);
    } else {
      addToast('Create a deck first to start studying!', 'info');
      setIsModalOpen(true);
    }
  };

  // Get greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Visual Header / Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
            {getGreeting()}, {profile?.username || 'Learner'}! 👋
          </h1>
          <p className="text-sm text-gray-550 dark:text-gray-400 mt-1">
            Let's review some flashcards and grow your memory muscle today.
          </p>
        </div>
      </div>

      {/* Stats Widgets Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Streak Widget */}
        <div className="neo-glass-card p-6 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Study Streak
            </span>
            <div className="text-2xl font-black flex items-baseline gap-1">
              <span>{profile?.streak_count || 0}</span>
              <span className="text-sm font-bold text-gray-500 dark:text-gray-450">days</span>
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {profile?.streak_count && profile.streak_count > 0
                ? 'Keep the momentum going! 🔥'
                : 'Study a card to start a streak!'}
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform duration-200">
            <Flame className="w-6 h-6 fill-current" />
          </div>
        </div>

        {/* Due Cards Widget */}
        <div className="neo-glass-card p-6 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Due for Review
            </span>
            <div className="text-2xl font-black flex items-baseline gap-1">
              <span>{dueCount !== null ? dueCount : '...'}</span>
              <span className="text-sm font-bold text-gray-500 dark:text-gray-450">cards</span>
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {dueCount && dueCount > 0 ? 'Cards waiting for you.' : 'All caught up! 🎉'}
            </p>
          </div>
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-500 group-hover:scale-105 transition-transform duration-200">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Total Decks Widget */}
        <div className="neo-glass-card p-6 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Decks
            </span>
            <div className="text-2xl font-black flex items-baseline gap-1">
              <span>{totalDecksCount}</span>
              <span className="text-sm font-bold text-gray-500 dark:text-gray-450">categories</span>
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Active study groups.
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform duration-200">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Study / CTA Area */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-650 via-indigo-600 to-violet-600 dark:from-indigo-950/60 dark:via-indigo-900/60 dark:to-violet-950/60 text-white border-2 border-slate-900 dark:border-indigo-500/20 shadow-[4px_4px_0px_0px_#0f172a] dark:shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <h2 className="text-xl font-bold flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-amber-400 fill-current animate-pulse" /> Supercharge Your Learning
          </h2>
          <p className="text-sm text-indigo-100 dark:text-indigo-200">
            {dueCount && dueCount > 0
              ? `You have ${dueCount} cards due. Run a review session now to commit them to long-term memory.`
              : 'Create a deck and use Groq AI to generate structured flashcards from text, topic keywords, or PDF lecture uploads instantly.'}
          </p>
        </div>
        <div className="flex gap-3 z-10 flex-shrink-0">
          {dueCount && dueCount > 0 ? (
            <Button
              onClick={handleQuickStudyClick}
              size="lg"
              variant="outline"
              className="!bg-white !text-indigo-700 hover:!bg-gray-50 active:scale-95 shadow-md shadow-indigo-800/10 gap-2 !border-transparent"
            >
              <Play className="w-4 h-4 fill-current text-indigo-700" /> Study Due Cards
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/generate')}
              size="lg"
              variant="outline"
              className="!bg-white !text-indigo-700 hover:!bg-gray-50 active:scale-95 shadow-md shadow-indigo-800/10 gap-2 !border-transparent"
            >
              <Sparkles className="w-4 h-4 text-amber-500 fill-current" /> Generate cards
            </Button>
          )}
          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Create Deck
          </Button>
        </div>
      </div>

      {/* Recent Decks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-950 dark:text-gray-50 flex items-center gap-2">
            Recent Study Decks
          </h3>
          {totalDecksCount > 3 && (
            <Button
              onClick={() => navigate('/decks')}
              variant="ghost"
              size="sm"
              className="text-xs flex items-center gap-1"
            >
              View All Decks <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {recentDecks.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-900 dark:border-gray-800 rounded-2xl p-10 text-center bg-white/40 dark:bg-darkSurface/10 backdrop-blur-sm shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-none">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
              You haven't created any decks yet.
            </p>
            <Button onClick={() => setIsModalOpen(true)} className="gap-1">
              <Plus className="w-4 h-4" /> Create Deck
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentDecks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        )}
      </div>

      {/* Modal for creating deck */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Deck">
        <DeckForm onSubmit={handleCreateDeckSubmit} onCancel={() => setIsModalOpen(false)} isLoading={formLoading} />
      </Modal>
    </div>
  );
};
