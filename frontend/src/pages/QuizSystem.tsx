import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  Award, 
  Play, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  AlertCircle, 
  Check, 
  RotateCcw,
  BookOpen,
  Trophy
} from 'lucide-react';

export default function QuizSystem() {
  const { profile } = useAuth();

  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Test Player State
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result Modal State
  const [resultData, setResultData] = useState<any | null>(null);

  useEffect(() => {
    fetchPersonalizedSubjects();
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [selectedSubject]);

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
  }, [activeQuiz]);

  const fetchPersonalizedSubjects = async () => {
    try {
      const res = await api.get('/profile/subjects');
      const list = res.data.data.subjects || [];
      setSubjectsList(list);
      if (list.length > 0) {
        setSelectedSubject(list[0].name);
      }
    } catch (e) {}
  };

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (selectedSubject) params.subject = selectedSubject;

      const res = await api.get('/quizzes', { params });
      setQuizzes(res.data.data.quizzes || []);
    } catch (err) {
      console.warn('Failed to load quizzes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = async (quizId: string) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/quizzes/${quizId}`);
      const fullQuiz = res.data.data.quiz;
      setActiveQuiz(fullQuiz);
      setCurrentQIndex(0);
      setUserAnswers({});
      setTimeLeft((fullQuiz.timeLimitMin || 10) * 60);
    } catch (err) {
      console.error('Failed to load quiz details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    try {
      setIsSubmitting(true);
      const res = await api.post(`/quizzes/${activeQuiz.id}/submit`, {
        answers: userAnswers,
      });

      setResultData(res.data.data);
      setActiveQuiz(null);
    } catch (err) {
      console.error('Quiz submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="eduflow-card p-8 bg-gradient-to-r from-white via-[#f0f3ff] to-[#e7eeff] border border-[#c4c6d1]/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#052659]/10 text-[#052659] text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#30618f]" /> Practice & Self-Assessment • Sem {profile?.semester || 6}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001234] font-sans">
              Module Practice Quizzes
            </h1>
            <p className="text-[#44474f] text-xs font-mono mt-1">
              Timed multiple choice questions, instant feedback, and detailed explanations for {profile?.branch || 'Computer Science'}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#c4c6d1]/40 text-xs font-mono text-[#052659] shrink-0">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Automatic Scoring Active</span>
          </div>
        </div>
      </div>

      {/* Subject Filter Pills */}
      {!activeQuiz && (
        <div className="eduflow-card p-6 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {subjectsList.map((s) => (
              <button
                key={s.code}
                onClick={() => setSelectedSubject(s.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-sans whitespace-nowrap transition ${
                  selectedSubject === s.name
                    ? 'bg-[#052659] text-white shadow-md shadow-[#052659]/20'
                    : 'bg-[#f0f3ff] text-[#44474f] hover:text-[#001234] border border-[#c4c6d1]/30'
                }`}
              >
                {s.code} — {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quiz List Grid */}
      {!activeQuiz && !resultData && (
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-[#e7eeff]/40 animate-pulse border border-[#c4c6d1]/30"></div>
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="eduflow-card p-12 text-center space-y-3">
            <Award className="w-8 h-8 text-[#747780] mx-auto" />
            <h3 className="font-bold text-[#001234] text-base">No Quizzes Available</h3>
            <p className="text-xs text-[#747780] font-mono">Select another subject above to view practice tests.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map((q) => (
              <div
                key={q.id}
                className="eduflow-card p-6 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="eduflow-pill bg-[#052659]/10 text-[#052659]">
                      {q.subjectCode}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#747780]">
                      Module {q.moduleNumber}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-[#001234] group-hover:text-[#30618f] transition font-sans">
                    {q.title}
                  </h3>

                  <p className="text-xs text-[#44474f] leading-relaxed line-clamp-2">
                    {q.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-[#747780]">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-[#30618f]" /> {q.questionsCount} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-600" /> {q.timeLimitMin} Mins
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#e2e8f0] flex items-center justify-between">
                  <span className="text-xs font-mono text-[#747780]">Total: {q.totalMarks} Marks</span>

                  <button
                    onClick={() => handleStartQuiz(q.id)}
                    className="px-5 py-2 rounded-xl bg-[#052659] hover:bg-[#30618f] text-white font-bold text-xs transition shadow-md shadow-[#052659]/20 flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Test</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Active Quiz Test Runner */}
      {activeQuiz && (
        <div className="eduflow-card p-6 sm:p-8 space-y-6 bg-white border border-[#c4c6d1]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-4">
            <div>
              <span className="eduflow-pill bg-[#052659]/10 text-[#052659] mb-1 inline-block">
                {activeQuiz.subjectName}
              </span>
              <h2 className="text-xl font-bold text-[#001234] font-sans">{activeQuiz.title}</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-mono font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Time Left: {formatTime(timeLeft)}
              </div>
              <button
                onClick={() => setActiveQuiz(null)}
                className="p-2 rounded-xl bg-[#f0f3ff] text-[#747780] hover:text-[#001234]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Question Stepper Header */}
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#747780]">
            <span>Question {currentQIndex + 1} of {activeQuiz.questions.length}</span>
            <span>Marks: 1 Per Question</span>
          </div>

          {/* Question Body */}
          {activeQuiz.questions[currentQIndex] && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-[#001234] font-sans leading-relaxed p-4 rounded-xl bg-[#f0f3ff] border border-[#c4c6d1]/30">
                {activeQuiz.questions[currentQIndex].questionText}
              </h3>

              <div className="space-y-3">
                {JSON.parse(activeQuiz.questions[currentQIndex].options).map((optText: string, idx: number) => {
                  const isSelected = userAnswers[activeQuiz.questions[currentQIndex].id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(activeQuiz.questions[currentQIndex].id, idx)}
                      className={`w-full p-4 rounded-xl border text-left text-xs font-semibold font-sans transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#052659] text-white border-[#052659] shadow-md shadow-[#052659]/15'
                          : 'bg-white text-[#001234] border-[#c4c6d1]/40 hover:border-[#9ccafe]'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold ${
                          isSelected ? 'bg-white text-[#052659]' : 'bg-[#f0f3ff] text-[#052659]'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{optText}</span>
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Controls Footer */}
          <div className="pt-4 border-t border-[#e2e8f0] flex items-center justify-between">
            <button
              onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
              className="px-4 py-2 rounded-xl bg-[#f0f3ff] text-[#44474f] font-bold text-xs disabled:opacity-40 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            {currentQIndex < activeQuiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQIndex((prev) => prev + 1)}
                className="px-5 py-2 rounded-xl bg-[#052659] hover:bg-[#30618f] text-white font-bold text-xs transition flex items-center gap-1"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Test'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Result Display Modal */}
      {resultData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001234]/60 backdrop-blur-md p-4">
          <div className="w-full max-w-lg eduflow-card p-8 space-y-6 text-center shadow-2xl bg-white border border-[#c4c6d1]">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-[#001234] font-sans">Assessment Result</h3>
              <p className="text-xs text-[#747780] font-mono">{resultData.quizTitle}</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f0f3ff] border border-[#c4c6d1]/40 space-y-2">
              <p className="text-xs text-[#44474f] font-mono">Your Score</p>
              <p className="text-4xl font-extrabold text-[#052659]">
                {resultData.score} <span className="text-base text-[#747780] font-normal">/ {resultData.totalMarks} Marks</span>
              </p>
              <p className="text-xs font-mono text-emerald-700 font-bold pt-2">
                Percentage: {((resultData.score / resultData.totalMarks) * 100).toFixed(1)}%
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setResultData(null)}
                className="px-6 py-2.5 rounded-xl bg-[#052659] text-white font-bold text-xs hover:bg-[#30618f] transition shadow-md shadow-[#052659]/20"
              >
                Back to Quizzes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
