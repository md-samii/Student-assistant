import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Plus, 
  Trash2, 
  Github, 
  ExternalLink, 
  Sparkles, 
  BrainCircuit, 
  Layers, 
  CheckCircle2, 
  FolderGit2, 
  X,
  Bot
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
  const [newSkillCategory, setNewSkillCategory] = useState('Languages');
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
      setAiGapAnalysis('Focus on mastering DevOps tools (Docker), Cloud Hosting, and System Design patterns.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'Advanced':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Intermediate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
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
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-purple-950/80 border border-indigo-500/20 p-8 shadow-[0_15px_40px_-10px_rgba(99,102,241,0.2)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Skill Matrix & Showcase
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Technical Skills & Project Portfolio
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Manage your engineering technical stack, showcase portfolio projects, and run AI Skill Gap analysis to target industry expectations.
          </p>
        </div>

        <button
          onClick={handleAnalyzeGap}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2.5 shrink-0 group"
        >
          <Sparkles className="w-4 h-4 text-purple-200 group-hover:scale-110 transition-transform animate-pulse" />
          AI Skill Gap Analysis
        </button>
      </section>

      {/* Technical Skills Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Technical Skill Matrix</h2>
          </div>
          <button
            onClick={() => setIsSkillModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Skill
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.length === 0 ? (
            <div className="col-span-full p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs">
              No skills added yet. Click "Add Skill" to build your matrix!
            </div>
          ) : (
            skills.map((skill) => (
              <div
                key={skill.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{skill.name}</span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${getProficiencyColor(
                        skill.proficiency
                      )}`}
                    >
                      {skill.proficiency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{skill.category}</p>
                </div>
                <button
                  onClick={() => handleDeleteSkill(skill.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-400 transition"
                  title="Delete Skill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Projects Portfolio Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Project Portfolio</h2>
          </div>
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs">
              No projects showcased yet. Click "Add Project" to list your engineering apps!
            </div>
          ) : (
            projects.map((proj) => (
              <div
                key={proj.id}
                className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/40 transition space-y-4 flex flex-col justify-between group shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">
                      {proj.title}
                    </h3>
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 transition"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {parseTechStack(proj.techStack).map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/20 text-indigo-300 font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5"
                      >
                        <Github className="w-4 h-4" /> Code Repo
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-4 h-4" /> Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Add Skill Modal */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Add Technical Skill</h3>
              <button onClick={() => setIsSkillModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React.js, Docker, Python"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Category</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="Languages">Languages</option>
                  <option value="Frontend">Frontend & Frameworks</option>
                  <option value="Backend">Backend & APIs</option>
                  <option value="Database">Database</option>
                  <option value="DevOps">DevOps & Tools</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Proficiency Level</label>
                <select
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
              >
                Save Skill
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Add Portfolio Project</h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Homework Helper"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Briefly describe features, problem solved, and architecture..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Technologies (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, PostgreSQL, Tailwind"
                  value={newProjectTech}
                  onChange={(e) => setNewProjectTech(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">GitHub Repo URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={newProjectGithub}
                    onChange={(e) => setNewProjectGithub(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    placeholder="https://myproject.demo"
                    value={newProjectLive}
                    onChange={(e) => setNewProjectLive(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
              >
                Publish Project
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Skill Gap Modal */}
      {isGapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-purple-500/30 space-y-6 shadow-[0_20px_60px_rgba(147,51,234,0.3)]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-purple-400 animate-pulse" />
                <h3 className="text-xl font-extrabold text-white">AI Skill Gap Recommendation</h3>
              </div>
              <button onClick={() => setIsGapModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAnalyzing ? (
              <div className="py-12 text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-xs font-mono text-purple-300">Analyzing your branch, semester, and skill matrix...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                  {aiGapAnalysis}
                </div>

                {recommendedSkills.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-mono font-bold text-slate-400 uppercase">Recommended Industry Additions:</p>
                    <div className="flex flex-wrap gap-2">
                      {recommendedSkills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-mono px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
