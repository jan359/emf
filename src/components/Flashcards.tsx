import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';
import { generateFlashcards } from '../services/gemini';
import { Flashcard } from '../types';

export function Flashcards() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    setIsLoading(true);
    try {
      const newCards = await generateFlashcards(10);
      setCards(newCards);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error("Failed to load flashcards", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 200);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-indigo-600">
        <RefreshCw className="w-8 h-8 animate-spin mb-4" />
        <p className="font-medium">Generating flashcards...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-slate-500 mb-4">Failed to load flashcards.</p>
        <button onClick={loadCards} className="text-indigo-600 font-medium hover:underline">Try Again</button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-xl mx-auto px-4 py-8 flex flex-col items-center h-[calc(100vh-8rem)]">
      <div className="w-full flex justify-between items-center mb-6 text-sm text-slate-500 font-mono">
        <span>Card {currentIndex + 1} / {cards.length}</span>
        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs">{currentCard.topic}</span>
      </div>

      <div className="relative w-full aspect-[4/3] perspective-1000 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
        <motion.div
          className="w-full h-full relative preserve-3d transition-all duration-500"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col items-center justify-center p-8 text-center hover:shadow-md hover:border-indigo-200 transition-all">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Term</span>
            <h3 className="text-3xl font-bold text-slate-900">{currentCard.term}</h3>
            <div className="absolute bottom-6 text-slate-400 text-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <RotateCw size={14} /> Click to flip
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden bg-indigo-600 text-white rounded-3xl shadow-lg flex flex-col items-center justify-center p-8 text-center" style={{ transform: 'rotateY(180deg)' }}>
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-4">Definition</span>
            <p className="text-xl font-medium leading-relaxed">{currentCard.definition}</p>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-6 mt-8">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-4 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <ArrowLeft size={24} />
        </button>
        
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-6 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors"
        >
          {isFlipped ? 'Show Term' : 'Show Definition'}
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="p-4 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
}
