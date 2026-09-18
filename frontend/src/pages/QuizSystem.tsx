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
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="stitch-card p-6 sm:p-8 bg-white border border-[#e2e8e2] relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#006d3d]" /> Adaptive Assessment • Sem {profile?.semester || 6}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#181c1b] tracking-tight">
              Module Practice Quizzes
            </h1>
            <p className="text-[#404942] text-xs sm:text-sm mt-1">
              Timed multiple choice questions, instant grading, and detailed explanations for {profile?.branch || 'Computer Science'}.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#f0f9f4] border border-[#c0c9bf]/60 text-xs font-semibold text-[#134e2f] shrink-0">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Automated Scoring Active</span>
          </div>
        </div>
      </div>

      {/* Subject Filter Pills */}
      {!activeQuiz && (
        <div className="stitch-card p-5 space-y-3">
          <div className="text-xs font-bold text-[#404942] uppercase tracking-wider">
            Filter by Coursework:
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {subjectsList.map((s) => (
              <button
                key={s.code}
                onClick={() => setSelectedSubject(s.name)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedSubject === s.name
                    ? 'bg-[#134e2f] text-white shadow-sm'
                    : 'bg-[#f0f4f0] text-[#181c1b] hover:bg-[#e1e9e1] border border-[#e2e8e2]'
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
              <div key={i} className="h-44 rounded-3xl bg-white animate-pulse border border-[#e2e8e2]"></div>
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="stitch-card p-12 text-center space-y-3">
            <Award className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-bold text-[#181c1b] text-base">No Quizzes Available</h3>
            <p className="text-xs text-[#404942]">Select another subject above to view practice tests.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map((q) => (
              <div
                key={q.id}
                className="stitch-card p-6 flex flex-col justify-between space-y-4 group hover:translate-y-[-2px]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-bold font-mono">
                      {q.subjectCode}
                    </span>
                    <span className="text-xs font-semibold text-[#404942]">
                      Module {q.moduleNumber}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#181c1b] group-hover:text-[#134e2f] transition">
                    {q.title}
                  </h3>

                  <p className="text-xs text-[#404942] leading-relaxed line-clamp-2">
                    {q.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#404942]">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-[#006d3d]" /> {q.questionsCount} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-500" /> {q.timeLimitMin} Mins
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#e2e8e2] flex items-center justify-between">
                  <span className="text-xs text-[#404942] font-semibold">Total: {q.totalMarks} Marks</span>

                  <button
                    onClick={() => handleStartQuiz(q.id)}
                    className="stitch-btn-primary"
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
        <div className="stitch-card p-6 sm:p-8 space-y-6 bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e2e8e2] pb-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-bold font-mono mb-1">
                {activeQuiz.subjectName}
              </span>
              <h2 className="text-xl font-bold text-[#181c1b]">{activeQuiz.title}</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Time Left: {formatTime(timeLeft)}
              </div>
              <button
                onClick={() => setActiveQuiz(null)}
                className="p-2 rounded-full bg-[#f0f4f0] text-[#404942] hover:text-[#181c1b]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Question Stepper Header */}
          <div className="flex items-center justify-between text-xs font-semibold text-[#404942]">
            <span>Question {currentQIndex + 1} of {activeQuiz.questions.length}</span>
            <span>Marks: 1 Per Question</span>
          </div>

          {/* Question Body */}
          {activeQuiz.questions[currentQIndex] && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-[#181c1b] leading-relaxed p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2]">
                {activeQuiz.questions[currentQIndex].questionText}
              </h3>

              <div className="space-y-3">
                {JSON.parse(activeQuiz.questions[currentQIndex].options).map((optText: string, idx: number) => {
                  const isSelected = userAnswers[activeQuiz.questions[currentQIndex].id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(activeQuiz.questions[currentQIndex].id, idx)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#134e2f] text-white border-[#134e2f] shadow-sm'
                          : 'bg-white text-[#181c1b] border-[#c0c9bf] hover:border-[#134e2f] hover:bg-[#f0f9f4]'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                          isSelected ? 'bg-white text-[#134e2f]' : 'bg-[#e8f5e9] text-[#134e2f]'
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
          <div className="pt-4 border-t border-[#e2e8e2] flex items-center justify-between">
            <button
              onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
              className="stitch-btn-secondary disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            {currentQIndex < activeQuiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQIndex((prev) => prev + 1)}
                className="stitch-btn-primary"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#006d3d] hover:bg-[#00522d] text-white font-bold text-xs shadow-sm transition active:scale-[0.98]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md stitch-card p-8 space-y-6 text-center shadow-2xl bg-white animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#e8f5e9] text-[#006d3d] flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-[#181c1b]">Assessment Result</h3>
              <p className="text-xs text-[#404942]">{resultData.quizTitle}</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] space-y-2">
              <p className="text-xs text-[#404942]">Your Score</p>
              <p className="text-4xl font-extrabold text-[#134e2f]">
                {resultData.score} <span className="text-base text-[#404942] font-normal">/ {resultData.totalMarks} Marks</span>
              </p>
              <p className="text-xs text-[#006d3d] font-bold pt-1">
                Percentage: {((resultData.score / resultData.totalMarks) * 100).toFixed(1)}%
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setResultData(null)}
                className="stitch-btn-primary px-8"
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
