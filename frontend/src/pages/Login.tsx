import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, BookOpen, Sparkles, ShieldCheck } from 'lucide-react';

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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
      setError(err.response?.data?.message || 'Google Sign-In failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 animate-fade-in relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none"></div>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl eduflow-card overflow-hidden border border-slate-800/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative z-10">
        {/* Left Side: Graphic & Branding */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-950/90 via-slate-900 to-[#080c14] text-white relative overflow-hidden border-r border-slate-800/80">
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold font-sans tracking-tight">EduFlow AI</span>
          </div>

          <div className="space-y-4 max-w-md my-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Academic Clarity System
            </div>
            <h2 className="text-3xl font-extrabold font-sans leading-tight text-white">
              Organized Intelligence for Your Engineering Degree.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Navigate syllabus modules, practice quizzes, AI study assistance, and career opportunities without cognitive overload.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-800/80 text-xs text-indigo-300 font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> VTU, Anna Univ & Autonomous Curriculum Supported
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex flex-col justify-center p-8 sm:p-12 bg-[#0d1322]/90 w-full">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center gap-2.5 mb-6 justify-center">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white font-sans">EduFlow AI</span>
            </div>

            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-sans">Welcome Back</h2>
              <p className="text-xs text-slate-400 font-mono mt-1.5">Sign in to access your student companion portal</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-3 mb-6 shadow-sm group"
            >
              <GoogleIcon />
              <span>Sign in with Student Google SSO</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-slate-800 w-full"></div>
              <span className="bg-[#0d1322] px-3 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase shrink-0">
                Or with credentials
              </span>
              <div className="border-t border-slate-800 w-full"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@vtu.ac.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-xs text-white placeholder-slate-500 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-xs text-white placeholder-slate-500 outline-none transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-shimmer w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to EduFlow</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400">
              Need a new student profile?{' '}
              <Link to="/register" className="text-indigo-400 font-bold hover:underline">
                Register here
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
