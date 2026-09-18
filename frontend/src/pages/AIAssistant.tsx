import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  Copy, 
  Check, 
  AlertTriangle, 
  HelpCircle, 
  Trash2, 
  Search,
  BookOpen,
  Zap,
  Terminal,
  FileQuestion,
  ChevronRight,
  PlusCircle,
  GraduationCap
} from 'lucide-react';

export default function AIAssistant() {
  const { profile } = useAuth();

  const [question, setQuestion] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Operating Systems');
  const [mode, setMode] = useState<'THEORY' | 'CODE' | 'LAB' | 'INTERVIEW' | 'PYQ'>('THEORY');
  
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchHistory, setSearchHistory] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'BOOKMARKS'>('ALL');

  useEffect(() => {
    fetchSubjects();
    fetchHistory();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/profile/subjects');
      setSubjectsList(res.data.data.subjects || []);
      if (res.data.data.subjects?.length > 0) {
        setSelectedSubject(res.data.data.subjects[0].name);
      }
    } catch (e) {}
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/ai/history');
      setHistory(res.data.data.history || []);
    } catch (e) {}
  };

  const handleAskAI = async (e?: React.FormEvent, promptOverride?: string) => {
    if (e) e.preventDefault();
    const query = promptOverride || question;

    if (!query.trim()) return;

    try {
      setIsLoading(true);
      const res = await api.post('/ai/chat', {
        question: query,
        subject: selectedSubject,
        mode: mode,
      });

      const newInteraction = res.data.data.interaction;
      setActiveChat(newInteraction);
      setQuestion('');
      await fetchHistory();
    } catch (err: any) {
      console.error('AI chat failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: any) => {
    setActiveChat(item);
  };

  const handleToggleBookmark = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/ai/bookmark/${id}`, {
        isBookmarked: !currentStatus,
      });
      setHistory((prev) =>
        prev.map((h) => (h.id === id ? { ...h, isBookmarked: !currentStatus } : h))
      );
      if (activeChat?.id === id) {
        setActiveChat((prev: any) => ({ ...prev, isBookmarked: !currentStatus }));
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await api.delete(`/ai/history/${id}`);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      if (activeChat?.id === id) {
        setActiveChat(null);
      }
    } catch (err) {
      console.error('Delete history error:', err);
    }
  };

  const handleClearAllHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all chat history?')) return;
    try {
      await api.delete('/ai/history');
      setHistory([]);
      setActiveChat(null);
    } catch (err) {
      console.error('Clear all history error:', err);
    }
  };

  const handleCopyAnswer = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredHistory = history.filter((h) => {
    const matchesSearch = h.question.toLowerCase().includes(searchHistory.toLowerCase()) ||
                          h.subject.toLowerCase().includes(searchHistory.toLowerCase());
    if (activeTab === 'BOOKMARKS') {
      return matchesSearch && h.isBookmarked;
    }
    return matchesSearch;
  });

  const quickPrompts = [
    { text: 'Explain Deadlock & Banker’s Algorithm', subject: 'Operating Systems', mode: 'THEORY' },
    { text: 'Write Binary Search with O(log N) in C++', subject: 'Data Structures', mode: 'CODE' },
    { text: 'Top 5 Database Normalization Interview Questions', subject: 'Database Management Systems', mode: 'INTERVIEW' },
    { text: 'Explain TCP vs UDP Header Differences', subject: 'Computer Networks', mode: 'THEORY' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Top AI Header Banner */}
      <div className="stitch-card p-6 sm:p-8 bg-white border border-[#e2e8e2] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#134e2f] text-white flex items-center justify-center shadow-sm shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#006d3d]" /> Academic AI Tutoring Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#181c1b] tracking-tight">AI Academic Assistant</h1>
            <p className="text-[#404942] text-xs sm:text-sm mt-0.5">
              Syllabus Context: {profile?.university || 'VTU'} • {profile?.branch || 'CS'} • Semester {profile?.semester || 6}
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {['THEORY', 'CODE', 'LAB', 'INTERVIEW', 'PYQ'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                mode === m
                  ? 'bg-[#134e2f] text-white shadow-sm'
                  : 'bg-[#f0f4f0] text-[#181c1b] hover:bg-[#e1e9e1] border border-[#e2e8e2]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Drawer: Subject Scope & History */}
        <div className="lg:col-span-4 space-y-4">
          <div className="stitch-card p-5 space-y-4 bg-white">
            <button
              onClick={() => setActiveChat(null)}
              className="w-full py-2.5 px-4 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Query</span>
            </button>

            {/* Subject Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#404942]">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#006d3d]" /> Subject Scope:
                </span>
              </div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#f7faf7] border border-[#c0c9bf] text-xs font-semibold text-[#181c1b] focus:border-[#134e2f] outline-none"
              >
                {subjectsList.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* History Tabs & Search */}
            <div className="pt-2 border-t border-[#e2e8e2] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab('ALL')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      activeTab === 'ALL'
                        ? 'bg-[#134e2f] text-white'
                        : 'text-[#404942] hover:bg-[#f0f4f0]'
                    }`}
                  >
                    Recent
                  </button>
                  <button
                    onClick={() => setActiveTab('BOOKMARKS')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition flex items-center gap-1 ${
                      activeTab === 'BOOKMARKS'
                        ? 'bg-[#134e2f] text-white'
                        : 'text-[#404942] hover:bg-[#f0f4f0]'
                    }`}
                  >
                    <Bookmark className="w-3 h-3" /> Saved
                  </button>
                </div>

                {history.length > 0 && (
                  <button
                    onClick={handleClearAllHistory}
                    className="text-[11px] text-rose-600 hover:underline"
                    title="Clear history"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  placeholder="Search past chats..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] placeholder-gray-400 outline-none"
                />
              </div>
            </div>

            {/* History List */}
            <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
              {filteredHistory.length === 0 ? (
                <p className="text-center text-xs text-[#717971] py-6">
                  {activeTab === 'BOOKMARKS' ? 'No bookmarked queries' : 'No query history yet'}
                </p>
              ) : (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectHistory(item)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition flex items-start justify-between gap-2 ${
                      activeChat?.id === item.id
                        ? 'bg-[#e8f5e9] border-[#97f3b5] text-[#00361c]'
                        : 'bg-[#f7faf7] hover:bg-white border-[#e2e8e2] text-[#181c1b]'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{item.question}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[#404942] mt-0.5">
                        <span className="truncate">{item.subject}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleBookmark(item.id, item.isBookmarked);
                        }}
                        className="p-1 hover:text-[#006d3d] text-[#717971]"
                      >
                        {item.isBookmarked ? (
                          <BookmarkCheck className="w-3.5 h-3.5 text-[#006d3d]" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistory(item.id);
                        }}
                        className="p-1 hover:text-rose-600 text-gray-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Canvas: Chat & AI Output */}
        <div className="lg:col-span-8 space-y-4">
          {/* Ask Input Form */}
          <div className="stitch-card p-5 bg-white space-y-3">
            <form onSubmit={handleAskAI} className="relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask any concept, algorithm, formula derivation, or exam question..."
                rows={3}
                className="w-full p-4 pr-12 rounded-2xl bg-[#f7faf7] border border-[#c0c9bf] focus:border-[#134e2f] focus:bg-white text-xs sm:text-sm text-[#181c1b] placeholder-gray-400 outline-none transition resize-none"
              />
              <button
                type="submit"
                disabled={isLoading || !question.trim()}
                className="absolute right-3.5 bottom-4 p-2.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white disabled:opacity-40 transition shadow-sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>

            {/* Quick Prompts */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-[#404942] uppercase tracking-wider">
                Quick Prompts:
              </span>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedSubject(qp.subject);
                      setMode(qp.mode as any);
                      handleAskAI(undefined, qp.text);
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#f0f4f0] hover:bg-[#e1e9e1] border border-[#e2e8e2] text-[11px] font-semibold text-[#181c1b] transition"
                  >
                    {qp.text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Chat Conversation Card */}
          {activeChat ? (
            <div className="stitch-card p-6 sm:p-8 bg-white space-y-6">
              {/* Question bubble */}
              <div className="flex justify-end">
                <div className="max-w-2xl bg-[#134e2f] text-white p-4 rounded-2xl rounded-tr-sm shadow-sm">
                  <div className="flex items-center justify-between gap-4 text-[10px] text-emerald-200/90 font-semibold mb-1">
                    <span>You • {activeChat.subject}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">{activeChat.mode}</span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed">{activeChat.question}</p>
                </div>
              </div>

              {/* AI Answer bubble */}
              <div className="flex items-start gap-3.5 max-w-3xl">
                <div className="w-9 h-9 rounded-full bg-[#e8f5e9] text-[#006d3d] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 bg-[#f7faf7] border border-[#e2e8e2] p-5 sm:p-6 rounded-2xl rounded-tl-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e2e8e2]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#00361c]">Academic Assistant</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-[10px] font-semibold">
                        Syllabus Aligned
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyAnswer(activeChat.answer)}
                        className="px-2.5 py-1 rounded-full bg-white border border-[#c0c9bf] hover:bg-gray-50 text-xs font-semibold text-[#181c1b] flex items-center gap-1 transition"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-[#006d3d]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => handleToggleBookmark(activeChat.id, activeChat.isBookmarked)}
                        className="p-1.5 rounded-full bg-white border border-[#c0c9bf] hover:bg-gray-50 text-[#181c1b] transition"
                        title="Save to bookmarks"
                      >
                        {activeChat.isBookmarked ? (
                          <BookmarkCheck className="w-3.5 h-3.5 text-[#006d3d]" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Render Answer Text */}
                  <div className="text-xs sm:text-sm text-[#181c1b] leading-relaxed whitespace-pre-wrap font-sans">
                    {activeChat.answer}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="stitch-card p-12 text-center space-y-4 bg-white">
              <div className="w-14 h-14 rounded-full bg-[#e8f5e9] text-[#006d3d] flex items-center justify-center mx-auto shadow-sm">
                <Bot className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#181c1b]">Ready for Your Academic Questions</h3>
                <p className="text-xs text-[#404942] max-w-md mx-auto">
                  Ask questions about algorithms, operating systems, compiler design, database proofs, or interview preparation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
