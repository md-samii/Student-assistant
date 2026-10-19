import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ConfirmProvider } from './context/ConfirmContext';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import Profile from './pages/Profile';
import AIAssistant from './pages/AIAssistant';
import StudyResources from './pages/StudyResources';
import VideoRecommendations from './pages/VideoRecommendations';
import QuizSystem from './pages/QuizSystem';
import DocumentLocker from './pages/DocumentLocker';
import CareersAndOpportunities from './pages/CareersAndOpportunities';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import AdminDashboard from './pages/AdminDashboard';
import { SkillsAndProjects } from './pages/SkillsAndProjects';
import { SemesterUpgradeModal } from './components/SemesterUpgradeModal';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { Settings } from './pages/Settings';
import AnimatedAcademicBackground from './components/AnimatedAcademicBackground';
import { api } from './services/api';
import {
  Bot,
  BookOpen,
  LayoutDashboard,
  FileText,
  FileCheck,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Lock,
  LogOut,
  LogIn,
  UserPlus,
  User,
  ArrowRight,
  Clock,
  ChevronRight,
  Youtube,
  Award,
  ShieldCheck,
  TrendingUp,
  Menu,
  X,
  Code2,
  BarChart3,
  Plus,
  ArrowUpRight,
  Video,
  Pause,
  Play,
  Square,
  Calendar,
  Users,
  CheckCircle,
  Hash,
  Globe,
  Sun,
  Sparkle,
  Target,
  Flame,
  Zap
} from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#144E35]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#144E35]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const DashboardContent = () => {
  const { user, profile } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);


  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  const [lastWatchedVideo, setLastWatchedVideo] = useState<any>(null);
  const [isLoadingLastWatched, setIsLoadingLastWatched] = useState(true);

  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalThisWeek, setTotalThisWeek] = useState(0);


  const navigate = useNavigate();
  const [weeklyActivity, setWeeklyActivity] = useState<
    { date: string; count: number }[]
  >([]);

  const [activityStats, setActivityStats] = useState({
    currentStreak: 0,
    totalThisWeek: 0,
  });

  const [isLoadingActivity, setIsLoadingActivity] =
    useState(true);

  const [studySessionStartedAt, setStudySessionStartedAt] =
    useState<string | null>(null);

  const [studySessionElapsedSeconds, setStudySessionElapsedSeconds] =
    useState(0);

  const [isStudySessionActive, setIsStudySessionActive] =
    useState(false);

  const [isEndingStudySession, setIsEndingStudySession] =
    useState(false);

  const studentName = user?.fullName || '';
  const university = profile?.university || '';
  const semester = profile?.semester || 0;

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);



  const [studySummary, setStudySummary] = useState({
    totalMinutes: 0,
    dailyGoalMinutes: 240,
    progress: 0,
  });

  const [isUpdatingStudyGoal, setIsUpdatingStudyGoal] = useState(false);

  const [isLoadingStudySummary, setIsLoadingStudySummary] =
    useState(true);

  useEffect(() => {
    const restoreActiveStudySession = async () => {
      try {
        const response = await api.get('/study-sessions/active');

        const active = response.data?.data?.active;
        const startedAt = response.data?.data?.session?.startedAt;

        if (active && startedAt) {
          const elapsed = Math.max(
            0,
            Math.floor(
              (Date.now() - new Date(startedAt).getTime()) / 1000
            )
          );

          setStudySessionStartedAt(startedAt);
          setStudySessionElapsedSeconds(elapsed);
          setIsStudySessionActive(true);
        }
      } catch (error) {
        console.error(
          'Failed to restore active study session:',
          error
        );
      }
    };

    restoreActiveStudySession();
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoadingDashboard(true);

        const res = await api.get('/dashboard');

        setDashboardData(res.data.data);
      } catch (err) {
        console.warn('Failed to load dashboard:', err);
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchLastWatchedVideo = async () => {
      try {
        setIsLoadingLastWatched(true);
        const res = await api.get('/videos/user/library');
        const tracked = res.data?.data?.tracked || [];
        if (tracked.length > 0) {
          const sorted = [...tracked].sort((a: any, b: any) => {
            const dateA = a.lastWatchedAt ? new Date(a.lastWatchedAt).getTime() : 0;
            const dateB = b.lastWatchedAt ? new Date(b.lastWatchedAt).getTime() : 0;
            return dateB - dateA;
          });
          setLastWatchedVideo(sorted[0]);
        }
      } catch (err) {
        console.warn('Failed to load last watched video:', err);
      } finally {
        setIsLoadingLastWatched(false);
      }
    };

    fetchLastWatchedVideo();
  }, []);

  useEffect(() => {
    fetchWeeklyActivity();
  }, []);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const fetchWeeklyActivity = async () => {
    try {
      const response = await api.get('/activity/weekly');
      const data = response.data?.data || {};

      setWeeklyActivity(data.weeklyActivity || []);

      const streak = data.currentStreak || 0;
      const total = data.totalThisWeek || 0;

      setCurrentStreak(streak);
      setTotalThisWeek(total);

      setActivityStats({
        currentStreak: streak,
        totalThisWeek: total,
      });
    } catch (error) {
      console.error('Failed to load weekly activity:', error);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const handleStartStudySession = async () => {
    try {
      const response = await api.post('/study-sessions/start');

      const startedAt = response.data?.data?.startedAt;

      if (!startedAt) {
        throw new Error('Study session start time was not returned.');
      }

      setStudySessionStartedAt(startedAt);
      setStudySessionElapsedSeconds(0);
      setIsStudySessionActive(true);
    } catch (error) {
      console.error('Failed to start study session:', error);
    }
  };

  useEffect(() => {
    if (!studySessionStartedAt || !isStudySessionActive) {
      return;
    }

    const updateElapsedTime = () => {
      const elapsed = Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(studySessionStartedAt).getTime()) / 1000
        )
      );

      setStudySessionElapsedSeconds(elapsed);
    };

    updateElapsedTime();

    const interval = window.setInterval(updateElapsedTime, 1000);

    return () => window.clearInterval(interval);
  }, [studySessionStartedAt, isStudySessionActive]);

  const handleEndStudySession = async () => {
    if (!studySessionStartedAt || studySessionElapsedSeconds < 60) {
      return;
    }

    try {
      setIsEndingStudySession(true);

      await api.post('/study-sessions/end');

      setStudySessionStartedAt(null);
      setStudySessionElapsedSeconds(0);
      setIsStudySessionActive(false);

      const response = await api.get('/study-sessions/today');

      setStudySummary(response.data.data);
      await fetchWeeklyActivity();
    } catch (error) {
      console.error('Failed to end study session:', error);
    } finally {
      setIsEndingStudySession(false);
    }
  };

  const handleUpdateStudyGoal = async (dailyGoalMinutes: number) => {
    try {
      setIsUpdatingStudyGoal(true);

      const response = await api.patch('/study-sessions/goal', {
        dailyGoalMinutes,
      });

      const updatedGoal =
        response.data?.data?.dailyStudyGoalMinutes;

      if (typeof updatedGoal !== 'number') {
        throw new Error('Updated study goal was not returned.');
      }

      setStudySummary((prev) => ({
        ...prev,
        dailyGoalMinutes: updatedGoal,
        progress: Math.min(
          Math.round((prev.totalMinutes / updatedGoal) * 100),
          100
        ),
      }));
    } catch (error) {
      console.error('Failed to update study goal:', error);
    } finally {
      setIsUpdatingStudyGoal(false);
    }
  };

  useEffect(() => {
    const fetchPersonalizedSubjects = async () => {
      try {
        setIsLoadingSubjects(true);
        const res = await api.get('/profile/subjects');
        setSubjects(res.data.data.subjects || []);
      } catch (err) {
        console.warn('Failed to load personalized subjects:', err);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchPersonalizedSubjects();
  }, [semester]);

  useEffect(() => {
    const fetchStudySummary = async () => {
      try {
        setIsLoadingStudySummary(true);

        const response = await api.get('/study-sessions/today');

        setStudySummary(response.data.data);
      } catch (error) {
        console.error('Failed to load study summary:', error);
      } finally {
        setIsLoadingStudySummary(false);
      }
    };

    fetchStudySummary();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Section: Title & Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#181c1b] tracking-tight">
            Academic Sanctuary
          </h1>
          <p className="text-xs sm:text-sm text-[#404942] mt-1">
            Semester {semester} Engineering • Track your coursework, modules, quizzes, and career goals with ease.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white text-xs font-semibold shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer"
          >
            <span>Upgrade Semester</span>
          </button>
        </div>
      </div>

      {/* Row 1: 4 Top Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Enrolled Modules (Featured Forest Green) */}
        <div className="rounded-2xl bg-[#134e2f] text-white p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group shadow-[0_12px_30px_-8px_rgba(19,78,47,0.35)]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-emerald-200">Enrolled Coursework</span>
            <button
              onClick={() => navigate('/resources')}
              className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition"
              title="View Resources"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="my-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isLoadingDashboard
                ? 'Loading...'
                : `${dashboardData?.academics?.subjects ?? 0} Subjects`}
            </span>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-emerald-200/90 font-medium mb-1.5">
              <span>Coursework Status</span>
              <span>
                {isLoadingDashboard
                  ? 'Loading...'
                  : `${dashboardData?.academics?.subjects ?? 0} subjects`}
              </span>
            </div>

            <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#97f3b5] h-full w-full rounded-full opacity-80"></div>
            </div>
          </div>
        </div>

        {/* Card 2: Completed Practice Tests */}
        <div className="stitch-card p-5 sm:p-6 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#404942]">Practice Quizzes</span>
            <button
              onClick={() => navigate('/quizzes')}
              className="w-8 h-8 rounded-full border border-[#c0c9bf] flex items-center justify-center text-[#404942] hover:bg-[#f0f4f0] transition"
              title="View Quizzes"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="my-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#181c1b] tracking-tight">
              {isLoadingDashboard
                ? 'Loading...'
                : `${dashboardData?.quizzes?.solved ?? 0} Solved`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#006d3d] font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {isLoadingDashboard
                ? 'Loading...'
                : `${dashboardData?.quizzes?.averageAccuracy ?? 0}% Average Accuracy`}
            </span>
          </div>
        </div>

        {/* Card 3: Active Study Notes */}
        <div className="stitch-card p-5 sm:p-6 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#404942]">Curated Notes</span>
            <button
              onClick={() => navigate('/resources')}
              className="w-8 h-8 rounded-full border border-[#c0c9bf] flex items-center justify-center text-[#404942] hover:bg-[#f0f4f0] transition"
              title="View Notes"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="my-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#181c1b] tracking-tight">
              {isLoadingDashboard
                ? 'Loading...'
                : `${dashboardData?.academics?.modules ?? 0} Modules`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#006d3d] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {isLoadingDashboard
                ? 'Loading...'
                : `${dashboardData?.academics?.modules ?? 0} modules available`}
            </span>
          </div>
        </div>

        {/* Card 4: Last Video Watched */}
        <div
          onClick={() => navigate('/videos')}
          className="stitch-card p-5 sm:p-6 flex flex-col justify-between group cursor-pointer hover:border-[#134e2f]/40 transition relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#404942]">Last Video Watched</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/videos');
              }}
              className="w-8 h-8 rounded-full border border-[#c0c9bf] flex items-center justify-center text-[#404942] group-hover:bg-[#134e2f] group-hover:text-white group-hover:border-[#134e2f] transition"
              title="Continue Watching"
            >
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </button>
          </div>

          <div className="my-2.5">
            {isLoadingLastWatched ? (
              <div className="space-y-1.5 py-1">
                <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-3.5 w-1/2 bg-gray-100 animate-pulse rounded"></div>
              </div>
            ) : lastWatchedVideo ? (
              <div className="flex items-center gap-3">
                {lastWatchedVideo.thumbnailUrl && (
                  <div className="relative w-14 h-10 sm:w-16 sm:h-11 rounded-xl overflow-hidden shrink-0 border border-gray-200/80 shadow-sm bg-black/5">
                    <img
                      src={lastWatchedVideo.thumbnailUrl}
                      alt={lastWatchedVideo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="w-3 h-3 text-white fill-white" />
                    </div>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-[#181c1b] tracking-tight truncate group-hover:text-[#134e2f] transition" title={lastWatchedVideo.title}>
                    {lastWatchedVideo.title}
                  </h4>
                  <p className="text-[11px] text-[#717971] truncate mt-0.5">
                    {lastWatchedVideo.channelTitle || (lastWatchedVideo.subjectCode ? `VTU • ${lastWatchedVideo.subjectCode}` : 'Video Lecture')}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-xs sm:text-sm font-bold text-[#181c1b] block">
                  No video watched yet
                </span>
                <span className="text-[11px] text-[#717971] mt-0.5 block">
                  Explore recommended syllabus lectures
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#006d3d] font-semibold">
            {lastWatchedVideo ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#134e2f] animate-pulse"></span>
                <span>
                  {lastWatchedVideo.progressStatus === 'COMPLETED' ? 'Completed • Watch again' : 'In Progress • Resume'}
                </span>
              </>
            ) : (
              <>
                <Youtube className="w-3.5 h-3.5 text-rose-600" />
                <span className="text-rose-700">Browse Video Recommendations</span>
              </>
            )}
          </div>
        </div>
      </section>


      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Weekly Activity */}
        <div className="donezo-card p-6 lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900">
                Weekly Activity
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Study and coursework consistency
              </p>
            </div>
          </div>

          {/* Bar Chart Graphic */}
          <div className="flex-1 flex items-end justify-between px-2 pt-8 pb-3 min-h-[160px]">
            {weeklyActivity.map((day) => {
              const maxCount = Math.max(
                ...weeklyActivity.map((item) => item.count),
                1
              );

              const barHeight =
                day.count === 0
                  ? 80
                  : Math.max((day.count / maxCount) * 128, 80);

              const date = new Date(`${day.date}T00:00:00`);

              const dayLabel = date
                .toLocaleDateString('en-US', {
                  weekday: 'short',
                })
                .charAt(0);

              return (
                <div
                  key={day.date}
                  className="flex flex-col items-center gap-2.5"
                >
                  <div
                    className={`w-8 sm:w-10 rounded-full transition-all duration-300 ${day.count === 0
                      ? 'bar-hatched border border-gray-200'
                      : day.count === maxCount
                        ? 'bg-[#103D27]'
                        : 'bg-[#34D399]'
                      }`}
                    style={{
                      height: `${barHeight}px`,
                    }}
                    title={`${day.count} activities on ${day.date}`}
                  />

                  <span className="text-xs font-semibold text-gray-400">
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Study Goal */}
        <div className="lg:col-span-5 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#124b30] via-[#0e3b26] to-[#072417] text-white p-6 sm:p-7 border border-emerald-500/20 shadow-[0_16px_36px_-8px_rgba(13,54,35,0.45)] flex flex-col justify-between group">
          {/* Ambient Glows & Dot Texture */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#97f3b5]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#97f3b5]/15 transition-all duration-500" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#186444]/25 rounded-full blur-xl pointer-events-none" />
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(rgba(151, 243, 181, 0.4) 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }}
          />

          <div className="relative z-10 space-y-6">
            {/* Header Row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-[#97f3b5] backdrop-blur-sm">
                  <Target className="w-3.5 h-3.5 text-[#97f3b5]" />
                  <span>Daily Study Goal</span>
                  {currentStreak > 0 && (
                    <>
                      <span className="text-white/40">•</span>
                      <span className="flex items-center gap-1 text-amber-300">
                        <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
                        {currentStreak}d Streak
                      </span>
                    </>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2.5">
                  Today's Study Goal
                </h3>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Stay consistent with your VTU syllabus and career targets
                </p>
              </div>

              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-[#97f3b5] shadow-inner group-hover:scale-105 group-hover:bg-white/15 transition-all duration-300 shrink-0">
                <Target className="w-5 h-5 text-[#97f3b5]" />
              </div>
            </div>

            {/* Metrics Section */}
            <div className="flex items-baseline justify-between flex-wrap gap-3 pt-1">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                    {isLoadingStudySummary ? '...' : studySummary.totalMinutes}
                  </span>
                  <span className="text-sm font-semibold text-emerald-300">
                    min studied
                  </span>
                  <span className="text-xs text-emerald-200/70 font-mono">
                    ({((studySummary.totalMinutes || 0) / 60).toFixed(1)} hrs)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-200/70 block">
                  Daily Target
                </span>

                <select
                  value={studySummary.dailyGoalMinutes}
                  onChange={(e) =>
                    handleUpdateStudyGoal(Number(e.target.value))
                  }
                  disabled={isUpdatingStudyGoal || isLoadingStudySummary}
                  className="mt-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm font-bold text-white outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value={15} className="text-black">
                    15 min
                  </option>
                  <option value={30} className="text-black">
                    30 min
                  </option>
                  <option value={60} className="text-black">
                    60 min
                  </option>
                  <option value={90} className="text-black">
                    90 min
                  </option>
                  <option value={120} className="text-black">
                    120 min
                  </option>
                  <option value={180} className="text-black">
                    180 min
                  </option>
                  <option value={240} className="text-black">
                    240 min
                  </option>
                  <option value={300} className="text-black">
                    300 min
                  </option>
                  <option value={360} className="text-black">
                    360 min
                  </option>
                </select>

                {isUpdatingStudyGoal && (
                  <span className="block text-[10px] text-emerald-200/70 mt-1">
                    Saving...
                  </span>
                )}
              </div>

              {/* Progress Bar & Milestone Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#97f3b5] animate-pulse" />
                    {isLoadingStudySummary ? 'Loading...' : `${studySummary.progress}% completed`}
                  </span>
                  <span className="text-emerald-200/90 font-medium whitespace-nowrap shrink-0">
                    {isLoadingStudySummary
                      ? '...'
                      : studySummary.totalMinutes >= studySummary.dailyGoalMinutes ? (
                        <span className="text-[#97f3b5] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Goal Achieved!
                        </span>
                      ) : (
                        `${Math.max(studySummary.dailyGoalMinutes - studySummary.totalMinutes, 0)} min left`
                      )}
                  </span>
                </div>

                {/* Glowing Progress Bar */}
                <div className="h-2.5 w-full rounded-full bg-black/40 border border-white/10 p-0.5 overflow-hidden shadow-inner relative">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#97f3b5] transition-all duration-700 ease-out shadow-[0_0_12px_rgba(151,243,181,0.6)]"
                    style={{
                      width: `${Math.min(studySummary.progress, 100)}%`,
                    }}
                  />
                </div>

                {/* Milestone Markers */}
                <div className="flex justify-between items-center text-[10px] text-emerald-200/60 font-mono pt-0.5">
                  {[0, 0.25, 0.5, 0.75, 1].map((percentage, index) => {
                    const minutes =
                      index === 4
                        ? studySummary.dailyGoalMinutes
                        : Math.round(studySummary.dailyGoalMinutes * percentage);

                    const hours = minutes / 60;

                    const label =
                      hours >= 1
                        ? `${minutes}m (${Number.isInteger(hours) ? hours : hours.toFixed(1)}h)`
                        : `${minutes}m`;

                    return (
                      <span
                        key={percentage}
                        className={
                          index === 4
                            ? 'text-[#97f3b5] font-semibold'
                            : ''
                        }
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer: Live Focus Session & Quick Actions */}
            <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

              <div className="flex items-center gap-2.5">

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${isStudySessionActive
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-[#97f3b5]'
                    : 'bg-white/10 border-white/20 text-white/60'
                    }`}
                >
                  <Clock className="w-4 h-4" />
                </div>

                <div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">

                    <span>Focus Session</span>

                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isStudySessionActive
                        ? 'bg-[#97f3b5] animate-ping'
                        : 'bg-gray-400'
                        }`}
                    />

                  </div>

                  <p className="text-[11px] font-mono text-emerald-200/80">
                    {isStudySessionActive
                      ? formatTimer(studySessionElapsedSeconds)
                      : '00:00:00'}
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={
                    isStudySessionActive
                      ? handleEndStudySession
                      : handleStartStudySession
                  }
                  disabled={
                    isEndingStudySession ||
                    (isStudySessionActive && studySessionElapsedSeconds < 60)
                  }
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isStudySessionActive
                    ? 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                    : 'bg-[#97f3b5] hover:bg-[#7ceaa0] text-[#00361c] shadow-sm'
                    }`}
                >

                  {isStudySessionActive ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>
                        {isEndingStudySession ? 'Saving...' : 'Finish'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start</span>
                    </>
                  )}

                </button>

                <button
                  type="button"
                  onClick={() => navigate('/resources')}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition active:scale-95"
                  title="View Study Resources"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Row 4: Semester Academic Subjects & Quick Study Materials */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#144E35]" />
            <h2 className="text-lg font-bold text-gray-900">
              Active Semester {semester} Subjects
            </h2>
          </div>
          <Link
            to="/resources"
            className="text-xs text-[#144E35] hover:text-[#0F3D2A] font-semibold flex items-center gap-1 transition"
          >
            <span>View All Notes</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoadingSubjects ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-3xl bg-white animate-pulse border border-gray-200"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((sub) => (
              <div key={sub.code} className="donezo-card p-6 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {sub.code}
                    </span>
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" /> 5 Modules
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#144E35] transition">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {sub.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    to="/resources"
                    className="text-xs text-[#144E35] font-semibold hover:text-[#0F3D2A] flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Explore Notes & PDFs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upgrade Modal */}
      <SemesterUpgradeModal
        currentSemester={semester}
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
};

function AppLayout() {
  const location = useLocation();
  const { user, profile, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const studentName = user?.fullName || '';
  const studentEmail = user?.email || '';

  const menuNavItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/resources', label: 'Study Resources', icon: BookOpen },
    { path: '/videos', label: 'Video Recommendations', icon: Youtube },
    { path: '/quizzes', label: 'Practice Quiz', icon: Award },
    { path: '/ai-assistant', label: 'AI Assistant', icon: Bot },
    { path: '/careers', label: 'Careers and Opportunities', icon: Briefcase },
    { path: '/resume-analyzer', label: 'Resume Analyzer', icon: FileCheck },
    { path: '/locker', label: 'Document Locker', icon: FileText },
  ];



  if (!isAuthenticated && (location.pathname === '/' || location.pathname === '/landing')) {
    return <LandingPage />;
  }

  const isAuthPage = !isAuthenticated && (location.pathname === '/login' || location.pathname === '/register');

  return (
    <div className={`min-h-screen ${isAuthPage ? 'h-screen max-h-screen overflow-hidden' : ''} flex flex-col bg-[#f7faf7] text-[#181c1b] font-sans selection:bg-[#97f3b5] selection:text-[#00361c]`}>
      {isAuthPage && <AnimatedAcademicBackground />}
      {/* Student Assistant Left Sidebar */}
      {isAuthenticated && (
        <aside className="fixed left-0 top-0 h-full z-40 hidden lg:flex flex-col w-64 bg-white border-r border-[#e2e8e2] shadow-sm p-6 overflow-y-auto">
          {/* Brand Logo Header */}
          <Link to="/" className="flex items-center mb-7 px-1 group">
            <img
              src="/logo.png"
              alt="Student Assistant"
              className="w-[200px] h-auto object-contain object-left dark:hidden transition-transform duration-200 group-hover:scale-[1.02]"
            />
            <img
              src="/logo-dark.png"
              alt="Student Assistant"
              className="w-[200px] h-auto object-contain object-left hidden dark:block transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>

          {/* MENU Section */}
          <div className="mb-6">
            <h6 className="text-[11px] font-bold text-[#717971] uppercase tracking-wider px-3 mb-2">
              Menu
            </h6>
            <nav className="space-y-1">
              {menuNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path + item.label}
                    to={item.path}
                    className={`relative flex items-center justify-between px-3 py-2.5 rounded-full text-xs font-semibold transition-all duration-150 ${isActive
                      ? 'text-[#00361c] dark:text-[#86D5A4] font-bold bg-[#e8f5e9] dark:bg-[#22332A]'
                      : 'text-[#404942] dark:text-[#BAC8BE] hover:text-[#00361c] dark:hover:text-[#86D5A4] hover:bg-[#f0f4f0] dark:hover:bg-[#22332A]'
                      }`}
                  >
                    {/* Active vertical green indicator bar */}
                    {isActive && (
                      <span className="absolute -left-6 top-2 bottom-2 w-1.5 rounded-r-full bg-[#134e2f] dark:bg-[#86D5A4]"></span>
                    )}
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#134e2f] dark:text-[#86D5A4]' : 'text-gray-400 dark:text-[#91A397]'}`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Section - Pinned to bottom: Profile & Logout */}
          <div className="mt-auto pt-4 border-t border-[#e2e8e2] space-y-1">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-[#f0f4f0] transition group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#134e2f] to-[#2e8b57] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white shrink-0">
                {studentName ? studentName[0] : 'S'}
              </div>
              <div className="text-left overflow-hidden min-w-0">
                <p className="text-xs font-bold text-[#181c1b] leading-tight truncate group-hover:text-[#134e2f] transition">{studentName || 'Student'}</p>
                <p className="text-[10px] text-[#717971] font-mono leading-tight truncate">{studentEmail}</p>
              </div>
            </Link>

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-2xl text-xs font-semibold text-[#404942] hover:text-rose-600 hover:bg-rose-50/60 transition group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[#f0f4f0] group-hover:bg-rose-100/70 text-[#717971] group-hover:text-rose-600 flex items-center justify-center shrink-0 transition">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs leading-tight">Logout</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Wrapper */}
      <div className={`flex-1 flex flex-col ${isAuthPage ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'} ${isAuthenticated ? 'lg:ml-64' : ''}`}>
        {/* Top Header Bar - Only on mobile when authenticated, or full width when unauthenticated */}
        {isAuthenticated ? (
          <header className="lg:hidden sticky top-0 z-30 bg-[#f7faf7]/90 backdrop-blur-md px-4 py-3 border-b border-[#e2e8e2]">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full bg-white border border-[#c0c9bf] text-[#181c1b] shadow-sm cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Student Assistant" className="w-[140px] h-auto object-contain dark:hidden" />
                <img src="/logo-dark.png" alt="Student Assistant" className="w-[140px] h-auto object-contain hidden dark:block" />
              </div>

              <Link
                to="/profile"
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#134e2f] to-[#2e8b57] text-white flex items-center justify-center font-bold text-xs shadow-sm"
              >
                {studentName ? studentName[0] : 'S'}
              </Link>
            </div>

            {/* Mobile Drawer Menu */}
            {mobileMenuOpen && (
              <div className="mt-3 p-4 rounded-2xl bg-white border border-[#e2e8e2] shadow-lg grid grid-cols-2 gap-2 animate-fade-in">
                {menuNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path + item.label}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition ${isActive
                        ? 'bg-[#134e2f] text-white'
                        : 'text-[#181c1b] hover:bg-[#f0f4f0]'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={logout}
                  className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-rose-50 text-rose-600 text-xs font-bold mt-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </header>
        ) : (
          <header className="w-full bg-transparent px-6 lg:px-12 py-3 border-none relative z-30">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <Link to="/" className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Student Assistant" className="w-[190px] sm:w-[210px] h-auto object-contain dark:hidden" />
                <img src="/logo-dark.png" alt="Student Assistant" className="w-[190px] sm:w-[210px] h-auto object-contain hidden dark:block" />
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-5 py-2 text-xs font-semibold rounded-full shadow-sm transition ${
                    location.pathname === '/login'
                      ? 'bg-[#134e2f] hover:bg-[#0e3b24] text-white'
                      : 'bg-white hover:bg-[#f0f4f0] text-[#181c1b] border border-[#c0c9bf]'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-5 py-2 text-xs font-semibold rounded-full shadow-sm transition ${
                    location.pathname === '/login'
                      ? 'bg-white hover:bg-[#f0f4f0] text-[#181c1b] border border-[#c0c9bf]'
                      : 'bg-[#134e2f] hover:bg-[#0e3b24] text-white'
                  }`}
                >
                  Register
                </Link>
              </div>
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 w-full mx-auto ${isAuthPage ? 'px-4 py-0 flex flex-col justify-center max-w-5xl overflow-hidden' : 'max-w-7xl px-6 py-6'}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/landing" element={<LandingPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardContent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-assistant"
              element={
                <ProtectedRoute>
                  <AIAssistant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <StudyResources />
                </ProtectedRoute>
              }
            />
            <Route
              path="/videos"
              element={
                <ProtectedRoute>
                  <VideoRecommendations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes"
              element={
                <ProtectedRoute>
                  <QuizSystem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/locker"
              element={
                <ProtectedRoute>
                  <DocumentLocker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/careers"
              element={
                <ProtectedRoute>
                  <CareersAndOpportunities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume-analyzer"
              element={
                <ProtectedRoute>
                  <ResumeAnalyzer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/skills"
              element={
                <ProtectedRoute>
                  <SkillsAndProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <ReportsAnalytics />
                </AdminRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
        </main>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ConfirmProvider>
          <AppLayout />
        </ConfirmProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
