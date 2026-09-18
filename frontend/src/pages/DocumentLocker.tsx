import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  FileText, 
  FileCheck, 
  Award, 
  ShieldCheck, 
  UploadCloud, 
  Trash2, 
  Download, 
  Eye, 
  Plus, 
  Lock, 
  HardDrive, 
  CheckCircle2, 
  X, 
  Search, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function DocumentLocker() {
  const { user } = useAuth();

  const [documents, setDocuments] = useState<any[]>([]);
  const [storageUsed, setStorageUsed] = useState('12.4 MB');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState('RESUME');
  const [docFileUrl, setDocFileUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [activeCategory]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (activeCategory !== 'ALL') {
        params.category = activeCategory;
        params.type = activeCategory;
      }

      const res = await api.get('/documents', { params });
      const docs = res.data?.data?.documents || [];
      setDocuments(docs);
      if (res.data?.data?.storageUsed || res.data?.data?.totalStorageUsed) {
        setStorageUsed(res.data.data.storageUsed || res.data.data.totalStorageUsed);
      }
    } catch (err) {
      console.warn('Failed to fetch locker documents:', err);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !docFileUrl.trim()) return;

    try {
      setIsUploading(true);
      const res = await api.post('/documents', {
        name: docName,
        category: docCategory,
        type: docCategory,
        fileUrl: docFileUrl,
        fileSize: '1.2 MB',
      });

      const newDoc = res.data?.data?.document || {
        id: `doc_${Date.now()}`,
        name: docName,
        category: docCategory,
        type: docCategory,
        fileUrl: docFileUrl,
        fileSize: '1.2 MB',
        createdAt: new Date().toISOString(),
        isVerified: true,
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setShowUploadModal(false);
      setDocName('');
      setDocFileUrl('');
    } catch (err) {
      console.error('Upload document error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this verified document?')) return;
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

  const filteredDocs = (documents || []).filter((d) =>
    (d?.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="stitch-card p-6 sm:p-8 bg-white border border-[#e2e8e2] relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#006d3d]" /> Cloud Vault Storage • 256-Bit Encrypted
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#181c1b] tracking-tight">
            Student Document Locker
          </h1>
          <p className="text-[#404942] text-xs sm:text-sm mt-1">
            Securely manage verified resumes, VTU marks cards, internship certificates & achievement credentials.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="stitch-btn-primary shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Storage Bar & Filter Bar */}
      <div className="stitch-card p-5 space-y-4 bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e2e8e2] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#f0f9f4] text-[#134e2f] flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#181c1b]">Cloud Storage Utilization</p>
              <p className="text-[11px] text-[#404942]">{storageUsed} used of 500 MB quota</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#006d3d] font-semibold bg-[#e8f5e9] px-3.5 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5" /> 256-Bit Encrypted Storage
          </div>
        </div>

        {/* Category Pills & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {docCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${
                    activeCategory === cat.key
                      ? 'bg-[#134e2f] text-white shadow-sm'
                      : 'bg-[#f0f4f0] text-[#181c1b] hover:bg-[#e1e9e1] border border-[#e2e8e2]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] placeholder-gray-400 outline-none focus:border-[#134e2f]"
            />
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-white animate-pulse border border-[#e2e8e2]"></div>
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="stitch-card p-12 text-center space-y-3 bg-white">
          <UploadCloud className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-bold text-[#181c1b] text-base">No Documents Found</h3>
          <p className="text-xs text-[#404942]">Click "Upload Document" above to save your first verified credential.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="stitch-card p-6 flex flex-col justify-between space-y-4 bg-white group hover:translate-y-[-2px]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-semibold">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{String(doc.category || doc.type || 'Document').replace(/_/g, ' ')}</span>
                  </span>

                  {doc.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006d3d] bg-[#f0f9f4] px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-[#181c1b] group-hover:text-[#134e2f] transition truncate">
                  {doc.name}
                </h3>

                <p className="text-xs text-[#717971]">
                  Uploaded {doc.createdAt || doc.uploadedAt ? new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString() : 'Recent'} • {doc.fileSizeFormatted || doc.fileSize || 'PDF'}
                </p>
              </div>

              <div className="pt-4 border-t border-[#e2e8e2] flex items-center justify-between">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-[#f0f4f0] hover:bg-[#e1e9e1] text-[#181c1b] text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Doc</span>
                </a>

                <div className="flex items-center gap-2">
                  <a
                    href={doc.fileUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-full bg-[#f0f4f0] hover:bg-[#e1e9e1] text-[#181c1b] transition"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg stitch-card p-6 sm:p-8 bg-white space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e2e8e2] pb-3">
              <h3 className="text-lg font-bold text-[#181c1b]">Upload Verified Academic Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#181c1b] mb-1">Document Title</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Rahul_Sharma_Resume_2026.pdf"
                  className="w-full px-4 py-2 rounded-full bg-[#f7faf7] border border-[#c0c9bf] focus:border-[#134e2f] text-xs text-[#181c1b] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#181c1b] mb-1">Category</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-full bg-[#f7faf7] border border-[#c0c9bf] focus:border-[#134e2f] text-xs text-[#181c1b] outline-none"
                >
                  <option value="RESUME">Resume / CV</option>
                  <option value="MARKS_CARD">University Marks Card</option>
                  <option value="CERTIFICATE">Skill Certificate</option>
                  <option value="INTERNSHIP_CERTIFICATE">Internship Completion Letter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#181c1b] mb-1">Cloud Link / File URL</label>
                <input
                  type="url"
                  value={docFileUrl}
                  onChange={(e) => setDocFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/... or https://firebasestorage.googleapis.com/..."
                  className="w-full px-4 py-2 rounded-full bg-[#f7faf7] border border-[#c0c9bf] focus:border-[#134e2f] text-xs text-[#181c1b] outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="stitch-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="stitch-btn-primary"
                >
                  {isUploading ? 'Uploading...' : 'Save to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
