import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AnimatedAcademicBackground from '../components/AnimatedAcademicBackground';
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
  Search,
  FileText,
  Video,
  BrainCircuit,
  ChevronRight,
  Github,
  Zap,
  Target,
  BarChart3,
  Play,
  Star,
  Compass,
  Check,
  UploadCloud,
  FileCheck2,
  FolderLock
} from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai' | 'quiz' | 'resume' | 'careers'>('dashboard');

  return (
    <div className="min-h-screen text-[#181c1b] font-sans selection:bg-[#97f3b5] selection:text-[#00361c] relative">
      <AnimatedAcademicBackground />
      {/* Top Public Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent px-6 lg:px-12 py-5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img
              src="/logo.png"
              alt="Student Assistant"
              className="w-[190px] sm:w-[210px] h-auto object-contain dark:hidden transition-transform duration-200 group-hover:scale-[1.02]"
            />
            <img
              src="/logo-dark.png"
              alt="Student Assistant"
              className="w-[190px] sm:w-[210px] h-auto object-contain hidden dark:block transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 text-center max-w-7xl mx-auto overflow-hidden z-10">
        {/* Full-Viewport Centered Hero Container */}
        <div className="relative min-h-screen flex flex-col justify-center items-center pt-16 pb-12">
          {/* Floating Animated Academic Badges */}
          <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/85 backdrop-blur-md border border-[#c0c9bf]/60 shadow-sm text-xs font-bold text-[#00361c] absolute top-36 left-4 lg:left-8 academic-doodle-float-1 pointer-events-none select-none">
            <GraduationCap className="w-4 h-4 text-[#047240]" />
            <span>Engineering Notes</span>
          </div>
          <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/85 backdrop-blur-md border border-[#c0c9bf]/60 shadow-sm text-xs font-bold text-[#00361c] absolute top-24 right-4 lg:right-8 academic-doodle-float-2 pointer-events-none select-none">
            <Sparkles className="w-4 h-4 text-[#047240]" />
            <span>AI Study Help</span>
          </div>
          <div className="hidden xl:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/85 backdrop-blur-md border border-[#c0c9bf]/60 shadow-sm text-xs font-bold text-[#00361c] absolute bottom-16 left-2 xl:left-8 academic-doodle-float-3 pointer-events-none select-none">
            <BrainCircuit className="w-4 h-4 text-[#047240]" />
            <span>Practice Quizzes</span>
          </div>
          <div className="hidden xl:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/85 backdrop-blur-md border border-[#c0c9bf]/60 shadow-sm text-xs font-bold text-[#00361c] absolute bottom-16 right-2 xl:right-8 academic-doodle-float-1 pointer-events-none select-none">
            <FileText className="w-4 h-4 text-[#047240]" />
            <span>Resume Analyzer</span>
          </div>

          {/* Subtle decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-[#97f3b5]/30 to-[#134e2f]/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Centered Hero Content with Optical Adjustment */}
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center -translate-y-4 sm:-translate-y-6">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#181c1b] tracking-tight leading-[1.12] mb-5 text-center">
              Study Smarter. Prepare Better.<br className="hidden sm:inline" />{' '}
              <span className="bg-gradient-to-r from-[#134e2f] via-[#047240] to-[#2e8b57] bg-clip-text text-transparent">
                Get Career-Ready.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#404942] max-w-2xl mx-auto leading-relaxed mb-7 text-center">
              Find engineering notes, get help from AI, practice quizzes, watch educational videos, improve your resume, and explore jobs and internships — all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-7">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-[#134e2f] hover:bg-[#0e3b24] text-white text-sm font-bold px-7 py-3.5 rounded-full shadow-md hover:scale-[0.98] transition-all"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-[#c0c9bf] text-[#181c1b] text-sm font-semibold px-6 py-3.5 rounded-full shadow-sm hover:scale-[0.98] transition-all"
              >
                <span>Sign In</span>
              </Link>
            </div>

            {/* Quick Highlights Bar */}
            <div className="w-full flex flex-wrap items-center justify-center gap-y-3 gap-x-6 sm:gap-x-8 lg:gap-x-10 text-xs font-semibold text-[#404942]">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4 text-[#047240] shrink-0" />
                <span>Subject &amp; Module Notes</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4 text-[#047240] shrink-0" />
                <span>Resume Analyzer</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4 text-[#047240] shrink-0" />
                <span>AI Study Assistant</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <CheckCircle2 className="w-4 h-4 text-[#047240] shrink-0" />
                <span>Educational Videos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Platform Showcase */}
        <div
          id="interactive-preview"
          className="w-full max-w-5xl mx-auto mt-6 mb-20 lg:mt-8 lg:mb-24 rounded-3xl bg-white border border-[#e2e8e2] p-4 sm:p-6 shadow-[0_20px_60px_-15px_rgba(19,78,47,0.1)] text-left"
        >
          {/* Top Bar with Feature Tabs & Neatly Aligned Live Interactive Engine Badge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#e2e8e2] gap-3.5">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'dashboard'
                  ? 'bg-[#134e2f] text-white shadow-sm'
                  : 'bg-[#f0f4f0] text-[#404942] hover:text-[#00361c]'
                  }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'ai'
                  ? 'bg-[#134e2f] text-white shadow-sm'
                  : 'bg-[#f0f4f0] text-[#404942] hover:text-[#00361c]'
                  }`}
              >
                AI Concept Tutor
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'quiz'
                  ? 'bg-[#134e2f] text-white shadow-sm'
                  : 'bg-[#f0f4f0] text-[#404942] hover:text-[#00361c]'
                  }`}
              >
                Adaptive Quiz
              </button>
              <button
                onClick={() => setActiveTab('resume')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'resume'
                  ? 'bg-[#134e2f] text-white shadow-sm'
                  : 'bg-[#f0f4f0] text-[#404942] hover:text-[#00361c]'
                  }`}
              >
                Resume ATS Analyzer
              </button>
              <button
                onClick={() => setActiveTab('careers')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'careers'
                  ? 'bg-[#134e2f] text-white shadow-sm'
                  : 'bg-[#f0f4f0] text-[#404942] hover:text-[#00361c]'
                  }`}
              >
                Career Hub
              </button>
            </div>

            {/* Live Interactive Engine Badge Positioned Neatly Inside Preview Header */}
            <div className="shrink-0 flex items-center self-start md:self-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#006d3d] bg-[#e8f5e9] border border-emerald-200/80 px-3 py-1 rounded-full shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006d3d] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006d3d]"></span>
                </span>
                <span>Live Interactive Engine</span>
              </span>
            </div>
          </div>

          {/* Dynamic Tab Body */}
          <div className="mt-5 min-h-[300px]">
            {activeTab === 'dashboard' && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Hero Card */}
                  <div className="md:col-span-5 rounded-2xl bg-[#134e2f] text-white p-5 flex flex-col justify-between shadow-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-emerald-200">Enrolled Coursework</span>
                      <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white">
                        <GraduationCap className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="my-3">
                      <div className="text-3xl font-extrabold tracking-tight">11 Subjects</div>
                      <p className="text-xs text-emerald-100/80 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Semester 6 Engineering • VTU Scheme</span>
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-emerald-200 font-semibold mb-1.5">
                        <span>Curriculum Progress</span>
                        <span>82%</span>
                      </div>
                      <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#97f3b5] h-full w-[82%] rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs text-[#404942] font-semibold mb-1">
                        <span>Curated Notes</span>
                        <BookOpen className="w-4 h-4 text-[#006d3d]" />
                      </div>
                      <div className="text-2xl font-bold text-[#181c1b]">5 Modules Available</div>
                      <span className="inline-block mt-2 text-[11px] font-bold text-[#006d3d]">
                        ✓ Peer-Reviewed &amp; Downloadable
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs text-[#404942] font-semibold mb-1">
                        <span>Verified Internships</span>
                        <Briefcase className="w-4 h-4 text-[#006d3d]" />
                      </div>
                      <div className="text-2xl font-bold text-[#181c1b]">19 Opportunities</div>
                      <span className="inline-block mt-2 text-[11px] font-bold text-[#006d3d]">
                        ✓ 0 Deadlines Missed
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs text-[#404942] font-semibold mb-1">
                        <span>Practice Quizzes</span>
                        <Award className="w-4 h-4 text-[#006d3d]" />
                      </div>
                      <div className="text-2xl font-bold text-[#181c1b]">Bloom&apos;s Level Tested</div>
                      <span className="inline-block mt-2 text-[11px] font-bold text-[#006d3d]">
                        ✓ Instant Score Diagnostics
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs text-[#404942] font-semibold mb-1">
                        <span>Cloud Document Vault</span>
                        <FolderLock className="w-4 h-4 text-[#006d3d]" />
                      </div>
                      <div className="text-2xl font-bold text-[#181c1b]">Gradecards &amp; Resumes</div>
                      <span className="inline-block mt-2 text-[11px] font-bold text-[#006d3d]">
                        ✓ Encrypted Cloud Storage
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="rounded-2xl border border-[#e2e8e2] p-5 bg-[#f7faf7] animate-fade-in space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#e2e8e2]">
                  <div className="w-9 h-9 rounded-full bg-[#134e2f] text-white flex items-center justify-center font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#181c1b]">AI Engineering Concept Tutor</div>
                    <div className="text-[11px] text-[#404942]">Context: VTU CSE Semester 6 • Compiler Design &amp; Automata</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white p-3.5 rounded-2xl border border-[#e2e8e2] text-xs text-[#181c1b] max-w-lg self-end ml-auto">
                    <span className="font-bold text-[#134e2f]">Student Prompt:</span> &ldquo;Explain the difference between LL(1) and LR(1) parsers with time complexity and lookahead handling.&rdquo;
                  </div>
                  <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 text-xs text-[#181c1b] space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#006d3d]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Syllabus-Aligned Solution (Module 2):</span>
                    </div>
                    <p className="leading-relaxed text-[#404942]">
                      <strong>LL(1)</strong> is a Top-Down parser parsing from Left to Right producing a Leftmost derivation with 1 lookahead token. It cannot handle Left Recursion without grammar elimination.
                    </p>
                    <p className="leading-relaxed text-[#404942]">
                      <strong>LR(1)</strong> is a Bottom-Up Shift-Reduce parser handling a strictly larger class of grammars. Both run in <code className="bg-white px-1.5 py-0.5 rounded text-emerald-800 font-mono">O(n)</code> linear time for input length <code className="bg-white px-1.5 py-0.5 rounded text-emerald-800 font-mono">n</code>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="rounded-2xl border border-[#e2e8e2] p-5 bg-[#f7faf7] animate-fade-in space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#e2e8e2]">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#047240]" />
                    <span className="text-xs font-bold text-[#181c1b]">Database Management Systems • Practice Quiz</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-[#e8f5e9] text-[#006d3d] px-2.5 py-0.5 rounded-full">
                    Question 4 of 10
                  </span>
                </div>
                <div className="text-xs font-bold text-[#181c1b]">
                  Which normal form eliminates partial functional dependency on the candidate key?
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-[#e2e8e2] text-[#404942]">A) First Normal Form (1NF)</div>
                  <div className="p-3 rounded-xl bg-[#e8f5e9] border border-[#006d3d] text-[#00361c] font-bold flex items-center justify-between">
                    <span>B) Second Normal Form (2NF)</span>
                    <Check className="w-3.5 h-3.5 text-[#006d3d]" />
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#e2e8e2] text-[#404942]">C) Third Normal Form (3NF)</div>
                  <div className="p-3 rounded-xl bg-white border border-[#e2e8e2] text-[#404942]">D) Boyce-Codd Normal Form (BCNF)</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#e2e8e2] text-[11px] text-[#404942]">
                  <span className="font-bold text-[#006d3d]">Explanation:</span> A relation is in 2NF if and only if it is in 1NF and no non-prime attribute is functionally dependent on any proper subset of any candidate key.
                </div>
              </div>
            )}

            {activeTab === 'resume' && (
              <div className="rounded-2xl border border-[#e2e8e2] p-5 bg-[#f7faf7] animate-fade-in space-y-4">
                <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#e2e8e2] gap-2">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#047240]" />
                    <span className="text-xs font-bold text-[#181c1b]">Resume ATS Analysis: SDE Intern Role</span>
                  </div>
                  <span className="text-xs font-bold bg-[#97f3b5] text-[#006d3d] px-3 py-0.5 rounded-full">
                    ATS Score: 88 / 100 (Strong Match)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white border border-[#e2e8e2] text-center">
                    <div className="text-lg font-bold text-[#006d3d]">92%</div>
                    <div className="text-[11px] text-[#404942] font-semibold mt-0.5">Keyword Match</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#e2e8e2] text-center">
                    <div className="text-lg font-bold text-[#006d3d]">100%</div>
                    <div className="text-[11px] text-[#404942] font-semibold mt-0.5">Format Compliance</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#e2e8e2] text-center">
                    <div className="text-lg font-bold text-amber-600">2 Gaps</div>
                    <div className="text-[11px] text-[#404942] font-semibold mt-0.5">Skills to Add</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#e2e8e2] text-xs space-y-1.5">
                  <div className="font-bold text-[#181c1b]">Targeted Recommendations:</div>
                  <div className="text-[#404942] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                    <span>Add <strong>Docker</strong> and <strong>CI/CD pipeline metrics</strong> to your project descriptions.</span>
                  </div>
                  <div className="text-[#404942] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#047240] shrink-0"></span>
                    <span>Strong representation of <strong>React</strong>, <strong>TypeScript</strong>, and <strong>RESTful APIs</strong> detected.</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'careers' && (
              <div className="rounded-2xl border border-[#e2e8e2] p-5 bg-[#f7faf7] animate-fade-in space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#e2e8e2]">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#047240]" />
                    <span className="text-xs font-bold text-[#181c1b]">Verified Engineering Opportunities (19 Active)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#006d3d] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Target: 2026 Batch
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-white border border-[#e2e8e2] flex items-center justify-between gap-3 hover:border-[#134e2f] transition">
                    <div>
                      <div className="text-xs font-bold text-[#181c1b]">Software Engineering Intern (Summer 2026)</div>
                      <div className="text-[11px] text-[#404942]">Cloud &amp; Distributed Systems • Bengaluru • ₹45,000 / month</div>
                    </div>
                    <span className="text-xs font-bold text-[#134e2f] px-3 py-1 rounded-full bg-[#e8f5e9]">
                      94% Match
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[#e2e8e2] flex items-center justify-between gap-3 hover:border-[#134e2f] transition">
                    <div>
                      <div className="text-xs font-bold text-[#181c1b]">AI &amp; Data Science Research Trainee</div>
                      <div className="text-[11px] text-[#404942]">NLP &amp; Machine Learning Lab • Remote / Hybrid • ₹35,000 / month</div>
                    </div>
                    <span className="text-xs font-bold text-[#134e2f] px-3 py-1 rounded-full bg-[#e8f5e9]">
                      89% Match
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Core Modules Bento Grid Section */}
      <section id="features" className="py-20 px-6 lg:px-12 bg-white/70 backdrop-blur-md border-y border-[#e2e8e2] relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#181c1b] tracking-tight mt-3">
              Everything You Need for Your Studies
            </h2>
            <p className="text-sm text-[#404942] mt-2.5">
              Access the tools you need to study, practice, and prepare for your career.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-[#f7faf7] border border-[#e2e8e2] flex flex-col justify-between hover:shadow-md hover:border-[#134e2f]/30 transition-all duration-200">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-[#134e2f] text-white flex items-center justify-center mb-5 shadow-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-[#181c1b] mb-2">AI Concept Tutoring</h3>
                <p className="text-xs text-[#404942] leading-relaxed">
                  Ask questions about your subjects and get explanations to help you understand difficult topics.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#e2e8e2] flex items-center justify-between text-xs font-bold text-[#134e2f]">
                <span>AI Study Help</span>
                <Sparkles className="w-4 h-4 text-[#047240]" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-[#f7faf7] border border-[#e2e8e2] flex flex-col justify-between hover:shadow-md hover:border-[#134e2f]/30 transition-all duration-200">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-[#134e2f] text-white flex items-center justify-center mb-5 shadow-sm">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-[#181c1b] mb-2">Study Resources</h3>
                <p className="text-xs text-[#404942] leading-relaxed">
                  Find subject notes and module-wise study materials for your semester.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#e2e8e2] flex items-center justify-between text-xs font-bold text-[#134e2f]">
                <span>Subject Notes</span>
                <CheckCircle2 className="w-4 h-4 text-[#047240]" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-[#f7faf7] border border-[#e2e8e2] flex flex-col justify-between hover:shadow-md hover:border-[#134e2f]/30 transition-all duration-200">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-[#134e2f] text-white flex items-center justify-center mb-5 shadow-sm">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-[#181c1b] mb-2">Practice Quizzes</h3>
                <p className="text-xs text-[#404942] leading-relaxed">
                  Test your knowledge with practice questions based on your subjects and modules.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#e2e8e2] flex items-center justify-between text-xs font-bold text-[#134e2f]">
                <span>Module Quizzes</span>
                <Target className="w-4 h-4 text-[#047240]" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-[#f7faf7] border border-[#e2e8e2] flex flex-col justify-between hover:shadow-md hover:border-[#134e2f]/30 transition-all duration-200">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-[#134e2f] text-white flex items-center justify-center mb-5 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-[#181c1b] mb-2">Resume Analyzer</h3>
                <p className="text-xs text-[#404942] leading-relaxed">
                  Analyze your resume, compare it with a job description, and identify areas to improve.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#e2e8e2] flex items-center justify-between text-xs font-bold text-[#134e2f]">
                <span>Resume Analysis</span>
                <BarChart3 className="w-4 h-4 text-[#047240]" />
              </div>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-3xl bg-[#f7faf7] border border-[#e2e8e2] flex flex-col justify-between hover:shadow-md hover:border-[#134e2f]/30 transition-all duration-200">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-[#134e2f] text-white flex items-center justify-center mb-5 shadow-sm">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-[#181c1b] mb-2">Video Lessons</h3>
                <p className="text-xs text-[#404942] leading-relaxed">
                  Explore educational videos that help you learn concepts from your subjects.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#e2e8e2] flex items-center justify-between text-xs font-bold text-[#134e2f]">
                <span>Video Learning</span>
                <Play className="w-4 h-4 text-[#047240]" />
              </div>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-3xl bg-[#f7faf7] border border-[#e2e8e2] flex flex-col justify-between hover:shadow-md hover:border-[#134e2f]/30 transition-all duration-200">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-[#134e2f] text-white flex items-center justify-center mb-5 shadow-sm">
                  <FolderLock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-[#181c1b] mb-2">Document Locker</h3>
                <p className="text-xs text-[#404942] leading-relaxed">
                  Keep your important academic documents organized in one place.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#e2e8e2] flex items-center justify-between text-xs font-bold text-[#134e2f]">
                <span>Secure Storage</span>
                <Lock className="w-4 h-4 text-[#047240]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum & Autonomous Support Matrix */}
      <section id="curriculum" className="py-20 px-6 lg:px-12 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#181c1b] tracking-tight mt-3">
              Built for Your Academic Journey
            </h2>
            <p className="text-sm text-[#404942] mt-2.5">
              From managing your semester to preparing for placements, Student Assistant helps you stay organized and move forward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#e2e8e2] shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-[#e8f5e9] text-[#006d3d] flex items-center justify-center font-bold mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#181c1b] mb-1.5">Plan Your Studies</h3>
              <p className="text-xs text-[#404942] mb-4">
                Organize your semester, keep track of subjects and modules, and stay on top of your study tasks.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-[#404942]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047240]" /> Semester and module organization
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047240]" /> Study resources in one place
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047240]" /> Study progress tracking
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#e2e8e2] shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-[#e8f5e9] text-[#006d3d] flex items-center justify-center font-bold mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#181c1b] mb-1.5">Prepare for Your Career</h3>
              <p className="text-xs text-[#404942] mb-4">
                Improve your resume, compare it with job descriptions, and explore job and internship opportunities.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-[#404942]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047240]" /> Resume improvement
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047240]" /> Job description comparison
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047240]" /> Job and internship search
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#e2e8e2] shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-[#e8f5e9] text-[#006d3d] flex items-center justify-center font-bold mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#181c1b] mb-1.5">Track Your Learning Progress</h3>
              <p className="text-xs text-[#404942] mb-4">
                Review your study activity, monitor quiz results, and identify subjects that need more attention.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-[#404942]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047240]" /> Quiz results
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047240]" /> Study activity
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#047240]" /> Learning progress
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Banner Section */}
      <section className="py-20 px-6 lg:px-12 bg-transparent relative z-10">
        <div className="max-w-5xl mx-auto rounded-[32px] bg-gradient-to-br from-[#134e2f] via-[#047240] to-[#01351e] text-white p-8 sm:p-14 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Ready to Make Student Life Easier?
            </h2>
            <p className="text-sm text-emerald-100/90 leading-relaxed max-w-xl mx-auto">
              Study your subjects, practice what you learn, and prepare for your career with Student Assistant.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-[#134e2f] hover:bg-gray-100 text-xs font-bold px-7 py-3.5 rounded-full shadow-md transition hover:scale-[0.98]"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-transparent text-white border border-white/30 hover:bg-white/10 text-xs font-bold px-6 py-3.5 rounded-full transition"
              >
                <span>Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Botanical Footer */}
      <footer className="py-10 border-t border-[#e2e8e2] text-xs text-[#404942] px-6 lg:px-12 bg-white/80 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link to="/">
              <img
                src="/logo.png"
                alt="Student Assistant"
                className="w-[160px] h-auto object-contain dark:hidden"
              />
              <img
                src="/logo-dark.png"
                alt="Student Assistant"
                className="w-[160px] h-auto object-contain hidden dark:block"
              />
            </Link>
            <span className="hidden sm:inline text-gray-300">•</span>
            <span className="text-[11px] text-gray-500">
              Your study and career companion.
            </span>
          </div>

          <a
            href="https://github.com/md-samii/Student-assistant"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-[#404942] hover:text-[#006d3d] hover:bg-[#e8f5e9]/60 transition-all flex items-center justify-center"
            title="GitHub"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </footer>
    </div>
  );
}
