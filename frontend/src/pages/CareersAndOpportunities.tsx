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
  Send
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
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="eduflow-card p-8 bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-indigo-950/70 border border-purple-500/30 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Career & Placement Portal • {profile?.branch || 'Engineering'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sans">
            Internships, Jobs & Projects Portfolio
          </h1>
          <p className="text-slate-300 text-xs font-mono mt-1">
            Branch-matched tech internships, graduate recruitment drives, government exams (GATE/ISRO), and GitHub showcase
          </p>
        </div>

        {activeTab === 'PROJECTS' && (
          <button
            onClick={() => setShowAddProjectModal(true)}
            className="btn-shimmer px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/30 flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add GitHub Project</span>
          </button>
        )}
      </div>

      {/* Tabs Bar & Search */}
      <div className="eduflow-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { key: 'INTERNSHIP', label: 'Internships', icon: Briefcase },
              { key: 'JOB', label: 'Full-Time Jobs', icon: Building2 },
              { key: 'GOVT_EXAM', label: 'Government Exams', icon: Landmark },
              { key: 'PROJECTS', label: 'Portfolio Showcase', icon: Code2 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-sans whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25 border border-purple-400/30'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab !== 'PROJECTS' && (
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company, skills..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 transition"
              />
            </div>
          )}
        </div>
      </div>

      {/* Opportunities or Projects Rendering */}
      {activeTab !== 'PROJECTS' ? (
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800"></div>
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="eduflow-card p-12 text-center space-y-3">
            <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="font-bold text-white text-base">No Opportunities Found</h3>
            <p className="text-xs text-slate-400 font-mono">Try adjusting your search query or tab selection above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="eduflow-card p-6 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center justify-center p-2 shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition font-sans">
                          {opp.title}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono font-medium mt-0.5">{opp.company}</p>
                      </div>
                    </div>

                    <span className="eduflow-pill bg-purple-500/10 text-purple-300 border-purple-500/30">
                      {opp.stipendOrSalary}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {opp.location}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" /> Deadline: {opp.deadline}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {opp.requiredSkills.map((sk: string) => (
                      <span key={sk} className="px-2.5 py-0.5 rounded-lg bg-slate-950 text-slate-300 text-[10px] font-mono font-semibold border border-slate-800">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">Matched to {profile?.branch?.split(' ')[0] || 'Engineering'}</span>

                  {opp.hasApplied ? (
                    <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Application Submitted
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApplyClick(opp)}
                      className="btn-shimmer px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-md shadow-purple-600/30 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Apply Now</span>
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
              <div key={i} className="h-44 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800"></div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="eduflow-card p-12 text-center space-y-3">
            <Code2 className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="font-bold text-white text-base">No Portfolio Projects Showcase</h3>
            <p className="text-xs text-slate-400 font-mono">Click "Add GitHub Project" above to highlight your technical projects.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="eduflow-card p-6 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="eduflow-pill">
                      GitHub Repo
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-white group-hover:text-purple-300 transition font-sans">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    {proj.techStack.map((tech: string) => (
                      <span key={tech} className="px-2.5 py-0.5 rounded-lg bg-slate-950 text-slate-300 text-[10px] font-mono font-semibold border border-slate-800">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition border border-slate-800 flex items-center gap-1.5"
                  >
                    <Github className="w-4 h-4 text-purple-400" />
                    <span>View GitHub Repo</span>
                  </a>

                  {proj.liveDemoUrl && (
                    <a
                      href={proj.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-400 hover:underline font-bold flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-lg eduflow-card p-6 sm:p-8 space-y-6 shadow-2xl relative bg-[#0d1322] border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg text-white font-sans flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" /> {applyingOpp.title}
              </h3>
              <button
                onClick={() => setApplyingOpp(null)}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {appSuccessMsg ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white font-sans">Application Transmitted!</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Your academic profile and verified resume have been transmitted to {applyingOpp.company}.
                </p>
                <button
                  onClick={() => setApplyingOpp(null)}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs font-mono">
                  <p className="text-slate-400">Organization: <strong className="text-white">{applyingOpp.company}</strong></p>
                  <p className="text-slate-400">Package: <strong className="text-purple-400">{applyingOpp.stipendOrSalary}</strong></p>
                  <p className="text-slate-400">Location: <strong className="text-white">{applyingOpp.location}</strong></p>
                </div>

                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" /> Automatic Profile Transmission
                  </p>
                  <p className="text-[11px] opacity-90 font-mono">
                    Your semester status, branch specialization, and digital resume will be submitted.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setApplyingOpp(null)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 font-bold text-xs border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmApply}
                    disabled={isSubmittingApp}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-md shadow-purple-600/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-lg eduflow-card p-6 sm:p-8 space-y-5 shadow-2xl relative bg-[#0d1322] border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg text-white font-sans flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-400" /> Add GitHub Project to Showcase
              </h3>
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Project Title</label>
                <input
                  type="text"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g. AI Student Assistant Platform"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Briefly describe your project..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Tech Stack (Comma Separated)</label>
                <input
                  type="text"
                  value={projTech}
                  onChange={(e) => setProjTech(e.target.value)}
                  placeholder="React, Node.js, TypeScript, Tailwind"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">GitHub Repo URL</label>
                <input
                  type="url"
                  value={projGithub}
                  onChange={(e) => setProjGithub(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Live Demo URL (Optional)</label>
                <input
                  type="url"
                  value={projDemo}
                  onChange={(e) => setProjDemo(e.target.value)}
                  placeholder="https://myproject.vercel.app"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingProj}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSavingProj ? 'Adding Project...' : 'Save to Portfolio'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
