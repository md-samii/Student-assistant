import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, User as UserIcon, Building2, ArrowRight, AlertCircle, Sparkles, BookOpen } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: 'Visvesvaraya Technological University (VTU)',
    degree: 'B.E.',
    branch: 'Computer Science & Engineering',
    semester: '6',
    section: 'A',
    graduationYear: '2027',
    role: 'STUDENT',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(formData);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setIsSubmitting(true);
      await loginWithGoogle({
        email: 'rahul.sharma@student.vtu.ac.in',
        fullName: 'Rahul Sharma',
        profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        googleId: '10928374659182374'
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 animate-fade-in relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-purple-600/15 blur-[130px] rounded-full pointer-events-none"></div>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl eduflow-card overflow-hidden border border-slate-800/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative z-10">
        {/* Left Side: Graphic & Info */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-10 bg-gradient-to-br from-indigo-950/90 via-slate-900 to-[#080c14] text-white relative border-r border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold font-sans tracking-tight">EduFlow AI</span>
          </div>

          <div className="space-y-4 max-w-md my-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Student Account Setup
            </div>
            <h2 className="text-2xl font-extrabold font-sans leading-tight text-white">
              Syllabus-Tailored Learning Companion.
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Register with your degree and branch to automatically receive university study materials, practice quizzes, and internship notifications.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-800/80 text-xs text-indigo-300 font-mono flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" /> Personalised Semester Modules
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:col-span-7 flex flex-col justify-center p-8 sm:p-10 bg-[#0d1322]/90 w-full">
          <div className="w-full max-w-xl mx-auto">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center gap-2.5 mb-6 justify-center">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white font-sans">EduFlow AI</span>
            </div>

            <div className="mb-6 text-center lg:text-left">
              <h2 className="text-2xl font-extrabold text-white font-sans">Create Student Profile</h2>
              <p className="text-xs text-slate-400 font-mono mt-1">Get personalized study materials & AI homework guidance</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google SSO Button */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-3 mb-4 shadow-sm"
            >
              <GoogleIcon />
              <span>Register with Student Google SSO</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-slate-800 w-full"></div>
              <span className="bg-[#0d1322] px-3 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase shrink-0">
                Or fill details
              </span>
              <div className="border-t border-slate-800 w-full"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Rahul Sharma"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-xs text-white outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="rahul@student.edu"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-xs text-white outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-xs text-white outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-xs text-white outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Academic Profile */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <p className="text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider">Academic Details</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono text-slate-300 mb-1">University</label>
                    <div className="relative">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="university"
                        value={formData.university}
                        onChange={handleChange}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-xs text-white outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Branch / Major</label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-xs text-white outline-none"
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Information Science & Engineering">Information Science & Engineering</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Semester</label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-xs text-white outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-shimmer w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <span>Registering Profile...</span>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-slate-400">
              Already registered?{' '}
              <Link to="/login" className="text-indigo-400 font-bold hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
