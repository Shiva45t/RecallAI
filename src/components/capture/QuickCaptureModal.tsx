import React, { useState, useEffect } from 'react';
import { useDeckStore } from '../../stores/deck.store';
import { useUIStore } from '../../stores/ui.store';
import { cardService } from '../../services/card.service';
import { groq, GROQ_MODELS } from '../../lib/groq';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Plus, Sparkles, Save, Layers } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const QuickCaptureModal: React.FC = () => {
  const location = useLocation();
  const { decks, loadDecks } = useDeckStore();
  const { addToast } = useUIStore();

  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedDeckId, setSelectedDeckId] = useState('');
  
  // Loaders
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDecks();
    }
  }, [isOpen, loadDecks]);

  // Set default selected deck if currently on a deck page
  useEffect(() => {
    const match = location.pathname.match(/\/decks\/([a-f0-9-]+)/i);
    if (match && match[1]) {
      setSelectedDeckId(match[1]);
    }
  }, [location, isOpen]);

  // Hide the floating action button on public routes (Landing page and Auth page)
  const isPublicRoute = location.pathname === '/' || location.pathname === '/auth';
  if (isPublicRoute) return null;

  const handleAiAnswer = async () => {
    if (!question.trim()) {
      addToast('Please enter a question first.', 'warning');
      return;
    }

    setIsAiLoading(true);
    try {
      const selectedDeck = decks.find((d) => d.id === selectedDeckId);
      const subjectText = selectedDeck?.subject ? `(Subject: ${selectedDeck.subject})` : '';

      const completion = await groq.chat.completions.create({
        model: GROQ_MODELS.FAST, // Use Llama 3.1 8B for fast answer drafting
        messages: [
          {
            role: 'system',
            content: 'You are an expert tutor. Provide a concise, high-quality, direct answer (1-3 sentences) to the question. Do not include markdown formatting, conversational introductions, or explanations. Respond with the answer text ONLY.'
          },
          {
            role: 'user',
            content: `Question: ${question} ${subjectText}`
          }
        ],
        temperature: 0.4
      });

      const aiText = completion.choices[0]?.message?.content;
      if (aiText) {
        setAnswer(aiText.trim());
        addToast('AI drafted the answer successfully!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'AI Answer service failed.', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeckId) {
      addToast('Please select a deck.', 'warning');
      return;
    }
    if (!question.trim() || !answer.trim()) {
      addToast('Both question and answer are required.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      await cardService.createCard({
        deck_id: selectedDeckId,
        question: question.trim(),
        answer: answer.trim(),
      });
      addToast('Card created successfully!', 'success');
      
      // Reset form fields
      setQuestion('');
      setAnswer('');
      setIsOpen(false);
    } catch (err: any) {
      addToast(err.message || 'Failed to create card.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) - Elevated on mobile to clear bottom navigation */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-6 z-45 w-14 h-14 bg-indigo-600 hover:bg-indigo-750 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
        title="Quick Capture Flashcard"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Modal interface */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Quick Capture Flashcard">
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Deck selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-305 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Destination Deck
            </label>
            <select
              value={selectedDeckId}
              onChange={(e) => setSelectedDeckId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkSurface text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer font-medium"
              disabled={isSaving}
            >
              <option value="">-- Choose a deck --</option>
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.title} {deck.subject ? `(${deck.subject})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Question */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What question do you want to ask?"
              rows={2}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkSurface text-gray-900 dark:text-gray-105 transition-all outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400"
              disabled={isSaving}
            />
          </div>

          {/* Answer + AI helper */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Answer
              </label>
              <Button
                type="button"
                onClick={handleAiAnswer}
                size="sm"
                variant="outline"
                className="text-[10px] py-0.5 px-2 gap-1 border-amber-250 text-amber-600 dark:border-amber-900 dark:text-amber-450 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                disabled={isAiLoading || isSaving}
              >
                <Sparkles className="w-3 h-3 text-amber-500 fill-current" /> AI Answer
              </Button>
            </div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Provide answer details or click 'AI Answer' to auto-draft..."
              rows={3}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkSurface text-gray-900 dark:text-gray-105 transition-all outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400"
              disabled={isAiLoading || isSaving}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="gap-1.5"
              isLoading={isSaving}
              disabled={isAiLoading || !selectedDeckId}
            >
              <Save className="w-4 h-4" /> Save Card
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
