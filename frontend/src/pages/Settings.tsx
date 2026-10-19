import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme, ThemeMode } from '../context/ThemeContext';

interface NotificationPreferences {
  notifyAcademic: boolean;
  notifyQuizzes: boolean;
  notifyCareers: boolean;
}

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { theme, effectiveTheme, setTheme } = useTheme();

  // Scoped storage key per user
  const storageKey = `student_assistant_notifications_${user?.id || 'default'}`;

  // Notification Preferences State
  const [notifyAcademic, setNotifyAcademic] = useState(true);
  const [notifyQuizzes, setNotifyQuizzes] = useState(true);
  const [notifyCareers, setNotifyCareers] = useState(true);

  // Status feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  const [isDownloadingData, setIsDownloadingData] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Load saved notification preferences on mount or user change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.notifyAcademic === 'boolean') setNotifyAcademic(parsed.notifyAcademic);
        if (typeof parsed.notifyQuizzes === 'boolean') setNotifyQuizzes(parsed.notifyQuizzes);
        if (typeof parsed.notifyCareers === 'boolean') setNotifyCareers(parsed.notifyCareers);
      }
    } catch (e) {
      console.warn('Failed to parse saved notification preferences:', e);
    }
  }, [storageKey]);

  // Save All Preferences handler
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setSaveMessage('');

    try {
      const prefs: NotificationPreferences = {
        notifyAcademic,
        notifyQuizzes,
        notifyCareers,
      };

      // Persist preferences in user-scoped storage
      localStorage.setItem(storageKey, JSON.stringify(prefs));

      setSaveStatus('success');
      setSaveMessage('All preferences and theme settings have been saved successfully.');

      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 3500);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setSaveStatus('error');
      setSaveMessage(err?.message || 'Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Authenticated Data Archive Export
  const handleDownloadDataArchive = async () => {
    try {
      setIsDownloadingData(true);
      setDownloadError(null);
      setDownloadSuccess(false);

      const response = await api.get('/profile/export-data');

      if (!response.data || !response.data.data) {
        throw new Error('Invalid archive payload received from server.');
      }

      const jsonString = JSON.stringify(response.data.data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStamp = new Date().toISOString().split('T')[0];
      const studentTag = user?.fullName
        ? user.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')
        : 'student';
      link.download = `${studentTag}_academic_archive_${dateStamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err: any) {
      console.error('Data archive download failed:', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to download academic archive. Please verify your connection.';
      setDownloadError(msg);
    } finally {
      setIsDownloadingData(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12 font-sans">
      {/* Header Banner */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f5e9] dark:bg-[#22332A] text-[#1b5e20] dark:text-[#86D5A4] text-xs font-semibold uppercase tracking-wider mb-2 border border-transparent dark:border-[#304438]">
            <SettingsIcon className="w-3.5 h-3.5 text-[#006d3d] dark:text-[#86D5A4]" /> Platform Preferences
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#181c1b] dark:text-[#F0F5F1] tracking-tight">
            User Settings &amp; System Preferences
          </h1>
          <p className="text-sm text-[#404942] dark:text-[#BAC8BE] mt-1">
            Customize your UI appearance, configure alert preferences, and download your personal academic archive.
          </p>
        </div>
      </section>

      {/* Theme & Display Options */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A2821] border border-[#e2e8e2] dark:border-[#304438] space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#ecefec] dark:border-[#304438]">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-[#134e2f] dark:text-[#86D5A4]" />
            <h2 className="text-base font-bold text-[#181c1b] dark:text-[#F0F5F1]">Appearance &amp; Theme Mode</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f0f4f0] dark:bg-[#22332A] text-[#404942] dark:text-[#BAC8BE] border border-[#e2e8e2] dark:border-[#304438]">
            Active: {effectiveTheme === 'dark' ? 'Dark Forest' : 'Light Botanical'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Light Botanical */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between gap-4 cursor-pointer focus:outline-none ${
              theme === 'light'
                ? 'bg-[#e8f5e9]/70 dark:bg-[#22332A] border-[#006d3d] dark:border-[#86D5A4] text-[#181c1b] dark:text-[#F0F5F1] ring-1 ring-[#006d3d] dark:ring-[#86D5A4] shadow-xs'
                : 'bg-[#f7faf7] dark:bg-[#141F19] border-[#e2e8e2] dark:border-[#304438] text-[#404942] dark:text-[#BAC8BE] hover:border-[#c0c9bf] dark:hover:border-[#435e4e]'
            }`}
          >
            <div className="flex justify-between items-center">
              <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-[#006d3d] dark:text-[#86D5A4]' : 'text-gray-400'}`} />
              {theme === 'light' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006d3d] dark:text-[#86D5A4] bg-white dark:bg-[#1A2821] px-2 py-0.5 rounded-full border border-[#006d3d]/30 dark:border-[#86D5A4]/30">
                  <Check className="w-3.5 h-3.5" /> Selected
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-[#181c1b] dark:text-[#F0F5F1]">Light Botanical</p>
              <p className="text-xs text-[#717971] dark:text-[#91A397] mt-0.5">High-clarity collegiate theme (Default)</p>
            </div>
          </button>

          {/* Dark Forest */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between gap-4 cursor-pointer focus:outline-none ${
              theme === 'dark'
                ? 'bg-[#e8f5e9]/70 dark:bg-[#22332A] border-[#006d3d] dark:border-[#86D5A4] text-[#181c1b] dark:text-[#F0F5F1] ring-1 ring-[#006d3d] dark:ring-[#86D5A4] shadow-xs'
                : 'bg-[#f7faf7] dark:bg-[#141F19] border-[#e2e8e2] dark:border-[#304438] text-[#404942] dark:text-[#BAC8BE] hover:border-[#c0c9bf] dark:hover:border-[#435e4e]'
            }`}
          >
            <div className="flex justify-between items-center">
              <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-[#006d3d] dark:text-[#86D5A4]' : 'text-gray-400'}`} />
              {theme === 'dark' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006d3d] dark:text-[#86D5A4] bg-white dark:bg-[#1A2821] px-2 py-0.5 rounded-full border border-[#006d3d]/30 dark:border-[#86D5A4]/30">
                  <Check className="w-3.5 h-3.5" /> Selected
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-[#181c1b] dark:text-[#F0F5F1]">Dark Forest</p>
              <p className="text-xs text-[#717971] dark:text-[#91A397] mt-0.5">Deep emerald night contrast palette (#101A16)</p>
            </div>
          </button>

          {/* System Default */}
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between gap-4 cursor-pointer focus:outline-none ${
              theme === 'system'
                ? 'bg-[#e8f5e9]/70 dark:bg-[#22332A] border-[#006d3d] dark:border-[#86D5A4] text-[#181c1b] dark:text-[#F0F5F1] ring-1 ring-[#006d3d] dark:ring-[#86D5A4] shadow-xs'
                : 'bg-[#f7faf7] dark:bg-[#141F19] border-[#e2e8e2] dark:border-[#304438] text-[#404942] dark:text-[#BAC8BE] hover:border-[#c0c9bf] dark:hover:border-[#435e4e]'
            }`}
          >
            <div className="flex justify-between items-center">
              <Monitor className={`w-6 h-6 ${theme === 'system' ? 'text-[#006d3d] dark:text-[#86D5A4]' : 'text-gray-400'}`} />
              {theme === 'system' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006d3d] dark:text-[#86D5A4] bg-white dark:bg-[#1A2821] px-2 py-0.5 rounded-full border border-[#006d3d]/30 dark:border-[#86D5A4]/30">
                  <Check className="w-3.5 h-3.5" /> Selected
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-[#181c1b] dark:text-[#F0F5F1]">System Default</p>
              <p className="text-xs text-[#717971] dark:text-[#91A397] mt-0.5">
                Matches OS ({effectiveTheme === 'dark' ? 'Dark' : 'Light'})
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A2821] border border-[#e2e8e2] dark:border-[#304438] space-y-6 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-[#ecefec] dark:border-[#304438]">
          <Bell className="w-5 h-5 text-[#134e2f] dark:text-[#86D5A4]" />
          <h2 className="text-base font-bold text-[#181c1b] dark:text-[#F0F5F1]">Notification Preferences</h2>
        </div>

        <div className="space-y-3">
          {/* Item 1 */}
          <label className="flex items-center justify-between p-4 rounded-2xl bg-[#f7faf7] dark:bg-[#141F19] border border-[#e2e8e2] dark:border-[#304438] cursor-pointer hover:border-[#c0c9bf] dark:hover:border-[#435e4e] transition">
            <div className="pr-4">
              <p className="text-xs font-bold text-[#181c1b] dark:text-[#F0F5F1]">
                Academic Notes &amp; Syllabus Announcements
              </p>
              <p className="text-xs text-[#717971] dark:text-[#91A397] mt-0.5">
                Receive alerts when new lecture notes, question banks, or syllabus revisions are uploaded.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyAcademic}
              onChange={(e) => setNotifyAcademic(e.target.checked)}
              className="w-4 h-4 accent-[#134e2f] dark:accent-[#86D5A4] rounded cursor-pointer shrink-0"
            />
          </label>

          {/* Item 2 */}
          <label className="flex items-center justify-between p-4 rounded-2xl bg-[#f7faf7] dark:bg-[#141F19] border border-[#e2e8e2] dark:border-[#304438] cursor-pointer hover:border-[#c0c9bf] dark:hover:border-[#435e4e] transition">
            <div className="pr-4">
              <p className="text-xs font-bold text-[#181c1b] dark:text-[#F0F5F1]">
                Practice Quiz &amp; Assessment Alerts
              </p>
              <p className="text-xs text-[#717971] dark:text-[#91A397] mt-0.5">
                Notifications when subject test banks, semester practice modules, or midterm prep sets become active.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyQuizzes}
              onChange={(e) => setNotifyQuizzes(e.target.checked)}
              className="w-4 h-4 accent-[#134e2f] dark:accent-[#86D5A4] rounded cursor-pointer shrink-0"
            />
          </label>

          {/* Item 3 */}
          <label className="flex items-center justify-between p-4 rounded-2xl bg-[#f7faf7] dark:bg-[#141F19] border border-[#e2e8e2] dark:border-[#304438] cursor-pointer hover:border-[#c0c9bf] dark:hover:border-[#435e4e] transition">
            <div className="pr-4">
              <p className="text-xs font-bold text-[#181c1b] dark:text-[#F0F5F1]">
                Internships &amp; Placement Matching
              </p>
              <p className="text-xs text-[#717971] dark:text-[#91A397] mt-0.5">
                Alerts when new internships, hackathons, or graduate recruitment drives match your branch and skills.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyCareers}
              onChange={(e) => setNotifyCareers(e.target.checked)}
              className="w-4 h-4 accent-[#134e2f] dark:accent-[#86D5A4] rounded cursor-pointer shrink-0"
            />
          </label>
        </div>

        {/* Clear Notice on Notification Delivery Scope */}
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f0f4f0] dark:bg-[#141F19] border border-[#e2e8e2] dark:border-[#304438] text-xs text-[#404942] dark:text-[#BAC8BE]">
          <Bell className="w-4 h-4 text-[#134e2f] dark:text-[#86D5A4] shrink-0 mt-0.5" />
          <p>
            <strong>Delivery Notice:</strong> These settings configure active notification preference categories for your student profile. In-app notifications will respect these channels. Direct email or SMS delivery is not enabled in this local development environment.
          </p>
        </div>
      </section>

      {/* Data Privacy & Academic Records Export */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A2821] border border-[#e2e8e2] dark:border-[#304438] space-y-6 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-[#ecefec] dark:border-[#304438]">
          <Database className="w-5 h-5 text-[#006d3d] dark:text-[#86D5A4]" />
          <h2 className="text-base font-bold text-[#181c1b] dark:text-[#F0F5F1]">Data Privacy &amp; Academic Records Export</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#f7faf7] dark:bg-[#141F19] border border-[#e2e8e2] dark:border-[#304438]">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#181c1b] dark:text-[#F0F5F1]">Download Personal Academic Archive</p>
            <p className="text-xs text-[#717971] dark:text-[#91A397]">
              Export a complete JSON file containing your user profile, skills matrix, projects, and document metadata scoped strictly to your account.
            </p>
            {downloadSuccess && (
              <p className="text-xs font-semibold text-[#006d3d] dark:text-[#86D5A4] flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Archive downloaded successfully.
              </p>
            )}
            {downloadError && (
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5" /> {downloadError}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleDownloadDataArchive}
            disabled={isDownloadingData}
            className="px-4 py-2.5 rounded-full bg-[#e8f5e9] dark:bg-[#22332A] hover:bg-[#d0eed8] dark:hover:bg-[#2b3f34] text-[#1b5e20] dark:text-[#86D5A4] border border-[#a0d2af] dark:border-[#304438] text-xs font-semibold transition flex items-center gap-2 shrink-0 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isDownloadingData ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#006d3d] dark:text-[#86D5A4]" />
                <span>Exporting JSON...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[#006d3d] dark:text-[#86D5A4]" />
                <span>Download Archive JSON</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Save All Preferences Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div>
          {saveStatus === 'success' && (
            <div className="flex items-center gap-2 text-xs font-bold text-[#1b5e20] dark:text-[#86D5A4] bg-[#e8f5e9] dark:bg-[#22332A] px-4 py-2 rounded-full border border-[#a0d2af] dark:border-[#304438] animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#006d3d] dark:text-[#86D5A4]" />
              <span>{saveMessage}</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-4 py-2 rounded-full border border-rose-200 dark:border-rose-900/60 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>{saveMessage}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-6 py-3 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white font-bold text-xs shadow-sm transition flex items-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#97f3b5]" />
              <span>Saving Preferences...</span>
            </>
          ) : saveStatus === 'success' ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#97f3b5]" />
              <span>Preferences Saved!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#97f3b5]" />
              <span>Save All Preferences</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
