import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Bot, 
  Award, 
  Briefcase, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  Lock,
  Layers,
  Search
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7faf7] text-[#181c1b] font-sans selection:bg-[#97f3b5] selection:text-[#00361c]">
      {/* Top Public Header */}
      <header className="sticky top-0 z-50 bg-[#f7faf7]/90 backdrop-blur-md border-b border-[#e2e8e2] px-6 lg:px-12 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#134e2f] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg text-[#00361c] tracking-tight leading-none">
                Student Assistant
              </span>
              <span className="text-[11px] text-[#404942] font-medium mt-0.5">
                Academic & Career Suite
              </span>
            </div>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#404942]">
            <a href="#features" className="hover:text-[#00361c] transition">Features</a>
            <a href="#academic-hub" className="hover:text-[#00361c] transition">Academic Hub</a>
            <a href="#curriculum" className="hover:text-[#00361c] transition">Curriculum Support</a>
            <a href="#careers" className="hover:text-[#00361c] transition">Careers</a>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold px-4 py-2 text-[#404942] hover:text-[#00361c] transition"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-[#134e2f] hover:bg-[#0e3b24] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-sm hover:scale-[0.98] transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-6 lg:px-12 text-center max-w-7xl mx-auto">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 bg-white border border-[#c0c9bf] px-4 py-1.5 rounded-full shadow-sm mb-6 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#006d3d] animate-pulse"></span>
          <span className="text-xs font-semibold text-[#00361c]">✨ Powered by Next-Gen Academic AI</span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-[#404942] font-medium">VTU & Autonomous Engineering</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#181c1b] max-w-4xl mx-auto tracking-tight leading-[1.15] mb-6">
          Master Your University Coursework.<br />
          <span className="text-[#134e2f]">Accelerate Your Career.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#404942] max-w-2xl mx-auto leading-relaxed mb-8">
          An all-in-one academic intelligence sanctuary. Ask complex concept questions, access peer-reviewed notes, practice smart quizzes, and uncover tailored internships—all in one place.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-[#134e2f] hover:bg-[#0e3b24] text-white text-sm font-semibold px-7 py-3.5 rounded-full shadow-md hover:scale-[0.98] transition-all"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-[#c0c9bf] text-[#181c1b] text-sm font-semibold px-6 py-3.5 rounded-full shadow-sm hover:scale-[0.98] transition-all"
          >
            <span>Sign In to Dashboard</span>
          </Link>
        </div>

        {/* Floating Academic Preview Showcase */}
        <div className="w-full max-w-5xl mx-auto rounded-3xl bg-white border border-[#e2e8e2] p-5 sm:p-7 shadow-[0_16px_48px_-12px_rgba(19,78,47,0.08)] text-left">
          {/* Top Bar inside Mock Showcase */}
          <div className="flex flex-wrap items-center justify-between pb-5 border-b border-[#e2e8e2] gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#97f3b5] text-[#047240] flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#181c1b]">Academic Intelligence Center</div>
                <div className="text-xs text-[#404942]">Active Term Progress • VTU 2022 Scheme</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-[#f1f4f1] px-3.5 py-1.5 rounded-full border border-[#e2e8e2]">
                <Search className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-400">Search coursework...</span>
                <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-400 font-mono">⌘F</span>
              </div>
              <span className="text-xs bg-[#97f3b5] text-[#006d3d] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006d3d]"></span> Live Sync
              </span>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-5">
            {/* Primary Dark Hero Card */}
            <div className="md:col-span-5 rounded-2xl bg-[#134e2f] text-white p-5 flex flex-col justify-between shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-emerald-200">Enrolled Modules</span>
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <GraduationCap className="w-4 h-4" />
                </span>
              </div>
              <div className="my-4">
                <div className="text-3xl font-extrabold tracking-tight">6 Subjects</div>
                <p className="text-xs text-emerald-100/80 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                  <span>30 Course Modules Loaded</span>
                </p>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-emerald-200 font-semibold mb-1.5">
                  <span>Semester Completion</span>
                  <span>78%</span>
                </div>
                <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#97f3b5] h-full w-[78%] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="stitch-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#404942] font-semibold mb-2">
                    <span>CGPA Milestone</span>
                    <Award className="w-4 h-4 text-[#006d3d]" />
                  </div>
                  <div className="text-2xl font-bold text-[#181c1b]">9.4 / 10</div>
                  <span className="inline-block mt-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20]">
                    Top 5% Cohort
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
                  Target for Campus Placements
                </div>
              </div>

              <div className="stitch-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#404942] font-semibold mb-2">
                    <span>AI Assistant Queries</span>
                    <Bot className="w-4 h-4 text-[#006d3d]" />
                  </div>
                  <div className="text-2xl font-bold text-[#181c1b]">124 Solved</div>
                  <span className="inline-block mt-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006d3d]">
                    Immediate Explanations
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
                  Formulas, Codes & Schematics
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 px-6 lg:px-12 bg-white border-y border-[#e2e8e2]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#006d3d] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#181c1b] tracking-tight mt-3">
              Engineered for High Academic Agency
            </h2>
            <p className="text-sm text-[#404942] mt-2">
              Everything an engineering and university student needs to stay organized and excel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="stitch-card p-6 flex flex-col justify-between hover:translate-y-[-2px]">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#f0f9f4] text-[#134e2f] flex items-center justify-center mb-4">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#181c1b] mb-1.5">AI Academic Assistant</h3>
                <p className="text-xs text-[#404942] leading-relaxed">
                  Context-aware tutoring for engineering math, algorithms, mechanics, and electronics with step-by-step proofs.
                </p>
              </div>
              <Link to="/register" className="text-xs font-bold text-[#134e2f] hover:underline mt-4 flex items-center gap-1">
                <span>Try Assistant</span> <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="stitch-card p-6 flex flex-col justify-between hover:translate-y-[-2px]">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#f0f9f4] text-[#134e2f] flex items-center justify-center mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#181c1b] mb-1.5">Study Resources</h3>
                <p className="text-xs text-[#404942] leading-relaxed">
                  Peer-reviewed lecture notes, previous question papers, and syllabus-aligned module breakdowns.
                </p>
              </div>
              <Link to="/register" className="text-xs font-bold text-[#134e2f] hover:underline mt-4 flex items-center gap-1">
                <span>Browse Notes</span> <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="stitch-card p-6 flex flex-col justify-between hover:translate-y-[-2px]">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#f0f9f4] text-[#134e2f] flex items-center justify-center mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#181c1b] mb-1.5">Adaptive Quizzes</h3>
                <p className="text-xs text-[#404942] leading-relaxed">
                  Interactive quizzes that adjust difficulty based on performance, tracking weak modules and concept mastery.
                </p>
              </div>
              <Link to="/register" className="text-xs font-bold text-[#134e2f] hover:underline mt-4 flex items-center gap-1">
                <span>Start Practice</span> <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="stitch-card p-6 flex flex-col justify-between hover:translate-y-[-2px]">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#f0f9f4] text-[#134e2f] flex items-center justify-center mb-4">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#181c1b] mb-1.5">Career Opportunities</h3>
                <p className="text-xs text-[#404942] leading-relaxed">
                  Curated internships, hackathons, open-source projects, and placement preparation roadmaps.
                </p>
              </div>
              <Link to="/register" className="text-xs font-bold text-[#134e2f] hover:underline mt-4 flex items-center gap-1">
                <span>Explore Careers</span> <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto rounded-3xl bg-[#134e2f] text-white p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Upgrade Your Academic Experience?
            </h2>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              Join thousands of engineering students managing their university coursework, notes, and career trajectory on Student Assistant.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-[#134e2f] hover:bg-gray-100 text-xs font-bold px-7 py-3.5 rounded-full shadow-md transition"
              >
                <span>Create Student Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-transparent text-white border border-white/30 hover:bg-white/10 text-xs font-bold px-6 py-3.5 rounded-full transition"
              >
                <span>Existing User Login</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 border-t border-[#e2e8e2] text-xs text-[#404942] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#134e2f] text-white flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-[#181c1b]">Student Assistant</span>
            <span>• Academic & Career Intelligence Engine</span>
          </div>
          <p className="flex items-center gap-2 font-mono text-gray-500">
            <Lock className="w-3.5 h-3.5 text-[#006d3d]" /> Protected Student Cloud System
          </p>
        </div>
      </footer>
    </div>
  );
}
