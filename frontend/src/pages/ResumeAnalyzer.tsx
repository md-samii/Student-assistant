import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useConfirm } from '../context/ConfirmContext';
import { api } from '../services/api';
import {
  FileText,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Info,
  CheckSquare,
  Square,
  Eye,
  Target,
  ArrowRight,
  Briefcase,
  Check,
  Award,
  Download,
  Compass,
  Trash2,
  X,
  FileCheck2,
} from 'lucide-react';

export default function ResumeAnalyzer() {
  const { alert: customAlert } = useConfirm();
  // File Upload State (PDF Only)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<any | null>(null);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  // Job Description vs Resume Matching State
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isComparingJob, setIsComparingJob] = useState(false);
  const [jobMatchError, setJobMatchError] = useState<string | null>(null);
  const [jobMatchResult, setJobMatchResult] = useState<any | null>(null);

  // Filter & Inspection State
  const [issuePriorityFilter, setIssuePriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [checkedChecklistItems, setCheckedChecklistItems] = useState<Record<string, boolean>>({});
  const [activeExtractedSection, setActiveExtractedSection] = useState<'SKILLS' | 'EXPERIENCE' | 'PROJECTS' | 'EDUCATION' | 'SUMMARY'>('SKILLS');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Sequence counter to prevent stale asynchronous response repopulation
  const activeRequestSeqRef = useRef<number>(0);

  // File Selection & Drag-and-Drop Handlers
  const validateAndSetFile = (file: File) => {
    setAnalyzeError(null);

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setAnalyzeError('Invalid file type. Only readable PDF (.pdf) documents up to 5 MB are supported in Resume Analyzer.');
      clearResume();
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAnalyzeError('File size exceeds the maximum limit of 5 MB.');
      clearResume();
      return;
    }

    // Invalidate prior request sequence
    activeRequestSeqRef.current++;

    // Immediately clear previous analysis and match results so old results don't show while new resume is pending
    setResumeAnalysis(null);
    setJobMatchResult(null);
    setJobMatchError(null);
    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  // Complete Clear / Remove Resume Handler
  const clearResume = () => {
    // Invalidate any active in-flight request
    activeRequestSeqRef.current++;

    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setResumeAnalysis(null);
    setJobMatchResult(null);
    setJobDescription('');
    setAnalyzeError(null);
    setJobMatchError(null);
  };

  // Run ATS Analysis
  const handleRunAnalysis = async () => {
    setAnalyzeError(null);

    if (!selectedFile) {
      setAnalyzeError('Please select a PDF resume file from your device first.');
      return;
    }

    const currentSeq = ++activeRequestSeqRef.current;
    setIsAnalyzing(true);
    setJobMatchResult(null); // Clear old job comparison results for the new run

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read resume file.'));
        reader.readAsDataURL(selectedFile);
      });

      const payload = {
        fileBase64: base64Data,
        fileName: selectedFile.name,
      };

      const res = await api.post('/careers/resume/analyze', payload);

      // Discard response if user removed or replaced the resume while request was in-flight
      if (currentSeq !== activeRequestSeqRef.current) {
        return;
      }

      setResumeAnalysis(res.data?.data);
    } catch (err: any) {
      if (currentSeq !== activeRequestSeqRef.current) {
        return;
      }
      const msg = err?.response?.data?.message || err?.message || 'Failed to analyze resume.';
      setAnalyzeError(msg);
    } finally {
      if (currentSeq === activeRequestSeqRef.current) {
        setIsAnalyzing(false);
      }
    }
  };

  // Compare Resume Against Pasted Job Description
  const handleCompareResumeWithJob = async () => {
    setJobMatchError(null);

    if (!resumeAnalysis) {
      setJobMatchError('Please upload and run an ATS analysis on your resume above before comparing.');
      return;
    }

    const cleanDesc = jobDescription.trim();
    if (!cleanDesc) {
      setJobMatchError('Please paste a job description with role requirements to compare.');
      return;
    }

    if (cleanDesc.length < 20) {
      setJobMatchError('Job description is too short. Please provide at least 20 characters of requirements.');
      return;
    }

    setIsComparingJob(true);
    try {
      const res = await api.post('/careers/resume/compare-job', {
        jobDescription: cleanDesc,
        analysisId: resumeAnalysis.analysisId,
        jobTitle: 'Target Role',
      });
      setJobMatchResult(res.data?.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to compare resume with job description.';
      setJobMatchError(msg);
    } finally {
      setIsComparingJob(false);
    }
  };

  const handleClearJobDescription = () => {
    setJobDescription('');
    setJobMatchResult(null);
    setJobMatchError(null);
  };

  // Download ATS Diagnostic Report (PDF)
  const handleDownloadReport = async () => {
    if (!resumeAnalysis) return;
    setIsDownloadingReport(true);
    try {
      const res = await api.get('/careers/resume/report/download', {
        params: { analysisId: resumeAnalysis.analysisId },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = (resumeAnalysis.resumeName || 'Resume').replace(/\.[^/.]+$/, '');
      link.setAttribute('download', `${safeName}_ATS_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      customAlert({
        title: 'Download Failed',
        message: 'Failed to download PDF report. Please try again.',
        type: 'error',
      });
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const toggleChecklist = (id: string) => {
    setCheckedChecklistItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredIssues = (resumeAnalysis?.issues || []).filter((issue: any) => {
    if (issuePriorityFilter === 'ALL') return true;
    return issue.priority === issuePriorityFilter;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in pb-16 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#181c1b] tracking-tight">
            AI Resume Analyzer &amp; ATS Scorer
          </h1>
          <p className="text-[#404942] text-sm mt-1 max-w-3xl">
            Upload your resume PDF for ATS scoring, 20+ domain classification, actionable rewrite templates, and targeted job description comparison.
          </p>
        </div>

        {resumeAnalysis && (
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleDownloadReport}
              disabled={isDownloadingReport}
              className="px-4 py-2.5 rounded-full bg-white border border-[#c0c9bf] hover:bg-[#f7faf7] text-[#181c1b] font-bold text-xs transition shadow-sm flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isDownloadingReport ? (
                <RefreshCw className="w-4 h-4 text-[#134e2f] animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-[#134e2f]" />
              )}
              <span>Download ATS Report (PDF)</span>
            </button>

            <Link
              to="/careers"
              className="px-5 py-2.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white font-bold text-xs transition shadow-sm flex items-center gap-2 active:scale-95"
            >
              <Briefcase className="w-4 h-4 text-[#97f3b5]" />
              <span>Matched Opportunities &rarr;</span>
            </Link>
          </div>
        )}
      </div>

      {/* PDF Upload Card */}
      <div className="bg-white border border-[#e2e8e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-[#ecefec] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#181c1b] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#134e2f]" />
              Upload Resume (PDF)
            </h2>
            <p className="text-xs text-[#404942] mt-0.5">
              Direct PDF upload for comprehensive ATS parsing. Accepts documents up to 5 MB.
            </p>
          </div>
          {selectedFile && (
            <button
              onClick={clearResume}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 transition self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Resume</span>
            </button>
          )}
        </div>

        {/* Selected File State vs Dropzone */}
        {selectedFile ? (
          <div className="p-5 rounded-2xl bg-[#f4fbf4] border border-[#a0d2af] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#e8f5e9] border border-[#006d3d]/20 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-6 h-6 text-[#134e2f]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#181c1b] break-all">{selectedFile.name}</p>
                <p className="text-[11px] text-[#404942] mt-0.5">
                  Size: {formatFileSize(selectedFile.size)} • Type: PDF Document
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-full bg-white border border-[#c0c9bf] hover:bg-[#f7faf7] text-xs font-semibold text-[#181c1b] transition shadow-xs"
              >
                Change PDF
              </button>
              <button
                onClick={clearResume}
                className="p-1.5 rounded-full bg-white border border-[#c0c9bf] hover:bg-rose-50 hover:border-rose-300 text-rose-600 transition shadow-xs"
                title="Remove this resume"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition ${isDragging
                ? 'border-[#134e2f] bg-[#e8f5e9]/40'
                : 'border-[#c0c9bf] hover:border-[#134e2f] bg-[#f7faf7]/60 hover:bg-[#e8f5e9]/20'
              }`}
          >
            <UploadCloud className="w-9 h-9 text-[#134e2f] mx-auto mb-2.5" />
            <p className="text-xs font-bold text-[#181c1b]">
              Click to select or drag and drop your resume PDF
            </p>
            <p className="text-[11px] text-[#717971] mt-1">
              Supports standard text-based PDF documents up to 5 MB.
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Validation / Notice Alert */}
        {analyzeError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Resume Upload Notice</p>
              <p>{analyzeError}</p>
            </div>
          </div>
        )}

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <span className="text-[11px] text-[#717971]">
            {resumeAnalysis
              ? `Current Active Resume: ${resumeAnalysis.resumeName} (Evaluated ${new Date(resumeAnalysis.createdAt).toLocaleDateString()})`
              : selectedFile
                ? 'PDF loaded and ready for ATS evaluation.'
                : 'No resume currently selected.'}
          </span>

          <div className="flex items-center gap-2">
            {selectedFile && (
              <button
                onClick={clearResume}
                className="px-4 py-2.5 rounded-full border border-[#c0c9bf] hover:bg-[#f7faf7] text-xs font-semibold text-[#404942] transition"
              >
                Clear
              </button>
            )}

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !selectedFile}
              className="px-6 py-3 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white font-bold text-xs transition shadow-md flex items-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 text-[#97f3b5] animate-spin" />
                  <span>Evaluating Complete Resume &amp; Domain...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#97f3b5]" />
                  <span>Run ATS Resume Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Resume vs Job Description Match Section */}
      <div className="bg-white border border-[#e2e8e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-[#ecefec] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#134e2f] mb-1">
              <Target className="w-4 h-4 text-[#006d3d]" />
              Role-Specific Opportunity Alignment
            </div>
            <h2 className="text-xl font-extrabold text-[#181c1b] tracking-tight">
              Resume vs Job Description Match
            </h2>
            <p className="text-xs text-[#404942] mt-0.5">
              Paste a target job posting to benchmark your resume against specific requirements, uncover critical skill gaps, and view actionable bullet recommendations.
            </p>
          </div>

          {jobDescription && (
            <button
              onClick={handleClearJobDescription}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 transition self-start md:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Job Description</span>
            </button>
          )}
        </div>

        {!resumeAnalysis ? (
          <div className="p-6 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] text-center space-y-2">
            <Info className="w-7 h-7 text-[#134e2f] mx-auto opacity-75" />
            <h4 className="text-xs font-bold text-[#181c1b]">Upload &amp; Analyze a Resume First</h4>
            <p className="text-xs text-[#404942] max-w-md mx-auto">
              Please upload a resume PDF and click <strong>Run ATS Resume Analysis</strong> above. Once evaluated, paste any job description here to run a role-specific comparison.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#181c1b]">
                  Paste Job Description
                </label>
                <span className="text-[11px] text-[#717971]">
                  {jobDescription.length} characters
                </span>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => {
                  setJobDescription(e.target.value);
                  setJobMatchError(null);
                }}
                placeholder="Paste the target job description, responsibilities, required qualifications, and technical stack here..."
                rows={5}
                className="w-full px-4 py-3 rounded-2xl bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white transition"
              />
            </div>

            {/* Error State */}
            {jobMatchError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <p>{jobMatchError}</p>
              </div>
            )}

            {/* Actions Row */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#717971]">
                Benchmarked against active resume: <strong>{resumeAnalysis.resumeName}</strong>
              </span>

              <div className="flex items-center gap-2">
                {jobDescription && (
                  <button
                    onClick={handleClearJobDescription}
                    className="px-4 py-2 rounded-full border border-[#c0c9bf] hover:bg-[#f7faf7] text-xs font-semibold text-[#404942] transition"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={handleCompareResumeWithJob}
                  disabled={isComparingJob || !jobDescription.trim()}
                  className="px-6 py-2.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white font-bold text-xs transition shadow-sm flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isComparingJob ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-[#97f3b5] animate-spin" />
                      <span>Comparing Skills &amp; Keywords...</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-3.5 h-3.5 text-[#97f3b5]" />
                      <span>Compare Resume</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Comparison Results */}
            {jobMatchResult && (
              <div className="pt-4 border-t border-[#ecefec] space-y-6 animate-fade-in">
                {/* Score vs ATS distinction header */}
                <div className="p-5 rounded-2xl bg-[#f4fbf4] border border-[#a0d2af] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-18 h-18 rounded-full bg-white border-3 border-[#006d3d] flex items-center justify-center shrink-0 shadow-xs">
                      <span className="text-2xl font-black text-[#00361c]">
                        {jobMatchResult.matchPercentage}%
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#006d3d]">
                          Job Description Match Score (Role Alignment)
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${jobMatchResult.matchPercentage >= 75
                              ? 'bg-[#e8f5e9] text-[#1b5e20] border border-[#a0d2af]'
                              : jobMatchResult.matchPercentage >= 50
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                        >
                          {jobMatchResult.matchPercentage >= 75
                            ? 'High Alignment'
                            : jobMatchResult.matchPercentage >= 50
                              ? 'Moderate Alignment'
                              : 'Low Alignment'}
                        </span>
                      </div>
                      <p className="text-xs text-[#404942] mt-1 max-w-xl">
                        {jobMatchResult.scoringMethodology?.disclaimer}
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right shrink-0">
                    <span className="text-[11px] text-[#717971] block">Compared with:</span>
                    <span className="text-xs font-bold text-[#181c1b]">{jobMatchResult.resumeName}</span>
                  </div>
                </div>

                {/* Methodology Note */}
                <div className="p-3.5 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] text-[11px] text-[#404942] flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#134e2f] shrink-0 mt-0.5" />
                  <div>
                    <strong>How this score is calculated:</strong> {jobMatchResult.scoringMethodology?.rule}
                  </div>
                </div>

                {/* 2-Column Skill & Keyword Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Matching Skills */}
                  <div className="p-5 rounded-2xl bg-white border border-[#e2e8e2] space-y-3">
                    <h4 className="text-xs font-bold text-[#1b5e20] flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-[#006d3d]" />
                      Matching Skills &amp; Keywords ({jobMatchResult.matchedSkills?.length || 0})
                    </h4>
                    {jobMatchResult.matchedSkills?.length === 0 ? (
                      <p className="text-xs text-[#717971]">No exact skill keywords matched from the job posting.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {jobMatchResult.matchedSkills?.map((skill: string) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#e8f5e9] text-[#1b5e20] text-xs font-semibold border border-[#a0d2af]/60"
                          >
                            <Check className="w-3 h-3 text-[#006d3d]" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {jobMatchResult.matchedKeywords?.length > 0 && (
                      <div className="pt-2 border-t border-[#ecefec]">
                        <span className="text-[11px] font-bold text-[#404942] block mb-1">
                          Role Terminology Matched:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {jobMatchResult.matchedKeywords.map((kw: string) => (
                            <span
                              key={kw}
                              className="px-2 py-0.5 rounded-md bg-[#f4fbf4] text-[#134e2f] text-[11px] font-medium border border-[#e2e8e2]"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Missing Skills */}
                  <div className="p-5 rounded-2xl bg-white border border-[#e2e8e2] space-y-3">
                    <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Missing Skills &amp; Gaps ({jobMatchResult.missingSkills?.length || 0})
                    </h4>
                    {jobMatchResult.missingSkills?.length === 0 ? (
                      <p className="text-xs text-[#006d3d] font-semibold">Great! No major skill gaps detected.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {jobMatchResult.missingSkills?.map((skill: string) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200"
                          >
                            <span className="text-amber-600 font-bold">•</span>
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {jobMatchResult.missingKeywords?.length > 0 && (
                      <div className="pt-2 border-t border-[#ecefec]">
                        <span className="text-[11px] font-bold text-[#404942] block mb-1">
                          Missing Industry Concepts:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {jobMatchResult.missingKeywords.map((kw: string) => (
                            <span
                              key={kw}
                              className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 text-[11px] font-medium border border-rose-200"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Qualification Alignment & Recommendations */}
                <div className="p-5 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] space-y-3">
                  <h4 className="text-xs font-bold text-[#181c1b] uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#134e2f]" />
                    Academic Alignment &amp; Actionable Recommendations
                  </h4>
                  <p className="text-xs text-[#404942]">
                    {jobMatchResult.experienceQualificationAlignment?.summary}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-[#ecefec]">
                    {(jobMatchResult.recommendations || []).map((rec: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#181c1b]">
                        <ArrowRight className="w-3.5 h-3.5 text-[#006d3d] shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analysis Results View */}
      {resumeAnalysis && (
        <div className="space-y-8 animate-fade-in">
          {/* Top Score & Rubric Dimensions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Big Score Card */}
            <div className="bg-white border border-[#e2e8e2] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-semibold text-[#717971] uppercase tracking-wider">
                  Diagnostic Result
                </span>
                <h3 className="text-lg font-bold text-[#181c1b] mt-0.5">
                  ATS-style Resume Score (estimate)
                </h3>
              </div>

              <div className="flex items-center gap-5 my-2">
                <div className="relative w-24 h-24 rounded-full bg-[#e8f5e9] border-4 border-[#006d3d] flex items-center justify-center shrink-0">
                  <span className="text-3xl font-black text-[#00361c]">
                    {resumeAnalysis.overallScore}
                  </span>
                  <span className="text-[11px] text-[#006d3d] font-bold absolute bottom-2">/100</span>
                </div>
                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${resumeAnalysis.overallScore >= 80
                        ? 'bg-[#e8f5e9] text-[#1b5e20]'
                        : resumeAnalysis.overallScore >= 60
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                  >
                    {resumeAnalysis.scoreCategory ||
                      (resumeAnalysis.overallScore >= 80
                        ? 'Strong Competitive Profile'
                        : resumeAnalysis.overallScore >= 60
                          ? 'Moderate ATS Alignment'
                          : 'Needs Section Optimization')}
                  </span>
                  <p className="text-xs text-[#404942] mt-2">
                    Document: <strong>{resumeAnalysis.resumeName}</strong> ({resumeAnalysis.pageCount} {resumeAnalysis.pageCount === 1 ? 'page' : 'pages'})
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3.5 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] text-[11px] text-[#404942] leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-[#134e2f] shrink-0 mt-0.5" />
                <span>{resumeAnalysis.disclaimer}</span>
              </div>
            </div>

            {/* Rubric Breakdown */}
            <div className="lg:col-span-2 bg-white border border-[#e2e8e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[#181c1b]">
                  5-Dimension Rubric Breakdown
                </h3>
                <button
                  onClick={handleDownloadReport}
                  disabled={isDownloadingReport}
                  className="px-3 py-1.5 rounded-full bg-[#f7faf7] hover:bg-[#e8f5e9] text-[#134e2f] font-semibold text-xs border border-[#c0c9bf] flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF Report</span>
                </button>
              </div>

              <div className="space-y-3.5">
                {[
                  {
                    label: 'Parsing & Formatting Quality',
                    score: resumeAnalysis.rubric?.parsingScore || 15,
                    max: 20,
                    desc: 'Text extractability, layout simplicity, standard headings, no multi-column traps.',
                  },
                  {
                    label: 'Section Completeness & Clarity',
                    score: resumeAnalysis.rubric?.sectionScore || 20,
                    max: 25,
                    desc: 'Contact info, education, skills, projects, experience, and summary.',
                  },
                  {
                    label: 'Relevance & Depth of Skills',
                    score: resumeAnalysis.rubric?.skillsScore || 16,
                    max: 20,
                    desc: 'Balance of modern languages, frameworks, developer tools, and fundamentals.',
                  },
                  {
                    label: 'Quality of Projects & Experience',
                    score: resumeAnalysis.rubric?.experienceScore || 18,
                    max: 25,
                    desc: 'Strong action verbs, quantifiable metrics, and demonstrated engineering impact.',
                  },
                  {
                    label: 'ATS Layout & Readability',
                    score: resumeAnalysis.rubric?.formattingScore || 8,
                    max: 10,
                    desc: 'Page length compliance (1-2 pages), bullet density, and date consistency.',
                  },
                ].map((item) => {
                  const pct = Math.round((item.score / item.max) * 100);
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#181c1b]">{item.label}</span>
                        <span className="font-bold text-[#134e2f]">
                          {item.score} / {item.max} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#ecefec] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#134e2f] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-[#717971]">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Industry Domain Classification & Keyword Intelligence Card */}
          {resumeAnalysis.domain && (
            <div className="bg-white border border-[#e2e8e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ecefec] pb-4">
                <div>
                  <span className="text-xs font-semibold text-[#006d3d] uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#006d3d]" /> 20+ Industry Taxonomy Diagnostic
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <h3 className="text-xl font-black text-[#181c1b]">
                      Detected Domain: {resumeAnalysis.domain.primary}
                    </h3>
                    <span className="px-3 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-extrabold border border-[#a0d2af]">
                      {Math.round((resumeAnalysis.domain.confidence || 0.85) * 100)}% Confidence
                    </span>
                  </div>
                  <p className="text-xs text-[#404942] mt-1">
                    {resumeAnalysis.domain.description}
                  </p>
                </div>

                {resumeAnalysis.domain.secondary && (
                  <div className="p-2.5 px-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] text-xs self-start md:self-auto">
                    <span className="text-[#717971] block text-[10px] font-bold uppercase">Secondary Alignment</span>
                    <span className="font-bold text-[#181c1b]">{resumeAnalysis.domain.secondary}</span>
                  </div>
                )}
              </div>

              {/* Keyword Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] space-y-2">
                  <h5 className="font-bold text-xs text-[#181c1b] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#006d3d]" />
                    Detected Domain Keywords
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {(resumeAnalysis.keywordsAnalysis?.found || []).slice(0, 10).map((k: string) => (
                      <span key={k} className="px-2 py-0.5 rounded-md bg-white border border-[#c0c9bf] text-[11px] text-[#181c1b] font-medium">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] space-y-2">
                  <h5 className="font-bold text-xs text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Recommended Domain Skills
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {(resumeAnalysis.keywordsAnalysis?.missing || []).slice(0, 8).map((k: string) => (
                      <span key={k} className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] space-y-2">
                  <h5 className="font-bold text-xs text-[#134e2f] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#134e2f]" />
                    Impact Action Verbs
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {(resumeAnalysis.keywordsAnalysis?.recommended || ['Engineered', 'Optimized', 'Architected', 'Automated']).map((k: string) => (
                      <span key={k} className="px-2 py-0.5 rounded-md bg-white border border-[#c0c9bf] text-[11px] text-[#134e2f] font-bold">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actionable Issues & Rewrites */}
          <div className="bg-white border border-[#e2e8e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ecefec] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#181c1b] flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#134e2f]" />
                  Actionable Bullet Improvements ({filteredIssues.length})
                </h3>
                <p className="text-xs text-[#404942]">
                  Issues detected across clarity, impact, formatting, and ATS readability.
                </p>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setIssuePriorityFilter(p)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${issuePriorityFilter === p
                        ? 'bg-[#134e2f] text-white shadow-xs'
                        : 'bg-[#f7faf7] text-[#404942] hover:text-[#181c1b]'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredIssues.map((issue: any) => (
                <div
                  key={issue.id}
                  className="p-5 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${issue.priority === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : issue.priority === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-[#e8f5e9] text-[#1b5e20]'
                          }`}
                      >
                        {issue.priority} Priority
                      </span>
                      <span className="text-xs font-bold text-[#717971]">
                        {issue.category} Section
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#181c1b]">
                    {issue.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-[#e2e8e2] space-y-1">
                      <span className="font-bold text-rose-700 block text-[11px]">Original Problematic Text</span>
                      <p className="text-[#404942] font-mono text-[11px]">{issue.originalText || 'Not specified'}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-[#e2e8e2] space-y-1">
                      <span className="font-bold text-[#006d3d] block text-[11px]">Suggested Fix</span>
                      <p className="text-[#404942] leading-relaxed">{issue.suggestedFix}</p>
                    </div>
                  </div>

                  {issue.improvedExample && (
                    <div className="p-3.5 rounded-xl bg-[#e8f5e9]/50 border border-[#a0d2af]/60 text-xs space-y-1">
                      <span className="font-bold text-[#1b5e20] text-[11px]">Recommended Bullet Template:</span>
                      <p className="text-[#181c1b] font-mono text-[11px] leading-relaxed">
                        {issue.improvedExample}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Pre-Submission Checklist */}
          <div className="bg-white border border-[#e2e8e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="border-b border-[#ecefec] pb-3">
              <h3 className="text-base font-bold text-[#181c1b] flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#134e2f]" />
                Interactive ATS Pre-Submission Checklist
              </h3>
              <p className="text-xs text-[#404942] mt-0.5">
                Check off items as you make adjustments to your resume document.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(resumeAnalysis.checklist || []).map((chk: any) => {
                const isChecked = checkedChecklistItems[chk.id] ?? chk.passed;
                return (
                  <div
                    key={chk.id}
                    onClick={() => toggleChecklist(chk.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${isChecked
                        ? 'bg-[#e8f5e9]/40 border-[#a0d2af]'
                        : 'bg-white border-[#e2e8e2] hover:border-[#134e2f]'
                      }`}
                  >
                    <div className="mt-0.5 shrink-0 text-[#134e2f]">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#006d3d]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#717971]" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-xs text-[#181c1b]">{chk.label}</h5>
                      <p className="text-[11px] text-[#404942] leading-relaxed">{chk.tip}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extracted Profile Inspector */}
          <div className="bg-white border border-[#e2e8e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ecefec] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#181c1b] flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#134e2f]" />
                  Extracted Profile &amp; Section Inspector
                </h3>
                <p className="text-xs text-[#404942]">
                  Inspect the structured sections extracted from your document.
                </p>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { key: 'SKILLS', label: 'Skills' },
                  { key: 'PROJECTS', label: 'Projects' },
                  { key: 'EXPERIENCE', label: 'Experience' },
                  { key: 'EDUCATION', label: 'Education' },
                  { key: 'SUMMARY', label: 'Summary' },
                ].map((sec) => (
                  <button
                    key={sec.key}
                    onClick={() => setActiveExtractedSection(sec.key as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${activeExtractedSection === sec.key
                        ? 'bg-[#134e2f] text-white shadow-sm'
                        : 'bg-[#f7faf7] text-[#404942] hover:text-[#181c1b]'
                      }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>
            </div>

            {activeExtractedSection === 'SKILLS' && (
              <div className="space-y-4 text-xs">
                <div>
                  <h5 className="font-bold text-[#181c1b] mb-1.5">Programming Languages</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {(resumeAnalysis.extraction?.skills?.languages || []).map((s: string) => (
                      <span key={s} className="px-2.5 py-0.5 rounded-full bg-[#ecefec] text-[#181c1b] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-bold text-[#181c1b] mb-1.5">Frameworks &amp; Libraries</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {(resumeAnalysis.extraction?.skills?.frameworks || []).map((s: string) => (
                      <span key={s} className="px-2.5 py-0.5 rounded-full bg-[#ecefec] text-[#181c1b] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-bold text-[#181c1b] mb-1.5">Developer Tools &amp; Cloud</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {(resumeAnalysis.extraction?.skills?.developerTools || []).map((s: string) => (
                      <span key={s} className="px-2.5 py-0.5 rounded-full bg-[#ecefec] text-[#181c1b] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-bold text-[#181c1b] mb-1.5">Core Computer Science Fundamentals</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {(resumeAnalysis.extraction?.skills?.coreFundamentals || []).map((s: string) => (
                      <span key={s} className="px-2.5 py-0.5 rounded-full bg-[#ecefec] text-[#181c1b] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeExtractedSection === 'PROJECTS' && (
              <div className="space-y-3">
                {(resumeAnalysis.extraction?.projects || []).map((p: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-sm text-[#181c1b]">{p.title}</h5>
                      <div className="flex gap-1">
                        {(p.techStack || []).map((t: string) => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-white border border-[#c0c9bf] text-[10px] text-[#404942]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[#404942]">{p.description}</p>
                  </div>
                ))}
              </div>
            )}

            {activeExtractedSection === 'EXPERIENCE' && (
              <div className="space-y-3">
                {(resumeAnalysis.extraction?.experience || []).length === 0 ? (
                  <p className="text-xs text-[#717971]">No formal employment or internships extracted from text.</p>
                ) : (
                  (resumeAnalysis.extraction?.experience || []).map((exp: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] text-xs space-y-1">
                      <h5 className="font-bold text-sm text-[#181c1b]">{exp.role} at {exp.company}</h5>
                      <span className="text-[11px] text-[#717971]">{exp.duration}</span>
                      <ul className="list-disc list-inside text-[#404942] space-y-0.5 pt-1">
                        {(exp.bullets || []).map((b: string, bIdx: number) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeExtractedSection === 'EDUCATION' && (
              <div className="space-y-3">
                {(resumeAnalysis.extraction?.education || []).map((ed: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] text-xs space-y-1">
                    <h5 className="font-bold text-sm text-[#181c1b]">{ed.degree} - {ed.branch}</h5>
                    <p className="text-[#404942]">{ed.institution}</p>
                    <span className="text-[11px] text-[#717971]">
                      Graduation Year: {ed.graduationYear || '2026'} • GPA: {ed.gpa || 'Not specified'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeExtractedSection === 'SUMMARY' && (
              <div className="p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] text-xs space-y-2">
                <h5 className="font-bold text-xs text-[#181c1b]">Extracted Summary:</h5>
                <p className="text-[#404942] italic">
                  "{resumeAnalysis.extraction?.summary?.text || 'No summary text detected.'}"
                </p>
                <p className="text-[11px] text-[#006d3d] font-semibold">
                  Assessment: {resumeAnalysis.extraction?.summary?.assessment}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="p-6 rounded-3xl bg-[#f7faf7] border border-[#e2e8e2] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-[#181c1b]">Export Your Diagnostic Report</h4>
              <p className="text-xs text-[#717971]">Download a complete, formatted PDF evaluation report with actionable rewrite templates.</p>
            </div>
            <button
              onClick={handleDownloadReport}
              disabled={isDownloadingReport}
              className="px-6 py-3 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white font-bold text-xs transition shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isDownloadingReport ? (
                <RefreshCw className="w-4 h-4 text-[#97f3b5] animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-[#97f3b5]" />
              )}
              <span>Download PDF Diagnostic Report</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
