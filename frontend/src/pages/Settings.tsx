import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  ShieldCheck, 
  Download, 
  Check, 
  Database,
  Lock,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [layoutDensity, setLayoutDensity] = useState<'comfortable' | 'compact'>('comfortable');

  // Notification Channel Toggles
  const [notifyAcademic, setNotifyAcademic] = useState(true);
  const [notifyQuizzes, setNotifyQuizzes] = useState(true);
  const [notifyCareers, setNotifyCareers] = useState(true);
  const [notifyExams, setNotifyExams] = useState(true);

  const [isSaved, setIsSaved] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);

  const handleSaveSettings = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDownloadDataArchive = async () => {
    try {
      setIsDownloadingData(true);
      window.open(`${api.defaults.baseURL}/profile/export-data`, '_blank');
    } catch (err) {
      console.error('Data archive download failed:', err);
    } finally {
      setIsDownloadingData(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-purple-950/80 border border-indigo-500/20 p-8 shadow-[0_15px_40px_-10px_rgba(99,102,241,0.2)] flex items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
            <SettingsIcon className="w-3.5 h-3.5 text-indigo-400" /> Platform Preferences
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            User Settings & System Preferences
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Customize your UI theme, density, notification channels, and manage your personal data privacy settings.
          </p>
        </div>
      </section>

      {/* Theme & Display Options */}
      <section className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Moon className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Appearance & Theme Mode</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setTheme('dark')}
            className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between gap-4 ${
              theme === 'dark'
                ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex justify-between items-center">
              <Moon className="w-6 h-6 text-indigo-400" />
              {theme === 'dark' && <Check className="w-4 h-4 text-indigo-400" />}
            </div>
            <div>
              <p className="text-sm font-bold">Dark Mode</p>
              <p className="text-[11px] text-slate-400 font-mono">Soft glassmorphism dark palette (Default)</p>
            </div>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between gap-4 ${
              theme === 'light'
                ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex justify-between items-center">
              <Sun className="w-6 h-6 text-amber-400" />
              {theme === 'light' && <Check className="w-4 h-4 text-amber-400" />}
            </div>
            <div>
              <p className="text-sm font-bold">Light Mode</p>
              <p className="text-[11px] text-slate-400 font-mono">High contrast light background variant</p>
            </div>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between gap-4 ${
              theme === 'system'
                ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex justify-between items-center">
              <Monitor className="w-6 h-6 text-purple-400" />
              {theme === 'system' && <Check className="w-4 h-4 text-purple-400" />}
            </div>
            <div>
              <p className="text-sm font-bold">System Default</p>
              <p className="text-[11px] text-slate-400 font-mono">Adapts to system OS dark/light mode</p>
            </div>
          </button>
        </div>
      </section>

      {/* Notification Channel Preferences */}
      <section className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Bell className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">Academic & Notes Announcements</p>
              <p className="text-[11px] text-slate-400">Receive alerts when new study notes or semester releases are published</p>
            </div>
            <input
              type="checkbox"
              checked={notifyAcademic}
              onChange={(e) => setNotifyAcademic(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">Practice Quiz & Assessment Alerts</p>
              <p className="text-[11px] text-slate-400">Notifications when subject quizzes or practice sets become available</p>
            </div>
            <input
              type="checkbox"
              checked={notifyQuizzes}
              onChange={(e) => setNotifyQuizzes(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">Internships & Career Opportunities</p>
              <p className="text-[11px] text-slate-400">Alerts when new internships or graduate job listings match your branch</p>
            </div>
            <input
              type="checkbox"
              checked={notifyCareers}
              onChange={(e) => setNotifyCareers(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </div>
        </div>
      </section>

      {/* Data Privacy & Export (GDPR Compliance) */}
      <section className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Database className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Data Privacy & GDPR Export</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="space-y-1">
            <p className="text-xs font-bold text-white">Download Personal Data Archive</p>
            <p className="text-[11px] text-slate-400">
              Export a complete JSON file containing your user profile, skills matrix, projects, and document metadata.
            </p>
          </div>

          <button
            onClick={handleDownloadDataArchive}
            disabled={isDownloadingData}
            className="px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-2 shrink-0"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Download Archive JSON
          </button>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSaveSettings}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {isSaved ? 'Preferences Saved!' : 'Save All Preferences'}
        </button>
      </div>
    </div>
  );
};
