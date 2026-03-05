import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, Zap, BookOpen, BarChart, ListOrdered } from 'lucide-react';

interface StartScreenProps {
  onStart: (mode: 'random' | 'personalized', difficulty: 'easy' | 'medium' | 'hard', count: number) => void;
  hasHistory: boolean;
  isGenerating: boolean;
}

export function StartScreen({ onStart, hasHistory, isGenerating }: StartScreenProps) {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(5);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 max-w-2xl mx-auto px-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="bg-indigo-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6">
          <Zap className="w-10 h-10 text-indigo-600" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          ElectroQuiz AI
        </h1>
        <p className="text-lg text-slate-600 max-w-md mx-auto">
          Master Electromagnetic Fields and Waves with AI-generated quizzes tailored to your learning progress.
        </p>
      </motion.div>

      <div className="w-full max-w-lg space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2 justify-center">
            <BarChart size={16} /> Select Difficulty
          </label>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                  difficulty === level 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2 justify-center">
            <ListOrdered size={16} /> Number of Questions
          </label>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {[5, 10, 15].map((count) => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  questionCount === count 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {count} Questions
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStart('random', difficulty, questionCount)}
          disabled={isGenerating}
          className="flex flex-col items-center p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
        >
          <div className="bg-emerald-100 p-3 rounded-xl mb-3 group-hover:bg-emerald-200 transition-colors">
            <BookOpen className="w-6 h-6 text-emerald-700" />
          </div>
          <h3 className="font-semibold text-slate-900">Standard Quiz</h3>
          <p className="text-sm text-slate-500 mt-1">Random mix of topics from the lecture notes</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStart('personalized', difficulty, questionCount)}
          disabled={isGenerating || !hasHistory}
          className={`flex flex-col items-center p-6 border rounded-2xl shadow-sm transition-all group ${
            hasHistory 
              ? 'bg-white border-slate-200 hover:shadow-md hover:border-indigo-200 cursor-pointer' 
              : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
          }`}
        >
          <div className={`p-3 rounded-xl mb-3 transition-colors ${
            hasHistory ? 'bg-indigo-100 group-hover:bg-indigo-200' : 'bg-slate-200'
          }`}>
            <Brain className={`w-6 h-6 ${hasHistory ? 'text-indigo-700' : 'text-slate-400'}`} />
          </div>
          <h3 className="font-semibold text-slate-900">Smart Drill</h3>
          <p className="text-sm text-slate-500 mt-1">
            {hasHistory ? 'Focus on concepts you struggled with' : 'Complete a quiz first to unlock'}
          </p>
        </motion.button>
      </div>

      {isGenerating && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2 text-indigo-600 font-medium"
        >
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          <span className="ml-2">Generating questions...</span>
        </motion.div>
      )}

      <div className="mt-12 text-slate-400 text-sm">
        Powered by Gemini 2.5 Flash
      </div>
    </div>
  );
}
