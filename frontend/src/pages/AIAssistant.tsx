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
  FileQuestion
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
        mode,
      });

      const newEntry = res.data.data;
      setActiveChat(newEntry);
      setHistory((prev) => [newEntry, ...prev]);
      if (!promptOverride) setQuestion('');
    } catch (err: any) {
      console.error('Ask AI Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBookmark = async (id: string) => {
    try {
      const res = await api.post(`/ai/bookmark/${id}`);
      const isBookmarked = res.data.data.isBookmarked;

      setHistory((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isBookmarked } : item))
      );

      if (activeChat && activeChat.id === id) {
        setActiveChat((prev: any) => ({ ...prev, isBookmarked }));
      }
    } catch (e) {}
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await api.delete(`/ai/history/${id}`);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (activeChat && activeChat.id === id) {
        setActiveChat(null);
      }
    } catch (e) {}
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.question.toLowerCase().includes(searchHistory.toLowerCase());
    const matchesTab = activeTab === 'ALL' || (activeTab === 'BOOKMARKS' && item.isBookmarked);
    return matchesSearch && matchesTab;
  });

  const quickPrompts = [
    { text: 'Explain Deadlock & Banker’s Algorithm', subject: 'Operating Systems', mode: 'THEORY' },
    { text: 'Write Binary Search with O(log N) in C++', subject: 'Data Structures', mode: 'CODE' },
    { text: 'Top 5 Database Normalization Interview Questions', subject: 'Database Management Systems', mode: 'INTERVIEW' },
    { text: 'Explain TCP vs UDP Header Differences', subject: 'Computer Networks', mode: 'THEORY' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top AI Header */}
      <div className="eduflow-card p-6 bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/70 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-indigo-400" /> GPT-4 Academic Engine
            </div>
            <h1 className="text-2xl font-extrabold text-white font-sans">AI Study Assistant</h1>
            <p className="text-slate-400 text-xs font-mono mt-0.5">
              Target Context: {profile?.university || 'VTU'} • {profile?.branch || 'CS'} • Sem {profile?.semester || 6}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['THEORY', 'CODE', 'LAB', 'INTERVIEW', 'PYQ'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 ${
                mode === m
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Columns: Chat Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Question Input Form */}
          <div className="eduflow-card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono font-bold text-slate-300">Selected Subject:</span>
              </div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-indigo-300 outline-none focus:border-indigo-500 transition"
              >
                {subjectsList.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleAskAI} className="relative">
              <textarea
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={`Ask any ${selectedSubject} question... (e.g. "Explain with step-by-step example" or "Write implementation in C++")`}
                className="w-full pl-4 pr-28 py-3 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs font-sans outline-none resize-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={isLoading || !question.trim()}
                className="btn-shimmer absolute right-3 bottom-3.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Analyzing...</span>
                ) : (
                  <>
                    <span>Ask AI</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Prompts:</span>
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedSubject(qp.subject);
                    setMode(qp.mode as any);
                    setQuestion(qp.text);
                    handleAskAI(undefined, qp.text);
                  }}
                  className="px-3 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-semibold transition-all flex items-center gap-1.5 hover:scale-[1.02]"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{qp.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active AI Answer Display */}
          {activeChat ? (
            <div className="eduflow-card p-6 sm:p-8 space-y-6 relative border border-indigo-500/30 shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="eduflow-pill">
                      {activeChat.subject}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">• {new Date(activeChat.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white font-sans">{activeChat.question}</h2>
                </div>

                <button
                  onClick={() => handleToggleBookmark(activeChat.id)}
                  className={`p-2.5 rounded-xl border transition ${
                    activeChat.isBookmarked
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Bookmark Answer"
                >
                  {activeChat.isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
              </div>

              {/* Response Content */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-mono font-bold uppercase text-indigo-400 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-indigo-400" /> Concept & Academic Explanation
                  </h3>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    {activeChat.aiResponse.explanation}
                  </p>
                </div>

                {activeChat.aiResponse.keyPoints?.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" /> Key Takeaway Points
                    </h3>
                    <ul className="space-y-1.5">
                      {activeChat.aiResponse.keyPoints.map((pt: string, i: number) => (
                        <li key={i} className="text-xs text-slate-200 flex items-start gap-2 bg-slate-900/60 px-3.5 py-2.5 rounded-xl border border-slate-800/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeChat.aiResponse.codeSnippet && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-cyan-400" /> Implementation ({activeChat.aiResponse.language || 'cpp'})
                      </h3>
                      <button
                        onClick={() => handleCopyCode(activeChat.aiResponse.codeSnippet)}
                        className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold flex items-center gap-1 transition"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                    </div>

                    <pre className="p-4 rounded-xl bg-slate-950 text-cyan-300 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
                      <code>{activeChat.aiResponse.codeSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="eduflow-card p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base font-sans">Ready for Q&A</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Type your syllabus query or click any suggested question to generate formatted academic answers.
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Column: Saved Conversations */}
        <div className="space-y-4">
          <div className="eduflow-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-xs font-sans">Saved Q&A History</h3>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
                    activeTab === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('BOOKMARKS')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
                    activeTab === 'BOOKMARKS' ? 'bg-amber-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Saved
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredHistory.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4 font-mono">No entries found.</p>
              ) : (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveChat(item)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start justify-between gap-2 group ${
                      activeChat?.id === item.id
                        ? 'bg-indigo-600/20 text-white border-indigo-500/50 shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-indigo-500/30 text-slate-300'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {item.isBookmarked && <Bookmark className="w-3 h-3 text-amber-400 shrink-0" />}
                        <span className={`text-[10px] font-mono font-bold uppercase ${activeChat?.id === item.id ? 'text-indigo-300' : 'text-indigo-400'}`}>
                          {item.subject}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold truncate group-hover:text-indigo-300">
                        {item.question}
                      </h4>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteHistory(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
