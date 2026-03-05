import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Question, QuizResult } from '../types';

interface ResultsViewProps {
  result: QuizResult;
  questions: Question[];
  userAnswers: number[];
  onRetry: () => void;
  onHome: () => void;
}

export function ResultsView({ result, questions, userAnswers, onRetry, onHome }: ResultsViewProps) {
  const percentage = Math.round((result.score / result.total) * 100);
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-lg mb-6 relative">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className={percentage >= 70 ? "text-emerald-500" : percentage >= 40 ? "text-amber-500" : "text-rose-500"}
              strokeDasharray={`${percentage}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-2xl font-bold text-slate-900">{percentage}%</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
        <p className="text-slate-600 max-w-lg mx-auto leading-relaxed">
          {result.feedbackSummary}
        </p>
      </motion.div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Review Answers</h3>
        
        {questions.map((q, idx) => {
          const isCorrect = userAnswers[idx] === q.correctAnswer;
          return (
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 rounded-2xl border ${isCorrect ? 'bg-white border-slate-200' : 'bg-rose-50/50 border-rose-100'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Question {idx + 1}</span>
                    <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{q.topic}</span>
                  </div>
                  <p className="text-slate-900 font-medium mb-4">{q.text}</p>
                  
                  <div className="space-y-2 mb-4">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[idx] === optIdx;
                      const isTargetCorrect = q.correctAnswer === optIdx;
                      
                      let style = "border-slate-200 text-slate-600";
                      if (isTargetCorrect) style = "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium";
                      else if (isSelected && !isTargetCorrect) style = "border-rose-500 bg-rose-50 text-rose-900";
                      
                      return (
                        <div key={optIdx} className={`p-3 rounded-lg border text-sm ${style}`}>
                          {opt} {isTargetCorrect && <span className="ml-2 text-emerald-600 text-xs font-bold">(Correct)</span>}
                          {isSelected && !isTargetCorrect && <span className="ml-2 text-rose-600 text-xs font-bold">(Your Answer)</span>}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900 block mb-1">Explanation:</span>
                    {q.explanation}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-center gap-4">
        <button 
          onClick={onHome}
          className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Back to Home
        </button>
        <button 
          onClick={onRetry}
          className="px-6 py-3 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Start New Quiz
        </button>
      </div>
    </div>
  );
}
