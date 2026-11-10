import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDeckStore } from '../stores/deck.store';
import { useUIStore } from '../stores/ui.store';
import { aiService } from '../services/ai.service';
import { cardService } from '../services/card.service';
import { TopicInput } from '../components/generate/TopicInput';
import { TextInput } from '../components/generate/TextInput';
import { PDFUpload } from '../components/generate/PDFUpload';
import { GeneratedPreview } from '../components/generate/GeneratedPreview';
import type { GeneratedCard } from '../types/ai.types';
import {
  Sparkles,
  ArrowLeft,
  FileText,
  Type,
  BookOpen,
  GraduationCap
} from 'lucide-react';

type TabType = 'topic' | 'text' | 'pdf';

export const Generate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { decks, loadDecks } = useDeckStore();
  const { addToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<TabType>('topic');
  const [selectedDeckId, setSelectedDeckId] = useState(searchParams.get('deckId') || '');
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[] | null>(null);
  
  // Loader states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const handleGenerateSubmit = async (promptContent: string, count: number) => {
    setIsGenerating(true);
    try {
      addToast('Asking Groq AI to write cards...', 'info');
      const cards = await aiService.generateCards(promptContent, count);
      
      if (cards.length === 0) {
        throw new Error('AI was unable to formulate flashcards from the provided content.');
      }
      
      setGeneratedCards(cards);
      addToast(`Successfully generated ${cards.length} cards!`, 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Generation failed. Try simplifying the content.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCards = async (approvedCards: GeneratedCard[]) => {
    if (!selectedDeckId) {
      addToast('Please select a destination deck first.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      addToast(`Adding ${approvedCards.length} cards to the deck...`, 'info');
      
      // Save all cards sequentially (handles Dexie + Supabase writes)
      for (const card of approvedCards) {
        await cardService.createCard({
          deck_id: selectedDeckId,
          question: card.question,
          answer: card.answer,
        });
      }
      
      addToast(`Saved ${approvedCards.length} cards successfully!`, 'success');
      // Redirect to the deck detail view
      navigate(`/decks/${selectedDeckId}`);
    } catch (err: any) {
      addToast(err.message || 'Failed to save cards.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelPreview = () => {
    setGeneratedCards(null);
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="relative">
          <GraduationCap className="w-16 h-16 text-indigo-500 animate-bounce" />
          <Sparkles className="w-6 h-6 text-amber-500 fill-current absolute top-0 right-0 animate-ping" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            AI is thinking...
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            We are analyzing your lecture contents to formulate conceptual Q&A flashcards. This might take a few moments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-250 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {!generatedCards ? (
        /* Setup Phase */
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-amber-500 fill-current" /> AI Flashcard Creator
            </h1>
            <p className="text-sm text-gray-550 dark:text-gray-400 mt-1">
              Select an input mode to generate spaced repetition cards instantly with Groq.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-150 dark:border-gray-800">
            <button
              onClick={() => setActiveTab('topic')}
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
                activeTab === 'topic'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-650'
              }`}
            >
              <Type className="w-4 h-4" /> Study Topic
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
                activeTab === 'text'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-650'
              }`}
            >
              <FileText className="w-4 h-4" /> Paste Notes
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
                activeTab === 'pdf'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-650'
              }`}
            >
              <BookOpen className="w-4 h-4" /> PDF Document
            </button>
          </div>

          {/* Tab Views */}
          <div className="neo-glass-card-static p-6">
            {activeTab === 'topic' && (
              <TopicInput onSubmit={handleGenerateSubmit} isLoading={isGenerating} />
            )}
            {activeTab === 'text' && (
              <TextInput onSubmit={handleGenerateSubmit} isLoading={isGenerating} />
            )}
            {activeTab === 'pdf' && (
              <PDFUpload onSubmit={handleGenerateSubmit} isLoading={isGenerating} />
            )}
          </div>
        </div>
      ) : (
        /* Review Draft Phase */
        <div className="max-w-4xl mx-auto neo-glass-card-static p-6">
          <GeneratedPreview
            initialCards={generatedCards}
            decks={decks}
            selectedDeckId={selectedDeckId}
            onDeckIdChange={setSelectedDeckId}
            onSave={handleSaveCards}
            onCancel={handleCancelPreview}
            isLoading={isSaving}
          />
        </div>
      )}
    </div>
  );
};
