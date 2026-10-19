import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';
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
  HardDrive,
  X,
  Search,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Database,
  File,
} from 'lucide-react';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function DocumentLocker() {
  const { user } = useAuth();
  const { confirm, alert: customAlert } = useConfirm();

  const [documents, setDocuments] = useState<any[]>([]);
  const [storageUsed, setStorageUsed] = useState('0 KB');
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState('RESUME');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      if (res.data?.data?.totalFiles !== undefined) {
        setTotalFiles(res.data.data.totalFiles);
      }
    } catch (err) {
      console.warn('Failed to fetch locker documents:', err);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate MIME / extension
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setUploadError('Invalid file type. Only PDF documents are supported.');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Enforce 5 MB limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(
        `File size (${formatFileSize(file.size)}) exceeds the maximum limit of 5 MB.`
      );
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size === 0) {
      setUploadError('The selected file is empty (0 bytes).');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);

    // Auto-populate document title if not set
    if (!docName.trim()) {
      const cleanName = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
      setDocName(cleanName);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!docName.trim()) {
      setUploadError('Please enter a document title.');
      return;
    }

    if (!selectedFile) {
      setUploadError('Please choose a PDF document from your device.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(
        `File size (${formatFileSize(selectedFile.size)}) exceeds the 5 MB maximum limit.`
      );
      return;
    }

    try {
      setIsUploading(true);

      // Read file into Base64 for database BYTEA transmission
      const reader = new FileReader();

      reader.onerror = () => {
        setIsUploading(false);
        setUploadError('Error reading local file from disk.');
      };

      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;

          const res = await api.post('/documents', {
            title: docName.trim(),
            name: docName.trim(),
            category: docCategory,
            type: docCategory,
            fileBase64: base64Data,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
          });

          // Reset modal state
          setShowUploadModal(false);
          setDocName('');
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';

          setActionMessage({
            type: 'success',
            text: 'PDF document stored securely in database locker.',
          });
          setTimeout(() => setActionMessage(null), 4000);

          // Refresh documents and storage usage
          await fetchDocuments();
        } catch (err: any) {
          console.error('Upload document error:', err);
          const msg =
            err.response?.data?.message || err.message || 'Failed to upload document to database.';
          setUploadError(msg);
        } finally {
          setIsUploading(false);
        }
      };

      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      setIsUploading(false);
      setUploadError(err.message || 'Unexpected upload error.');
    }
  };

  // View document by streaming PDF from authenticated backend
  const handleViewDoc = async (doc: any) => {
    try {
      const res = await api.get(`/documents/${doc.id}/view`, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const fileUrl = window.URL.createObjectURL(blob);
      window.open(fileUrl, '_blank');
      // Clean up object URL after brief delay
      setTimeout(() => window.URL.revokeObjectURL(fileUrl), 60000);
    } catch (err: any) {
      console.error('View doc error:', err);
      // If legacy document has a direct external URL, fallback
      if (doc.fileUrl && !doc.fileUrl.startsWith('/api/documents')) {
        window.open(doc.fileUrl, '_blank');
        return;
      }
      customAlert({
        title: 'Unable to View File',
        message: err.response?.data?.message || 'Could not retrieve PDF file from database. If this is an older URL record, please re-upload the PDF.',
        type: 'error',
      });
    }
  };

  // Download document by streaming PDF from authenticated backend
  const handleDownloadDoc = async (doc: any) => {
    try {
      const res = await api.get(`/documents/${doc.id}/download`, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const fileUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = doc.name.toLowerCase().endsWith('.pdf') ? doc.name : `${doc.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(fileUrl), 1000);
    } catch (err: any) {
      console.error('Download doc error:', err);
      if (doc.fileUrl && !doc.fileUrl.startsWith('/api/documents')) {
        window.open(doc.fileUrl, '_blank');
        return;
      }
      customAlert({
        title: 'Download Failed',
        message: err.response?.data?.message || 'Could not download PDF from database. If this is an older URL record, please re-upload the PDF.',
        type: 'error',
      });
    }
  };

  // Delete document
  const handleDeleteDoc = async (id: string) => {
    const isConfirmed = await confirm({
      title: 'Delete Document?',
      message: 'Are you sure you want to delete this document from your database storage? This action cannot be undone.',
      confirmText: 'Delete Document',
      cancelText: 'Keep Document',
      type: 'danger',
    });

    if (!isConfirmed) {
      return;
    }

    try {
      await api.delete(`/documents/${id}`);
      setActionMessage({
        type: 'success',
        text: 'Document deleted from database storage.',
      });
      setTimeout(() => setActionMessage(null), 3000);
      await fetchDocuments();
    } catch (err: any) {
      console.error('Delete document error:', err);
      customAlert({
        title: 'Delete Failed',
        message: err.response?.data?.message || 'Failed to delete document from database storage.',
        type: 'error',
      });
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
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#181c1b] tracking-tight">
            Student Document Locker
          </h1>
          <p className="text-xs sm:text-sm text-[#404942] mt-1">
            Securely store, view, and manage your academic resumes, VTU marks cards, certificates &amp; credentials directly in PostgreSQL.
          </p>
        </div>

        <button
          onClick={() => {
            setShowUploadModal(true);
            setUploadError(null);
          }}
          className="stitch-btn-primary shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2 animate-fade-in ${actionMessage.type === 'success'
            ? 'bg-[#e8f5e9] text-[#1b5e20] border-[#a5d6a7]'
            : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{actionMessage.text}</span>
        </div>
      )}

      {/* Storage Utilization Card & Category Filter Bar */}
      <div className="stitch-card p-5 space-y-4 bg-white border border-[#e2e8e2]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e2e8e2] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#f0f9f4] text-[#134e2f] flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#181c1b]">Database Storage Utilization</p>
              <p className="text-[11px] text-[#404942]">
                {storageUsed} used across {totalFiles} document{totalFiles !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#006d3d] font-semibold bg-[#e8f5e9] px-3.5 py-1.5 rounded-full border border-[#c0c9bf]/60">
            <Database className="w-3.5 h-3.5" />
            <span>5 MB Max File Size</span>
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
                  className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${activeCategory === cat.key
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
            <div
              key={i}
              className="h-44 rounded-3xl bg-white animate-pulse border border-[#e2e8e2]"
            />
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="stitch-card p-12 text-center space-y-3 bg-white border border-[#e2e8e2]">
          <UploadCloud className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-bold text-[#181c1b] text-base">No Documents Found</h3>
          <p className="text-xs text-[#404942]">
            Click "Upload Document" above to save your first PDF credential in PostgreSQL storage.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="stitch-card p-6 flex flex-col justify-between space-y-4 bg-white border border-[#e2e8e2] group hover:border-[#134e2f] hover:translate-y-[-2px] transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-semibold">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{String(doc.category || doc.type || 'Document').replace(/_/g, ' ')}</span>
                  </span>

                  <span className="text-[11px] font-mono text-[#717971]">
                    {doc.fileSizeFormatted || formatFileSize(doc.fileSize || 0)}
                  </span>
                </div>

                <h3
                  onClick={() => handleViewDoc(doc)}
                  className="font-bold text-base text-[#181c1b] group-hover:text-[#134e2f] transition truncate cursor-pointer"
                  title={doc.name}
                >
                  {doc.name}
                </h3>

                <p className="text-xs text-[#717971]">
                  Uploaded {doc.createdAt || doc.uploadedAt ? new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString() : 'Recent'} • PDF
                </p>
              </div>

              <div className="pt-4 border-t border-[#e2e8e2] flex items-center justify-between">
                <button
                  onClick={() => handleViewDoc(doc)}
                  className="px-3 py-1.5 rounded-full bg-[#f0f4f0] hover:bg-[#e1e9e1] text-[#181c1b] text-xs font-semibold flex items-center gap-1.5 transition"
                  title="View PDF"
                >
                  <Eye className="w-3.5 h-3.5 text-[#134e2f]" />
                  <span>View Doc</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadDoc(doc)}
                    className="p-1.5 rounded-full bg-[#f0f4f0] hover:bg-[#e1e9e1] text-[#181c1b] transition"
                    title="Download PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id={`delete-doc-${doc.id}`}
                    data-testid="delete-doc-btn"
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1.5 rounded-full bg-[#f0f4f0] hover:bg-red-50 text-[#717971] hover:text-red-600 transition cursor-pointer"
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

      {/* Real PDF Upload Modal */}
      {showUploadModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in font-sans"
            onClick={() => {
              setShowUploadModal(false);
              setSelectedFile(null);
              setUploadError(null);
            }}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative w-full max-w-lg rounded-[28px] bg-white border border-[#e2e8e2] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden space-y-5 animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ambient Emerald Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-2xl pointer-events-none opacity-40 bg-emerald-400" />
            <div className="flex items-center justify-between border-b border-[#e2e8e2] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#181c1b]">Upload Academic PDF</h3>
                <p className="text-xs text-[#404942]">Stored directly in PostgreSQL BYTEA binary storage.</p>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setUploadError(null);
                }}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner in Modal */}
            {uploadError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <p className="leading-relaxed">{uploadError}</p>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Local File Picker Area */}
              <div>
                <label className="block text-xs font-semibold text-[#181c1b] mb-1.5">
                  Select PDF Document <span className="text-[#134e2f]">*</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#c0c9bf] hover:border-[#134e2f] rounded-2xl p-6 text-center cursor-pointer bg-[#f7faf7] hover:bg-[#f0f9f4] transition space-y-2"
                  >
                    <UploadCloud className="w-8 h-8 text-[#134e2f] mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-[#181c1b]">Click to browse PDF from device</p>
                      <p className="text-[11px] text-[#717971]">PDF files only • Maximum size: 5 MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-[#f0f9f4] border border-[#a5d6a7] flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-[#e8f5e9] text-[#1b5e20] flex items-center justify-center shrink-0">
                        <File className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-[#181c1b] truncate">{selectedFile.name}</p>
                        <p className="text-[11px] text-[#717971]">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-[#134e2f] hover:underline shrink-0 ml-2"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* Document Title */}
              <div>
                <label className="block text-xs font-semibold text-[#181c1b] mb-1">
                  Document Title <span className="text-[#134e2f]">*</span>
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Rahul Sharma Resume 2026"
                  className="w-full px-4 py-2 rounded-full bg-[#f7faf7] border border-[#c0c9bf] focus:border-[#134e2f] text-xs text-[#181c1b] outline-none"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-[#181c1b] mb-1">
                  Category <span className="text-[#134e2f]">*</span>
                </label>
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

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setUploadError(null);
                  }}
                  className="stitch-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="stitch-btn-primary text-xs disabled:opacity-50"
                >
                  {isUploading ? 'Saving to Database...' : 'Save to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
