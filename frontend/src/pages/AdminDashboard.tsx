import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  BookOpen,
  FileText,
  Award,
  Briefcase,
  Bot,
  ShieldCheck,
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  Activity,
  Sparkles,
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="eduflow-card p-8 bg-gradient-to-r from-white via-[#f0f3ff] to-[#e7eeff] border border-[#c4c6d1]/40 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#052659]/10 text-[#052659] text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#30618f]" /> System Administration & Monitoring
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001234] font-sans">
            EduFlow Admin Control Suite
          </h1>
          <p className="text-[#44474f] text-xs font-mono mt-1">
            System health, active student directory management, database audit logs & platform analytics
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2.5 rounded-xl bg-[#052659] hover:bg-[#30618f] text-white font-bold text-xs transition shadow-md shadow-[#052659]/20 flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh System Logs</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="eduflow-card p-4 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('METRICS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition ${
            activeTab === 'METRICS'
              ? 'bg-[#052659] text-white'
              : 'bg-[#f0f3ff] text-[#44474f] hover:text-[#001234]'
          }`}
        >
          Platform Analytics
        </button>
        <button
          onClick={() => setActiveTab('STUDENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition ${
            activeTab === 'STUDENTS'
              ? 'bg-[#052659] text-white'
              : 'bg-[#f0f3ff] text-[#44474f] hover:text-[#001234]'
          }`}
        >
          Student Accounts ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('LOGS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition ${
            activeTab === 'LOGS'
              ? 'bg-[#052659] text-white'
              : 'bg-[#f0f3ff] text-[#44474f] hover:text-[#001234]'
          }`}
        >
          System Audit Logs ({logs.length})
        </button>
      </div>

      {/* Metrics Section */}
      {activeTab === 'METRICS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="eduflow-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#747780]">Total Users</span>
              <Users className="w-5 h-5 text-[#30618f]" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-[#001234]">{metrics?.totalStudents || 0}</p>
              <p className="text-[11px] font-mono text-emerald-700 font-bold mt-1">
                {metrics?.activeStudents || 0} Active Student Profiles
              </p>
            </div>
          </div>

          <div className="eduflow-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#747780]">Curriculum Notes</span>
              <BookOpen className="w-5 h-5 text-[#30618f]" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-[#001234]">{metrics?.totalResources || 0}</p>
              <p className="text-[11px] font-mono text-[#747780] mt-1">
                Across {metrics?.totalSubjects || 0} VTU Subjects
              </p>
            </div>
          </div>

          <div className="eduflow-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#747780]">Practice Quizzes</span>
              <Award className="w-5 h-5 text-[#30618f]" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-[#001234]">{metrics?.totalQuizzes || 0}</p>
              <p className="text-[11px] font-mono text-[#747780] mt-1">
                {metrics?.totalSubmissions || 0} Student Submissions
              </p>
            </div>
          </div>

          <div className="eduflow-card p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#747780]">AI Conversations</span>
              <Bot className="w-5 h-5 text-[#30618f]" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-[#001234]">{metrics?.totalAIChats || 0}</p>
              <p className="text-[11px] font-mono text-[#747780] mt-1">
                GPT-4 Academic Q&A Prompts
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Student Directory Table */}
      {activeTab === 'STUDENTS' && (
        <div className="eduflow-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-base font-bold text-[#001234] font-sans">Student User Directory</h2>
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-[#747780] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#f0f3ff] border border-[#c4c6d1]/40 text-xs text-[#001234] outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#e2e8f0] text-[#747780]">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">University & Branch</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-[#f0f3ff]/50 transition">
                    <td className="py-3 px-4 font-bold text-[#001234]">{st.fullName}</td>
                    <td className="py-3 px-4 text-[#44474f]">{st.email}</td>
                    <td className="py-3 px-4 text-[#747780]">
                      {st.profile?.branch ? `${st.profile.branch} (Sem ${st.profile.semester})` : 'VTU Student'}
                    </td>
                    <td className="py-3 px-4">
                      {st.isActive ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-bold text-[10px]">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 font-bold text-[10px]">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStudentStatus(st.id, st.isActive)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition ${
                          st.isActive
                            ? 'bg-rose-500/10 text-rose-700 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20'
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
        <div className="eduflow-card p-6 space-y-4">
          <h2 className="text-base font-bold text-[#001234] font-sans">System Audit Logs</h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-[#f0f3ff] border border-[#c4c6d1]/30 flex items-center justify-between text-xs font-mono">
                <div>
                  <p className="font-bold text-[#001234]">{log.action}</p>
                  <p className="text-[11px] text-[#747780]">{log.details || 'No details'}</p>
                </div>
                <span className="text-[11px] text-[#747780]">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
