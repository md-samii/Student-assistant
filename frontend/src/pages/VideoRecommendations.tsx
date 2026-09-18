import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Youtube, 
  Play, 
  ExternalLink, 
  Search, 
  Tv, 
  Clock, 
  Sparkles, 
  X,
  BookOpen
} from 'lucide-react';

export default function VideoRecommendations() {
  const { profile } = useAuth();

  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeVideoModal, setActiveVideoModal] = useState<any | null>(null);

  useEffect(() => {
    fetchPersonalizedSubjects();
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [selectedSubject, selectedChannel, searchQuery]);

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

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (selectedSubject) params.subject = selectedSubject;
      if (selectedChannel !== 'ALL') params.channel = selectedChannel;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/videos', { params });
      setVideos(res.data.data.videos || []);
    } catch (err) {
      console.warn('Failed to fetch videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const channelsList = [
    { key: 'ALL', name: 'All Educators' },
    { key: 'Neso Academy', name: 'Neso Academy' },
    { key: 'Abdul Bari', name: 'Abdul Bari' },
    { key: 'Gate Smashers', name: 'Gate Smashers' },
    { key: 'FreeCodeCamp', name: 'FreeCodeCamp' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="stitch-card p-6 sm:p-8 bg-white border border-[#e2e8e2] relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#006d3d]" /> Verified Curriculum Video Library • Sem {profile?.semester || 6}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#181c1b] tracking-tight">
            Academic Video Lectures
          </h1>
          <p className="text-[#404942] text-xs sm:text-sm mt-1">
            Top-rated engineering educators mapped directly to {profile?.branch || 'Computer Science'} syllabus modules.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 shrink-0">
          <Youtube className="w-4 h-4 text-rose-600" />
          <span>Curated Playlists Active</span>
        </div>
      </div>

      {/* Filter Bar */}
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
              placeholder="Search lectures, topics..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] placeholder-gray-400 outline-none focus:border-[#134e2f]"
            />
          </div>
        </div>

        {/* Channel Filter */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[#e2e8e2] pt-3">
          <span className="text-xs font-semibold text-[#404942] mr-2">Top Educators:</span>
          {channelsList.map((ch) => (
            <button
              key={ch.key}
              onClick={() => setSelectedChannel(ch.key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedChannel === ch.key
                  ? 'bg-[#134e2f] text-white'
                  : 'bg-[#f0f4f0] text-[#181c1b] hover:bg-[#e1e9e1]'
              }`}
            >
              {ch.name}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-white animate-pulse border border-[#e2e8e2]"></div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="stitch-card p-12 text-center space-y-3 bg-white">
          <Tv className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-bold text-[#181c1b] text-base">No Video Lectures Found</h3>
          <p className="text-xs text-[#404942]">Select another subject or educator channel above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="stitch-card overflow-hidden flex flex-col justify-between bg-white group hover:translate-y-[-2px]"
            >
              {/* Thumbnail Container */}
              <div 
                className="relative aspect-video bg-gray-100 cursor-pointer overflow-hidden"
                onClick={() => setActiveVideoModal(vid)}
              >
                <img
                  src={vid.thumbnailUrl}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {vid.duration && (
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white font-mono text-[10px] font-bold">
                    {vid.duration}
                  </span>
                )}
              </div>

              {/* Details Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-bold font-mono">
                      {vid.subjectCode}
                    </span>
                    <span className="text-xs text-[#717971]">{vid.channelTitle}</span>
                  </div>

                  <h3 
                    onClick={() => setActiveVideoModal(vid)}
                    className="font-bold text-sm text-[#181c1b] group-hover:text-[#134e2f] transition cursor-pointer line-clamp-2"
                  >
                    {vid.title}
                  </h3>

                  <p className="text-xs text-[#404942] line-clamp-2 leading-relaxed">
                    {vid.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#e2e8e2] flex items-center justify-between">
                  <button
                    onClick={() => setActiveVideoModal(vid)}
                    className="text-xs font-semibold text-[#134e2f] hover:underline flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch Lecture</span>
                  </button>

                  <a
                    href={`https://www.youtube.com/watch?v=${vid.youtubeVideoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-gray-400 hover:text-[#181c1b] flex items-center gap-1"
                    title="Open on YouTube"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-4xl stitch-card bg-white flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#e2e8e2] flex items-center justify-between bg-[#f7faf7]">
              <div className="flex items-center gap-2 truncate">
                <Youtube className="w-5 h-5 text-rose-600" />
                <span className="font-bold text-sm text-[#181c1b] truncate">{activeVideoModal.title}</span>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoModal.youtubeVideoId}?autoplay=1`}
                className="w-full h-full border-0"
                title={activeVideoModal.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
