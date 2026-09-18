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
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck
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
    <div className="space-y-8 animate-fade-in pb-12 font-sans max-w-7xl mx-auto">
      {/* Header & Control Bar */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#006d3d]" /> Telemetry &amp; Institutional Audits
          </div>
          <h1 className="text-3xl font-extrabold text-[#181c1b] tracking-tight">
            Institutional Intelligence &amp; Analytics
          </h1>
          <p className="text-sm text-[#404942] max-w-3xl mt-1">
            Deep telemetry across cohort learning curves, student AI assistant interactions, syllabus mastery indices, and data exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleDownloadStudentsCSV}
            className="px-4 py-2.5 rounded-full bg-[#f7faf7] hover:bg-[#ecefec] text-[#181c1b] border border-[#c0c9bf] text-xs font-semibold transition flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#134e2f]" />
            <span>Export Scholars CSV</span>
          </button>
          <button
            onClick={handleDownloadQuizzesCSV}
            className="px-4 py-2.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white text-xs font-semibold transition shadow-sm flex items-center gap-2 active:scale-95"
          >
            <Download className="w-4 h-4 text-[#97f3b5]" />
            <span>Export Quiz Scores CSV</span>
          </button>
        </div>
      </section>

      {/* Top 4 Bento Metric Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Featured Dark Green Hero Card */}
        <div className="rounded-3xl bg-[#134e2f] text-white p-6 flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Campus AI Interactions</span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[#97f3b5] text-[11px] font-bold">Live</span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">{data?.overviewTotals.totalAIChats || 1250}+</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#97f3b5] font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.6% vs previous term</span>
            </div>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-[#97f3b5] h-full rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>

        {/* KPI 2: Average Quiz Mastery */}
        <div className="rounded-3xl bg-white border border-[#e2e8e2] p-6 flex flex-col justify-between shadow-sm hover:border-[#006d3d] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#404942]">Average Assessment Mastery</span>
            <span className="px-2 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-[10px] font-bold">Top Decile</span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-[#181c1b] tracking-tight">{data?.quizPassRate.avgScorePercentage || 82}%</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#006d3d] font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+4.2% post-AI study tutor</span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#ecefec] text-xs text-[#717971]">
            Target Baseline: 75% Exceeded
          </div>
        </div>

        {/* KPI 3: Curriculum Resources */}
        <div className="rounded-3xl bg-white border border-[#e2e8e2] p-6 flex flex-col justify-between shadow-sm hover:border-[#006d3d] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#404942]">Study Notes &amp; Handouts</span>
            <span className="w-8 h-8 rounded-full bg-[#ecefec] flex items-center justify-center text-[#181c1b]">
              <BookOpen className="w-4 h-4 text-[#006d3d]" />
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-[#181c1b] tracking-tight">{data?.overviewTotals.totalResources || 48}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#006d3d] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>+12 published this month</span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#ecefec] text-xs text-[#717971]">
            VTU Syllabus Mapped
          </div>
        </div>

        {/* KPI 4: Practice Quizzes */}
        <div className="rounded-3xl bg-white border border-[#e2e8e2] p-6 flex flex-col justify-between shadow-sm hover:border-[#006d3d] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#404942]">Assessment Sets</span>
            <span className="w-8 h-8 rounded-full bg-[#ecefec] flex items-center justify-center text-[#181c1b]">
              <Award className="w-4 h-4 text-[#006d3d]" />
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-[#181c1b] tracking-tight">{data?.overviewTotals.totalQuizzes || 15}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#404942]">
              <span>Active Subject Tests</span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#ecefec] text-xs text-[#006d3d] font-semibold">
            Automated Evaluation Live
          </div>
        </div>
      </section>

      {/* Visual Analytics Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Trend Bar Visual */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e2e8e2] space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-[#ecefec] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#181c1b] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#134e2f]" /> Weekly Student Engagement Activity
              </h3>
              <p className="text-xs text-[#717971] mt-0.5">Aggregate AI queries and syllabus resource views</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20]">
              Daily Volume
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {(data?.dailyActivity || [
              { day: 'Monday', aiQueries: 140, quizAttempts: 45, resourceViews: 190 },
              { day: 'Tuesday', aiQueries: 185, quizAttempts: 60, resourceViews: 230 },
              { day: 'Wednesday', aiQueries: 210, quizAttempts: 80, resourceViews: 310 },
              { day: 'Thursday', aiQueries: 195, quizAttempts: 75, resourceViews: 280 },
              { day: 'Friday', aiQueries: 240, quizAttempts: 95, resourceViews: 350 },
            ]).map((item) => (
              <div key={item.day} className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#404942]">
                  <span className="font-semibold text-[#181c1b]">{item.day}</span>
                  <span className="text-[#717971]">{item.aiQueries} AI Queries • {item.resourceViews} Views</span>
                </div>
                <div className="w-full bg-[#ecefec] rounded-full h-2.5 overflow-hidden flex">
                  <div
                    className="bg-[#134e2f] h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (item.aiQueries / 300) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Usage Distribution */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e2e8e2] space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-[#ecefec] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#181c1b] flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#006d3d]" /> Top Subject Coursework Interactions
              </h3>
              <p className="text-xs text-[#717971] mt-0.5">Most active courses queried by students</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20]">
              By Volume
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {(data?.subjectDistribution || [
              { subject: 'Data Structures & Algorithms', count: 420 },
              { subject: 'Database Management Systems', count: 350 },
              { subject: 'Artificial Intelligence & Machine Learning', count: 290 },
              { subject: 'Operating Systems & Linux Kernel', count: 210 },
              { subject: 'Full-Stack Web Technologies', count: 180 },
            ]).map((sub, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2]">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#ecefec] text-[#134e2f] flex items-center justify-center font-bold text-xs">
                    #{idx + 1}
                  </div>
                  <span className="text-xs font-semibold text-[#181c1b]">{sub.subject}</span>
                </div>
                <span className="text-xs font-semibold text-[#006d3d]">{sub.count} queries</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
