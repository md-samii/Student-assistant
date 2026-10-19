import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';
import { api } from '../services/api';
import {
  Video,
  Play,
  ExternalLink,
  Search,
  Sparkles,
  X,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart2,
  RefreshCw,
  Layers,
  Tv,
  ArrowRight,
  Check,
  Trash2,
} from 'lucide-react';

interface SubjectItem {
  code: string;
  name: string;
  semester: number;
  modulesCount?: number;
  courseType?: string;
}

interface CurriculumModule {
  moduleNumber: number;
  title: string;
  description?: string;
}

interface VideoItem {
  id: string;
  youtubeVideoId: string;
  title: string;
  description?: string;
  channelTitle?: string;
  thumbnailUrl: string;
  publishedAt?: string;
  subjectCode?: string;
  subjectName?: string;
  moduleNumber?: number;
  isFavorite?: boolean;
  progressStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  lastWatchedAt?: string;
}

interface LibraryStats {
  totalTracked: number;
  completedCount: number;
  inProgressCount: number;
  favoritesCount: number;
}

export default function VideoRecommendations() {
  const { profile } = useAuth();
  const { confirm, alert: customAlert } = useConfirm();

  // Top-level Navigation Sections: 'explore' | 'favorites' | 'analytics'
  const [activeTab, setActiveTab] = useState<'explore' | 'favorites' | 'analytics'>('explore');

  // Subjects & Modules
  const [subjectsList, setSubjectsList] = useState<SubjectItem[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);
  const [modulesList, setModulesList] = useState<CurriculumModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<number | 'ALL'>('ALL');

  // Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // Video Search Results
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [apiError, setApiError] = useState<{ code?: string; message: string } | null>(null);

  // User Library (Saved & Tracked)
  const [libraryVideos, setLibraryVideos] = useState<VideoItem[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [libraryStats, setLibraryStats] = useState<LibraryStats>({
    totalTracked: 0,
    completedCount: 0,
    inProgressCount: 0,
    favoritesCount: 0,
  });

  // Modal Video Player
  const [activeVideoModal, setActiveVideoModal] = useState<VideoItem | null>(null);

  // Load personalized subjects based on student's current profile semester
  useEffect(() => {
    fetchPersonalizedSubjects();
  }, [profile?.semester]);

  // Load modules whenever selectedSubject changes
  useEffect(() => {
    if (selectedSubject?.code) {
      fetchSubjectModules(selectedSubject.code);
    } else {
      setModulesList([]);
    }
    setSelectedModule('ALL');
  }, [selectedSubject?.code]);

  // Fetch videos when search parameters change (only in explore tab)
  useEffect(() => {
    if (selectedSubject && activeTab === 'explore') {
      fetchVideos();
    }
  }, [selectedSubject?.code, selectedModule, activeTab]);

  // Fetch user library on mount or tab change
  useEffect(() => {
    fetchUserLibrary();
  }, [activeTab]);

  const fetchPersonalizedSubjects = async () => {
    try {
      const res = await api.get('/profile/subjects');
      const list: SubjectItem[] = res.data?.data?.subjects || [];
      setSubjectsList(list);

      if (list.length > 0) {
        const match = list.find((s) => s.code === selectedSubject?.code);
        setSelectedSubject(match || list[0]);
      } else {
        setSelectedSubject(null);
      }
    } catch (err) {
      console.error('Failed to load personalized subjects:', err);
      setSubjectsList([]);
      setSelectedSubject(null);
    }
  };

  const fetchSubjectModules = async (subjectCode: string) => {
    try {
      const res = await api.get('/videos/curriculum/modules', {
        params: { subjectCode },
      });
      const mods = res.data?.data?.modules || [];
      setModulesList(mods);
    } catch (err) {
      console.warn('Failed to load modules for subject:', err);
      setModulesList([1, 2, 3, 4, 5].map((m) => ({ moduleNumber: m, title: `Module ${m}` })));
    }
  };

  const fetchVideos = async (manualSearchText?: string) => {
    if (!selectedSubject) return;

    try {
      setIsLoadingVideos(true);
      setApiError(null);

      const params: any = {
        subjectCode: selectedSubject.code,
        subjectName: selectedSubject.name,
      };

      if (selectedModule !== 'ALL') {
        params.moduleNumber = selectedModule;
        const modObj = modulesList.find((m) => m.moduleNumber === selectedModule);
        if (modObj) {
          params.moduleTitle = modObj.title;
        }
      }

      const q = manualSearchText !== undefined ? manualSearchText : searchQuery;
      if (q.trim()) {
        params.search = q.trim();
      }

      const res = await api.get('/videos', { params });
      const videoResults = res.data?.data?.videos || [];
      setVideos(videoResults);
    } catch (err: any) {
      const errData = err?.response?.data;
      const code = errData?.code || '';
      const message =
        errData?.message ||
        err?.message ||
        'Failed to fetch video recommendations from YouTube.';

      setApiError({ code, message });
      setVideos([]);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const fetchUserLibrary = async () => {
    try {
      setIsLoadingLibrary(true);
      const res = await api.get('/videos/user/library');
      const data = res.data?.data;
      if (data) {
        setLibraryVideos(data.tracked || []);
        setLibraryStats(
          data.stats || {
            totalTracked: 0,
            completedCount: 0,
            inProgressCount: 0,
            favoritesCount: 0,
          }
        );
      }
    } catch (err) {
      console.warn('Failed to fetch user library:', err);
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (video: VideoItem) => {
    const newFavoriteStatus = !video.isFavorite;

    // Optimistically update local state
    setVideos((prev) =>
      prev.map((v) =>
        v.youtubeVideoId === video.youtubeVideoId ? { ...v, isFavorite: newFavoriteStatus } : v
      )
    );

    setLibraryVideos((prev) => {
      const exists = prev.find((v) => v.youtubeVideoId === video.youtubeVideoId);
      if (exists) {
        return prev.map((v) =>
          v.youtubeVideoId === video.youtubeVideoId ? { ...v, isFavorite: newFavoriteStatus } : v
        );
      }
      return [{ ...video, isFavorite: newFavoriteStatus }, ...prev];
    });

    if (activeVideoModal?.youtubeVideoId === video.youtubeVideoId) {
      setActiveVideoModal({ ...activeVideoModal, isFavorite: newFavoriteStatus });
    }

    try {
      await api.post('/videos/user/favorite', {
        youtubeVideoId: video.youtubeVideoId,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        channelTitle: video.channelTitle,
        subjectCode: video.subjectCode || selectedSubject?.code,
        moduleNumber: video.moduleNumber || (selectedModule !== 'ALL' ? selectedModule : null),
        isFavorite: newFavoriteStatus,
      });
      fetchUserLibrary();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      fetchUserLibrary();
    }
  };

  // Update Progress Status
  const handleUpdateProgress = async (
    video: VideoItem,
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  ) => {
    // Optimistically update local state
    setVideos((prev) =>
      prev.map((v) =>
        v.youtubeVideoId === video.youtubeVideoId ? { ...v, progressStatus: status } : v
      )
    );

    setLibraryVideos((prev) => {
      const exists = prev.find((v) => v.youtubeVideoId === video.youtubeVideoId);
      if (exists) {
        return prev.map((v) =>
          v.youtubeVideoId === video.youtubeVideoId ? { ...v, progressStatus: status } : v
        );
      }
      return [{ ...video, progressStatus: status }, ...prev];
    });

    if (activeVideoModal?.youtubeVideoId === video.youtubeVideoId) {
      setActiveVideoModal({ ...activeVideoModal, progressStatus: status });
    }

    try {
      await api.post('/videos/user/progress', {
        youtubeVideoId: video.youtubeVideoId,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        channelTitle: video.channelTitle,
        subjectCode: video.subjectCode || selectedSubject?.code,
        moduleNumber: video.moduleNumber || (selectedModule !== 'ALL' ? selectedModule : null),
        status,
      });
      fetchUserLibrary();
    } catch (err) {
      console.error('Failed to update progress:', err);
      fetchUserLibrary();
    }
  };

  // Open Video in Modal Player
  const handleOpenVideo = (video: VideoItem) => {
    setActiveVideoModal(video);
    if (!video.progressStatus || video.progressStatus === 'NOT_STARTED') {
      handleUpdateProgress(video, 'IN_PROGRESS');
    }
  };

  // Clear all video learning history
  const handleClearHistory = async () => {
    const confirmClear = await confirm({
      title: 'Clear Video History?',
      message: 'Are you sure you want to clear your video learning history? Bookmarked favorites will remain preserved.',
      confirmText: 'Clear History',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (!confirmClear) return;

    try {
      await api.delete('/videos/user/history');
      await fetchUserLibrary();
    } catch (err: any) {
      console.error('Failed to clear video history:', err);
      customAlert({
        title: 'Clear History Failed',
        message: 'Error clearing history: ' + (err.response?.data?.message || err.message),
        type: 'error',
      });
    }
  };

  // Remove single video from history
  const handleRemoveHistoryItem = async (videoId: string) => {
    try {
      await api.delete(`/videos/user/history/${videoId}`);
      await fetchUserLibrary();
    } catch (err: any) {
      console.error('Failed to remove history item:', err);
    }
  };

  // Extract saved favorites
  const favoriteVideos = libraryVideos.filter((v) => v.isFavorite);

  // Group tracked videos by subject for analytics
  const subjectProgressMap = new Map<
    string,
    { subjectCode: string; total: number; completed: number; inProgress: number }
  >();

  for (const v of libraryVideos) {
    const code = v.subjectCode || 'General';
    if (!subjectProgressMap.has(code)) {
      subjectProgressMap.set(code, { subjectCode: code, total: 0, completed: 0, inProgress: 0 });
    }
    const item = subjectProgressMap.get(code)!;
    item.total += 1;
    if (v.progressStatus === 'COMPLETED') item.completed += 1;
    if (v.progressStatus === 'IN_PROGRESS') item.inProgress += 1;
  }

  const subjectProgressList = Array.from(subjectProgressMap.values());
  const completionRate =
    libraryStats.totalTracked > 0
      ? Math.round((libraryStats.completedCount / libraryStats.totalTracked) * 100)
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-16 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#181c1b] tracking-tight">
            Academic Video Lectures
          </h1>
          <p className="text-xs sm:text-sm text-[#404942] mt-1">
            Top-rated engineering educators mapped directly to{' '}
            <span className="font-semibold text-[#134e2f]">
              {profile?.branch || 'Computer Science & Engineering'}
            </span>{' '}
            syllabus modules.
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e2e8e2] pb-1">
        <button
          onClick={() => setActiveTab('explore')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${activeTab === 'explore'
            ? 'bg-[#134e2f] text-white shadow-sm'
            : 'text-[#404942] hover:text-[#181c1b] hover:bg-[#f0f4f0]'
            }`}
        >
          <Video className="w-4 h-4" />
          <span>Explore Lectures</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${activeTab === 'favorites'
            ? 'bg-[#134e2f] text-white shadow-sm'
            : 'text-[#404942] hover:text-[#181c1b] hover:bg-[#f0f4f0]'
            }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Favorites</span>
          {libraryStats.favoritesCount > 0 && (
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'favorites'
                ? 'bg-white/20 text-white'
                : 'bg-[#e8f5e9] text-[#134e2f]'
                }`}
            >
              {libraryStats.favoritesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 ${activeTab === 'analytics'
            ? 'bg-[#134e2f] text-white shadow-sm'
            : 'text-[#404942] hover:text-[#181c1b] hover:bg-[#f0f4f0]'
            }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Learning Analytics &amp; Progress</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: EXPLORE LECTURES                                               */}
      {/* ========================================================================= */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Subject Selector & Search Card (Styled exactly like Study Resources) */}
          <div className="stitch-card p-5 space-y-4 bg-white border border-[#e2e8e2]">

            {/* Subject Selector & Search Bar (Exact Study Resources Pattern) */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {subjectsList.map((s) => (
                  <button
                    key={s.code}
                    onClick={() => setSelectedSubject(s)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${selectedSubject?.code === s.code
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') fetchVideos(searchQuery);
                  }}
                  placeholder="Search lectures, topics..."
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] placeholder-gray-400 outline-none focus:border-[#134e2f]"
                />
              </div>
            </div>

            {/* Module Filter (Exact Study Resources Pattern) */}
            <div className="flex flex-wrap items-center gap-2 border-t border-[#e2e8e2] pt-3">
              <span className="text-xs font-semibold text-[#404942] mr-2">Module:</span>
              <button
                onClick={() => setSelectedModule('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${selectedModule === 'ALL'
                  ? 'bg-[#134e2f] text-white'
                  : 'bg-[#f0f4f0] text-[#181c1b] hover:bg-[#e1e9e1]'
                  }`}
              >
                All Modules
              </button>
              {modulesList.map((mod) => (
                <button
                  key={mod.moduleNumber}
                  onClick={() => setSelectedModule(mod.moduleNumber)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${selectedModule === mod.moduleNumber
                    ? 'bg-[#134e2f] text-white'
                    : 'bg-[#f0f4f0] text-[#181c1b] hover:bg-[#e1e9e1]'
                    }`}
                  title={mod.title}
                >
                  Module {mod.moduleNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Missing Alert Banner (Green & Neutral Themed) */}
          {apiError && (
            <div className="p-4 rounded-2xl border border-[#c0c9bf] bg-[#f0f9f4] text-[#181c1b] flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#134e2f]" />
              <div className="space-y-1 text-xs">
                <div className="font-bold text-sm text-[#134e2f]">
                  {apiError.code === 'YOUTUBE_API_KEY_MISSING'
                    ? 'YouTube Data API Key Required'
                    : 'YouTube Search Error'}
                </div>
                <p className="text-[#404942] leading-relaxed">{apiError.message}</p>
                {apiError.code === 'YOUTUBE_API_KEY_MISSING' && (
                  <div className="mt-2 text-[11px] bg-white p-2.5 rounded-xl border border-[#c0c9bf] font-mono text-[#181c1b]">
                    To enable live search, add your key to <strong>backend/.env</strong>:
                    <br />
                    <code>YOUTUBE_API_KEY="your_google_cloud_youtube_data_api_v3_key"</code>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Search Context Bar */}
          {selectedSubject && (
            <div className="flex items-center justify-between text-xs text-[#717971] px-1">
              <span>
                Showing lectures for{' '}
                <strong className="text-[#181c1b]">
                  {selectedSubject.code} — {selectedSubject.name}
                </strong>
                {selectedModule !== 'ALL' && (
                  <span className="font-medium text-[#134e2f]"> (Module {selectedModule})</span>
                )}
              </span>
              <span>{videos.length} lectures available</span>
            </div>
          )}

          {/* Videos Grid */}
          {isLoadingVideos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-72 rounded-3xl bg-white animate-pulse border border-[#e2e8e2]"
                />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="stitch-card p-12 text-center space-y-3 bg-white border border-[#e2e8e2]">
              <Tv className="w-12 h-12 text-[#c0c9bf] mx-auto" />
              <h3 className="font-bold text-[#181c1b] text-base">No Video Lectures Found</h3>
              <p className="text-xs text-[#404942] max-w-md mx-auto">
                {apiError
                  ? 'Configure the YouTube Data API key in backend/.env to search live academic videos.'
                  : 'Try selecting "All Modules", clearing your keyword search, or choosing another educator.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((vid) => (
                <ThemeVideoCard
                  key={vid.youtubeVideoId}
                  video={vid}
                  onOpen={handleOpenVideo}
                  onToggleFavorite={handleToggleFavorite}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: SAVED FAVORITES (DEDICATED SECTION)                            */}
      {/* ========================================================================= */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#181c1b]">Saved Favorite Lectures</h2>
              <p className="text-xs sm:text-sm text-[#404942] mt-0.5">
                Quick access to lectures you have bookmarked for exam revision.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] border border-[#a5d6a7]">
                {favoriteVideos.length} Saved Lecture{favoriteVideos.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {isLoadingLibrary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-72 rounded-3xl bg-white animate-pulse border border-[#e2e8e2]"
                />
              ))}
            </div>
          ) : favoriteVideos.length === 0 ? (
            <div className="stitch-card p-12 text-center space-y-4 bg-white border border-[#e2e8e2]">
              <Bookmark className="w-12 h-12 text-[#c0c9bf] mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-[#181c1b] text-base">No Favorite Lectures Yet</h3>
                <p className="text-xs text-[#404942] max-w-sm mx-auto">
                  Click the bookmark icon on any lecture card to save it here for fast revision.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('explore')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#134e2f] hover:bg-[#006d3d] text-white text-xs font-bold transition shadow-sm"
              >
                <span>Browse Recommended Lectures</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteVideos.map((vid) => (
                <ThemeVideoCard
                  key={vid.youtubeVideoId}
                  video={vid}
                  onOpen={handleOpenVideo}
                  onToggleFavorite={handleToggleFavorite}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: LEARNING ANALYTICS & PROGRESS (DEDICATED SECTION)              */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Header & Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#181c1b]">
                Video Learning Analytics &amp; Progress
              </h2>
              <p className="text-xs sm:text-sm text-[#404942] mt-0.5">
                Personal watch telemetry and syllabus completion velocity for your verified account.
              </p>
            </div>

            <button
              onClick={fetchUserLibrary}
              disabled={isLoadingLibrary}
              className="px-4 py-2 rounded-full border border-[#c0c9bf] bg-white hover:bg-[#f0f4f0] text-xs font-semibold text-[#181c1b] flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLibrary ? 'animate-spin' : ''}`} />
              <span>Refresh Progress</span>
            </button>
          </div>

          {/* Metric Cards (Styled exactly like QuizSystem stats) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stitch-card p-5 bg-white border border-[#e2e8e2]">
              <p className="text-xs font-semibold text-[#404942]">Total Tracked Lectures</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#134e2f] mt-1">
                {libraryStats.totalTracked}
              </p>
              <p className="text-[11px] text-[#404942] mt-1">Active study sessions</p>
            </div>

            <div className="stitch-card p-5 bg-white border border-[#e2e8e2]">
              <p className="text-xs font-semibold text-[#404942]">Completed Lectures</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#006d3d] mt-1">
                {libraryStats.completedCount}
              </p>
              <p className="text-[11px] text-[#404942] mt-1">Syllabus topics finished</p>
            </div>

            <div className="stitch-card p-5 bg-white border border-[#e2e8e2]">
              <p className="text-xs font-semibold text-[#404942]">In Progress</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#134e2f] mt-1">
                {libraryStats.inProgressCount}
              </p>
              <p className="text-[11px] text-[#404942] mt-1">Currently being watched</p>
            </div>

            <div className="stitch-card p-5 bg-white border border-[#e2e8e2]">
              <p className="text-xs font-semibold text-[#404942]">Completion Ratio</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#181c1b] mt-1">
                {completionRate}%
              </p>
              <p className="text-[11px] text-[#404942] mt-1">Completed vs total tracked</p>
            </div>
          </div>

          {/* Subject-Wise Video Progress Breakdown (Styled like Quiz subjectWise) */}
          <div className="stitch-card p-6 bg-white border border-[#e2e8e2] space-y-4">
            <h3 className="text-sm font-bold text-[#181c1b] uppercase tracking-wider">
              Subject-Wise Learning Progress Breakdown
            </h3>

            {subjectProgressList.length === 0 ? (
              <div className="text-xs text-[#717971] py-4 text-center italic">
                No video study sessions tracked yet. Open any lecture to begin tracking your progress.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjectProgressList.map((item) => {
                  const subjectPercentage =
                    item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;

                  return (
                    <div
                      key={item.subjectCode}
                      className="p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#e8f5e9] text-[#1b5e20]">
                          {item.subjectCode}
                        </span>
                        <span className="text-xs text-[#404942] font-semibold">
                          {item.completed} / {item.total} Completed
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#404942]">
                        <span>{item.inProgress} currently in progress</span>
                        <span className="font-bold text-[#134e2f]">{subjectPercentage}%</span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-[#e2e8e2] overflow-hidden">
                        <div
                          className="h-full bg-[#134e2f] rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, subjectPercentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* All Tracked Videos History List */}
          <div className="stitch-card p-6 bg-white border border-[#e2e8e2] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#181c1b] uppercase tracking-wider">
                Tracked Lecture History ({libraryVideos.length})
              </h3>

              {libraryVideos.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[#c0c9bf] bg-white hover:bg-[#f0f4f0] text-[#181c1b] flex items-center gap-1.5 transition"
                  title="Clear all tracked video history"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#717971]" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {libraryVideos.length === 0 ? (
              <p className="text-xs text-[#717971] text-center py-6">
                No videos recorded in history yet.
              </p>
            ) : (
              <div className="divide-y divide-[#e2e8e2]">
                {libraryVideos.map((item) => (
                  <div
                    key={item.youtubeVideoId}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-16 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 cursor-pointer relative group"
                        onClick={() => handleOpenVideo(item)}
                      >
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <Play className="w-3.5 h-3.5 text-white fill-current" />
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <h4
                          onClick={() => handleOpenVideo(item)}
                          className="text-xs font-bold text-[#181c1b] hover:text-[#134e2f] transition cursor-pointer line-clamp-1"
                        >
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-[#717971]">
                          {item.subjectCode && (
                            <span className="font-mono font-semibold text-[#134e2f]">
                              {item.subjectCode}
                              {item.moduleNumber ? ` M${item.moduleNumber}` : ''}
                            </span>
                          )}
                          <span>•</span>
                          <span>{item.channelTitle || 'Educator'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1 ${item.progressStatus === 'COMPLETED'
                          ? 'bg-[#e8f5e9] text-[#1b5e20] border-[#a5d6a7]'
                          : 'bg-[#f0f9f4] text-[#134e2f] border-[#c0c9bf]'
                          }`}
                      >
                        {item.progressStatus === 'COMPLETED' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-[#1b5e20]" />
                            <span>Completed</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-[#134e2f]" />
                            <span>In Progress</span>
                          </>
                        )}
                      </span>

                      {/* Toggle status button */}
                      <button
                        onClick={() =>
                          handleUpdateProgress(
                            item,
                            item.progressStatus === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED'
                          )
                        }
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-[#c0c9bf] bg-white hover:bg-[#f0f4f0] text-[#181c1b] transition"
                      >
                        {item.progressStatus === 'COMPLETED' ? 'Mark In Progress' : 'Mark Done'}
                      </button>

                      {/* Watch Button */}
                      <button
                        onClick={() => handleOpenVideo(item)}
                        className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#134e2f] hover:bg-[#006d3d] text-white transition flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Watch</span>
                      </button>

                      {/* Remove from history button */}
                      <button
                        onClick={() => handleRemoveHistoryItem(item.youtubeVideoId)}
                        className="p-1.5 rounded-full border border-transparent hover:border-[#c0c9bf] hover:bg-[#f0f4f0] text-[#717971] hover:text-[#181c1b] transition"
                        title="Remove from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EMBEDDED MODAL PLAYER (GREEN & WHITE THEMED)                              */}
      {/* ========================================================================= */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-4xl stitch-card bg-white flex flex-col overflow-hidden shadow-2xl rounded-3xl border border-[#e2e8e2]">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#e2e8e2] flex items-center justify-between bg-[#f7faf7]">
              <div className="flex items-center gap-2 truncate pr-4">
                <Video className="w-5 h-5 text-[#134e2f] shrink-0" />
                <span className="font-bold text-sm text-[#181c1b] truncate">
                  {activeVideoModal.title}
                </span>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1.5 rounded-full hover:bg-[#e2e8e2] text-[#404942] transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded YouTube Iframe */}
            <div className="aspect-video w-full bg-black relative">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoModal.youtubeVideoId}?autoplay=1`}
                className="w-full h-full border-0"
                title={activeVideoModal.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal Controls / Footer */}
            <div className="p-4 bg-white border-t border-[#e2e8e2] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {activeVideoModal.subjectCode && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-bold font-mono">
                    {activeVideoModal.subjectCode}
                  </span>
                )}
                {activeVideoModal.channelTitle && (
                  <span className="text-xs text-[#717971]">{activeVideoModal.channelTitle}</span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                {/* Toggle Favorite */}
                <button
                  onClick={() => handleToggleFavorite(activeVideoModal)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${activeVideoModal.isFavorite
                    ? 'bg-[#e8f5e9] text-[#1b5e20] border border-[#a5d6a7]'
                    : 'bg-[#f0f4f0] text-[#181c1b] hover:bg-[#e1e9e1] border border-[#e2e8e2]'
                    }`}
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${activeVideoModal.isFavorite ? 'fill-[#1b5e20] text-[#1b5e20]' : 'text-gray-500'
                      }`}
                  />
                  <span>{activeVideoModal.isFavorite ? 'Saved to Favorites' : 'Save Favorite'}</span>
                </button>

                {/* Mark as Completed */}
                <button
                  onClick={() =>
                    handleUpdateProgress(
                      activeVideoModal,
                      activeVideoModal.progressStatus === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED'
                    )
                  }
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${activeVideoModal.progressStatus === 'COMPLETED'
                    ? 'bg-[#134e2f] text-white shadow-sm'
                    : 'bg-[#f0f4f0] text-[#181c1b] hover:bg-[#e1e9e1] border border-[#e2e8e2]'
                    }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {activeVideoModal.progressStatus === 'COMPLETED' ? 'Completed' : 'Mark Completed'}
                  </span>
                </button>

                {/* External YouTube Link */}
                <a
                  href={`https://www.youtube.com/watch?v=${activeVideoModal.youtubeVideoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#f0f9f4] text-[#134e2f] hover:bg-[#e8f5e9] border border-[#c0c9bf] flex items-center gap-1.5 transition"
                >
                  <span>Open on YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Video Card matching Website Green & White Theme
function ThemeVideoCard({
  video,
  onOpen,
  onToggleFavorite,
  onUpdateProgress,
}: {
  video: VideoItem;
  onOpen: (v: VideoItem) => void;
  onToggleFavorite: (v: VideoItem) => void;
  onUpdateProgress: (v: VideoItem, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') => void;
}) {
  const isCompleted = video.progressStatus === 'COMPLETED';
  const isInProgress = video.progressStatus === 'IN_PROGRESS';

  return (
    <div className="stitch-card overflow-hidden flex flex-col justify-between bg-white border border-[#e2e8e2] group hover:border-[#134e2f] hover:shadow-md transition">
      {/* Thumbnail Container */}
      <div
        className="relative aspect-video bg-gray-100 cursor-pointer overflow-hidden"
        onClick={() => onOpen(video)}
      >
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/95 text-[#134e2f] flex items-center justify-center shadow-lg group-hover:scale-110 transition">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Favorite Bookmark Button (Green Themed) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(video);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition ${video.isFavorite
            ? 'bg-[#134e2f] text-white shadow-sm'
            : 'bg-black/40 hover:bg-black/60 text-white'
            }`}
          title={video.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Bookmark className={`w-4 h-4 ${video.isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Progress Status Badge (Green Themed) */}
        {video.progressStatus && video.progressStatus !== 'NOT_STARTED' && (
          <span
            className={`absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wide border shadow-sm ${isCompleted
              ? 'bg-[#e8f5e9] text-[#1b5e20] border-[#a5d6a7]'
              : 'bg-[#f0f9f4] text-[#134e2f] border-[#c0c9bf]'
              }`}
          >
            {isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
          </span>
        )}
      </div>

      {/* Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            {video.subjectCode ? (
              <span className="px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] font-bold font-mono text-[11px]">
                {video.subjectCode}
                {video.moduleNumber ? ` • M${video.moduleNumber}` : ''}
              </span>
            ) : (
              <span />
            )}
            <span className="text-[11px] text-[#717971] truncate max-w-[150px]">
              {video.channelTitle}
            </span>
          </div>

          <h3
            onClick={() => onOpen(video)}
            className="font-bold text-sm text-[#181c1b] group-hover:text-[#134e2f] transition cursor-pointer line-clamp-2 leading-snug"
          >
            {video.title}
          </h3>

          {video.description && (
            <p className="text-xs text-[#404942] line-clamp-2 leading-relaxed">
              {video.description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-[#e2e8e2] flex items-center justify-between gap-2">
          {/* Quick Progress Changer */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpen(video)}
              className="text-xs font-bold text-[#134e2f] hover:underline flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Watch</span>
            </button>

            <span className="text-[#c0c9bf]">•</span>

            <button
              onClick={() =>
                onUpdateProgress(video, isCompleted ? 'IN_PROGRESS' : 'COMPLETED')
              }
              className={`text-[11px] font-semibold flex items-center gap-1 transition ${isCompleted ? 'text-[#1b5e20]' : 'text-[#717971] hover:text-[#134e2f]'
                }`}
              title={isCompleted ? 'Click to set In Progress' : 'Click to mark Completed'}
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 ${isCompleted ? 'text-[#1b5e20]' : 'text-gray-400'}`}
              />
              <span>{isCompleted ? 'Done' : 'Mark Done'}</span>
            </button>
          </div>

          {/* External Link */}
          <a
            href={`https://www.youtube.com/watch?v=${video.youtubeVideoId}`}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-[#717971] hover:text-[#134e2f] flex items-center gap-1 transition"
            title="Open on YouTube"
          >
            <span>YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
