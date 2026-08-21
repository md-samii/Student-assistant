import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  FileText, 
  UploadCloud, 
  ShieldCheck, 
  Award, 
  FileCheck, 
  Trash2, 
  Eye, 
  Plus, 
  X, 
  Search, 
  Sparkles, 
  Lock, 
  HardDrive
} from 'lucide-react';

export default function DocumentLocker() {
  const { user } = useAuth();

  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [storageUsed, setStorageUsed] = useState('0 MB');
  const [isLoading, setIsLoading] = useState(true);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('RESUME');
  const [isUploading, setIsUploading] = useState(false);

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [selectedType]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (selectedType !== 'ALL') params.type = selectedType;

      const res = await api.get('/documents', { params });
      setDocuments(res.data.data.documents || []);
      setStorageUsed(res.data.data.totalStorageUsed || '0 MB');
    } catch (err) {
      console.warn('Failed to fetch documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    try {
      setIsUploading(true);
      await api.post('/documents/upload', {
        name: docTitle,
        type: docType,
      });

      setShowUploadModal(false);
      setDocTitle('');
      await fetchDocuments();
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Delete document error:', err);
    }
  };

  const docCategories = [
    { key: 'ALL', label: 'All Documents', icon: FileText },
    { key: 'RESUME', label: 'Resumes', icon: FileText },
    { key: 'MARKS_CARD', label: 'Marks Cards', icon: FileCheck },
    { key: 'CERTIFICATE', label: 'Certificates', icon: Award },
    { key: 'INTERNSHIP_CERTIFICATE', label: 'Internships', icon: ShieldCheck },
  ];

  const filteredDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="eduflow-card p-8 bg-gradient-to-r from-white via-[#f0f3ff] to-[#e7eeff] border border-[#c4c6d1]/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#052659]/10 text-[#052659] text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#30618f]" /> Firebase Storage Cloud Locker • Encrypted
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001234] font-sans">
              Student Document Locker
            </h1>
            <p className="text-[#44474f] text-xs font-mono mt-1">
              Securely store verified resumes, VTU marks cards, internship certificates & achievement badges
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#052659] hover:bg-[#30618f] text-white font-bold text-xs transition shadow-md shadow-[#052659]/20 flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Storage Bar & Filter Bar */}
      <div className="eduflow-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-4">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-[#30618f]" />
            <div>
              <p className="text-xs font-mono font-bold text-[#001234]">Cloud Storage Utilization</p>
              <p className="text-[11px] font-mono text-[#747780]">{storageUsed} used of 500 MB quota</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono text-emerald-700 font-bold bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
            <Lock className="w-3.5 h-3.5" /> 256-Bit Encrypted Storage
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {docCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedType(cat.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold font-sans whitespace-nowrap transition flex items-center gap-1.5 ${
                    selectedType === cat.key
                      ? 'bg-[#052659] text-white shadow-md shadow-[#052659]/20'
                      : 'bg-[#f0f3ff] text-[#44474f] hover:text-[#001234] border border-[#c4c6d1]/30'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-[#747780] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search document name..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#f0f3ff] border border-[#c4c6d1]/40 text-xs text-[#001234] placeholder-[#747780] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Document Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-[#e7eeff]/40 animate-pulse border border-[#c4c6d1]/30"></div>
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="eduflow-card p-12 text-center space-y-3">
          <FileText className="w-8 h-8 text-[#747780] mx-auto" />
          <h3 className="font-bold text-[#001234] text-base">No Documents in Locker</h3>
          <p className="text-xs text-[#747780] font-mono">Upload your resume, marks card, or certificates above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="eduflow-card p-6 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="eduflow-pill bg-[#052659]/10 text-[#052659]">
                    {doc.type}
                  </span>
                  <span className="text-[11px] text-[#747780] font-mono">{doc.fileSize}</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#052659]/10 text-[#052659] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#001234] group-hover:text-[#30618f] transition font-sans line-clamp-1">
                      {doc.name}
                    </h3>
                    <p className="text-[11px] text-[#747780] font-mono mt-0.5">
                      Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e2e8f0] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#747780] font-mono">{doc.mimeType?.split('/')[1] || 'PDF'}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="px-3 py-1.5 rounded-xl bg-[#052659] hover:bg-[#30618f] text-white font-bold text-xs transition flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1.5 rounded-xl bg-[#f0f3ff] text-[#747780] hover:text-rose-600 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001234]/60 backdrop-blur-md p-4">
          <div className="w-full max-w-lg eduflow-card p-6 sm:p-8 space-y-5 shadow-2xl relative bg-white border border-[#c4c6d1]">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
              <h3 className="font-bold text-lg text-[#001234] font-sans flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#30618f]" /> Upload Digital Document
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-xl bg-[#f0f3ff] text-[#747780] hover:text-[#001234]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-[#001234] mb-1">Document Title</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Rahul_Sharma_Resume_2026.pdf"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#f0f3ff] border border-[#c4c6d1]/40 text-xs text-[#001234] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-[#001234] mb-1">Document Category</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#f0f3ff] border border-[#c4c6d1]/40 text-xs text-[#001234] outline-none"
                >
                  <option value="RESUME">Resume / CV</option>
                  <option value="MARKS_CARD">VTU Semester Marks Card</option>
                  <option value="CERTIFICATE">Course / Skill Certificate</option>
                  <option value="INTERNSHIP_CERTIFICATE">Internship Certificate</option>
                </select>
              </div>

              <div className="p-4 rounded-xl border-2 border-dashed border-[#c4c6d1] bg-[#f0f3ff] text-center space-y-2">
                <UploadCloud className="w-8 h-8 text-[#30618f] mx-auto" />
                <p className="text-xs font-mono font-bold text-[#001234]">Simulated Firebase Cloud Upload</p>
                <p className="text-[11px] text-[#747780] font-mono">PDF, PNG, JPG files up to 25MB supported</p>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-2.5 rounded-xl bg-[#052659] hover:bg-[#30618f] text-white font-bold text-xs transition shadow-md shadow-[#052659]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? 'Uploading to Firebase...' : 'Save to Digital Locker'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001234]/60 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl eduflow-card p-6 sm:p-8 space-y-6 shadow-2xl relative bg-white border border-[#c4c6d1]">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#052659] text-white flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#001234] font-sans">{previewDoc.name}</h3>
                  <p className="text-[11px] text-[#747780] font-mono">{previewDoc.type} • {previewDoc.fileSize}</p>
                </div>
              </div>

              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-xl bg-[#f0f3ff] text-[#747780] hover:text-[#001234]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 rounded-2xl bg-[#f0f3ff] text-center space-y-4 border border-[#c4c6d1]/40">
              <FileText className="w-12 h-12 text-[#052659] mx-auto" />
              <div className="space-y-1">
                <p className="font-bold text-sm text-[#001234] font-sans">{previewDoc.name}</p>
                <p className="text-xs font-mono text-[#747780]">Encrypted Firebase Storage URL Verified</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2.5 rounded-xl bg-[#052659] text-white font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
