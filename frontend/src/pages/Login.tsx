import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

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

  const handleGoogleSuccess = async (credentialResponse: {
    credential?: string;
  }) => {
    try {
      setError(null);
      setIsSubmitting(true);

      if (!credentialResponse.credential) {
        throw new Error('Google did not return an authentication credential.');
      }

      await loginWithGoogle(credentialResponse.credential);

      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Google Sign-In failed.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 animate-fade-in relative">
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-[28px] stitch-card overflow-hidden shadow-[0_20px_60px_-15px_rgba(19,78,47,0.08)] bg-white relative z-10">
        {/* Left Side: Graphic & Branding */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-[#134e2f] text-white relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-[#134e2f] flex items-center justify-center shadow-md font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white leading-none">Student Assistant</span>
              <span className="text-[11px] text-emerald-200/90 font-medium mt-0.5">Academic & Career Suite</span>
            </div>
          </div>

          <div className="space-y-4 max-w-md my-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-emerald-100 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> Academic Workflow Platform
            </div>
            <h2 className="text-3xl font-extrabold leading-tight text-white tracking-tight">
              Plan, prioritize, and accomplish your academic goals with ease.
            </h2>
            <p className="text-sm text-emerald-100/85 leading-relaxed">
              Tailored study notes, AI concept tutoring, adaptive practice quizzes, and verified engineering internships in one unified sanctuary.
            </p>
          </div>

          <div className="pt-6 border-t border-white/20 text-xs text-emerald-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" /> VTU, Autonomous & Engineering Curriculums Supported
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex flex-col justify-center p-8 sm:p-12 bg-white w-full">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center gap-2.5 mb-6 justify-center">
              <div className="w-9 h-9 rounded-full bg-[#134e2f] text-white flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-[#181c1b]">Student Assistant</span>
            </div>

            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#181c1b] tracking-tight">Welcome Back</h2>
              <p className="text-xs text-[#404942] mt-1.5">Sign in to access your personalized student dashboard</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Sign-In */}
            <div className="w-full flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                width="100%"
                text="signin_with"
              />
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-[#e2e8e2] w-full"></div>
              <span className="bg-white px-3 text-[10px] font-bold tracking-widest text-[#717971] uppercase shrink-0">
                Or with credentials
              </span>
              <div className="border-t border-[#e2e8e2] w-full"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#181c1b] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@vtu.ac.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#c0c9bf] focus:border-[#134e2f] focus:ring-1 focus:ring-[#134e2f] text-xs text-[#181c1b] placeholder-gray-400 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#181c1b] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-full bg-white border border-[#c0c9bf] focus:border-[#134e2f] focus:ring-1 focus:ring-[#134e2f] text-xs text-[#181c1b] placeholder-gray-400 outline-none transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#717971] hover:text-[#181c1b]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#404942]">
                  <input type="checkbox" className="rounded text-[#134e2f] focus:ring-[#134e2f]" defaultChecked />
                  <span>Remember this device</span>
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Please contact institutional admin or reset through your VTU student email."); }} className="font-semibold text-[#134e2f] hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white font-semibold text-xs transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In to Sanctuary</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-[#404942]">
              New to Student Assistant?{' '}
              <Link to="/register" className="font-bold text-[#134e2f] hover:underline">
                Create free account
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
