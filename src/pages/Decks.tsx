import React, { useEffect, useState } from 'react';
import { useDeckStore } from '../stores/deck.store';
import { useUIStore } from '../stores/ui.store';
import { DeckGrid } from '../components/decks/DeckGrid';
import { DeckForm } from '../components/decks/DeckForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Search, Filter } from 'lucide-react';
import type { Deck } from '../types/deck.types';

export const Decks: React.FC = () => {
  const { decks, isLoading, loadDecks, createDeck, updateDeck, deleteDeck } = useDeckStore();
  const { addToast } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  // Extract unique subjects for filtering dropdown
  const subjects = Array.from(
    new Set(decks.map((deck) => deck.subject).filter(Boolean))
  ) as string[];

  // Filter logic
  const filteredDecks = decks.filter((deck) => {
    const matchesSearch = deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deck.description && deck.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSubject = !selectedSubject || deck.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });

  const handleCreateDeck = async (data: any) => {
    setFormLoading(true);
    try {
      await createDeck(data);
      addToast('Deck created successfully!', 'success');
      setIsModalOpen(false);
    } catch (err: any) {
      addToast(err.message || 'Failed to create deck', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateDeck = async (data: any) => {
    if (!editingDeck) return;
    setFormLoading(true);
    try {
      await updateDeck(editingDeck.id, data);
      addToast('Deck updated successfully!', 'success');
      setIsModalOpen(false);
      setEditingDeck(null);
    } catch (err: any) {
      addToast(err.message || 'Failed to update deck', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (deck: Deck) => {
    setEditingDeck(deck);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    try {
      await deleteDeck(id);
      addToast('Deck deleted successfully!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to delete deck', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingDeck(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
            Study Decks
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create decks to categorize your study materials and track progress.
          </p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2 self-start sm:self-center">
          <Plus className="w-4 h-4" /> Create Deck
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 neo-glass-card-static p-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-4.5 w-4.5 text-gray-400" />
          <Input
            placeholder="Search decks by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Subject Filter dropdown */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl border-2 border-slate-900 bg-white/60 dark:bg-darkSurface backdrop-blur-sm text-gray-900 dark:text-gray-100 transition-all outline-none shadow-[2px_2px_0px_0px_#0f172a] focus:shadow-[4px_4px_0px_0px_#0f172a] focus:translate-x-[-2px] focus:translate-y-[-2px] cursor-pointer dark:border dark:border-gray-800 dark:shadow-none dark:transform-none dark:focus:ring-2 dark:focus:ring-indigo-500/20 dark:focus:border-indigo-500"
          >
            <option value="">All Subjects</option>
            {subjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Decks Grid */}
      <DeckGrid
        decks={filteredDecks}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        isLoading={isLoading}
        emptyAction={
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="w-4 h-4" /> Create Your First Deck
          </Button>
        }
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDeck(null);
        }}
        title={editingDeck ? 'Edit Deck' : 'Create New Deck'}
      >
        <DeckForm
          initialValues={
            editingDeck
              ? {
                  title: editingDeck.title,
                  description: editingDeck.description || '',
                  subject: editingDeck.subject || '',
                  color: editingDeck.color,
                }
              : undefined
          }
          onSubmit={editingDeck ? handleUpdateDeck : handleCreateDeck}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingDeck(null);
          }}
          isLoading={formLoading}
        />
      </Modal>
    </div>
  );
};
