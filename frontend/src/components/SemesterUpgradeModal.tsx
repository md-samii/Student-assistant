import React, { useState } from 'react';
import { Sparkles, ArrowRight, BookOpen, CheckCircle2, GraduationCap, X } from 'lucide-react';
import { api } from '../services/api';

interface SemesterUpgradeModalProps {
  currentSemester: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSem: number) => void;
}

export const SemesterUpgradeModal: React.FC<SemesterUpgradeModalProps> = ({
  currentSemester,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCelebrated, setIsCelebrated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const targetSemester = Math.min(8, currentSemester + 1);

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      setErrorMessage('');
      const res = await api.post('/profile/upgrade-semester');
      setIsCelebrated(true);
      setTimeout(() => {
        setIsCelebrated(false);
        setIsUpgrading(false);
        onSuccess(targetSemester);
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to upgrade semester. Please try again.');
      setIsUpgrading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 to-indigo-950/90 border border-indigo-500/30 p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(99,102,241,0.3)] overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/50 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {isCelebrated ? (
          <div className="py-8 text-center space-y-4 animate-bounce">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">Congratulations! 🎉</h3>
            <p className="text-sm text-slate-300">
              You are now enrolled in <span className="text-emerald-400 font-semibold">Semester {targetSemester}</span>! Your academic resources and syllabus notes have been updated.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">Academic Progression</span>
                <h2 className="text-xl font-extrabold text-white">Upgrade Academic Semester</h2>
              </div>
            </div>

            {/* Semester Transition Graphic */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="text-center flex-1">
                <p className="text-xs text-slate-400 font-mono">Current</p>
                <p className="text-xl font-bold text-slate-300">Sem {currentSemester}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="text-center flex-1">
                <p className="text-xs text-indigo-400 font-mono">Target</p>
                <p className="text-xl font-bold text-indigo-300">Sem {targetSemester}</p>
              </div>
            </div>

            {/* Unlocking features */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase font-mono">What Unlocks Next:</p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" /> Fresh syllabus modules & Google Drive PDF notes
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400 shrink-0" /> Target practice quizzes for Semester {targetSemester} subjects
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> AI Assistant prompt context automatically updated
                </li>
              </ul>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {isUpgrading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Confirm Upgrade
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
