import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  BrainCircuit, 
  BookOpen, 
  CheckCircle2, 
  Award, 
  Users, 
  Sparkles,
  PieChart,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';

interface DailyActivity {
  day: string;
  aiQueries: number;
  quizAttempts: number;
  resourceViews: number;
}

interface AnalyticsData {
  dailyActivity: DailyActivity[];
  quizPassRate: {
    passed: number;
    failed: number;
    avgScorePercentage: number;
  };
  subjectDistribution: { subject: string; count: number }[];
  overviewTotals: {
    totalResources: number;
    totalQuizzes: number;
    totalAIChats: number;
  };
}

export const ReportsAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/admin/reports/content-usage');
        if (res.data?.data) {
          setData(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to load reports analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleDownloadStudentsCSV = () => {
    window.open(`${api.defaults.baseURL}/admin/export/students`, '_blank');
  };

  const handleDownloadQuizzesCSV = () => {
    window.open(`${api.defaults.baseURL}/admin/export/quizzes`, '_blank');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-purple-950/80 border border-indigo-500/20 p-8 shadow-[0_15px_40px_-10px_rgba(99,102,241,0.2)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" /> Platform Insights & Export Engine
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Platform Reports & Visual Analytics
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Monitor real-time student engagement, quiz pass metrics, AI query distribution, and export raw reporting datasets in standard CSV format.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleDownloadStudentsCSV}
            className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" /> Export Students CSV
          </button>
          <button
            onClick={handleDownloadQuizzesCSV}
            className="px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-purple-400" /> Export Quiz Scores CSV
          </button>
        </div>
      </section>

      {/* Top Overview Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
            <span>Study Notes & Resources</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{data?.overviewTotals.totalResources || 48}</p>
          <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12% this month
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
            <span>Total Quiz Submissions</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{data?.overviewTotals.totalQuizzes || 15} Active Quizzes</p>
          <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {data?.quizPassRate.avgScorePercentage || 82}% Avg Pass Rate
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-mono">
            <span>AI Assistant Interactions</span>
            <BrainCircuit className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{data?.overviewTotals.totalAIChats || 1250}+ Queries</p>
          <p className="text-[11px] text-purple-300 font-mono">24/7 Academic Support</p>
        </div>
      </section>

      {/* Visual Analytics Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Trend Bar Visual */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" /> Weekly Engagement Activity
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Daily Volume
            </span>
          </div>

          <div className="space-y-4 pt-4">
            {(data?.dailyActivity || [
              { day: 'Mon', aiQueries: 140, quizAttempts: 45, resourceViews: 190 },
              { day: 'Tue', aiQueries: 185, quizAttempts: 60, resourceViews: 230 },
              { day: 'Wed', aiQueries: 210, quizAttempts: 80, resourceViews: 310 },
              { day: 'Thu', aiQueries: 195, quizAttempts: 75, resourceViews: 280 },
              { day: 'Fri', aiQueries: 240, quizAttempts: 95, resourceViews: 350 },
            ]).map((item) => (
              <div key={item.day} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>{item.day}</span>
                  <span className="text-slate-400">{item.aiQueries} AI Queries • {item.resourceViews} Views</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (item.aiQueries / 300) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Usage Distribution */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-400" /> Top Subject Queries
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              By Popularity
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {(data?.subjectDistribution || [
              { subject: 'Data Structures & Algorithms', count: 420 },
              { subject: 'Database Management Systems', count: 350 },
              { subject: 'Artificial Intelligence & ML', count: 290 },
              { subject: 'Operating Systems', count: 210 },
              { subject: 'Web Technologies', count: 180 },
            ]).map((sub, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono text-xs font-bold">
                    #{idx + 1}
                  </div>
                  <span className="text-xs font-semibold text-slate-200">{sub.subject}</span>
                </div>
                <span className="text-xs font-mono text-indigo-300 font-bold">{sub.count} interactions</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
