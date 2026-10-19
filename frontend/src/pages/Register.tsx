import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import AnimatedAcademicBackground from '../components/AnimatedAcademicBackground';
import {
  GraduationCap,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

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
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      setError(
        err.response?.data?.message ||
        'Registration failed. Please check your details.'
      );
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
        throw new Error(
          'Google did not return an authentication credential.'
        );
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
    <div className="w-full flex items-center justify-center py-2 -translate-y-4 sm:-translate-y-6 animate-fade-in relative">
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-[28px] stitch-card overflow-hidden shadow-[0_20px_60px_-15px_rgba(19,78,47,0.08)] bg-white relative z-10">

        {/* Left Side: Graphic & Branding */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-[#134e2f] text-white relative overflow-hidden">
          {/* Subtle Decorative Background Accents */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4 max-w-md my-auto relative z-10 -translate-y-10 sm:-translate-y-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white tracking-tight">
              Get Started with Student Assistant
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
              Your journey to smarter learning starts here. Access study materials, AI study support, practice quizzes, and career opportunities in one place.
            </p>
          </div>

          <div className="pt-6 border-t border-white/20 text-xs text-emerald-200 font-semibold flex items-center gap-2 relative z-10">
            <ShieldCheck className="w-4 h-4 text-[#97f3b5] shrink-0" />
            <span>Your All-in-One Academic and Career Companion</span>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="flex flex-col justify-center p-6 sm:p-9 bg-white w-full">

          <div className="w-full max-w-md mx-auto">

            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-center mb-6">
              <img src="/logo.png" alt="Student Assistant" className="w-[180px] h-auto object-contain" />
            </div>



            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google SSO */}
            <div className="w-full flex justify-center mb-3">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                width="100%"
                text="signup_with"
              />
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-3">
              <div className="border-t border-[#e2e8e2] w-full"></div>

              <span className="bg-white px-3 text-[10px] font-bold tracking-widest text-[#717971] uppercase shrink-0">
                Or fill academic profile
              </span>

              <div className="border-t border-[#e2e8e2] w-full"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">

                <div>
                  <label className="block text-[11px] font-semibold text-[#181c1b] mb-0.5">
                    Full Name
                  </label>

                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />

                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-[#c0c9bf] focus:border-[#134e2f] focus:ring-1 focus:ring-[#134e2f] text-xs text-[#181c1b] outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#181c1b] mb-0.5">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="student@vtu.ac.in"
                      className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-[#c0c9bf] focus:border-[#134e2f] focus:ring-1 focus:ring-[#134e2f] text-xs text-[#181c1b] outline-none transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">

                <div>
                  <label className="block text-[11px] font-semibold text-[#181c1b] mb-0.5">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-[#c0c9bf] focus:border-[#134e2f] focus:ring-1 focus:ring-[#134e2f] text-xs text-[#181c1b] outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#181c1b] mb-0.5">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />

                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-[#c0c9bf] focus:border-[#134e2f] focus:ring-1 focus:ring-[#134e2f] text-xs text-[#181c1b] outline-none transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Passing Year & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">

                <div>
                  <label className="block text-[11px] font-semibold text-[#181c1b] mb-0.5">
                    Graduation Year
                  </label>

                  <input
                    type="number"
                    name="graduationYear"
                    list="graduation-years-list"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    min="2000"
                    max="2100"
                    placeholder="e.g. 2027"
                    className="w-full px-3.5 py-1.5 rounded-full bg-white border border-[#c0c9bf] focus:border-[#134e2f] text-xs text-[#181c1b] outline-none"
                    required
                  />
                  <datalist id="graduation-years-list">
                    {Array.from({ length: 30 }, (_, i) => 2015 + i).map((year) => (
                      <option key={year} value={year.toString()} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#181c1b] mb-0.5">
                    Semester
                  </label>

                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-3.5 py-1.5 rounded-full bg-white border border-[#c0c9bf] focus:border-[#134e2f] text-xs text-[#181c1b] outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem.toString()}>
                        Sem {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white font-semibold text-xs transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-2.5 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-3 text-center text-xs text-[#404942]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#134e2f] hover:underline"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}