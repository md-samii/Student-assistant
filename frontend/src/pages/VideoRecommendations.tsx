import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Youtube, 
  Play, 
  Clock, 
  Eye, 
  Search, 
  X, 
  Sparkles, 
  BookOpen, 
  ExternalLink,
  Tv
} from 'lucide-react';

export default function VideoRecommendations() {
  const { profile } = useAuth();

  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);

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
      console.warn('Failed to load recommended videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const channelsList = [
    { key: 'ALL', label: 'All Channels' },
    { key: 'GATE Smashers', label: 'GATE Smashers' },
    { key: 'Neso Academy', label: 'Neso Academy' },
    { key: 'Abdul Bari', label: 'Abdul Bari' },
    { key: 'Knowledge Gate', label: 'Knowledge Gate' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="eduflow-card p-8 bg-gradient-to-r from-white via-[#f0f3ff] to-[#e7eeff] border border-[#c4c6d1]/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#052659]/10 text-[#052659] text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#30618f]" /> YouTube Data API • Semester {profile?.semester || 6}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001234] font-sans">
              AI Video Lectures & Tutorials
            </h1>
            <p className="text-[#44474f] text-xs font-mono mt-1">
              Top-rated YouTube engineering channels mapped directly to {profile?.branch || 'Computer Science'} syllabus
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#c4c6d1]/40 text-xs font-mono text-[#052659] shrink-0">
            <Tv className="w-4 h-4 text-rose-600" />
            <span>Embedded HD Player Active</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
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
              placeholder="Search lectures, topics..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#f0f3ff] border border-[#c4c6d1]/40 text-xs text-[#001234] placeholder-[#747780] outline-none"
            />
          </div>
        </div>

        {/* Channel Filter */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[#e2e8f0] pt-4">
          <span className="text-xs font-mono font-bold text-[#747780] mr-2">Top Educators:</span>
          {channelsList.map((ch) => (
            <button
              key={ch.key}
              onClick={() => setSelectedChannel(ch.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                selectedChannel === ch.key
                  ? 'bg-[#001234] text-white'
                  : 'bg-[#f0f3ff] text-[#44474f] hover:text-[#001234] border border-[#c4c6d1]/30'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-[#e7eeff]/40 animate-pulse border border-[#c4c6d1]/30"></div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="eduflow-card p-12 text-center space-y-3">
          <Youtube className="w-8 h-8 text-[#747780] mx-auto" />
          <h3 className="font-bold text-[#001234] text-base">No Video Lectures Found</h3>
          <p className="text-xs text-[#747780] font-mono">Try searching for different syllabus keywords above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="eduflow-card overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail Container */}
                <div className="relative aspect-video bg-[#001234] overflow-hidden">
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-[#001234]/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button
                      onClick={() => setActiveVideo(vid)}
                      className="w-12 h-12 rounded-full bg-[#052659] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition"
                    >
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </button>
                  </div>

                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#001234]/90 text-white font-mono text-[10px] font-bold">
                    {vid.duration}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="eduflow-pill bg-[#052659]/10 text-[#052659]">
                      {vid.channelName}
                    </span>
                    <span className="text-[10px] font-mono text-[#747780] flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {vid.views}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#001234] group-hover:text-[#30618f] transition line-clamp-2 font-sans">
                    {vid.title}
                  </h3>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-[#e2e8f0] flex items-center justify-between text-xs mt-3">
                <span className="text-[11px] font-mono text-[#747780]">{vid.subjectCode}</span>

                <button
                  onClick={() => setActiveVideo(vid)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#052659] hover:bg-[#30618f] text-white font-bold text-xs transition shadow-md shadow-[#052659]/15 flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Watch Lecture</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Embedded YouTube Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001234]/70 backdrop-blur-md p-4">
          <div className="w-full max-w-4xl glass-panel rounded-2xl overflow-hidden shadow-2xl bg-white border border-[#c4c6d1]">
            <div className="p-4 bg-[#f0f3ff] border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                  <Youtube className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#001234] font-sans line-clamp-1">{activeVideo.title}</h3>
                  <p className="text-[11px] text-[#747780] font-mono">{activeVideo.channelName} • {activeVideo.views} views</p>
                </div>
              </div>

              <button
                onClick={() => setActiveVideo(null)}
                className="p-1.5 rounded-xl bg-white border border-[#c4c6d1]/40 text-[#747780] hover:text-[#001234]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-[#001234]">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeVideoId}?autoplay=1`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
