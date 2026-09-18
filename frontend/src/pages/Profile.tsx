import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  User as UserIcon, 
  Building2, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  Save,
  Github,
  Linkedin,
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  Share2,
  Download,
  ArrowUpRight
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
    bio: profile?.bio || 'Computer Science student passionate about AI, Full-Stack Web Development, and Distributed Cloud Technologies.',
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
    <div className="space-y-8 max-w-5xl mx-auto font-sans pb-12 animate-fade-in">
      {/* SECTION 1: PROFILE HERO BANNER & VERIFICATION */}
      <section className="bg-white rounded-3xl border border-[#e2e8e2] overflow-hidden shadow-sm">
        {/* University Cover Bar */}
        <div className="h-32 w-full bg-gradient-to-r from-[#134e2f] via-[#006d3d] to-[#1f4d32] relative px-6 flex items-end justify-between pb-3">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="relative z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#97f3b5]" />
            <span>{formData.university} · Department of Engineering</span>
          </div>
          
          <div className="relative z-10 text-[11px] text-[#97f3b5] bg-black/30 backdrop-blur-md px-3 py-0.5 rounded-full font-mono">
            Student ID: SA-2024-8849
          </div>
        </div>

        {/* Profile Details Deck */}
        <div className="p-6 sm:p-8 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 pb-6 border-b border-[#ecefec]">
            {/* Avatar & Core Identity */}
            <div className="flex items-end gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl ring-4 ring-white shadow-md bg-[#134e2f] text-white flex items-center justify-center text-3xl font-extrabold">
                  {user?.fullName ? user.fullName[0] : 'S'}
                </div>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#006d3d] flex items-center justify-center text-white ring-2 ring-white" title="Verified Scholar">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-[#181c1b] tracking-tight">{user?.fullName || 'Student Scholar'}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-bold">
                    Semester {formData.semester}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#404942] flex items-center gap-2">
                  <span>{formData.degree} in {formData.branch}</span>
                  <span className="text-[#c0c9bf]">•</span>
                  <span className="text-[#006d3d] font-semibold">Verified Student</span>
                </p>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
              <button
                onClick={() => {
                  const formEl = document.getElementById('edit-profile-form');
                  formEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-full bg-[#134e2f] text-white text-xs font-semibold hover:bg-[#0e3b24] transition shadow-sm active:scale-95"
              >
                Edit Profile
              </button>
              <button
                onClick={() => alert('Public portfolio URL copied to clipboard!')}
                className="px-4 py-2 rounded-full border border-[#c0c9bf] bg-white text-[#181c1b] text-xs font-semibold hover:bg-[#ecefec] transition flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Portfolio</span>
              </button>
            </div>
          </div>

          {/* Verification Metadata Pills */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecefec] text-[#404942]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#006d3d]" />
                <span>FERPA Verified Student Record</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecefec] text-[#404942]">
                <Calendar className="w-3.5 h-3.5 text-[#717971]" />
                <span>Expected Graduation: {formData.graduationYear}</span>
              </div>
            </div>
            <div className="text-[#404942]">
              Profile Integrity: <span className="text-[#006d3d] font-bold">100% Completed</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ACADEMIC PERFORMANCE STRIP (4 Bento Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cumulative GPA Featured Card */}
        <div className="p-6 rounded-3xl bg-[#134e2f] text-white flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Cumulative GPA</span>
            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">8.84 <span className="text-sm font-normal text-[#97f3b5]">/ 10.0</span></div>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-[#97f3b5] text-[#00361c] text-[10px] font-bold">
                +0.12 this term
              </span>
              <span className="text-[11px] text-[#97f3b5]">Top 5% in Branch</span>
            </div>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-[#97f3b5] h-full rounded-full" style={{ width: '88%' }}></div>
          </div>
        </div>

        {/* Card 2: Degree Completion Progress */}
        <div className="p-6 rounded-3xl bg-white border border-[#e2e8e2] flex flex-col justify-between shadow-sm hover:border-[#006d3d] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#404942]">Degree Completion</span>
            <span className="w-8 h-8 rounded-full bg-[#ecefec] flex items-center justify-center text-[#181c1b]">
              <BookOpen className="w-4 h-4 text-[#006d3d]" />
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-[#181c1b]">75%</div>
            <div className="text-xs text-[#404942] mt-1">
              <span className="font-bold text-[#134e2f]">120</span> of 160 Credits Completed
            </div>
          </div>
          <div>
            <div className="w-full bg-[#ecefec] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#134e2f] h-full rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>

        {/* Card 3: Verified Honors */}
        <div className="p-6 rounded-3xl bg-white border border-[#e2e8e2] flex flex-col justify-between shadow-sm hover:border-[#006d3d] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#404942]">Honors &amp; Awards</span>
            <span className="w-8 h-8 rounded-full bg-[#ecefec] flex items-center justify-center text-[#181c1b]">
              <Award className="w-4 h-4 text-[#006d3d]" />
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-[#181c1b]">4</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-[#ecefec] text-[#181c1b] text-[10px]">
                Dean's List 3x
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#ecefec] text-[#181c1b] text-[10px]">
                Hackathon #1
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#006d3d] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Faculty Endorsement on file</span>
          </div>
        </div>

        {/* Card 4: Academic Standing */}
        <div className="p-6 rounded-3xl bg-white border border-[#e2e8e2] flex flex-col justify-between shadow-sm hover:border-[#006d3d] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#404942]">Academic Status</span>
            <span className="w-8 h-8 rounded-full bg-[#ecefec] flex items-center justify-center text-[#181c1b]">
              <Sparkles className="w-4 h-4 text-[#006d3d]" />
            </span>
          </div>
          <div className="my-3">
            <div className="text-lg font-bold text-[#006d3d]">First Class Distinction</div>
            <div className="text-xs text-[#404942] mt-1">
              Good Standing · Zero Backlogs
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#ecefec] text-[11px] text-[#717971]">
            <span>Next Exam: Dec 2024</span>
            <span className="text-[#006d3d] font-semibold">Active Enrollment</span>
          </div>
        </div>
      </section>

      {message && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-[#e8f5e9] text-[#1b5e20] border border-[#a0d2af]' : 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ffdad6]'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{message.text}</span>
        </div>
      )}

      {/* SECTION 3: EDIT ACADEMIC PROFILE FORM */}
      <form id="edit-profile-form" onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#e2e8e2] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#ecefec] pb-4">
          <h2 className="text-lg font-bold text-[#181c1b] flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#134e2f]" /> Edit Student &amp; Academic Credentials
          </h2>
          <p className="text-xs text-[#717971] mt-0.5">Keep your degree, branch, and semester updated for automated syllabus content matching.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#181c1b] mb-1">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#181c1b] mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#181c1b] mb-1">University / Institute</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#181c1b] mb-1">Branch / Specialization</label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
            >
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Science & Engineering">Information Science & Engineering</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#181c1b] mb-1">Active Semester</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#181c1b] mb-1">GitHub Profile URL</label>
            <div className="relative">
              <Github className="w-4 h-4 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#181c1b] mb-1">LinkedIn Profile URL</label>
            <div className="relative">
              <Linkedin className="w-4 h-4 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#181c1b] mb-1">Academic Summary / Bio</label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#ecefec] flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white font-bold text-xs transition shadow-sm flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            <Save className="w-4 h-4 text-[#97f3b5]" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
