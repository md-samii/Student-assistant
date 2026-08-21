import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  User as UserIcon, 
  Building2, 
  GraduationCap, 
  Github, 
  Linkedin, 
  Phone, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Save,
  BookOpen
} from 'lucide-react';

export default function Profile() {
  const { user, profile, refetchUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    university: profile?.university || 'Visvesvaraya Technological University (VTU)',
    degree: profile?.degree || 'B.E.',
    branch: profile?.branch || 'Computer Science & Engineering',
    semester: profile?.semester || 6,
    section: profile?.section || 'A',
    graduationYear: profile?.graduationYear || 2027,
    phone: profile?.phone || '',
    bio: profile?.bio || 'Computer Science student passionate about AI, Full-Stack Web Development, and Cloud Technologies.',
    githubUrl: profile?.githubUrl || 'https://github.com',
    linkedinUrl: profile?.linkedinUrl || 'https://linkedin.com',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      setIsSaving(true);
      await api.put('/profile', formData);
      await refetchUser();
      setMessage({ type: 'success', text: 'Academic profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Card */}
      <div className="eduflow-card p-8 bg-gradient-to-r from-white via-[#f0f3ff] to-[#e7eeff] border border-[#c4c6d1]/40 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-[#052659] text-white flex items-center justify-center text-2xl font-extrabold shadow-lg shadow-[#052659]/20 shrink-0">
            {user?.fullName ? user.fullName[0] : 'S'}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#052659]/10 text-[#052659] text-xs font-mono font-semibold uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#30618f]" /> Verified Student Account
            </div>
            <h1 className="text-2xl font-extrabold text-[#001234] font-sans">{user?.fullName}</h1>
            <p className="text-xs text-[#44474f] font-mono mt-0.5">
              {profile?.university || 'VTU'} • {profile?.branch || 'Computer Science'} (Sem {profile?.semester || 6})
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-xl bg-white border border-[#c4c6d1]/40 text-xs font-mono text-[#052659] font-bold">
          Role: {user?.role}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-mono font-bold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-800 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-800 border border-rose-500/20'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="eduflow-card p-8 space-y-6">
        <div className="border-b border-[#e2e8f0] pb-4">
          <h2 className="text-lg font-bold text-[#001234] font-sans flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#30618f]" /> Edit Student & Academic Profile
          </h2>
          <p className="text-xs text-[#747780] font-mono mt-0.5">Keep your degree and semester updated for automated syllabus content matching.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-[#001234] mb-1">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-[#747780] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f0f3ff] border border-[#c4c6d1]/40 text-xs text-[#001234] outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-[#001234] mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#747780] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f0f3ff] border border-[#c4c6d1]/40 text-xs text-[#001234] outline-none"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono font-semibold text-[#001234] mb-1">University / Institute</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-[#747780] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f0f3ff] border border-[#c4c6d1]/40 text-xs text-[#001234] outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-[#001234] mb-1">Branch / Specialization</label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0f3ff] border border-[#c4c6d1]/40 text-xs text-[#001234] outline-none"
            >
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Science & Engineering">Information Science & Engineering</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-[#001234] mb-1">Active Semester</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0f3ff] border border-[#c4c6d1]/40 text-xs text-[#001234] outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-[#001234] mb-1">GitHub Profile URL</label>
            <div className="relative">
              <Github className="w-4 h-4 text-[#747780] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f0f3ff] border border-[#c4c6d1]/40 text-xs text-[#001234] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-[#001234] mb-1">LinkedIn Profile URL</label>
            <div className="relative">
              <Linkedin className="w-4 h-4 text-[#747780] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f0f3ff] border border-[#c4c6d1]/40 text-xs text-[#001234] outline-none"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono font-semibold text-[#001234] mb-1">Academic Summary / Bio</label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#f0f3ff] border border-[#c4c6d1]/40 text-xs text-[#001234] outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#e2e8f0] flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#052659] hover:bg-[#30618f] text-white font-bold text-xs transition shadow-md shadow-[#052659]/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
