import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { Question } from '../types';

interface QuizCardProps {
  question: Question;
  currentNumber: number;
  totalQuestions: number;
  onAnswer: (index: number) => void;
}

export function QuizCard({ question, currentNumber, totalQuestions, onAnswer }: QuizCardProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <span className="text-sm font-mono text-slate-500">
          Question {currentNumber} <span className="text-slate-300">/</span> {totalQuestions}
        </span>
        <span className="text-xs font-medium px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
          {question.topic}
        </span>
      </div>

      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-8"
      >
        <h2 className="text-2xl font-semibold text-slate-900 leading-tight">
          {question.text}
        </h2>

        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.01, backgroundColor: '#F8FAFC' }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onAnswer(idx)}
              className="w-full text-left p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all group relative overflow-hidden bg-white"
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-medium group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-slate-700 group-hover:text-slate-900 font-medium transition-colors">
                  {option}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
