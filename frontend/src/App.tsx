import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import AdminDashboard from './pages/AdminDashboard';
import { SkillsAndProjects } from './pages/SkillsAndProjects';
import { NotificationDropdown } from './components/NotificationDropdown';
import { SemesterUpgradeModal } from './components/SemesterUpgradeModal';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { Settings } from './pages/Settings';
import { api } from './services/api';
import { 
  Bot, 
  BookOpen, 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
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
  Search,
  Bell,
  Mail,
  TrendingUp,
  Menu,
  X,
  Code2,
  BarChart3,
  Settings as SettingsIcon,
  HelpCircle,
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
  Layers,
  Sparkle
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
  const navigate = useNavigate();

  const studentName = user?.fullName || 'Totok Michael';
  const university = profile?.university || 'Visvesvaraya Technological University (VTU)';
  const semester = profile?.semester || 6;

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Live Time Tracker State (matches reference "01:24:08" by default)
  const [timerSeconds, setTimerSeconds] = useState(5048); // 1 hr, 24 mins, 8 secs
  const [isTimerActive, setIsTimerActive] = useState(true);

  useEffect(() => {
    let interval: any = null;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
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

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Section: Title & Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006d3d] animate-pulse"></span>
            <span>● Live Sync • {university}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#181c1b] tracking-tight">
            Academic Sanctuary
          </h1>
          <p className="text-xs sm:text-sm text-[#404942] mt-1">
            Semester {semester} Engineering • Track your coursework, modules, quizzes, and career goals with ease.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/skills')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
          <button 
            onClick={() => setIsUpgradeModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-gray-50 border border-[#c0c9bf] text-[#181c1b] text-xs font-semibold shadow-sm transition active:scale-95"
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
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">6 Subjects</span>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-emerald-200/90 font-medium mb-1.5">
              <span>Syllabus Coverage</span>
              <span>78%</span>
            </div>
            <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#97f3b5] h-full w-[78%] rounded-full"></div>
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
            <span className="text-3xl sm:text-4xl font-extrabold text-[#181c1b] tracking-tight">10 Solved</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#006d3d] font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>92% Average Accuracy</span>
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
            <span className="text-3xl sm:text-4xl font-extrabold text-[#181c1b] tracking-tight">30 Modules</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#006d3d] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>VTU Scheme 2022 Verified</span>
          </div>
        </div>

        {/* Card 4: Career Opportunities */}
        <div className="stitch-card p-5 sm:p-6 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#404942]">Career Matches</span>
            <button 
              onClick={() => navigate('/careers')}
              className="w-8 h-8 rounded-full border border-[#c0c9bf] flex items-center justify-center text-[#404942] hover:bg-[#f0f4f0] transition"
              title="View Internships"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="my-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#181c1b] tracking-tight">4 Internships</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>2 Deadlines this week</span>
          </div>
        </div>
      </section>

      {/* Row 2: Analytics, Reminders & Projects */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Project Analytics (Bar Chart with hatched and emerald bars) */}
        <div className="donezo-card p-6 lg:col-span-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-gray-900">Project Analytics</h3>
          </div>

          {/* Bar Chart Graphic */}
          <div className="flex-1 flex items-end justify-between px-2 pt-8 pb-3 min-h-[160px]">
            {/* Sunday */}
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-8 sm:w-9 h-20 rounded-full bar-hatched border border-gray-200"></div>
              <span className="text-xs font-semibold text-gray-400">S</span>
            </div>

            {/* Monday */}
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-8 sm:w-9 h-24 rounded-full bg-[#186444]"></div>
              <span className="text-xs font-semibold text-gray-400">M</span>
            </div>

            {/* Tuesday (with 58% callout badge) */}
            <div className="flex flex-col items-center gap-2.5 relative">
              <div className="absolute -top-7 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 shadow-sm">
                58%
              </div>
              <div className="w-8 sm:w-9 h-28 rounded-full bg-[#34D399]"></div>
              <span className="text-xs font-semibold text-gray-400">T</span>
            </div>

            {/* Wednesday */}
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-8 sm:w-9 h-32 rounded-full bg-[#103D27]"></div>
              <span className="text-xs font-semibold text-gray-400">W</span>
            </div>

            {/* Thursday */}
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-8 sm:w-9 h-22 rounded-full bar-hatched border border-gray-200"></div>
              <span className="text-xs font-semibold text-gray-400">T</span>
            </div>

            {/* Friday */}
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-8 sm:w-9 h-24 rounded-full bar-hatched border border-gray-200"></div>
              <span className="text-xs font-semibold text-gray-400">F</span>
            </div>

            {/* Saturday */}
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-8 sm:w-9 h-20 rounded-full bar-hatched border border-gray-200"></div>
              <span className="text-xs font-semibold text-gray-400">S</span>
            </div>
          </div>
        </div>

        {/* Reminders Card */}
        <div className="donezo-card p-6 lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-gray-900 mb-3">Reminders</h3>
            <div className="mt-2">
              <h4 className="text-lg font-bold text-gray-900 leading-snug">
                Meeting with Arc Company
              </h4>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Time: 02.00 pm - 04.00 pm
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4">
            <button 
              onClick={() => alert("Connecting to live meeting room...")}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#144E35] hover:bg-[#0F3D2A] text-white text-xs font-semibold shadow-sm transition active:scale-98"
            >
              <Video className="w-4 h-4" />
              <span>Start Meeting</span>
            </button>
          </div>
        </div>

        {/* Project List Card */}
        <div className="donezo-card p-6 lg:col-span-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-gray-900">Project</h3>
            <button 
              onClick={() => navigate('/skills')}
              className="px-3 py-1 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              + New
            </button>
          </div>

          <div className="space-y-3">
            {/* Task 1 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Hash className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-gray-900 truncate">Develop API Endpoints</h5>
                <p className="text-[11px] text-gray-400">Due date: Nov 26, 2026</p>
              </div>
            </div>

            {/* Task 2 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-gray-900 truncate">Onboarding Flow</h5>
                <p className="text-[11px] text-gray-400">Due date: Nov 28, 2026</p>
              </div>
            </div>

            {/* Task 3 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <Sparkle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-gray-900 truncate">Build Dashboard</h5>
                <p className="text-[11px] text-gray-400">Due date: Nov 30, 2026</p>
              </div>
            </div>

            {/* Task 4 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <Sun className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-gray-900 truncate">Optimize Page Load</h5>
                <p className="text-[11px] text-gray-400">Due date: Dec 5, 2026</p>
              </div>
            </div>

            {/* Task 5 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-bold text-gray-900 truncate">Cross-Browser Testing</h5>
                <p className="text-[11px] text-gray-400">Due date: Dec 6, 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Row 3: Team Collaboration, Project Progress & Time Tracker */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Team Collaboration */}
        <div className="donezo-card p-6 lg:col-span-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-gray-900">Team Collaboration</h3>
            <button 
              onClick={() => alert("Invite teammate via student ID or email")}
              className="px-3 py-1 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              + Add Member
            </button>
          </div>

          <div className="space-y-3.5">
            {/* Member 1 */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 font-bold text-xs shrink-0">
                  AD
                </div>
                <div className="truncate">
                  <h5 className="text-xs font-bold text-gray-900">Alexandra Deff</h5>
                  <p className="text-[11px] text-gray-400 truncate">Working on Github Project Repository</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                Completed
              </span>
            </div>

            {/* Member 2 */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0">
                  EA
                </div>
                <div className="truncate">
                  <h5 className="text-xs font-bold text-gray-900">Edwin Adenike</h5>
                  <p className="text-[11px] text-gray-400 truncate">Working on Integrate User Authentication System</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                In Progress
              </span>
            </div>

            {/* Member 3 */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                  IO
                </div>
                <div className="truncate">
                  <h5 className="text-xs font-bold text-gray-900">Isaac Oluwatemilorun</h5>
                  <p className="text-[11px] text-gray-400 truncate">Working on Develop Search and Filter Functionality</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                Pending
              </span>
            </div>

            {/* Member 4 */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs shrink-0">
                  DO
                </div>
                <div className="truncate">
                  <h5 className="text-xs font-bold text-gray-900">David Oshodi</h5>
                  <p className="text-[11px] text-gray-400 truncate">Working on Responsive Layout for Homepage</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                In Progress
              </span>
            </div>
          </div>
        </div>

        {/* Project Progress Gauge */}
        <div className="donezo-card p-6 lg:col-span-4 flex flex-col justify-between">
          <h3 className="font-bold text-base text-gray-900 mb-2">Project Progress</h3>

          <div className="flex flex-col items-center justify-center my-auto py-2">
            {/* Semi-circular gauge SVG */}
            <div className="relative w-48 h-28 flex items-end justify-center overflow-hidden">
              <svg viewBox="0 0 200 110" className="w-full h-full">
                {/* Background Track */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                {/* Completed (Dark Green) */}
                <path
                  d="M 20 100 A 80 80 0 0 1 95 24"
                  fill="none"
                  stroke="#144E35"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                {/* In Progress (Mint Green) */}
                <path
                  d="M 95 24 A 80 80 0 0 1 140 45"
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="24"
                />
              </svg>

              {/* Center Metric Display */}
              <div className="absolute bottom-1 text-center">
                <span className="text-3xl font-extrabold text-gray-900">41%</span>
                <p className="text-[11px] text-gray-400 font-medium">Project Ended</p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px] font-medium text-gray-600 mt-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#144E35]"></span>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]"></span>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full legend-hatched border border-gray-300"></span>
                <span>Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time Tracker Widget (Functional timer with play/pause/reset) */}
        <div className="donezo-card-timetracker p-6 lg:col-span-3 flex flex-col justify-between">
          <div className="relative z-10">
            <span className="text-sm font-medium text-emerald-200">Time Tracker</span>
            <div className="my-5 text-center">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-wider">
                {formatTimer(timerSeconds)}
              </span>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setIsTimerActive(!isTimerActive)}
              className="w-11 h-11 rounded-full bg-white text-[#144E35] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
              title={isTimerActive ? "Pause" : "Start"}
            >
              {isTimerActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            <button
              onClick={() => {
                setIsTimerActive(false);
                setTimerSeconds(0);
              }}
              className="w-11 h-11 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
              title="Stop & Reset"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
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

  const studentName = user?.fullName || 'Totok Michael';
  const studentEmail = user?.email || 'tmichael20@mail.com';

  const menuNavItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/resources', label: 'Study Resources', icon: BookOpen },
    { path: '/videos', label: 'Video Recommendations', icon: Youtube },
    { path: '/quizzes', label: 'Practice Quiz', icon: Award },
    { path: '/ai-assistant', label: 'AI Assistant', icon: Bot },
    { path: '/careers', label: 'Careers and Opportunities', icon: Briefcase },
    { path: '/locker', label: 'Document Locker', icon: FileText },
  ];

  const generalNavItems = [
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
    { path: '/profile', label: 'Help', icon: HelpCircle },
  ];

  if (!isAuthenticated && (location.pathname === '/' || location.pathname === '/landing')) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen flex bg-[#f7faf7] text-[#181c1b] font-sans selection:bg-[#97f3b5] selection:text-[#00361c]">
      {/* Student Assistant Left Sidebar */}
      {isAuthenticated && (
        <aside className="fixed left-0 top-0 h-full z-40 hidden lg:flex flex-col w-64 bg-white border-r border-[#e2e8e2] shadow-sm p-6 overflow-y-auto">
          {/* Brand Logo Header */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-full bg-[#134e2f] text-white flex items-center justify-center shadow-sm shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-[#00361c] tracking-tight leading-none">
                Student Assistant
              </span>
              <span className="text-[10px] text-[#404942] font-semibold mt-1">
                Academic & Career Suite
              </span>
            </div>
          </div>

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
                    className={`relative flex items-center justify-between px-3 py-2.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'text-[#00361c] font-bold bg-[#e8f5e9]'
                        : 'text-[#404942] hover:text-[#00361c] hover:bg-[#f0f4f0]'
                    }`}
                  >
                    {/* Active vertical green indicator bar */}
                    {isActive && (
                      <span className="absolute -left-6 top-2 bottom-2 w-1.5 rounded-r-full bg-[#134e2f]"></span>
                    )}
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#134e2f]' : 'text-gray-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* GENERAL Section */}
          <div className="mb-6">
            <h6 className="text-[11px] font-bold text-[#717971] uppercase tracking-wider px-3 mb-2">
              General
            </h6>
            <nav className="space-y-1">
              {generalNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'text-[#00361c] font-bold bg-[#e8f5e9]'
                        : 'text-[#404942] hover:text-[#00361c] hover:bg-[#f0f4f0]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-full text-xs font-semibold text-[#404942] hover:text-rose-600 hover:bg-rose-50/50 transition"
              >
                <LogOut className="w-4 h-4 text-gray-400" />
                <span>Logout</span>
              </button>
            </nav>
          </div>

          {/* Bottom Card: Academic Syllabus Sync */}
          <div className="mt-auto pt-2">
            <div className="rounded-2xl bg-[#134e2f] p-4 text-white relative overflow-hidden shadow-sm">
              <div className="relative z-10 space-y-2">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <h5 className="font-bold text-xs leading-snug">VTU Syllabus Sync Active</h5>
                <p className="text-[11px] text-emerald-100/80">Semester {profile?.semester || 6} Engineering</p>
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full mt-2 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white border border-white/20 transition text-center block"
                >
                  Manage Academic Profile
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Wrapper */}
      <div className={`flex-1 flex flex-col min-h-screen ${isAuthenticated ? 'lg:ml-64' : ''}`}>
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#f7faf7]/90 backdrop-blur-md px-6 py-4 border-b border-[#e2e8e2]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Left: Mobile Toggle & Search Bar */}
            <div className="flex items-center gap-4 flex-1">
              {isAuthenticated && (
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-full bg-white border border-[#c0c9bf] text-[#181c1b] shadow-sm"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}

              {!isAuthenticated && (
                <Link to="/" className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#134e2f] flex items-center justify-center text-white shadow-sm">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-base text-[#181c1b]">
                    Student <span className="text-[#134e2f]">Assistant</span>
                  </span>
                </Link>
              )}

              {/* Pill Search Input */}
              {isAuthenticated && (
                <div className="hidden sm:flex items-center max-w-sm w-full">
                  <div className="relative w-full flex items-center">
                    <Search className="w-4 h-4 absolute left-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search coursework, quizzes, roadmaps..."
                      className="w-full pl-10 pr-12 py-2 rounded-full bg-white border border-[#c0c9bf] text-xs text-[#181c1b] placeholder-gray-400 focus:outline-none focus:border-[#134e2f] focus:ring-1 focus:ring-[#134e2f] shadow-sm transition"
                    />
                    <div className="absolute right-3 px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-[10px] font-mono font-medium text-gray-400">
                      ⌘F
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Message, Notification & Profile */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Messages Icon Button */}
                  <button 
                    onClick={() => navigate('/ai-assistant')}
                    className="p-2.5 rounded-full bg-white hover:bg-[#f0f4f0] border border-[#c0c9bf] text-[#181c1b] transition shadow-sm"
                    title="Messages / Assistant"
                  >
                    <Mail className="w-4 h-4 text-[#134e2f]" />
                  </button>

                  {/* Notification Dropdown */}
                  <NotificationDropdown />

                  {/* User Profile Pill with Avatar */}
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-white/80 transition"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#134e2f] to-[#2e8b57] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white">
                      {studentName ? studentName[0] : 'S'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-[#181c1b] leading-tight">{studentName}</p>
                      <p className="text-[10px] text-[#404942] font-mono leading-tight">{studentEmail}</p>
                    </div>
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-5 py-2 text-xs font-semibold rounded-full bg-white hover:bg-[#f0f4f0] text-[#181c1b] border border-[#c0c9bf] shadow-sm transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 text-xs font-semibold rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white shadow-sm transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Drawer Menu */}
          {isAuthenticated && mobileMenuOpen && (
            <div className="lg:hidden mt-3 p-4 rounded-2xl bg-white border border-[#e2e8e2] shadow-lg grid grid-cols-2 gap-2 animate-fade-in">
              {menuNavItems.concat(generalNavItems).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path + item.label}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition ${
                      isActive
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
                className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-rose-50 text-rose-600 text-xs font-bold mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-4">
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

        {/* Minimal Footer */}
        <footer className="py-6 text-center text-xs text-[#404942] bg-transparent border-t border-[#e2e8e2]/60">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 Student Assistant — Academic & Career Intelligence Engine.</p>
            <p className="flex items-center gap-2 font-mono text-gray-500">
              <Lock className="w-3.5 h-3.5 text-[#006d3d]" /> Protected Student Cloud System
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
