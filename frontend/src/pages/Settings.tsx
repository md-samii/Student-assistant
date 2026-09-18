import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  Download, 
  Check, 
  Database,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('light');
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
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12 font-sans">
      {/* Header Banner */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-semibold uppercase tracking-wider mb-2">
            <SettingsIcon className="w-3.5 h-3.5 text-[#006d3d]" /> Platform Preferences
          </div>
          <h1 className="text-3xl font-extrabold text-[#181c1b] tracking-tight">
            User Settings &amp; System Preferences
          </h1>
          <p className="text-sm text-[#404942] mt-1">
            Customize your UI appearance, notification channels, and manage your personal data privacy settings.
          </p>
        </div>
      </section>

      {/* Theme & Display Options */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e2e8e2] space-y-6 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-[#ecefec]">
          <Sun className="w-5 h-5 text-[#134e2f]" />
          <h2 className="text-base font-bold text-[#181c1b]">Appearance &amp; Theme Mode</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between gap-4 ${
              theme === 'light'
                ? 'bg-[#e8f5e9]/50 border-[#006d3d] text-[#181c1b] shadow-xs'
                : 'bg-[#f7faf7] border-[#e2e8e2] text-[#404942] hover:border-[#c0c9bf]'
            }`}
          >
            <div className="flex justify-between items-center">
              <Sun className="w-6 h-6 text-[#006d3d]" />
              {theme === 'light' && <Check className="w-4 h-4 text-[#006d3d]" />}
            </div>
            <div>
              <p className="text-sm font-bold">Light Botanical</p>
              <p className="text-xs text-[#717971] mt-0.5">High-clarity collegiate theme (Default)</p>
            </div>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between gap-4 ${
              theme === 'dark'
                ? 'bg-[#e8f5e9]/50 border-[#006d3d] text-[#181c1b] shadow-xs'
                : 'bg-[#f7faf7] border-[#e2e8e2] text-[#404942] hover:border-[#c0c9bf]'
            }`}
          >
            <div className="flex justify-between items-center">
              <Moon className="w-6 h-6 text-[#134e2f]" />
              {theme === 'dark' && <Check className="w-4 h-4 text-[#006d3d]" />}
            </div>
            <div>
              <p className="text-sm font-bold">Dark Forest</p>
              <p className="text-xs text-[#717971] mt-0.5">Deep emerald night contrast palette</p>
            </div>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between gap-4 ${
              theme === 'system'
                ? 'bg-[#e8f5e9]/50 border-[#006d3d] text-[#181c1b] shadow-xs'
                : 'bg-[#f7faf7] border-[#e2e8e2] text-[#404942] hover:border-[#c0c9bf]'
            }`}
          >
            <div className="flex justify-between items-center">
              <Monitor className="w-6 h-6 text-[#717971]" />
              {theme === 'system' && <Check className="w-4 h-4 text-[#006d3d]" />}
            </div>
            <div>
              <p className="text-sm font-bold">System Default</p>
              <p className="text-xs text-[#717971] mt-0.5">Adapts to your operating system theme</p>
            </div>
          </button>
        </div>
      </section>

      {/* Notification Channel Preferences */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e2e8e2] space-y-6 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-[#ecefec]">
          <Bell className="w-5 h-5 text-[#134e2f]" />
          <h2 className="text-base font-bold text-[#181c1b]">Notification Preferences</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2]">
            <div>
              <p className="text-xs font-bold text-[#181c1b]">Academic Notes &amp; Syllabus Announcements</p>
              <p className="text-xs text-[#717971]">Receive alerts when new lecture notes or question banks are uploaded</p>
            </div>
            <input
              type="checkbox"
              checked={notifyAcademic}
              onChange={(e) => setNotifyAcademic(e.target.checked)}
              className="w-4 h-4 accent-[#134e2f] rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2]">
            <div>
              <p className="text-xs font-bold text-[#181c1b]">Practice Quiz &amp; Assessment Alerts</p>
              <p className="text-xs text-[#717971]">Notifications when subject test banks or midterm prep sets become active</p>
            </div>
            <input
              type="checkbox"
              checked={notifyQuizzes}
              onChange={(e) => setNotifyQuizzes(e.target.checked)}
              className="w-4 h-4 accent-[#134e2f] rounded"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2]">
            <div>
              <p className="text-xs font-bold text-[#181c1b]">Internships &amp; Placement Matching</p>
              <p className="text-xs text-[#717971]">Alerts when new internships or graduate recruitment drives match your branch</p>
            </div>
            <input
              type="checkbox"
              checked={notifyCareers}
              onChange={(e) => setNotifyCareers(e.target.checked)}
              className="w-4 h-4 accent-[#134e2f] rounded"
            />
          </div>
        </div>
      </section>

      {/* Data Privacy & Export (FERPA / GDPR) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e2e8e2] space-y-6 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-[#ecefec]">
          <Database className="w-5 h-5 text-[#006d3d]" />
          <h2 className="text-base font-bold text-[#181c1b]">Data Privacy &amp; Academic Records Export</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2]">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#181c1b]">Download Personal Academic Archive</p>
            <p className="text-xs text-[#717971]">
              Export a complete JSON file containing your user profile, skills matrix, projects, and document metadata.
            </p>
          </div>

          <button
            onClick={handleDownloadDataArchive}
            disabled={isDownloadingData}
            className="px-4 py-2.5 rounded-full bg-[#e8f5e9] hover:bg-[#d0eed8] text-[#1b5e20] border border-[#a0d2af] text-xs font-semibold transition flex items-center gap-2 shrink-0 active:scale-95"
          >
            <Download className="w-4 h-4 text-[#006d3d]" /> Download Archive JSON
          </button>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSaveSettings}
          className="px-6 py-3 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white font-bold text-xs shadow-sm transition flex items-center gap-2 active:scale-95"
        >
          {isSaved ? <CheckCircle2 className="w-4 h-4 text-[#97f3b5]" /> : <Sparkles className="w-4 h-4 text-[#97f3b5]" />}
          <span>{isSaved ? 'Preferences Saved!' : 'Save All Preferences'}</span>
        </button>
      </div>
    </div>
  );
};
