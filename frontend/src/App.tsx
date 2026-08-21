import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
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
  UserCheck,
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
  Flame,
  TrendingUp,
  BrainCircuit,
  Menu,
  X,
  Zap,
  Activity,
  Code2,
  BarChart3,
  Settings as SettingsIcon
} from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
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
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
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

  const studentName = user?.fullName || 'Rahul Sharma';
  const university = profile?.university || 'Visvesvaraya Technological University (VTU)';
  const branch = profile?.branch || 'Computer Science & Engineering';
  const semester = profile?.semester || 6;

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

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
  }, [semester, branch]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Premium Hero Greeting Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/70 border border-indigo-500/25 p-8 sm:p-10 shadow-[0_15px_40px_-10px_rgba(99,102,241,0.25)] flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_12px_rgba(99,102,241,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> {university} • Sem {semester}
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">{studentName}</span> 👋
          </h1>
          
          <p className="text-slate-300 text-sm leading-relaxed">
            Your personalized academic workspace is live. Access syllabus-tailored study notes, practice quizzes, AI homework assistance, and matched career opportunities.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button 
              onClick={() => navigate('/ai-assistant')} 
              className="btn-shimmer px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 group"
            >
              <Bot className="w-4 h-4 text-indigo-200 group-hover:scale-110 transition-transform" /> Ask AI Academic Assistant
            </button>
            <button 
              onClick={() => navigate('/resources')} 
              className="px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700/80 transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" /> Sem {semester} Notes
            </button>
            <button 
              onClick={() => navigate('/careers')} 
              className="px-5 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-semibold text-xs border border-purple-500/30 transition flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-purple-400" /> Internships & Jobs
            </button>
            <button 
              onClick={() => setIsUpgradeModalOpen(true)} 
              className="px-5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-500/30 transition flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" /> Advance Semester
            </button>
          </div>
        </div>

        <SemesterUpgradeModal 
          currentSemester={semester}
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          onSuccess={() => window.location.reload()}
        />

        {/* Mascot / Glowing Icon Badge */}
        <div className="relative z-10 w-44 h-44 mt-6 md:mt-0 flex items-center justify-center shrink-0">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.4)] animate-float p-1">
            <div className="w-full h-full rounded-[22px] bg-[#0d1322] flex items-center justify-center">
              <GraduationCap className="w-16 h-16 text-indigo-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="eduflow-card p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Active Streak
            </span>
          </div>
          <div>
            <p className="text-xs font-mono text-slate-400 mb-1">Study Consistency</p>
            <p className="text-2xl font-extrabold text-white font-sans">14 Days 🔥</p>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full w-[85%]"></div>
            </div>
          </div>
        </div>

        <div className="eduflow-card p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-slate-400">Assessments</span>
          </div>
          <div>
            <p className="text-xs font-mono text-slate-400 mb-1">Quizzes Passed</p>
            <p className="text-2xl font-extrabold text-white font-sans">12 / 15</p>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-[80%]"></div>
            </div>
          </div>
        </div>

        <div className="eduflow-card p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-indigo-300">Sem {semester}</span>
          </div>
          <div>
            <p className="text-xs font-mono text-slate-400 mb-1">Active Subjects</p>
            <p className="text-2xl font-extrabold text-white font-sans">{subjects.length || 4} Courses</p>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full w-[75%]"></div>
            </div>
          </div>
        </div>

        <div className="eduflow-card p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-purple-300">Target</span>
          </div>
          <div>
            <p className="text-xs font-mono text-slate-400 mb-1">Target CGPA</p>
            <p className="text-2xl font-extrabold text-white font-sans">8.8 / 10</p>
            <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full w-[90%]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Semester Subjects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white font-sans flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" /> Active Semester {semester} Subjects
          </h2>
          <Link to="/resources" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition">
            <span>View All Notes</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoadingSubjects ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((sub) => (
              <div key={sub.code} className="eduflow-card p-6 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="eduflow-pill">
                      {sub.code}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" /> 5 Modules
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition font-sans">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {sub.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <Link to="/resources" className="text-xs text-indigo-400 font-semibold hover:text-indigo-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Explore Notes & PDFs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Assistant & Career Quick Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="eduflow-card p-6 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-indigo-500/30 flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white font-sans">Study Buddy AI Assistant</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ask questions on Compiler Design, Machine Learning algorithms, Web Tech, or upload syllabus queries for instant solutions.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between relative z-10">
            <span className="text-xs font-mono text-indigo-300">GPT-4 Academic Engine</span>
            <Link to="/ai-assistant" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5">
              <span>Start Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="eduflow-card p-6 flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-white font-sans">Campus & Government Careers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore active Summer 2026 internships at Google, Microsoft, Amazon, along with GATE 2027 & ISRO competitive exam updates.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">8 Live Listings Available</span>
            <Link to="/careers" className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5">
              <span>Explore Listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

function AppLayout() {
  const location = useLocation();
  const { user, profile, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    ...(user?.role === 'ADMIN' ? [
      { path: '/admin', label: 'Admin Suite', icon: ShieldCheck },
      { path: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    ] : []),
    { path: '/ai-assistant', label: 'AI Assistant', icon: Bot },
    { path: '/resources', label: 'Study Notes', icon: BookOpen },
    { path: '/videos', label: 'Video Lectures', icon: Youtube },
    { path: '/quizzes', label: 'Practice Quizzes', icon: Award },
    { path: '/locker', label: 'Document Locker', icon: FileText },
    { path: '/careers', label: 'Careers & Jobs', icon: Briefcase },
    { path: '/skills', label: 'Skills & Projects', icon: Code2 },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
    { path: '/profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex bg-[#080c14] text-slate-100 font-sans">
      {/* Translucent Dark Glass SideNavBar */}
      {isAuthenticated && (
        <aside className="fixed left-0 top-0 h-full z-40 hidden lg:flex flex-col w-64 bg-[#0d1322]/85 backdrop-blur-xl border-r border-slate-800/70 shadow-2xl py-6">
          {/* Brand Header */}
          <div className="px-6 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 p-0.5">
              <div className="w-full h-full rounded-[14px] bg-[#0d1322] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight font-sans text-white flex items-center gap-1">
                EduFlow <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Academic Companion</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User & Settings Footer */}
          <div className="px-4 mt-auto pt-4 border-t border-slate-800/80 space-y-3">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                {user?.fullName ? user.fullName[0] : 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition truncate">{user?.fullName}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{profile?.branch ? profile.branch.split(' ')[0] : 'Sem 6'}</p>
              </div>
            </Link>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition border border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Wrapper */}
      <div className={`flex-1 flex flex-col min-h-screen ${isAuthenticated ? 'lg:ml-64' : ''}`}>
        {/* Glass Top Header */}
        <header className="sticky top-0 z-30 bg-[#080c14]/85 backdrop-blur-xl border-b border-slate-800/80 px-6 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Left: Mobile Toggle & Brand */}
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}

              {!isAuthenticated && (
                <Link to="/" className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-base text-white font-sans tracking-tight">
                    EduFlow <span className="text-indigo-400">AI</span>
                  </span>
                </Link>
              )}
            </div>

            {/* Middle: Search Field (Authenticated) */}
            {isAuthenticated && (
              <div className="hidden md:flex flex-1 max-w-md">
                <div className="relative w-full group">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition" />
                  <input
                    type="text"
                    placeholder="Search study notes, quizzes, AI answers..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
            )}

            {/* Right: Auth Action & Notifications */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <NotificationDropdown />

                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-semibold">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{user?.fullName}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-slate-200 hover:bg-slate-800 transition border border-slate-800"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-600/30"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Drawer Menu */}
          {isAuthenticated && mobileMenuOpen && (
            <div className="lg:hidden mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={logout}
                className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-bold mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

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

        {/* Footer */}
        <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 bg-[#080c14]">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 EduFlow AI — Student Learning & Academic Companion.</p>
            <p className="flex items-center gap-2 font-mono">
              <Lock className="w-3.5 h-3.5 text-indigo-400" /> Security & Role Access Active
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
