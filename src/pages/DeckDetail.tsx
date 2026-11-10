import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/dexie';
import type { Deck } from '../types/deck.types';
import type { Card } from '../types/card.types';
import { cardService } from '../services/card.service';
import { useUIStore } from '../stores/ui.store';
import { CardGrid } from '../components/cards/CardGrid';
import { CardEditor } from '../components/cards/CardEditor';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, Plus, Sparkles, Play, Search, GraduationCap } from 'lucide-react';

export const DeckDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const loadDeckAndCards = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const deckData = await db.decks.get(id);
      if (!deckData) {
        addToast('Deck not found', 'error');
        navigate('/decks');
        return;
      }
      setDeck(deckData);
      
      const cardsData = await cardService.getCards(id);
      setCards(cardsData);
    } catch (err) {
      console.error('Failed to load deck details:', err);
      addToast('Failed to load card information', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeckAndCards();
  }, [id]);

  // Search card filtering
  const filteredCards = cards.filter((card) =>
    card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCard = async (data: any) => {
    if (!id) return;
    setFormLoading(true);
    try {
      await cardService.createCard({
        deck_id: id,
        question: data.question,
        answer: data.answer,
      });
      addToast('Card created successfully!', 'success');
      setIsModalOpen(false);
      // Reload cards to refresh stats and count
      await loadDeckAndCards();
    } catch (err: any) {
      addToast(err.message || 'Failed to create card', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateCard = async (data: any) => {
    if (!editingCard) return;
    setFormLoading(true);
    try {
      await cardService.updateCard(editingCard.id, data);
      addToast('Card updated successfully!', 'success');
      setIsModalOpen(false);
      setEditingCard(null);
      await loadDeckAndCards();
    } catch (err: any) {
      addToast(err.message || 'Failed to update card', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await cardService.deleteCard(cardId);
      addToast('Card deleted successfully!', 'success');
      await loadDeckAndCards();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete card', 'error');
    }
  };

  const handleEditClick = (card: Card) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingCard(null);
    setIsModalOpen(true);
  };

  if (isLoading && !deck) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <GraduationCap className="w-10 h-10 animate-bounce text-indigo-500" />
        <span className="mt-4 text-sm font-semibold text-gray-500">Loading deck details...</span>
      </div>
    );
  }

  if (!deck) return null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate('/decks')}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Decks
      </button>

      {/* Header Info Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-darkSurface border border-gray-150 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
        <div className="flex items-start gap-4">
          <div
            className="w-4 h-16 rounded-lg flex-shrink-0"
            style={{ backgroundColor: deck.color }}
          />
          <div className="space-y-1 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
                {deck.title}
              </h1>
              {deck.subject && <Badge variant="secondary">{deck.subject}</Badge>}
            </div>
            <p className="text-sm text-gray-550 dark:text-gray-400">
              {deck.description || 'No description provided.'}
            </p>
            <div className="text-xs text-gray-400 font-medium">
              Total: {cards.length} cards • Studied from local cache
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={openCreateModal} variant="outline" className="gap-1.5">
            <Plus className="w-4 h-4" /> Add Card
          </Button>
          <Button onClick={() => navigate(`/generate?deckId=${deck.id}`)} variant="outline" className="gap-1.5 border-amber-200 text-amber-600 dark:border-amber-900/50 dark:text-amber-450 hover:bg-amber-50 dark:hover:bg-amber-950/20">
            <Sparkles className="w-4 h-4 text-amber-500 fill-current" /> AI Generate
          </Button>
          {cards.length > 0 && (
            <Button onClick={() => navigate(`/study/${deck.id}`)} variant="primary" className="gap-1.5">
              <Play className="w-4 h-4 fill-current" /> Study Deck
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 bg-white dark:bg-darkSurface border border-gray-150 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-4.5 w-4.5 text-gray-400" />
          <Input
            placeholder="Search questions or answers in this deck..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Cards Display Grid */}
      <CardGrid
        cards={filteredCards}
        onEdit={handleEditClick}
        onDelete={handleDeleteCard}
        isLoading={isLoading}
      />

      {/* Card Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCard(null);
        }}
        title={editingCard ? 'Edit Flashcard' : 'Add Flashcard'}
      >
        <CardEditor
          initialValues={
            editingCard
              ? { question: editingCard.question, answer: editingCard.answer }
              : undefined
          }
          onSubmit={editingCard ? handleUpdateCard : handleCreateCard}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingCard(null);
          }}
          isLoading={formLoading}
        />
      </Modal>
    </div>
  );
};
