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
      await api.post('/profile/upgrade-semester');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-[#e2e8e2] p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#717971] hover:text-[#181c1b] rounded-full bg-[#ecefec] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {isCelebrated ? (
          <div className="py-8 text-center space-y-4 animate-bounce">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-[#134e2f] flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-[#97f3b5]" />
            </div>
            <h3 className="text-2xl font-bold text-[#181c1b]">Congratulations! 🎉</h3>
            <p className="text-sm text-[#404942]">
              You are now enrolled in <span className="text-[#006d3d] font-semibold">Semester {targetSemester}</span>! Your academic resources and syllabus notes have been updated.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#e8f5e9] text-[#134e2f] border border-[#a0d2af] flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#006d3d] uppercase tracking-wider">Academic Progression</span>
                <h2 className="text-xl font-bold text-[#181c1b]">Upgrade Academic Semester</h2>
              </div>
            </div>

            {/* Semester Transition Graphic */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2]">
              <div className="text-center flex-1">
                <p className="text-xs text-[#717971]">Current</p>
                <p className="text-xl font-bold text-[#181c1b]">Sem {currentSemester}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#e8f5e9] text-[#006d3d] flex items-center justify-center shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="text-center flex-1">
                <p className="text-xs text-[#006d3d]">Target</p>
                <p className="text-xl font-bold text-[#134e2f]">Sem {targetSemester}</p>
              </div>
            </div>

            {/* Unlocking features */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#717971] uppercase">What Unlocks Next:</p>
              <ul className="space-y-2 text-xs text-[#404942]">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#006d3d] shrink-0" /> Fresh syllabus modules &amp; Google Drive PDF notes
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#006d3d] shrink-0" /> Target practice quizzes for Semester {targetSemester} subjects
                </li>
              </ul>
            </div>

            {errorMessage && (
              <p className="text-xs text-[#ba1a1a] bg-[#ffdad6] p-3 rounded-xl">{errorMessage}</p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-[#c0c9bf] bg-white hover:bg-[#ecefec] text-xs font-semibold text-[#404942]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="px-6 py-2.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white text-xs font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-50 active:scale-95"
              >
                <span>{isUpgrading ? 'Upgrading...' : `Confirm Semester ${targetSemester}`}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#97f3b5]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
