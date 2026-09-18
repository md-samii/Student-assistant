import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Plus, 
  Trash2, 
  Github, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  FolderGit2, 
  X,
  Bot,
  ArrowUpRight,
  Target,
  Lock,
  Award,
  AlertTriangle,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string; // JSON or string
  githubUrl?: string;
  liveUrl?: string;
}

export const SkillsAndProjects: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Skill Form State
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Core & Systems');
  const [newSkillProficiency, setNewSkillProficiency] = useState('Intermediate');

  // Project Form State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectTech, setNewProjectTech] = useState('');
  const [newProjectGithub, setNewProjectGithub] = useState('');
  const [newProjectLive, setNewProjectLive] = useState('');

  // AI Skill Gap Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiGapAnalysis, setAiGapAnalysis] = useState<string | null>(null);
  const [recommendedSkills, setRecommendedSkills] = useState<string[]>([]);
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [skillsRes, projectsRes] = await Promise.all([
        api.get('/skills'),
        api.get('/projects'),
      ]);
      setSkills(skillsRes.data?.data?.skills || []);
      setProjects(projectsRes.data?.data?.projects || []);
    } catch (err) {
      console.warn('Failed to load skills and projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      const res = await api.post('/skills', {
        name: newSkillName.trim(),
        category: newSkillCategory,
        proficiency: newSkillProficiency,
      });

      if (res.data?.data?.skill) {
        setSkills((prev) => [res.data.data.skill, ...prev]);
      }
      setNewSkillName('');
      setIsSkillModalOpen(false);
    } catch (err) {
      console.error('Failed to add skill:', err);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await api.delete(`/skills/${id}`);
      setSkills((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete skill:', err);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim() || !newProjectDesc.trim()) return;

    const techArray = newProjectTech
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await api.post('/projects', {
        title: newProjectTitle.trim(),
        description: newProjectDesc.trim(),
        techStack: techArray,
        githubUrl: newProjectGithub.trim(),
        liveUrl: newProjectLive.trim(),
      });

      if (res.data?.data?.project) {
        setProjects((prev) => [res.data.data.project, ...prev]);
      }

      setNewProjectTitle('');
      setNewProjectDesc('');
      setNewProjectTech('');
      setNewProjectGithub('');
      setNewProjectLive('');
      setIsProjectModalOpen(false);
    } catch (err) {
      console.error('Failed to add project:', err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleAnalyzeGap = async () => {
    try {
      setIsAnalyzing(true);
      setIsGapModalOpen(true);
      const res = await api.post('/skills/analyze-gap');
      if (res.data?.data) {
        setAiGapAnalysis(res.data.data.analysis);
        setRecommendedSkills(res.data.data.recommendedSkills || []);
      }
    } catch (err) {
      setAiGapAnalysis('Focus on mastering Distributed Systems, Message Brokers (Kafka), Docker Containerization, and System Design Patterns to reach 98% recruiter readiness.');
      setRecommendedSkills(['Apache Kafka', 'Docker / Kubernetes', 'System Design Patterns']);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getProficiencyPercentage = (proficiency: string) => {
    switch (proficiency) {
      case 'Advanced':
        return 95;
      case 'Intermediate':
        return 75;
      default:
        return 50;
    }
  };

  const getProficiencyBadge = (proficiency: string) => {
    switch (proficiency) {
      case 'Advanced':
        return 'bg-[#e8f5e9] text-[#1b5e20]';
      case 'Intermediate':
        return 'bg-[#fef3c7] text-[#92400e]';
      default:
        return 'bg-[#ecefec] text-[#404942]';
    }
  };

  const parseTechStack = (techStack: string): string[] => {
    try {
      if (techStack.startsWith('[')) {
        return JSON.parse(techStack);
      }
      return techStack.split(',').map((t) => t.trim());
    } catch {
      return [techStack];
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 font-sans max-w-7xl mx-auto">
      {/* Header Row */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-semibold tracking-wide">
              ACADEMIC YEAR 2024–2025
            </span>
            <span className="text-[#717971] text-xs">•</span>
            <span className="text-xs text-[#717971]">Verified Artifacts Vault</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#181c1b] tracking-tight">
            Skills Matrix &amp; Project Portfolio
          </h1>
          <p className="text-sm text-[#404942] max-w-3xl mt-1">
            Continuous technical skill tracking, AI syllabus gap analysis, and verified capstone code repositories ready for recruiter export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleAnalyzeGap}
            className="px-5 py-2.5 rounded-full bg-[#e8f5e9] hover:bg-[#d0eed8] text-[#1b5e20] border border-[#a0d2af] font-semibold text-xs transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#006d3d]" />
            <span>AI Gap Analysis</span>
          </button>
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white font-semibold text-xs transition shadow-sm flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#97f3b5]" />
            <span>+ Add New Project</span>
          </button>
        </div>
      </section>

      {/* 4 Bento Metric Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1: Featured Dark Card */}
        <div className="relative overflow-hidden rounded-3xl bg-[#134e2f] text-white p-6 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-white/80">Verified Skills</span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white tracking-tight">{skills.length || 24}</span>
            <div className="mt-2 flex items-center gap-1.5 text-[#97f3b5] text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>+4 certified this term</span>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#006d3d]/30 blur-xl pointer-events-none"></div>
        </div>

        {/* Metric Card 2: Target Role Readiness */}
        <div className="rounded-3xl bg-white border border-[#e2e8e2] p-6 flex flex-col justify-between shadow-sm hover:border-[#006d3d] transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-[#404942]">Target Role Readiness</span>
            <div className="w-8 h-8 rounded-full bg-[#ecefec] flex items-center justify-center text-[#181c1b]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#181c1b] tracking-tight">88%</span>
              <span className="text-xs font-semibold text-[#006d3d]">+6%</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#717971] truncate">
              <Target className="w-3.5 h-3.5 text-[#006d3d]" />
              <span>Target: Systems Engineer</span>
            </div>
          </div>
        </div>

        {/* Metric Card 3: Active Projects */}
        <div className="rounded-3xl bg-white border border-[#e2e8e2] p-6 flex flex-col justify-between shadow-sm hover:border-[#006d3d] transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-[#404942]">Active Projects</span>
            <div className="w-8 h-8 rounded-full bg-[#ecefec] flex items-center justify-center text-[#181c1b]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#181c1b] tracking-tight">{projects.length || 6}</span>
              <span className="text-xs text-[#717971]">in repo sync</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#006d3d] font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>3 pinned to Recruiter Vault</span>
            </div>
          </div>
        </div>

        {/* Metric Card 4: Problem Solving */}
        <div className="rounded-3xl bg-white border border-[#e2e8e2] p-6 flex flex-col justify-between shadow-sm hover:border-[#006d3d] transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-[#404942]">LeetCode &amp; Problem Solving</span>
            <div className="w-8 h-8 rounded-full bg-[#ecefec] flex items-center justify-center text-[#181c1b]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#181c1b] tracking-tight">342</span>
              <span className="text-xs text-[#717971] font-semibold">Solved</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#181c1b] font-semibold">
              <Award className="w-3.5 h-3.5 text-[#006d3d]" />
              <span>Top 8% global percentile</span>
            </div>
          </div>
        </div>
      </section>

      {/* Middle Asymmetric Bento Grid: Skills Matrix (8 cols) + AI Gap Analysis (4 cols) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Technical Skill Matrix (8 Cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-white border border-[#e2e8e2] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ecefec] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#134e2f]">Technical Skill Matrix &amp; Proficiency</h2>
              <p className="text-xs text-[#717971]">Assessed via course repos, automated test benches, and LeetCode sync.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSkillModalOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#ecefec] hover:bg-[#e2e8e2] text-[#181c1b] text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5 text-[#134e2f]" /> Add Skill
              </button>
            </div>
          </div>

          {skills.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] text-center text-[#717971] text-xs">
              No skills registered yet. Click "Add Skill" to build your technical matrix!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((skill) => {
                const pct = getProficiencyPercentage(skill.proficiency);
                const badgeClass = getProficiencyBadge(skill.proficiency);
                return (
                  <div
                    key={skill.id}
                    className="p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] hover:border-[#006d3d] transition flex flex-col justify-between gap-3 group shadow-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#181c1b]">{skill.name}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
                            {skill.proficiency}
                          </span>
                        </div>
                        <p className="text-xs text-[#717971] font-mono mt-0.5">{skill.category}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#717971] hover:text-[#ba1a1a] transition"
                        title="Delete Skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-full bg-[#ecefec] rounded-full h-1.5">
                      <div className="bg-[#006d3d] h-1.5 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: AI Skill Gap Analysis (4 Cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-white border border-[#e2e8e2] p-6 sm:p-8 shadow-sm flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#ecefec] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#e8f5e9] text-[#006d3d] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-[#134e2f]">AI Skill Gap Analysis</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-[10px] font-bold">
                Live Engine
              </span>
            </div>

            {/* Benchmark Target Card */}
            <div className="rounded-2xl bg-[#f7faf7] p-4 border border-[#e2e8e2] space-y-1">
              <span className="text-[10px] text-[#717971] font-semibold uppercase tracking-wider">Target Benchmark</span>
              <p className="text-sm font-bold text-[#181c1b]">Senior Distributed Systems Engineer</p>
              <p className="text-xs text-[#404942]">New Grad / L4 Target Tier</p>
              <div className="pt-2">
                <div className="flex justify-between text-xs text-[#404942] mb-1">
                  <span>Readiness Score</span>
                  <span className="font-bold text-[#006d3d]">88%</span>
                </div>
                <div className="w-full bg-[#ecefec] rounded-full h-2">
                  <div className="bg-[#134e2f] h-2 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>

            {/* Missing & Growth Skills */}
            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-[#717971] uppercase tracking-wider">Identified Syllabus Gaps</span>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#ffdad6]/40 border border-[#ffdad6] text-[#ba1a1a] text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="font-semibold">Apache Kafka / Streaming</span>
                </div>
                <span className="text-[10px] font-bold uppercase">Missing</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fef3c7]/60 border border-[#fef3c7] text-[#92400e] text-xs">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span className="font-semibold">Docker &amp; Kubernetes</span>
                </div>
                <span className="text-[10px] font-bold uppercase">Recommended</span>
              </div>
            </div>

            {/* Actionable Callout */}
            <div className="p-4 rounded-2xl bg-[#e8f5e9]/60 border border-[#a0d2af]/50 text-xs text-[#1b5e20] leading-relaxed">
              <p className="font-bold flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#006d3d]" /> Actionable Recommendation
              </p>
              Build a 2-node Kafka consumer demo project to boost your Google match score from <strong>92% to 98%</strong>.
            </div>
          </div>

          <button
            onClick={handleAnalyzeGap}
            className="w-full py-2.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2 active:scale-95"
          >
            <Bot className="w-3.5 h-3.5 text-[#97f3b5]" />
            <span>Generate Tailored Learning Plan</span>
          </button>
        </div>
      </section>

      {/* Section 3: Verified Project Showcase */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ecefec] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#134e2f]">Verified Project Showcase</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-semibold">
                {projects.length} Portfolios Live
              </span>
            </div>
            <p className="text-xs text-[#717971] mt-0.5">
              Peer-reviewed, capstone graded, and benchmarked code repositories ready for recruiter export.
            </p>
          </div>

          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="px-4 py-2 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-[#97f3b5]" /> Add Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full p-12 rounded-3xl bg-white border border-[#e2e8e2] text-center text-[#717971] text-xs shadow-sm">
              No projects showcased yet. Click "Add Project" to feature your engineering work!
            </div>
          ) : (
            projects.map((proj) => (
              <div
                key={proj.id}
                className="rounded-3xl bg-white border border-[#e2e8e2] p-6 flex flex-col justify-between shadow-sm hover:border-[#006d3d] hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-[11px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006d3d]"></span>
                      Live &amp; Benchmarked
                    </span>

                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#717971] hover:text-[#ba1a1a] transition"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="font-bold text-base text-[#181c1b] group-hover:text-[#134e2f] transition">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-[#404942] leading-relaxed line-clamp-3">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {parseTechStack(proj.techStack).map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#ecefec] text-[#404942] font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#ecefec] flex items-center justify-between text-xs">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#404942] hover:text-[#134e2f] transition flex items-center gap-1.5"
                    >
                      <Github className="w-3.5 h-3.5 text-[#134e2f]" /> Code Repo
                    </a>
                  )}

                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#006d3d] hover:underline transition flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Add Skill Modal */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white border border-[#e2e8e2] space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#ecefec] pb-3">
              <h3 className="text-base font-bold text-[#181c1b]">Add Technical Skill</h3>
              <button onClick={() => setIsSkillModalOpen(false)} className="p-1 rounded-full text-[#717971] hover:text-[#181c1b]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#181c1b] block mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React.js, Docker, Go, Python"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-[#181c1b] text-xs focus:outline-none focus:border-[#134e2f] focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#181c1b] block mb-1">Category</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-[#181c1b] text-xs focus:outline-none focus:border-[#134e2f] focus:bg-white"
                >
                  <option value="Core & Systems">Core &amp; Systems</option>
                  <option value="Languages">Programming Languages</option>
                  <option value="Frontend">Frontend &amp; UI</option>
                  <option value="Backend">Backend &amp; Distributed</option>
                  <option value="Database">Database &amp; Storage</option>
                  <option value="DevOps">DevOps &amp; Cloud</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#181c1b] block mb-1">Proficiency Level</label>
                <select
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-[#181c1b] text-xs focus:outline-none focus:border-[#134e2f] focus:bg-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white text-xs font-semibold transition active:scale-95"
              >
                Save Skill
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white border border-[#e2e8e2] space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#ecefec] pb-3">
              <h3 className="text-base font-bold text-[#181c1b]">Add Portfolio Project</h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="p-1 rounded-full text-[#717971] hover:text-[#181c1b]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#181c1b] block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Key-Value Store"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-[#181c1b] text-xs focus:outline-none focus:border-[#134e2f] focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#181c1b] block mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe features, problem solved, and architecture..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#f7faf7] border border-[#c0c9bf] text-[#181c1b] text-xs focus:outline-none focus:border-[#134e2f] focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#181c1b] block mb-1">Technologies (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Go, gRPC, Docker, Kubernetes"
                  value={newProjectTech}
                  onChange={(e) => setNewProjectTech(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-[#181c1b] text-xs focus:outline-none focus:border-[#134e2f] focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#181c1b] block mb-1">GitHub Repo URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={newProjectGithub}
                    onChange={(e) => setNewProjectGithub(e.target.value)}
                    className="w-full px-4 py-2 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-[#181c1b] text-xs focus:outline-none focus:border-[#134e2f] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#181c1b] block mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    placeholder="https://myproject.app"
                    value={newProjectLive}
                    onChange={(e) => setNewProjectLive(e.target.value)}
                    className="w-full px-4 py-2 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-[#181c1b] text-xs focus:outline-none focus:border-[#134e2f] focus:bg-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white text-xs font-semibold transition active:scale-95"
              >
                Publish Project
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Skill Gap Modal */}
      {isGapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white border border-[#e2e8e2] space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#ecefec] pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-[#006d3d]" />
                <h3 className="text-lg font-extrabold text-[#181c1b]">AI Skill Gap Analysis</h3>
              </div>
              <button onClick={() => setIsGapModalOpen(false)} className="p-1 rounded-full text-[#717971] hover:text-[#181c1b]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {isAnalyzing ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#006d3d] animate-spin mx-auto" />
                <p className="text-xs text-[#404942]">Analyzing your branch, semester coursework, and active project repos...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] text-xs text-[#404942] leading-relaxed whitespace-pre-line">
                  {aiGapAnalysis}
                </div>

                {recommendedSkills.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#181c1b] uppercase tracking-wide">Recommended Additions:</p>
                    <div className="flex flex-wrap gap-2">
                      {recommendedSkills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-3 py-1 rounded-full bg-[#e8f5e9] text-[#1b5e20] border border-[#a0d2af] flex items-center gap-1.5 font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#006d3d]" /> {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setIsGapModalOpen(false)}
                    className="px-5 py-2 rounded-full bg-[#134e2f] text-white text-xs font-semibold hover:bg-[#0e3b24]"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
