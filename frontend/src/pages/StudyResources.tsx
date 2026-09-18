import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  BookOpen, 
  FileText, 
  Presentation, 
  FileCheck, 
  FlaskConical, 
  Video, 
  Search, 
  ExternalLink, 
  Eye, 
  X, 
  Sparkles, 
  Layers,
  HardDrive,
  Download,
  GraduationCap
} from 'lucide-react';

const formatDrivePreviewUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('/view')) {
    return url.replace('/view', '/preview');
  }
  return url;
};

export default function StudyResources() {
  const { profile } = useAuth();

  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<number | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewResource, setPreviewResource] = useState<any | null>(null);

  useEffect(() => {
    fetchPersonalizedSubjects();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [selectedSubject, selectedModule, selectedType, searchQuery]);

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

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (selectedSubject) params.subject = selectedSubject;
      if (selectedModule !== 'ALL') params.module = selectedModule;
      if (selectedType !== 'ALL') params.type = selectedType;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/resources', { params });
      setResources(res.data.data.resources || []);
    } catch (err) {
      console.warn('Failed to fetch resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resourceTypes = [
    { key: 'ALL', label: 'All Formats', icon: Layers },
    { key: 'NOTES', label: 'Notes (PDF)', icon: FileText },
    { key: 'PPT', label: 'Presentations', icon: Presentation },
    { key: 'QUESTION_PAPER', label: 'Model Papers', icon: FileCheck },
    { key: 'LAB_MANUAL', label: 'Lab Manuals', icon: FlaskConical },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PPT': return <Presentation className="w-4 h-4 text-amber-600" />;
      case 'QUESTION_PAPER': return <FileCheck className="w-4 h-4 text-purple-600" />;
      case 'LAB_MANUAL': return <FlaskConical className="w-4 h-4 text-emerald-600" />;
      default: return <FileText className="w-4 h-4 text-[#134e2f]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="stitch-card p-6 sm:p-8 bg-white border border-[#e2e8e2] relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#006d3d]" /> Cloud Curriculum Repository • Sem {profile?.semester || 6}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#181c1b] tracking-tight">
            Syllabus Notes & Study Materials
          </h1>
          <p className="text-[#404942] text-xs sm:text-sm mt-1">
            Curated PDF notes, PPTs, lab manuals & solved question papers for {profile?.branch || 'Computer Science'}.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#f0f9f4] border border-[#c0c9bf]/60 text-xs font-semibold text-[#134e2f] shrink-0">
          <HardDrive className="w-4 h-4 text-[#006d3d]" />
          <span>Drive Viewer Active</span>
        </div>
      </div>

      {/* Subject Selector & Search Bar */}
      <div className="stitch-card p-5 space-y-4 bg-white">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
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

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, topics..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] placeholder-gray-400 outline-none focus:border-[#134e2f]"
            />
          </div>
        </div>

        {/* Module Filter */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[#e2e8e2] pt-3">
          <span className="text-xs font-semibold text-[#404942] mr-2">Module:</span>
          {['ALL', 1, 2, 3, 4, 5].map((mod) => (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod as any)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedModule === mod
                  ? 'bg-[#134e2f] text-white'
                  : 'bg-[#f0f4f0] text-[#181c1b] hover:bg-[#e1e9e1]'
              }`}
            >
              {mod === 'ALL' ? 'All Modules' : `Module ${mod}`}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-[#e2e8e2] mx-2 hidden sm:block"></div>

          {/* Type Filter */}
          {resourceTypes.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setSelectedType(t.key)}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                  selectedType === t.key
                    ? 'bg-[#006d3d] text-white'
                    : 'bg-[#f0f4f0] text-[#404942] hover:bg-[#e1e9e1]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resource Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-white animate-pulse border border-[#e2e8e2]"></div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="stitch-card p-12 text-center space-y-3 bg-white">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-bold text-[#181c1b] text-base">No Resources Found</h3>
          <p className="text-xs text-[#404942]">Try changing your search query, subject, or module filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <div
              key={res.id}
              className="stitch-card p-6 flex flex-col justify-between space-y-4 bg-white group hover:translate-y-[-2px]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-bold font-mono">
                    {getTypeIcon(res.type)}
                    <span>{res.subjectCode}</span>
                  </span>
                  <span className="text-xs font-semibold text-[#404942]">
                    Module {res.moduleNumber}
                  </span>
                </div>

                <h3 className="font-bold text-base text-[#181c1b] group-hover:text-[#134e2f] transition leading-snug">
                  {res.title}
                </h3>

                <p className="text-xs text-[#404942] leading-relaxed line-clamp-2">
                  {res.description || 'Verified course material aligned with standard VTU scheme.'}
                </p>
              </div>

              <div className="pt-4 border-t border-[#e2e8e2] flex items-center justify-between">
                <span className="text-xs text-[#717971]">
                  {res.fileSize || 'PDF Document'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewResource(res)}
                    className="px-3 py-1.5 rounded-full bg-[#f0f4f0] hover:bg-[#e1e9e1] text-[#181c1b] text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <a
                    href={res.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white transition"
                    title="Open in Drive"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Embedded Document Preview Modal */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-5xl h-[85vh] stitch-card bg-white flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#e2e8e2] flex items-center justify-between bg-[#f7faf7]">
              <div className="flex items-center gap-2 truncate">
                <BookOpen className="w-5 h-5 text-[#134e2f]" />
                <span className="font-bold text-sm text-[#181c1b] truncate">{previewResource.title}</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewResource.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="stitch-btn-primary py-1.5 px-4 text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Open Full PDF</span>
                </a>
                <button
                  onClick={() => setPreviewResource(null)}
                  className="p-2 rounded-full hover:bg-gray-200 text-gray-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-gray-100 p-2">
              <iframe
                src={formatDrivePreviewUrl(previewResource.fileUrl)}
                className="w-full h-full rounded-2xl border border-gray-200"
                title={previewResource.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
