/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StartScreen } from './components/StartScreen';
import { QuizCard } from './components/QuizCard';
import { ResultsView } from './components/ResultsView';
import { ChatTutor } from './components/ChatTutor';
import { Flashcards } from './components/Flashcards';
import { generateQuestions, analyzeResults } from './services/gemini';
import { Question, QuizResult, UserProgress } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, MessageCircle, Layers, BookOpen } from 'lucide-react';

type AppState = 'start' | 'quiz' | 'results';
type Tab = 'quiz' | 'tutor' | 'flashcards';

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('quiz');
  const [appState, setAppState] = useState<AppState>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  
  // Persist progress in local storage (simulated for this session)
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('electro_quiz_progress');
    return saved ? JSON.parse(saved) : { weakTopics: [], history: [] };
  });

  useEffect(() => {
    localStorage.setItem('electro_quiz_progress', JSON.stringify(progress));
  }, [progress]);

  const handleStartQuiz = async (mode: 'random' | 'personalized', difficulty: 'easy' | 'medium' | 'hard' = 'medium', count: number = 5) => {
    setIsGenerating(true);
    try {
      const weakTopics = mode === 'personalized' ? progress.weakTopics : [];
      const newQuestions = await generateQuestions(count, weakTopics, difficulty);
      
      if (newQuestions.length > 0) {
        setQuestions(newQuestions);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setAppState('quiz');
      } else {
        alert("Failed to generate questions. Please try again.");
      }
    } catch (error) {
      console.error("Error starting quiz:", error);
      alert("An error occurred. Please check your connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = async (answerIndex: number) => {
    const newAnswers = [...userAnswers, answerIndex];
    setUserAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300); // Small delay for visual feedback if we added selection animation
    } else {
      // Quiz finished
      setIsGenerating(true); // Re-use loading state for analysis
      try {
        const result = await analyzeResults(questions, newAnswers);
        setQuizResult(result);
        
        // Update progress
        setProgress(prev => {
          // Merge new weak topics with existing ones, keep unique
          const allWeakTopics = Array.from(new Set([...prev.weakTopics, ...result.weakTopics]));
          
          return {
            weakTopics: allWeakTopics,
            history: [result, ...prev.history].slice(0, 10) // Keep last 10
          };
        });
        
        setAppState('results');
      } catch (error) {
        console.error("Error analyzing results:", error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleHome = () => {
    setAppState('start');
    setQuestions([]);
    setQuizResult(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20 md:pb-0">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200 z-50 flex items-center justify-between px-6">
        <div className="font-bold text-xl tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-mono text-sm">EQ</div>
          <span>ElectroQuiz AI</span>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setCurrentTab('quiz')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${currentTab === 'quiz' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Quiz
          </button>
          <button 
            onClick={() => setCurrentTab('tutor')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${currentTab === 'tutor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            AI Tutor
          </button>
          <button 
            onClick={() => setCurrentTab('flashcards')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${currentTab === 'flashcards' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Flashcards
          </button>
        </div>

        {appState === 'quiz' && currentTab === 'quiz' && (
          <div className="hidden md:block h-2 bg-slate-100 rounded-full w-32 overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        )}
      </header>

      <main className="pt-20 px-4 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {currentTab === 'quiz' && (
            <motion.div
              key="quiz-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full"
            >
              {appState === 'start' && (
                <StartScreen 
                  onStart={handleStartQuiz} 
                  hasHistory={progress.history.length > 0}
                  isGenerating={isGenerating}
                />
              )}

              {appState === 'quiz' && questions.length > 0 && (
                <QuizCard 
                  question={questions[currentQuestionIndex]}
                  currentNumber={currentQuestionIndex + 1}
                  totalQuestions={questions.length}
                  onAnswer={handleAnswer}
                />
              )}

              {appState === 'results' && quizResult && (
                <ResultsView 
                  result={quizResult}
                  questions={questions}
                  userAnswers={userAnswers}
                  onRetry={() => handleStartQuiz('personalized', 'medium', 5)}
                  onHome={handleHome}
                />
              )}
            </motion.div>
          )}

          {currentTab === 'tutor' && (
            <motion.div
              key="tutor-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full"
            >
              <ChatTutor />
            </motion.div>
          )}

          {currentTab === 'flashcards' && (
            <motion.div
              key="flashcards-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full"
            >
              <Flashcards />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 pb-safe">
        <button 
          onClick={() => setCurrentTab('quiz')}
          className={`flex flex-col items-center gap-1 ${currentTab === 'quiz' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Brain size={24} />
          <span className="text-[10px] font-medium">Quiz</span>
        </button>
        <button 
          onClick={() => setCurrentTab('tutor')}
          className={`flex flex-col items-center gap-1 ${currentTab === 'tutor' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <MessageCircle size={24} />
          <span className="text-[10px] font-medium">Tutor</span>
        </button>
        <button 
          onClick={() => setCurrentTab('flashcards')}
          className={`flex flex-col items-center gap-1 ${currentTab === 'flashcards' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Layers size={24} />
          <span className="text-[10px] font-medium">Cards</span>
        </button>
      </div>
    </div>
  );
}
