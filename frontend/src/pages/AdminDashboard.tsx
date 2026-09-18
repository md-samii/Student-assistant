import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  BookOpen,
  Award,
  Bot,
  ShieldCheck,
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Filter
} from 'lucide-react';

interface Metrics {
  totalStudents: number;
  activeStudents: number;
  totalSubjects: number;
  totalResources: number;
  totalQuizzes: number;
  totalSubmissions: number;
  totalInternships: number;
  totalJobs: number;
  totalGovExams: number;
  totalAIChats: number;
}

interface StudentUser {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  profile?: {
    university?: string;
    branch?: string;
    semester?: number;
    phone?: string;
  };
}

interface AuditLogItem {
  id: string;
  action: string;
  details?: string;
  createdAt: string;
  user?: {
    fullName: string;
    email: string;
    role: string;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);

  const [activeTab, setActiveTab] = useState<'METRICS' | 'STUDENTS' | 'LOGS'>('METRICS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [metricsRes, studentsRes, logsRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/students'),
        api.get('/admin/audit-logs'),
      ]);

      setMetrics(metricsRes.data.data);
      setStudents(studentsRes.data.data.students || []);
      setLogs(logsRes.data.data.logs || []);
    } catch (err) {
      console.warn('Failed to load admin dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStudentStatus = async (studentId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/students/${studentId}/status`, {
        isActive: !currentStatus,
      });

      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, isActive: !currentStatus } : s))
      );
    } catch (err) {
      console.error('Failed to update student status:', err);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-extrabold text-[#181c1b] tracking-tight">
              Institutional Operations &amp; Academic Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006d3d]"></span> Live Sync
            </span>
          </div>
          <p className="text-sm text-[#404942]">
            Monitor student engagement, AI computational quota consumption, syllabus coverage, and verified student credentials.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white font-semibold text-xs transition shadow-sm flex items-center gap-2 shrink-0 active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#97f3b5] ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* 4 Bento Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1: Dark Forest Accent Card */}
        <div className="bg-[#134e2f] text-white rounded-3xl p-6 relative overflow-hidden shadow-sm flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-white/80">Active Enrolled Scholars</span>
              <div className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                {metrics?.totalStudents || 0}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-[#97f3b5] font-semibold pt-3 border-t border-white/10">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{metrics?.activeStudents || 0} Active Student Profiles</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#006d3d]/30 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Metric 2: AI Inference Queries */}
        <div className="bg-white border border-[#e2e8e2] rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:border-[#006d3d] transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-[#404942]">AI Assistant Queries</span>
              <div className="text-3xl font-extrabold text-[#181c1b] mt-2 tracking-tight">
                {metrics?.totalAIChats || 0}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#ecefec] flex items-center justify-center text-[#181c1b]">
              <Bot className="w-4 h-4 text-[#006d3d]" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#ecefec]">
            <div className="flex items-center justify-between text-xs text-[#404942] mb-1">
              <span>Syllabus Q&amp;A Prompts</span>
              <span className="font-bold text-[#006d3d]">Active</span>
            </div>
            <div className="w-full bg-[#ecefec] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#006d3d] h-full rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>

        {/* Metric 3: Curriculum Resources */}
        <div className="bg-white border border-[#e2e8e2] rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:border-[#006d3d] transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-[#404942]">Curriculum Resources</span>
              <div className="text-3xl font-extrabold text-[#181c1b] mt-2 tracking-tight">
                {metrics?.totalResources || 0}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#ecefec] flex items-center justify-center text-[#181c1b]">
              <BookOpen className="w-4 h-4 text-[#006d3d]" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#ecefec] text-xs text-[#404942]">
            <span>Across {metrics?.totalSubjects || 0} Subjects</span>
            <span className="px-2 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-[10px] font-bold">Verified</span>
          </div>
        </div>

        {/* Metric 4: Practice Quizzes */}
        <div className="bg-white border border-[#e2e8e2] rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:border-[#006d3d] transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-[#404942]">Assessment Submissions</span>
              <div className="text-3xl font-extrabold text-[#181c1b] mt-2 tracking-tight">
                {metrics?.totalSubmissions || 0}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#ecefec] flex items-center justify-center text-[#181c1b]">
              <Award className="w-4 h-4 text-[#006d3d]" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#ecefec] text-xs text-[#404942]">
            <span>{metrics?.totalQuizzes || 0} Active Quizzes</span>
            <span className="px-2 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-[10px] font-bold">Tier 1</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-[#e2e8e2] p-2.5 rounded-full flex items-center gap-2 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('METRICS')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition ${
            activeTab === 'METRICS'
              ? 'bg-[#134e2f] text-white shadow-sm'
              : 'text-[#404942] hover:text-[#181c1b] hover:bg-[#ecefec]'
          }`}
        >
          Platform Overview
        </button>
        <button
          onClick={() => setActiveTab('STUDENTS')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition ${
            activeTab === 'STUDENTS'
              ? 'bg-[#134e2f] text-white shadow-sm'
              : 'text-[#404942] hover:text-[#181c1b] hover:bg-[#ecefec]'
          }`}
        >
          Student Directory ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('LOGS')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition ${
            activeTab === 'LOGS'
              ? 'bg-[#134e2f] text-white shadow-sm'
              : 'text-[#404942] hover:text-[#181c1b] hover:bg-[#ecefec]'
          }`}
        >
          System Audit Logs ({logs.length})
        </button>
      </div>

      {/* Student Directory Table */}
      {activeTab === 'STUDENTS' && (
        <div className="bg-white border border-[#e2e8e2] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#181c1b]">Enrolled Scholar Directory</h2>
              <p className="text-xs text-[#717971]">Inspect active matriculation statuses and profile privileges</p>
            </div>
            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scholar name or email..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#ecefec] text-[#717971] font-semibold">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">University &amp; Branch</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ecefec]">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-[#f7faf7] transition">
                    <td className="py-3 px-4 font-bold text-[#181c1b]">{st.fullName}</td>
                    <td className="py-3 px-4 text-[#404942]">{st.email}</td>
                    <td className="py-3 px-4 text-[#717971]">
                      {st.profile?.branch ? `${st.profile.branch} (Sem ${st.profile.semester})` : 'Engineering Scholar'}
                    </td>
                    <td className="py-3 px-4">
                      {st.isActive ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] font-bold text-[10px]">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] font-bold text-[10px]">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStudentStatus(st.id, st.isActive)}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                          st.isActive
                            ? 'bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffb4ab]'
                            : 'bg-[#e8f5e9] text-[#1b5e20] hover:bg-[#d0eed8]'
                        }`}
                      >
                        {st.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs */}
      {activeTab === 'LOGS' && (
        <div className="bg-white border border-[#e2e8e2] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-[#181c1b]">System Audit Logs &amp; Integrity Records</h2>
            <p className="text-xs text-[#717971]">Real-time immutable log stream of student actions and administrative events</p>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#181c1b]">{log.action}</p>
                  <p className="text-[11px] text-[#717971]">{log.details || 'System event recorded'}</p>
                </div>
                <span className="text-[11px] text-[#717971] font-mono">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
