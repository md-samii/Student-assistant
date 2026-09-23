import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
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
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 animate-fade-in relative">
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-[28px] stitch-card overflow-hidden shadow-[0_20px_60px_-15px_rgba(19,78,47,0.08)] bg-white relative z-10">

        {/* Left Side: Graphic & Branding */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-10 bg-[#134e2f] text-white relative overflow-hidden">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-[#134e2f] flex items-center justify-center shadow-md font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>

            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white leading-none">
                Student Assistant
              </span>

              <span className="text-[11px] text-emerald-200/90 font-medium mt-0.5">
                Academic & Career Suite
              </span>
            </div>
          </div>

          <div className="space-y-4 max-w-md my-auto relative z-10">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-emerald-100 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              Student Profile Onboarding
            </div>

            <h2 className="text-2xl font-extrabold leading-tight text-white tracking-tight">
              Syllabus-Tailored Learning Companion.
            </h2>

            <p className="text-xs text-emerald-100/85 leading-relaxed">
              Register with your degree and engineering branch to automatically
              unlock syllabus notes, module roadmaps, adaptive quizzes, and
              internship alerts.
            </p>
          </div>

          <div className="pt-6 border-t border-white/20 text-xs text-emerald-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            Verified Engineering Curriculums
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:col-span-7 flex flex-col justify-center p-8 sm:p-10 bg-white w-full">

          <div className="w-full max-w-xl mx-auto">

            {/* Mobile Header */}
            <div className="lg:hidden flex items-center gap-2.5 mb-6 justify-center">
              <div className="w-9 h-9 rounded-full bg-[#134e2f] text-white flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>

              <span className="font-extrabold text-lg text-[#181c1b]">
                Student Assistant
              </span>
            </div>

            <div className="mb-6 text-center lg:text-left">
              <h2 className="text-2xl font-extrabold text-[#181c1b] tracking-tight">
                Create Student Account
              </h2>

              <p className="text-xs text-[#404942] mt-1">
                Get personalized study materials & AI homework guidance
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google SSO */}
            <div className="w-full flex justify-center mb-6">
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
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-[#e2e8e2] w-full"></div>

              <span className="bg-white px-3 text-[10px] font-bold tracking-widest text-[#717971] uppercase shrink-0">
                Or fill academic profile
              </span>

              <div className="border-t border-[#e2e8e2] w-full"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-semibold text-[#181c1b] mb-1">
                    Full Name
                  </label>

                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />

                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-[#c0c9bf] focus:border-[#134e2f] focus:ring-1 focus:ring-[#134e2f] text-xs text-[#181c1b] outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#181c1b] mb-1">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="student@vtu.ac.in"
                      className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-[#c0c9bf] focus:border-[#134e2f] focus:ring-1 focus:ring-[#134e2f] text-xs text-[#181c1b] outline-none transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-semibold text-[#181c1b] mb-1">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-[#c0c9bf] focus:border-[#134e2f] focus:ring-1 focus:ring-[#134e2f] text-xs text-[#181c1b] outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#181c1b] mb-1">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />

                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-[#c0c9bf] focus:border-[#134e2f] focus:ring-1 focus:ring-[#134e2f] text-xs text-[#181c1b] outline-none transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* University & Degree */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-semibold text-[#181c1b] mb-1">
                    University / Board
                  </label>

                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-full bg-white border border-[#c0c9bf] focus:border-[#134e2f] text-xs text-[#181c1b] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#181c1b] mb-1">
                    Degree
                  </label>

                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-full bg-white border border-[#c0c9bf] focus:border-[#134e2f] text-xs text-[#181c1b] outline-none"
                  >
                    <option value="B.E.">B.E. / B.Tech</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                  </select>
                </div>
              </div>

              {/* Branch & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#181c1b] mb-1">
                    Branch
                  </label>

                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-full bg-white border border-[#c0c9bf] focus:border-[#134e2f] text-xs text-[#181c1b] outline-none"
                  >
                    <option value="Computer Science & Engineering">
                      Computer Science & Engineering
                    </option>

                    <option value="Information Science & Engineering">
                      Information Science & Engineering
                    </option>

                    <option value="Electronics & Communication Engineering">
                      Electronics & Communication Engineering
                    </option>

                    <option value="Artificial Intelligence & Machine Learning">
                      AI & Machine Learning
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#181c1b] mb-1">
                    Semester
                  </label>

                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-full bg-white border border-[#c0c9bf] focus:border-[#134e2f] text-xs text-[#181c1b] outline-none"
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
                className="w-full py-3 px-4 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white font-semibold text-xs transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
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

            <div className="mt-6 text-center text-xs text-[#404942]">
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