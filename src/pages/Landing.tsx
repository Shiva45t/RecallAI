import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { useUIStore } from '../stores/ui.store';
import { Button } from '../components/ui/Button';
import { aiService } from '../services/ai.service';
import {
  GraduationCap,
  Sparkles,
  BrainCircuit,
  ArrowRight,
  MousePointerClick,
  RefreshCw,
  Cpu,
  Database,
  Search,
  BookOpen,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoCard {
  question: string;
  answer: string;
}

const DEMO_TOPICS: Record<string, DemoCard> = {
  'spaced-repetition': {
    question: 'How does spaced repetition optimize memory consolidation?',
    answer: 'It schedules card reviews at expanding intervals (e.g. Day 1, 3, 8, 19) precisely before you are about to forget. This leverages the psychological spacing effect, forcing active recall and strengthening long-term memory retrieval pathways.'
  },
  'quantum-physics': {
    question: 'What is quantum superposition in simple terms?',
    answer: 'It is the ability of a quantum system (like an electron) to exist in multiple states or configurations simultaneously. Only when a measurement is made does the system collapse into a single, defined classical state.'
  },
  'javascript-closures': {
    question: 'What is a closure in JavaScript and why is it useful?',
    answer: 'A closure is a function that remembers and accesses its lexical scope (outer variables) even when executed outside that scope. It is useful for data encapsulation, currying, and creating stateful factory functions.'
  },
  'photosynthesis': {
    question: 'What is the light-dependent stage of photosynthesis?',
    answer: 'It occurs in the thylakoid membranes, where chlorophyll absorbs sunlight to split water molecules (photolysis), releasing oxygen as a byproduct and generating energy-rich ATP and NADPH molecules to power the Calvin Cycle.'
  }
};

export const Landing: React.FC = () => {
  const { user } = useAuthStore();
  const { theme, toggleTheme, addToast } = useUIStore();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, damping: 25, stiffness: 180 }
    }
  };

  // Demo States
  const [selectedTopic, setSelectedTopic] = useState<string>('spaced-repetition');
  const [customInput, setCustomInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [cardContent, setCardContent] = useState<DemoCard>(DEMO_TOPICS['spaced-repetition']);

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleParallaxMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const rotateX = -y / 20;
    const rotateY = x / 20;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.transition = 'none';
  };

  const handleParallaxLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
  };

  const handleSelectTopic = (key: string) => {
    if (isGenerating) return;
    setSelectedTopic(key);
    setIsFlipped(false);
    setIsGenerating(true);
    
    // Simulate minor visual generation delay for premium feel
    setTimeout(() => {
      setCardContent(DEMO_TOPICS[key]);
      setIsGenerating(false);
    }, 600);
  };

  const handleGenerateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim() || isGenerating) return;

    setIsFlipped(false);
    setIsGenerating(true);
    setSelectedTopic('custom');

    try {
      // Call actual AI service to generate a real card in real-time!
      const generated = await aiService.generateCards(
        `Generate a single high-quality flashcard explaining: ${customInput}`,
        1
      );
      if (generated && generated.length > 0) {
        setCardContent({
          question: generated[0].question,
          answer: generated[0].answer
        });
        addToast('Flashcard generated successfully using Groq AI!', 'success');
      } else {
        throw new Error('Empty response');
      }
    } catch (err) {
      // Fallback in case of rate-limits or missing API keys
      console.warn('Real AI generation failed, falling back to mock card.', err);
      setTimeout(() => {
        setCardContent({
          question: `What is the core concept of ${customInput}?`,
          answer: `Here is a custom explanation of ${customInput} mapped dynamically. (To enable full live AI generation, verify that your Groq VITE_GROQ_API_KEY is configured in your .env.local file).`
        });
      }, 1000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-gray-900 dark:text-gray-100 selection:bg-indigo-500/20 relative overflow-hidden">
      {/* 3D Animated Background Mesh & Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">

        {/* Blob 1 (Indigo) */}
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 50, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-[10%] left-[5%] w-[45vw] h-[45vw] rounded-full bg-indigo-500/10 dark:bg-indigo-500/8 blur-[120px]"
        />

        {/* Blob 2 (Violet) */}
        <motion.div
          animate={{
            x: [0, -50, 70, 0],
            y: [0, 80, -60, 0],
            scale: [1, 0.85, 1.15, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-[30%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-violet-500/10 dark:bg-violet-500/8 blur-[130px]"
        />

        {/* Blob 3 (Fuchsia / Rose) */}
        <motion.div
          animate={{
            x: [0, 60, -80, 0],
            y: [0, 40, 70, 0],
            scale: [1, 1.1, 0.8, 1],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-fuchsia-500/8 dark:bg-fuchsia-500/6 blur-[120px]"
        />

        {/* Floating background sparks */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.3 + 0.1
            }}
            animate={{
              y: ['0%', '-20%', '0%'],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-500/80 blur-[1px]"
          />
        ))}
      </div>

      <header className="w-full max-w-none px-6 md:px-12 lg:px-16 h-20 flex items-center justify-between border-b border-gray-150 dark:border-gray-800/40 z-20">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <GraduationCap className="w-9 h-9" />
          <span className="text-2xl font-extrabold tracking-tight">
            Recall<span className="text-violet-600 dark:text-violet-400">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="border-2 border-slate-900 bg-white/70 dark:bg-white/10 dark:border-white p-2 rounded-xl text-slate-900 dark:text-white shadow-[2px_2px_0px_0px_#0f172a] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_#0f172a] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Button
            onClick={() => navigate('/auth')}
            size="sm"
            variant="outline"
            className="hidden sm:inline-flex border-gray-255 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-darkSurface"
          >
            Sign In
          </Button>
          <Button onClick={handleStart} size="sm" variant="primary">
            {user ? 'Go to Dashboard' : 'Get Started'}
          </Button>
        </div>
      </header>

      {/* Hero & Interactive Demo Section */}
      <main className="flex-1 flex flex-col justify-center w-full max-w-none px-6 md:px-12 lg:px-16 py-12 md:py-16 z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
        >
          {/* Hero text */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900/50 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse text-amber-500" />
              <span>Next-Gen AI Spaced Repetition</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Learn Smarter.<br />
              Remember <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400">
                Forever.
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-base sm:text-lg text-gray-555 dark:text-gray-400 max-w-lg leading-relaxed font-medium">
              Upload lectures, drag study PDFs, or write topics. RecallAI builds premium interactive flashcards instantly, scheduling them with the SM-2 algorithm to optimize your long-term memory retrieval.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Button onClick={handleStart} size="lg" className="flex items-center justify-center gap-2 group font-bold shadow-lg shadow-indigo-600/10">
                Start Studying Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => {
                  const demoEl = document.getElementById('playground');
                  demoEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                size="lg"
                variant="outline"
                className="font-bold border-gray-250 dark:border-gray-800 dark:hover:bg-darkSurface hover:bg-gray-100"
              >
                Try Live Playground
              </Button>
            </motion.div>

            {/* Quick Stats banner */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-150 dark:border-gray-850 max-w-md">
              <div>
                <h4 className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">100%</h4>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">PWA Offline</p>
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">SM-2</h4>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Sci-Proven</p>
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">Llama 3</h4>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">AI Powered</p>
              </div>
            </motion.div>
          </div>

          {/* Interactive Playground Graphic Panel */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-6 relative w-full flex justify-center"
            id="playground"
          >
            <div
              onMouseMove={handleParallaxMove}
              onMouseLeave={handleParallaxLeave}
              className="w-full max-w-lg bg-white/70 dark:bg-darkSurface/65 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-xl backdrop-blur-md flex flex-col gap-5 transition-transform duration-200 ease-out will-change-transform transform-style-3d"
            >
              
              {/* Window Controls Decorator */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-850">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/90" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/90" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/90" />
                </div>
                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Interactive Playground</span>
                </div>
              </div>

              {/* Topic Selector Pills */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-555 uppercase tracking-wider block">
                  Select a concept
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(DEMO_TOPICS).map((key) => (
                    <button
                      key={key}
                      onClick={() => handleSelectTopic(key)}
                      disabled={isGenerating}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedTopic === key
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-650 hover:bg-gray-100 dark:bg-darkBg/40 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-darkBg/80'
                      }`}
                    >
                      {key === 'spaced-repetition' && '🧠 Spaced Repetition'}
                      {key === 'quantum-physics' && '🌌 Quantum Physics'}
                      {key === 'javascript-closures' && '💻 JS Closures'}
                      {key === 'photosynthesis' && '🌿 Photosynthesis'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Topic Input */}
              <form onSubmit={handleGenerateCustom} className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-555 uppercase tracking-wider block">
                  Or enter your own custom topic
                </span>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="e.g. Mitochondria, Black Holes, DNA..."
                      disabled={isGenerating}
                      className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50/50 dark:bg-darkBg/30 border border-gray-155 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="gap-1 font-bold text-xs"
                    disabled={isGenerating || !customInput.trim()}
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    Generate
                  </Button>
                </div>
              </form>

              {/* 3D Demo Flippable Card */}
              <div className="relative h-48 w-full perspective-1000 select-none group mt-2">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    /* Loading/Generating card display */
                    <motion.div
                      key="generating"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full h-full rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-900 bg-indigo-50/10 dark:bg-indigo-950/10 flex flex-col items-center justify-center p-6 text-center space-y-3"
                    >
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-gray-105">Llama-3.3-70b-versatile thinking...</h4>
                        <p className="text-[9px] text-gray-400 mt-0.5">Synthesizing study prompt and extracting core card concepts</p>
                      </div>
                      <div className="w-32 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full animate-progress" style={{ width: '60%' }} />
                      </div>
                    </motion.div>
                  ) : (
                    /* Flippable Demo Card */
                    <motion.div
                      key="card"
                      initial={{ opacity: 0, scale: 0.98, rotateY: 0 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        rotateY: isFlipped ? 180 : 0
                      }}
                      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="w-full h-full cursor-pointer relative transform-style-3d shadow-lg hover:shadow-xl rounded-2xl"
                    >
                      {/* Card Front Side */}
                      <div className="absolute inset-0 w-full h-full backface-hidden bg-gray-50/50 dark:bg-darkBg/60 border border-gray-150 dark:border-gray-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/25 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-extrabold text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {selectedTopic === 'custom' ? 'AI Custom Generated' : 'Interactive Demo'}
                          </span>
                          <MousePointerClick className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors animate-pulse" />
                        </div>
                        <h3 className="text-sm sm:text-base font-extrabold text-center text-gray-900 dark:text-gray-50 px-2 line-clamp-3 leading-relaxed">
                          {cardContent.question}
                        </h3>
                        <div className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Tap card to reveal answer</span>
                        </div>
                      </div>

                      {/* Card Back Side */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-indigo-50/10 dark:bg-indigo-950/10 border border-indigo-150 dark:border-indigo-900/50 rounded-2xl p-6 flex flex-col justify-between">
                        <div className="border-b border-indigo-100 dark:border-indigo-900/40 pb-2 flex items-center justify-between">
                          <span className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                            AI Answer Explanation
                          </span>
                          <span className="text-[9px] text-gray-400 font-medium">Click to flip back</span>
                        </div>
                        <p className="text-xs text-gray-650 dark:text-gray-250 leading-relaxed font-semibold overflow-y-auto max-h-[90px] pr-1 py-1">
                          {cardContent.answer}
                        </p>
                        <div className="text-center text-[9px] text-indigo-500 dark:text-indigo-400 font-extrabold uppercase tracking-wide">
                          Matches SuperMemo SM-2 calculation schedules
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <section className="mt-24 md:mt-32">
          <div className="text-center space-y-3 mb-16 max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white">
              Engineered for Premium Learning
            </h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-450 leading-relaxed">
              We bridge cognitive science with bleeding-edge artificial intelligence, creating a robust, installable offline study assistant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/50 dark:bg-darkSurface/40 border border-gray-150 dark:border-gray-800/80 p-6 rounded-3xl flex flex-col gap-4 shadow-sm hover:scale-102 hover:shadow hover:border-indigo-500/25 transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 dark:text-gray-50">Spaced Repetition (SM-2)</h3>
                <p className="text-xs text-gray-555 dark:text-gray-400 mt-2 leading-relaxed">
                  Scientifically calculated intervals minimize forgetting cycles. Automatically logs user rating ease metrics to compute personal card retention schedules.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/50 dark:bg-darkSurface/40 border border-gray-150 dark:border-gray-800/80 p-6 rounded-3xl flex flex-col gap-4 shadow-sm hover:scale-102 hover:shadow hover:border-indigo-500/25 transition-all duration-300">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                <Sparkles className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 dark:text-gray-50">Llama-3 Flashcards</h3>
                <p className="text-xs text-gray-555 dark:text-gray-400 mt-2 leading-relaxed">
                  Instantly creates high-quality decks from textbooks, lecture notes, topics or raw study PDFs using deep semantic processing and contextual summaries.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/50 dark:bg-darkSurface/40 border border-gray-150 dark:border-gray-800/80 p-6 rounded-3xl flex flex-col gap-4 shadow-sm hover:scale-102 hover:shadow hover:border-indigo-500/25 transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 dark:text-gray-50">Offline IndexedDB Sync</h3>
                <p className="text-xs text-gray-555 dark:text-gray-400 mt-2 leading-relaxed">
                  Keep studying on commutes. App stores all deck progress locally and synchronizes updates with Supabase in the background whenever a network is detected.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-150 dark:border-gray-850/60 text-center text-xs text-gray-450 z-20">
        <div className="w-full max-w-none px-6 md:px-12 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-gray-505 dark:text-gray-400 font-bold">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            <span>RecallAI</span>
          </div>
          <p className="font-medium">© {new Date().getFullYear()} RecallAI Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
