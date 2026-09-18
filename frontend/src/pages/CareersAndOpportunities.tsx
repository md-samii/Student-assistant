import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Github, 
  Globe, 
  Sparkles, 
  Search, 
  X, 
  Landmark, 
  Code2,
  Send,
  TrendingUp,
  Award,
  Clock,
  ArrowUpRight,
  Bookmark
} from 'lucide-react';

export default function CareersAndOpportunities() {
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'INTERNSHIP' | 'JOB' | 'GOVT_EXAM' | 'PROJECTS'>('INTERNSHIP');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Apply Modal State
  const [applyingOpp, setApplyingOpp] = useState<any | null>(null);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [appSuccessMsg, setAppSuccessMsg] = useState('');

  // Add Project Modal State
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projGithub, setProjGithub] = useState('');
  const [projDemo, setProjDemo] = useState('');
  const [isSavingProj, setIsSavingProj] = useState(false);

  useEffect(() => {
    if (activeTab === 'PROJECTS') {
      fetchProjects();
    } else {
      fetchOpportunities();
    }
  }, [activeTab, searchQuery]);

  const fetchOpportunities = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (activeTab) params.category = activeTab;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/careers/opportunities', { params });
      setOpportunities(res.data.data.opportunities || []);
    } catch (err) {
      console.warn('Failed to fetch career opportunities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/careers/projects');
      setProjects(res.data.data.projects || []);
    } catch (err) {
      console.warn('Failed to fetch student projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyClick = async (opp: any) => {
    setApplyingOpp(opp);
    setAppSuccessMsg('');
  };

  const handleConfirmApply = async () => {
    if (!applyingOpp) return;
    try {
      setIsSubmittingApp(true);
      const res = await api.post(`/careers/apply/${applyingOpp.id}`);
      setAppSuccessMsg(res.data.message || 'Application submitted successfully!');
      
      setOpportunities((prev) =>
        prev.map((o) => (o.id === applyingOpp.id ? { ...o, hasApplied: true } : o))
      );
    } catch (err) {
      console.error('Apply error:', err);
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const handleAddProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projGithub.trim()) return;

    try {
      setIsSavingProj(true);
      await api.post('/careers/projects', {
        title: projTitle,
        description: projDesc,
        techStack: projTech.split(',').map((s) => s.trim()),
        githubUrl: projGithub,
        liveDemoUrl: projDemo,
      });

      setShowAddProjectModal(false);
      setProjTitle('');
      setProjDesc('');
      setProjTech('');
      setProjGithub('');
      setProjDemo('');
      await fetchProjects();
    } catch (err) {
      console.error('Add project error:', err);
    } finally {
      setIsSavingProj(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in pb-12 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#006d3d]" /> Career &amp; Placement Engine • {profile?.branch || 'Engineering'}
          </div>
          <h1 className="text-3xl font-extrabold text-[#181c1b] tracking-tight">
            Careers &amp; Opportunities
          </h1>
          <p className="text-[#404942] text-sm mt-1 max-w-3xl">
            AI-matched internships, full-time roles, competitive exam roadmaps, and verified student project showcases.
          </p>
        </div>

        {activeTab === 'PROJECTS' && (
          <button
            onClick={() => setShowAddProjectModal(true)}
            className="px-5 py-2.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white font-bold text-xs transition shadow-sm flex items-center gap-2 shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#97f3b5]" />
            <span>+ Add GitHub Project</span>
          </button>
        )}
      </div>

      {/* 4 Metric Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Primary Dark Card */}
        <div className="p-6 rounded-3xl bg-[#134e2f] text-white flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/80">Active Applications</span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-white">12</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#97f3b5] text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+3 updates this week</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#006d3d]/30 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Card 2: AI Match Rate */}
        <div className="p-6 rounded-3xl bg-white border border-[#e2e8e2] flex flex-col justify-between shadow-sm hover:border-[#006d3d] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#404942]">AI Match Rate</span>
            <div className="w-8 h-8 rounded-full bg-[#ecefec] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-[#181c1b]" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-[#181c1b]">94%</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#006d3d] text-xs font-medium">
            <Award className="w-3.5 h-3.5" />
            <span>Based on CS coursework</span>
          </div>
        </div>

        {/* Card 3: Interview Invites */}
        <div className="p-6 rounded-3xl bg-white border border-[#e2e8e2] flex flex-col justify-between shadow-sm hover:border-[#006d3d] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#404942]">Interview Invites</span>
            <div className="w-8 h-8 rounded-full bg-[#ecefec] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-[#181c1b]" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-[#181c1b]">3</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#006d3d] text-xs font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>Upcoming: Google &amp; Stripe</span>
          </div>
        </div>

        {/* Card 4: Expiring Deadlines */}
        <div className="p-6 rounded-3xl bg-white border border-[#e2e8e2] flex flex-col justify-between shadow-sm hover:border-[#ba1a1a] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#404942]">Expiring Deadlines</span>
            <div className="w-8 h-8 rounded-full bg-[#ecefec] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-[#181c1b]" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-[#ba1a1a]">5</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#ba1a1a] text-xs font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Next 48 hours</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="bg-white border border-[#e2e8e2] p-4 rounded-3xl space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { key: 'INTERNSHIP', label: 'Internships (Summer 2025)', icon: Briefcase },
              { key: 'JOB', label: 'Full-Time Roles', icon: Building2 },
              { key: 'GOVT_EXAM', label: 'Government & GATE', icon: Landmark },
              { key: 'PROJECTS', label: 'Portfolio Showcase', icon: Code2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#134e2f] text-white shadow-sm'
                      : 'bg-[#f7faf7] text-[#404942] hover:text-[#181c1b] hover:bg-[#ecefec] border border-[#e2e8e2]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#97f3b5]' : 'text-[#717971]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab !== 'PROJECTS' && (
            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company, skills, roles..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] placeholder-[#717971] outline-none focus:border-[#134e2f] focus:bg-white transition"
              />
            </div>
          )}
        </div>
      </div>

      {/* Opportunities or Projects Rendering */}
      {activeTab !== 'PROJECTS' ? (
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-52 rounded-3xl bg-white border border-[#e2e8e2] animate-pulse"></div>
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="bg-white border border-[#e2e8e2] rounded-3xl p-12 text-center space-y-3 shadow-sm">
            <Briefcase className="w-10 h-10 text-[#717971] mx-auto opacity-50" />
            <h3 className="font-bold text-[#181c1b] text-base">No Opportunities Found</h3>
            <p className="text-xs text-[#404942]">Try adjusting your search query or tab selection above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-white border border-[#e2e8e2] rounded-3xl p-6 shadow-sm hover:border-[#006d3d] hover:shadow-md transition-all flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#ecefec] text-[#134e2f] border border-[#c0c9bf]/40 flex items-center justify-center font-bold text-lg shrink-0">
                        {opp.company ? opp.company[0] : 'O'}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-base text-[#181c1b] group-hover:text-[#134e2f] transition">
                            {opp.title}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-[11px] font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#006d3d]" /> 95% Match
                          </span>
                        </div>
                        <p className="text-xs text-[#404942] font-medium mt-0.5">{opp.company}</p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-[#f7faf7] border border-[#e2e8e2] text-[#134e2f] font-bold text-xs whitespace-nowrap">
                      {opp.stipendOrSalary}
                    </span>
                  </div>

                  <p className="text-xs text-[#404942] line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#717971]">
                    <span className="flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-[#006d3d]" /> {opp.location}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-[#ba1a1a]">
                      <Calendar className="w-3.5 h-3.5" /> Deadline: {opp.deadline}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {opp.requiredSkills.map((sk: string) => (
                      <span key={sk} className="px-2.5 py-0.5 rounded-full bg-[#ecefec] text-[#404942] text-[11px] font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#ecefec] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#717971]">Matched to {profile?.branch?.split(' ')[0] || 'Engineering'}</span>

                  {opp.hasApplied ? (
                    <span className="px-3.5 py-1.5 rounded-full bg-[#e8f5e9] border border-[#a0d2af] text-[#1b5e20] font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#006d3d]" /> Application Submitted
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApplyClick(opp)}
                      className="px-5 py-2.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5 text-[#97f3b5]" />
                      <span>Quick Apply with Locker</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Portfolio Showcase Grid */
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 rounded-3xl bg-white border border-[#e2e8e2] animate-pulse"></div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white border border-[#e2e8e2] rounded-3xl p-12 text-center space-y-3 shadow-sm">
            <Code2 className="w-10 h-10 text-[#717971] mx-auto opacity-50" />
            <h3 className="font-bold text-[#181c1b] text-base">No Portfolio Projects Showcase</h3>
            <p className="text-xs text-[#404942]">Click "+ Add GitHub Project" above to highlight your technical builds.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white border border-[#e2e8e2] rounded-3xl p-6 shadow-sm hover:border-[#006d3d] hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-semibold">
                      Live Portfolio Repo
                    </span>
                    <span className="text-[11px] text-[#717971]">
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-[#181c1b] group-hover:text-[#134e2f] transition">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-[#404942] leading-relaxed line-clamp-2">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    {proj.techStack.map((tech: string) => (
                      <span key={tech} className="px-2.5 py-0.5 rounded-full bg-[#ecefec] text-[#404942] text-[11px] font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#ecefec] flex items-center justify-between text-xs">
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full bg-[#f7faf7] hover:bg-[#ecefec] text-[#181c1b] font-semibold transition border border-[#c0c9bf] flex items-center gap-1.5"
                  >
                    <Github className="w-4 h-4 text-[#134e2f]" />
                    <span>View GitHub Repo</span>
                  </a>

                  {proj.liveDemoUrl && (
                    <a
                      href={proj.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#006d3d] hover:underline font-bold flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Apply Modal */}
      {applyingOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-[#e2e8e2] relative">
            <div className="flex items-center justify-between border-b border-[#ecefec] pb-4">
              <h3 className="font-bold text-lg text-[#181c1b] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#134e2f]" /> {applyingOpp.title}
              </h3>
              <button
                onClick={() => setApplyingOpp(null)}
                className="p-1.5 rounded-full bg-[#ecefec] text-[#717971] hover:text-[#181c1b]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {appSuccessMsg ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#e8f5e9] text-[#006d3d] flex items-center justify-center mx-auto border border-[#a0d2af]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-[#181c1b]">Application Transmitted!</h4>
                <p className="text-xs text-[#404942] max-w-sm mx-auto leading-relaxed">
                  Your academic profile and verified credentials have been transmitted to {applyingOpp.company}.
                </p>
                <button
                  onClick={() => setApplyingOpp(null)}
                  className="px-6 py-2.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white font-bold text-xs transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] space-y-1.5 text-xs">
                  <p className="text-[#404942]">Organization: <strong className="text-[#181c1b]">{applyingOpp.company}</strong></p>
                  <p className="text-[#404942]">Package: <strong className="text-[#006d3d]">{applyingOpp.stipendOrSalary}</strong></p>
                  <p className="text-[#404942]">Location: <strong className="text-[#181c1b]">{applyingOpp.location}</strong></p>
                </div>

                <div className="p-4 rounded-2xl bg-[#e8f5e9]/70 border border-[#a0d2af]/60 text-xs text-[#1b5e20] space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#006d3d]" /> Automatic Academic Transmission
                  </p>
                  <p className="text-[11px] opacity-90">
                    Your semester status, branch specialization, and digital resume will be packaged and submitted securely.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setApplyingOpp(null)}
                    className="px-4 py-2 rounded-full bg-[#f7faf7] text-[#404942] font-semibold text-xs border border-[#c0c9bf] hover:bg-[#ecefec]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmApply}
                    disabled={isSubmittingApp}
                    className="px-6 py-2.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white font-bold text-xs transition shadow-sm flex items-center gap-2 disabled:opacity-50 active:scale-95"
                  >
                    <Send className="w-4 h-4 text-[#97f3b5]" />
                    <span>{isSubmittingApp ? 'Submitting...' : 'Confirm 1-Click Application'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#e2e8e2] relative">
            <div className="flex items-center justify-between border-b border-[#ecefec] pb-4">
              <h3 className="font-bold text-lg text-[#181c1b] flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#134e2f]" /> Add GitHub Project to Showcase
              </h3>
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="p-1.5 rounded-full bg-[#ecefec] text-[#717971] hover:text-[#181c1b]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#181c1b] mb-1">Project Title</label>
                <input
                  type="text"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus Engine"
                  className="w-full px-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#181c1b] mb-1">Description</label>
                <textarea
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Briefly describe your project architecture and features..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#181c1b] mb-1">Tech Stack (Comma Separated)</label>
                <input
                  type="text"
                  value={projTech}
                  onChange={(e) => setProjTech(e.target.value)}
                  placeholder="React, Go, Docker, gRPC"
                  className="w-full px-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#181c1b] mb-1">GitHub Repo URL</label>
                <input
                  type="url"
                  value={projGithub}
                  onChange={(e) => setProjGithub(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full px-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#181c1b] mb-1">Live Demo URL (Optional)</label>
                <input
                  type="url"
                  value={projDemo}
                  onChange={(e) => setProjDemo(e.target.value)}
                  placeholder="https://myproject.app"
                  className="w-full px-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingProj}
                className="w-full py-3 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isSavingProj ? 'Saving Project...' : 'Save to Portfolio'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
