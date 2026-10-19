import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';
import { api } from '../services/api';
import {
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  AlertCircle,
  Check,
  Trophy,
  BarChart2,
  RefreshCw,
  TrendingUp,
  Play,
  HelpCircle,
} from 'lucide-react';

interface QuestionItem {
  id: string;
  questionText: string;
  options: string[] | string;
}

interface ActiveQuizState {
  id?: string;
  attemptId: string;
  title: string;
  description?: string;
  subjectCode: string;
  subjectName: string;
  moduleNumber?: number;
  timeLimitMin: number;
  totalMarks: number;
  difficulty?: string;
  isPractice: boolean;
  questions: QuestionItem[];
}

interface QuestionBreakdownItem {
  questionId: string;
  questionText: string;
  options: string[];
  selectedOption: number;
  correctOption: number;
  isCorrect: boolean;
  explanation?: string;
}

interface QuizResultState {
  submissionId?: string;
  attemptId?: string;
  quizTitle: string;
  subjectName: string;
  subjectCode?: string;
  moduleNumber?: number;
  score: number;
  totalMarks: number;
  percentage: number;
  timeTakenSec?: number;
  submittedAt: string;
  breakdown: QuestionBreakdownItem[];
}

interface PracticeStats {
  totalPracticeAttempts: number;
  totalAllAttempts: number;
  averageScore: number;
  bestScore: number;
  subjectWise: {
    subjectCode: string;
    subjectName: string;
    attempts: number;
    averagePercentage: number;
    bestScore: number;
  }[];
  recentHistory: {
    id: string;
    title: string;
    subjectCode: string;
    subjectName: string;
    moduleNumber: number | null;
    score: number;
    totalMarks: number;
    percentage: number;
    timeTakenSec: number | null;
    isPractice: boolean;
    submittedAt: string;
  }[];
}

export default function QuizSystem() {
  const { user, profile } = useAuth();
  const { confirm, alert: customAlert } = useConfirm();

  // Navigation tab state: Practice Quiz or Practice Statistics
  const [activeTab, setActiveTab] = useState<'practice' | 'stats'>('practice');

  // Subjects data
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  // AI Practice Quiz Configuration State
  const [moduleNumber, setModuleNumber] = useState(1);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');

  // Active Test Runner State
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuizState | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Result View State
  const [resultData, setResultData] = useState<QuizResultState | null>(null);

  // Practice Analytics State
  const [practiceStats, setPracticeStats] = useState<PracticeStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    fetchPersonalizedSubjects();
  }, []);

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchPracticeStats();
    }
  }, [activeTab]);

  // Timer effect for active test runner
  useEffect(() => {
    if (!activeQuiz) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuiz, userAnswers]);

  const fetchPersonalizedSubjects = async () => {
    try {
      const res = await api.get('/profile/subjects');
      const list = res.data?.data?.subjects || [];
      setSubjectsList(list);
      if (list.length > 0) {
        setSelectedSubject(list[0].name);
      }
    } catch (e) {
      console.warn('Failed to load personalized subjects:', e);
    }
  };

  const fetchPracticeStats = async () => {
    try {
      setIsLoadingStats(true);
      const res = await api.get('/quizzes/practice/stats');
      if (res.data?.data?.stats) {
        setPracticeStats(res.data.data.stats);
      }
    } catch (err) {
      console.warn('Failed to load practice stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const currentSubjectObj = subjectsList.find(
    (item) => item.name === selectedSubject || item.code === selectedSubject
  );

  const availableModulesCount =
    currentSubjectObj?.modulesCount && currentSubjectObj.modulesCount > 0
      ? currentSubjectObj.modulesCount
      : 5;

  const availableModules = Array.from(
    { length: availableModulesCount },
    (_, i) => i + 1
  );

  /**
   * Generate an On-Demand Practice Quiz (Temporary in-memory attempt)
   */
  const handleGeneratePracticeQuiz = async () => {
    if (isGenerating) return;
    if (!currentSubjectObj?.code) {
      setGenerationError('Please select a valid subject.');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationError('');

      const response = await api.post('/quizzes/practice/generate', {
        subjectCode: currentSubjectObj.code,
        moduleNumber: Number(moduleNumber),
        questionCount: Number(questionCount),
        difficulty,
      });

      const practiceQuiz = response.data?.data?.quiz;

      if (
        !practiceQuiz ||
        !Array.isArray(practiceQuiz.questions) ||
        practiceQuiz.questions.length === 0
      ) {
        throw new Error(
          'AI was unable to generate questions for this module. Please try again.'
        );
      }

      // Start the quiz immediately
      setActiveQuiz(practiceQuiz);
      setCurrentQIndex(0);
      setUserAnswers({});
      setTimeLeft(
        (practiceQuiz.timeLimitMin || Math.max(5, practiceQuiz.questions.length)) * 60
      );
      setStartTime(Date.now());
      setResultData(null);
    } catch (error: any) {
      console.error('Practice quiz generation failed:', error);
      setGenerationError(
        error.response?.data?.message ||
        error.message ||
        'Unable to generate the practice quiz. Please verify the module and try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  /**
   * Submit the active practice quiz attempt
   */
  const handleSubmitQuiz = async () => {
    if (!activeQuiz || isSubmitting) return;

    const totalQuestions = activeQuiz.questions.length;
    const answeredCount = Object.keys(userAnswers).length;

    if (answeredCount < totalQuestions) {
      const confirmSubmit = await confirm({
        title: 'Submit Incomplete Quiz?',
        message: `You have answered ${answeredCount} of ${totalQuestions} questions. Unanswered questions will be marked incorrect.\n\nAre you sure you want to submit your quiz?`,
        confirmText: 'Submit Quiz',
        cancelText: 'Keep Answering',
        type: 'warning',
      });
      if (!confirmSubmit) return;
    }

    try {
      setIsSubmitting(true);
      const timeTakenSec = startTime
        ? Math.round((Date.now() - startTime) / 1000)
        : 0;

      // Submit temporary practice quiz to backend for server-side evaluation
      const res = await api.post(
        `/quizzes/practice/${activeQuiz.attemptId}/submit`,
        {
          answers: userAnswers,
          timeTakenSec,
        }
      );

      setResultData(res.data?.data?.result);

      // Exit active test runner
      setActiveQuiz(null);
    } catch (err: any) {
      console.error('Quiz submission error:', err);
      customAlert({
        title: 'Quiz Submission Error',
        message: err.response?.data?.message || err.message || 'Failed to submit quiz evaluation.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseActiveQuiz = async () => {
    const confirmExit = await confirm({
      title: 'Exit Active Quiz?',
      message: 'Are you sure you want to exit? Your progress in this quiz attempt will not be saved.',
      confirmText: 'Exit Quiz',
      cancelText: 'Continue Quiz',
      type: 'warning',
    });
    if (confirmExit) {
      setActiveQuiz(null);
      setUserAnswers({});
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const parseQuestionOptions = (optionsRaw: any): string[] => {
    if (Array.isArray(optionsRaw)) return optionsRaw;
    if (typeof optionsRaw === 'string') {
      try {
        const parsed = JSON.parse(optionsRaw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [optionsRaw];
      }
    }
    return [];
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#181c1b] tracking-tight">
            AI Practice Quizzes
          </h1>
          <p className="text-xs sm:text-sm text-[#404942] mt-1">
            On-demand syllabus practice tests, instant AI grading, and personal performance telemetry for {profile?.branch || 'Computer Science & Engineering'}.
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      {!activeQuiz && (
        <div className="flex items-center gap-2 border-b border-[#e2e8e2] pb-1">
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${activeTab === 'practice'
              ? 'bg-[#134e2f] text-white shadow-sm'
              : 'text-[#404942] hover:text-[#181c1b] hover:bg-[#f0f4f0]'
              }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Practice Quiz (On-Demand)</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${activeTab === 'stats'
              ? 'bg-[#134e2f] text-white shadow-sm'
              : 'text-[#404942] hover:text-[#181c1b] hover:bg-[#f0f4f0]'
              }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>My Practice Statistics</span>
          </button>
        </div>
      )}

      {/* TAB 1: ON-DEMAND PRACTICE QUIZ CONFIGURATION */}
      {!activeQuiz && activeTab === 'practice' && (
        <div className="space-y-6">
          <div className="stitch-card p-6 sm:p-8 space-y-6 bg-white border border-[#e2e8e2]">
            <div className="flex items-start gap-4">


              <div>
                <h2 className="text-xl font-bold text-[#181c1b]">
                  Configure Practice Quiz
                </h2>
                <p className="text-xs sm:text-sm text-[#404942] mt-1">
                  Select your subject, module, question volume, and difficulty. Questions are generated dynamically from course materials and open directly in the quiz runner.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* Subject Selector */}
              <div>
                <label className="block text-xs font-bold text-[#181c1b] uppercase tracking-wider mb-2">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setGenerationError('');
                    setModuleNumber(1);
                  }}
                  className="w-full rounded-xl border border-[#c0c9bf] p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#134e2f]"
                >
                  {subjectsList.length === 0 ? (
                    <option value="">No subjects found</option>
                  ) : (
                    subjectsList.map((subject) => (
                      <option key={subject.code} value={subject.name}>
                        {subject.code} — {subject.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Module Selector */}
              <div>
                <label className="block text-xs font-bold text-[#181c1b] uppercase tracking-wider mb-2">
                  Module
                </label>
                <select
                  value={moduleNumber}
                  onChange={(e) => setModuleNumber(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#c0c9bf] p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#134e2f]"
                >
                  {availableModules.map((mod) => (
                    <option key={mod} value={mod}>
                      Module {mod}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Selector */}
              <div>
                <label className="block text-xs font-bold text-[#181c1b] uppercase tracking-wider mb-2">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-xl border border-[#c0c9bf] p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#134e2f]"
                >
                  <option value="Easy">Easy (Conceptual &amp; Recall)</option>
                  <option value="Intermediate">Intermediate (Standard Exam)</option>
                  <option value="Hard">Hard (Analytical &amp; Problem Solving)</option>
                </select>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-xs font-bold text-[#181c1b] uppercase tracking-wider mb-2">
                  Number of Questions
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#c0c9bf] p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#134e2f]"
                >
                  <option value={5}>5 Questions (~5 mins)</option>
                  <option value={10}>10 Questions (~10 mins)</option>
                  <option value={15}>15 Questions (~15 mins)</option>
                  <option value={20}>20 Questions (~20 mins)</option>
                </select>
              </div>
            </div>

            {generationError && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{generationError}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#e2e8e2]">
              <div className="text-xs text-[#404942]">
                <span className="font-semibold text-[#181c1b]">Target: </span>
                {currentSubjectObj?.code || 'Course'} • Module {moduleNumber} • {questionCount} Marks
              </div>

              <button
                onClick={handleGeneratePracticeQuiz}
                disabled={isGenerating || subjectsList.length === 0}
                className="stitch-btn-primary disabled:opacity-50 px-6 py-3"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing AI Quiz...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Start Practice Quiz</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Snapshot / Highlights */}


        </div>
      )}

      {/* TAB 2: MY PRACTICE STATISTICS */}
      {!activeQuiz && activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#181c1b]">
                Personal Practice Statistics &amp; Mastery
              </h2>
              <p className="text-xs sm:text-sm text-[#404942] mt-0.5">
                Private attempt analytics and learning velocity for your verified account.
              </p>
            </div>

            <button
              onClick={fetchPracticeStats}
              disabled={isLoadingStats}
              className="px-4 py-2 rounded-full border border-[#c0c9bf] bg-white hover:bg-[#f0f4f0] text-xs font-semibold text-[#181c1b] flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </button>
          </div>

          {isLoadingStats ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl bg-white border border-[#e2e8e2] animate-pulse"
                ></div>
              ))}
            </div>
          ) : practiceStats ? (
            <div className="space-y-6">
              {/* Stat Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stitch-card p-5 bg-white border border-[#e2e8e2]">
                  <p className="text-xs font-semibold text-[#404942]">Practice Quizzes Solved</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#134e2f] mt-1">
                    {practiceStats.totalPracticeAttempts}
                  </p>
                  <p className="text-[11px] text-[#404942] mt-1">On-demand practice sessions</p>
                </div>

                <div className="stitch-card p-5 bg-white border border-[#e2e8e2]">
                  <p className="text-xs font-semibold text-[#404942]">Average Accuracy</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#006d3d] mt-1">
                    {practiceStats.averageScore}%
                  </p>
                  <p className="text-[11px] text-[#404942] mt-1">Cumulative mark ratio</p>
                </div>

                <div className="stitch-card p-5 bg-white border border-[#e2e8e2]">
                  <p className="text-xs font-semibold text-[#404942]">Best Score</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
                    {practiceStats.bestScore}%
                  </p>
                  <p className="text-[11px] text-[#404942] mt-1">Highest percentage earned</p>
                </div>

                <div className="stitch-card p-5 bg-white border border-[#e2e8e2]">
                  <p className="text-xs font-semibold text-[#404942]">Total Attempts</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#181c1b] mt-1">
                    {practiceStats.totalAllAttempts}
                  </p>
                  <p className="text-[11px] text-[#404942] mt-1">Completed assessments</p>
                </div>
              </div>

              {/* Subject-Wise Performance */}
              {practiceStats.subjectWise.length > 0 && (
                <div className="stitch-card p-6 bg-white border border-[#e2e8e2] space-y-4">
                  <h3 className="text-sm font-bold text-[#181c1b] uppercase tracking-wider">
                    Subject-Wise Performance Breakdown
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {practiceStats.subjectWise.map((subj) => (
                      <div
                        key={subj.subjectCode}
                        className="p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#e8f5e9] text-[#1b5e20]">
                            {subj.subjectCode}
                          </span>
                          <span className="text-xs text-[#404942] font-semibold">
                            {subj.attempts} attempt{subj.attempts > 1 ? 's' : ''}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-[#181c1b] truncate">
                          {subj.subjectName}
                        </p>

                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-[#404942]">
                            <span>Average: {subj.averagePercentage}%</span>
                            <span>Best: {subj.bestScore}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#e2e8e2] overflow-hidden">
                            <div
                              className="h-full bg-[#134e2f] rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, subj.averagePercentage)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Attempt History */}
              <div className="stitch-card p-6 bg-white border border-[#e2e8e2] space-y-4">
                <h3 className="text-sm font-bold text-[#181c1b] uppercase tracking-wider">
                  Recent Quiz Submissions
                </h3>

                {practiceStats.recentHistory.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#404942]">
                    No quiz submissions found. Complete your first practice quiz above!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#e2e8e2] text-[#404942]">
                          <th className="py-2.5 font-bold">Subject</th>
                          <th className="py-2.5 font-bold">Module</th>
                          <th className="py-2.5 font-bold">Score</th>
                          <th className="py-2.5 font-bold">Percentage</th>
                          <th className="py-2.5 font-bold">Time Taken</th>
                          <th className="py-2.5 font-bold">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e2e8e2]">
                        {practiceStats.recentHistory.map((h) => (
                          <tr key={h.id} className="hover:bg-[#f7faf7]">
                            <td className="py-3 font-semibold text-[#181c1b]">
                              {h.subjectCode ? `${h.subjectCode} — ` : ''}
                              {h.subjectName || h.title}
                            </td>
                            <td className="py-3 text-[#404942]">
                              {h.moduleNumber ? `Module ${h.moduleNumber}` : '—'}
                            </td>
                            <td className="py-3 font-mono font-bold text-[#181c1b]">
                              {h.score} / {h.totalMarks}
                            </td>
                            <td className="py-3">
                              <span
                                className={`font-bold ${h.percentage >= 70
                                  ? 'text-[#006d3d]'
                                  : h.percentage >= 50
                                    ? 'text-amber-600'
                                    : 'text-rose-600'
                                  }`}
                              >
                                {h.percentage}%
                              </span>
                            </td>
                            <td className="py-3 text-[#404942]">
                              {h.timeTakenSec
                                ? `${Math.floor(h.timeTakenSec / 60)}m ${h.timeTakenSec % 60}s`
                                : '—'}
                            </td>
                            <td className="py-3 text-[#404942]">
                              {new Date(h.submittedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 stitch-card bg-white">
              <Award className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-[#404942]">Failed to load practice statistics.</p>
            </div>
          )}
        </div>
      )}

      {/* ACTIVE QUIZ TEST RUNNER */}
      {activeQuiz && (
        <div className="stitch-card p-6 sm:p-8 space-y-6 bg-white border border-[#e2e8e2] animate-fade-in">
          {/* Test Runner Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e2e8e2] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-bold font-mono">
                  {activeQuiz.subjectCode}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                  Practice Mode
                </span>
                {activeQuiz.moduleNumber && (
                  <span className="text-xs text-[#404942] font-semibold">
                    Module {activeQuiz.moduleNumber}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-[#181c1b]">{activeQuiz.title}</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Time Left: {formatTime(timeLeft)}
              </div>
              <button
                onClick={handleCloseActiveQuiz}
                title="Exit quiz"
                className="p-2 rounded-full bg-[#f0f4f0] text-[#404942] hover:text-[#181c1b] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Question Stepper & Progress Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold text-[#404942]">
            <span>
              Question {currentQIndex + 1} of {activeQuiz.questions.length} •{' '}
              <strong className="text-[#134e2f]">
                {Object.keys(userAnswers).length} Answered
              </strong>
            </span>

            {/* Quick jump question numbers */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeQuiz.questions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isCurrent = idx === currentQIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-[11px] font-bold transition flex items-center justify-center ${isCurrent
                      ? 'border-2 border-[#134e2f] bg-[#e8f5e9] text-[#134e2f]'
                      : isAnswered
                        ? 'bg-[#134e2f] text-white'
                        : 'bg-[#f0f4f0] text-[#404942] hover:bg-[#e1e9e1]'
                      }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question Body */}
          {activeQuiz.questions[currentQIndex] && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2]">
                <h3 className="text-base font-bold text-[#181c1b] leading-relaxed">
                  {activeQuiz.questions[currentQIndex].questionText}
                </h3>
              </div>

              <div className="space-y-3">
                {parseQuestionOptions(
                  activeQuiz.questions[currentQIndex].options
                ).map((optText: string, idx: number) => {
                  const currentQId = activeQuiz.questions[currentQIndex].id;
                  const isSelected = userAnswers[currentQId] === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(currentQId, idx)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition flex items-center justify-between ${isSelected
                        ? 'bg-[#134e2f] text-white border-[#134e2f] shadow-sm'
                        : 'bg-white text-[#181c1b] border-[#c0c9bf] hover:border-[#134e2f] hover:bg-[#f0f9f4]'
                        }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${isSelected
                            ? 'bg-white text-[#134e2f]'
                            : 'bg-[#e8f5e9] text-[#134e2f]'
                            }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{optText}</span>
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls Footer */}
          <div className="pt-4 border-t border-[#e2e8e2] flex items-center justify-between">
            <button
              onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
              className="stitch-btn-secondary disabled:opacity-40 text-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex items-center gap-3">
              {currentQIndex < activeQuiz.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQIndex((prev) => prev + 1)}
                  className="stitch-btn-primary text-xs"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : null}

              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#006d3d] hover:bg-[#00522d] text-white font-bold text-xs shadow-sm transition active:scale-[0.98] disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting & Grading...' : 'Submit Test'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED RESULT MODAL */}
      {resultData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl stitch-card p-6 sm:p-8 space-y-6 text-left shadow-2xl bg-white animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[#e8f5e9] text-[#006d3d] flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#181c1b]">
                Practice Quiz Completed
              </h3>
              <p className="text-xs text-[#404942]">
                {resultData.subjectName}{' '}
                {resultData.moduleNumber ? `• Module ${resultData.moduleNumber}` : ''}
              </p>
            </div>

            {/* Score Summary Metrics */}
            <div className="grid grid-cols-3 gap-3 p-5 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] text-center">
              <div>
                <p className="text-[11px] font-semibold text-[#404942]">Score</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#134e2f]">
                  {resultData.score}{' '}
                  <span className="text-xs text-[#404942] font-normal">
                    / {resultData.totalMarks}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-[#404942]">Percentage</p>
                <p
                  className={`text-2xl sm:text-3xl font-extrabold ${resultData.percentage >= 70
                    ? 'text-[#006d3d]'
                    : resultData.percentage >= 50
                      ? 'text-amber-600'
                      : 'text-rose-600'
                    }`}
                >
                  {resultData.percentage}%
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-[#404942]">Time Taken</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#181c1b]">
                  {resultData.timeTakenSec
                    ? `${Math.floor(resultData.timeTakenSec / 60)}m ${resultData.timeTakenSec % 60}s`
                    : '1m'}
                </p>
              </div>
            </div>

            {/* Detailed Question Review Breakdown */}
            {resultData.breakdown && resultData.breakdown.length > 0 && (
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-[#181c1b] uppercase tracking-wider">
                  Detailed Answer Review &amp; Explanations
                </h4>

                <div className="space-y-3">
                  {resultData.breakdown.map((item, idx) => (
                    <div
                      key={item.questionId || idx}
                      className={`p-4 rounded-xl border text-xs space-y-2 ${item.isCorrect
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-rose-200 bg-rose-50/40'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-[#181c1b]">
                          {idx + 1}. {item.questionText}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${item.isCorrect
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                            }`}
                        >
                          {item.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>

                      <div className="space-y-1 text-[#404942]">
                        <p>
                          <strong className="text-[#181c1b]">Your Answer: </strong>
                          {item.selectedOption >= 0 &&
                            item.options[item.selectedOption]
                            ? `${String.fromCharCode(65 + item.selectedOption)}. ${item.options[item.selectedOption]}`
                            : 'Unanswered'}
                        </p>

                        {!item.isCorrect && (
                          <p className="text-emerald-800 font-semibold">
                            <strong>Correct Answer: </strong>
                            {String.fromCharCode(65 + item.correctOption)}. {item.options[item.correctOption]}
                          </p>
                        )}

                        {item.explanation && (
                          <div className="mt-2 p-2.5 rounded-lg bg-white/80 border border-gray-200 text-[11px] text-[#404942]">
                            <strong className="text-[#181c1b]">Explanation: </strong>
                            {item.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#e2e8e2]">
              <button
                onClick={() => {
                  setResultData(null);
                  setActiveTab('stats');
                }}
                className="stitch-btn-secondary text-xs w-full sm:w-auto"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>View Full Statistics</span>
              </button>

              <button
                onClick={() => setResultData(null)}
                className="stitch-btn-primary text-xs w-full sm:w-auto"
              >
                <span>Back to Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
