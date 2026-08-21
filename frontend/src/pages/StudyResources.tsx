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
  HardDrive
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
      if (selectedModule !== 'ALL') params.moduleNumber = selectedModule;
      if (selectedType !== 'ALL') params.type = selectedType;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/resources', { params });
      setResources(res.data.data.resources || []);
    } catch (err) {
      console.warn('Failed to load resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resourceTypes = [
    { key: 'ALL', label: 'All Materials', icon: Layers },
    { key: 'PDF_NOTES', label: 'PDF Notes', icon: FileText },
    { key: 'PPT', label: 'PPT Slides', icon: Presentation },
    { key: 'PREVIOUS_PAPER', label: 'Solved Papers', icon: FileCheck },
    { key: 'LAB_MANUAL', label: 'Lab Manuals', icon: FlaskConical },
    { key: 'TUTORIAL', label: 'Tutorial Guides', icon: Video },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF_NOTES': return FileText;
      case 'PPT': return Presentation;
      case 'PREVIOUS_PAPER': return FileCheck;
      case 'LAB_MANUAL': return FlaskConical;
      default: return BookOpen;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="eduflow-card p-8 bg-gradient-to-r from-white via-[#f0f3ff] to-[#e7eeff] border border-[#c4c6d1]/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#052659]/10 text-[#052659] text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#30618f]" /> Google Drive Cloud Repository • Sem {profile?.semester || 6}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001234] font-sans">
              Syllabus Notes & Study Materials
            </h1>
            <p className="text-[#44474f] text-xs font-mono mt-1">
              Curated PDF notes, PPTs, lab manuals & solved question papers for {profile?.branch || 'Computer Science'}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#c4c6d1]/40 text-xs font-mono text-[#052659] shrink-0">
            <HardDrive className="w-4 h-4 text-emerald-600" />
            <span>Drive Embedded Viewer Active</span>
          </div>
        </div>
      </div>

      {/* Subject Selector & Search Bar */}
      <div className="eduflow-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {subjectsList.map((s) => (
              <button
                key={s.code}
                onClick={() => setSelectedSubject(s.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-sans whitespace-nowrap transition ${
                  selectedSubject === s.name
                    ? 'bg-[#052659] text-white shadow-md shadow-[#052659]/20'
                    : 'bg-[#f0f3ff] text-[#44474f] hover:text-[#001234] border border-[#c4c6d1]/30'
                }`}
              >
                {s.code} — {s.name}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-[#747780] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes, topics..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#f0f3ff] border border-[#c4c6d1]/40 text-xs text-[#001234] placeholder-[#747780] outline-none"
            />
          </div>
        </div>

        {/* Module Filter */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[#e2e8f0] pt-4">
          <span className="text-xs font-mono font-bold text-[#747780] mr-2">Module:</span>
          {['ALL', 1, 2, 3, 4, 5].map((mod) => (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                selectedModule === mod
                  ? 'bg-[#052659] text-white'
                  : 'bg-[#f0f3ff] text-[#44474f] hover:text-[#001234] border border-[#c4c6d1]/30'
              }`}
            >
              {mod === 'ALL' ? 'All Modules' : `Module ${mod}`}
            </button>
          ))}
        </div>

        {/* Material Type Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {resourceTypes.map((rt) => {
            const Icon = rt.icon;
            return (
              <button
                key={rt.key}
                onClick={() => setSelectedType(rt.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition ${
                  selectedType === rt.key
                    ? 'bg-[#001234] text-white'
                    : 'bg-[#f0f3ff] text-[#747780] hover:text-[#001234] border border-[#c4c6d1]/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {rt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resource Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-[#e7eeff]/40 animate-pulse border border-[#c4c6d1]/30"></div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="eduflow-card p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-[#747780] mx-auto" />
          <h3 className="font-bold text-[#001234] text-base">No Materials Found</h3>
          <p className="text-xs text-[#747780] font-mono">Try adjusting your subject or module filters above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((item) => {
            const Icon = getTypeIcon(item.type);
            return (
              <div
                key={item.id}
                className="eduflow-card p-6 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="eduflow-pill bg-[#052659]/10 text-[#052659]">
                        {item.subjectCode}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-[#747780]">
                        Module {item.moduleNumber}
                      </span>
                    </div>

                    <span className="text-[11px] text-[#747780] font-mono">{item.fileSize}</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#052659]/10 text-[#052659] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#001234] group-hover:text-[#30618f] transition font-sans">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#44474f] mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#e2e8f0] flex items-center justify-between gap-3 text-xs">
                  <span className="text-[11px] text-[#747780] font-mono">Verified Notes</span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewResource(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#052659] hover:bg-[#30618f] text-white font-bold transition shadow-md shadow-[#052659]/15 flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <a
                      href={item.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-[#f0f3ff] hover:bg-[#e7eeff] border border-[#c4c6d1]/40 text-[#747780] hover:text-[#001234] transition"
                      title="Open in Google Drive"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Embedded Drive Modal */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001234]/60 backdrop-blur-md p-4">
          <div className="w-full max-w-5xl h-[85vh] eduflow-card rounded-2xl flex flex-col shadow-2xl overflow-hidden bg-white border border-[#c4c6d1]">
            <div className="p-4 sm:px-6 bg-[#f0f3ff] border-b border-[#e2e8f0] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#052659] text-white flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#001234] font-sans line-clamp-1">
                    {previewResource.title}
                  </h3>
                  <p className="text-[11px] text-[#747780] font-mono">
                    Module {previewResource.moduleNumber} ({previewResource.fileSize})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewResource.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#052659] hover:bg-[#30618f] text-white font-bold text-xs transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google Drive</span>
                </a>
                <button
                  onClick={() => setPreviewResource(null)}
                  className="p-2 rounded-xl bg-white border border-[#c4c6d1]/40 text-[#747780] hover:text-[#001234]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white relative">
              <iframe
                src={formatDrivePreviewUrl(previewResource.driveUrl)}
                title={previewResource.title}
                className="w-full h-full border-0"
                allow="autoplay"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
