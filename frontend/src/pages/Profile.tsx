import React, { useEffect, useState } from 'react';
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
    university:
      profile?.university ||
      'Visvesvaraya Technological University (VTU)',
    degree: profile?.degree || 'B.E.',
    branch: profile?.branch || 'Computer Science & Engineering',
    semester: profile?.semester || 6,
    section: profile?.section || 'A',
    graduationYear: profile?.graduationYear || 2027,
    phone: profile?.phone || '',
    bio:
      profile?.bio ||
      'Computer Science student passionate about AI, Full-Stack Web Development, and Distributed Cloud Technologies.',
    githubUrl: profile?.githubUrl || 'https://github.com',
    linkedinUrl: profile?.linkedinUrl || 'https://linkedin.com',
  });

  const [yearlyActivity, setYearlyActivity] = useState<
    { date: string; count: number }[]
  >([]);

  const [activityStats, setActivityStats] = useState({
    totalActivities: 0,
    activeDays: 0,
    currentStreak: 0,
    maxStreak: 0,
  });

  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      setIsSaving(true);

      await api.put('/profile', formData);

      await refetchUser();

      setMessage({
        type: 'success',
        text: 'Academic profile updated successfully!',
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text:
          err.response?.data?.message ||
          'Failed to update profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * Load yearly learning activity
   */
  useEffect(() => {
    const fetchYearlyActivity = async () => {
      try {
        console.log('Fetching yearly activity...');

        setIsLoadingActivity(true);

        const response = await api.get('/activity/yearly');

        console.log(
          'Yearly activity response:',
          response.data
        );

        const data = response.data.data;

        setYearlyActivity(data.activity || []);

        setActivityStats({
          totalActivities: data.totalActivities || 0,
          activeDays: data.activeDays || 0,
          currentStreak: data.currentStreak || 0,
          maxStreak: data.maxStreak || 0,
        });
      } catch (error) {
        console.error(
          'Failed to load yearly activity:',
          error
        );

        setYearlyActivity([]);

        setActivityStats({
          totalActivities: 0,
          activeDays: 0,
          currentStreak: 0,
          maxStreak: 0,
        });
      } finally {
        setIsLoadingActivity(false);
      }
    };

    fetchYearlyActivity();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans pb-12 animate-fade-in">

      {/* SECTION 1: PROFILE HERO BANNER & VERIFICATION */}
      <section className="bg-white rounded-3xl border border-[#e2e8e2] overflow-hidden shadow-sm">

        {/* University Cover Bar */}
        <div className="h-32 w-full bg-gradient-to-r from-[#134e2f] via-[#006d3d] to-[#1f4d32] relative px-6 flex items-end justify-between pb-3">

          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="relative z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#97f3b5]" />
            <span>
              {formData.university} · Department of Engineering
            </span>
          </div>

          <div className="relative z-10 text-[11px] text-[#97f3b5] bg-black/30 backdrop-blur-md px-3 py-0.5 rounded-full font-mono">
            Student Profile
          </div>
        </div>

        {/* Profile Details Deck */}
        <div className="p-6 sm:p-8 pt-0 relative">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 pb-6 border-b border-[#ecefec]">

            {/* Avatar & Core Identity */}
            <div className="flex items-end gap-4">

              <div className="relative">
                <div className="w-24 h-24 rounded-2xl ring-4 ring-white shadow-md bg-[#134e2f] text-white flex items-center justify-center text-3xl font-extrabold">
                  {user?.fullName
                    ? user.fullName[0]
                    : 'S'}
                </div>

                <span
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#006d3d] flex items-center justify-center text-white ring-2 ring-white"
                  title="Student Profile"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-1">

                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-[#181c1b] tracking-tight">
                    {user?.fullName || 'Student Scholar'}
                  </h1>

                  <span className="px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-bold">
                    Semester {formData.semester}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#404942] flex items-center gap-2">
                  <span>
                    {formData.degree} in {formData.branch}
                  </span>

                  <span className="text-[#c0c9bf]">
                    •
                  </span>

                  <span className="text-[#006d3d] font-semibold">
                    Student Profile
                  </span>
                </p>

              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">

              <button
                onClick={() => {
                  const formEl =
                    document.getElementById(
                      'edit-profile-form'
                    );

                  formEl?.scrollIntoView({
                    behavior: 'smooth',
                  });
                }}
                className="px-4 py-2 rounded-full bg-[#134e2f] text-white text-xs font-semibold hover:bg-[#0e3b24] transition shadow-sm active:scale-95"
              >
                Edit Profile
              </button>

              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      window.location.href
                    );

                    setMessage({
                      type: 'success',
                      text: 'Profile URL copied to clipboard.',
                    });
                  } catch {
                    setMessage({
                      type: 'error',
                      text: 'Unable to copy profile URL.',
                    });
                  }
                }}
                className="px-4 py-2 rounded-full border border-[#c0c9bf] bg-white text-[#181c1b] text-xs font-semibold hover:bg-[#ecefec] transition flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Portfolio</span>
              </button>

            </div>
          </div>

          {/* Profile Metadata */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">

            <div className="flex flex-wrap items-center gap-2">

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecefec] text-[#404942]">
                <Calendar className="w-3.5 h-3.5 text-[#717971]" />

                <span>
                  Expected Graduation:{' '}
                  {formData.graduationYear}
                </span>
              </div>

            </div>

            <div className="text-[#404942]">
              Profile information
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: ACADEMIC PROFILE SUMMARY */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="p-6 rounded-3xl bg-[#134e2f] text-white shadow-sm">
          <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
            Current Semester
          </span>

          <div className="text-3xl font-extrabold mt-3">
            {formData.semester}
          </div>

          <p className="text-xs text-[#97f3b5] mt-1">
            Active academic semester
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#e2e8e2] shadow-sm">
          <span className="text-xs font-semibold text-[#404942]">
            Degree
          </span>

          <div className="text-xl font-extrabold text-[#181c1b] mt-3">
            {formData.degree}
          </div>

          <p className="text-xs text-[#717971] mt-1">
            {formData.branch}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#e2e8e2] shadow-sm">
          <span className="text-xs font-semibold text-[#404942]">
            Graduation Year
          </span>

          <div className="text-3xl font-extrabold text-[#181c1b] mt-3">
            {formData.graduationYear}
          </div>

          <p className="text-xs text-[#717971] mt-1">
            Expected graduation
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#e2e8e2] shadow-sm">
          <span className="text-xs font-semibold text-[#404942]">
            University
          </span>

          <div className="text-sm font-bold text-[#181c1b] mt-3 leading-relaxed">
            {formData.university}
          </div>

          <p className="text-xs text-[#717971] mt-1">
            Academic institution
          </p>
        </div>

      </section>

      {/* SUCCESS / ERROR MESSAGE */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${message.type === 'success'
            ? 'bg-[#e8f5e9] text-[#1b5e20] border border-[#a0d2af]'
            : 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ffdad6]'
            }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{message.text}</span>
        </div>
      )}

      {/* YEARLY LEARNING ACTIVITY */}
      <section className="bg-white border border-[#e2e8e2] rounded-3xl p-6 shadow-sm">

        {(() => {
          const currentYear = new Date().getFullYear();

          /*
           * The backend already provides the complete
           * current-year activity data.
           *
           * Do not recalculate total activities,
           * active days, or max streak here.
           */
          const activityMap = new Map<string, number>(
            yearlyActivity.map(
              (item): [string, number] => [
                item.date,
                item.count,
              ]
            )
          );

          /*
           * Activity intensity.
           */
          const getActivityClass = (count: number) => {
            if (count === 0) {
              return 'bg-[#edf0ed]';
            }

            if (count === 1) {
              return 'bg-[#b7e9c5]';
            }

            if (count <= 3) {
              return 'bg-[#65c982]';
            }

            if (count <= 5) {
              return 'bg-[#2e9f5b]';
            }

            return 'bg-[#166534]';
          };

          /*
           * Build each month independently.
           *
           * Each month contains:
           * Monday
           * Tuesday
           * Wednesday
           * Thursday
           * Friday
           * Saturday
           * Sunday
           */
          const months = Array.from(
            { length: 12 },
            (_, monthIndex) => {

              const firstDay = new Date(
                currentYear,
                monthIndex,
                1
              );

              const lastDay = new Date(
                currentYear,
                monthIndex + 1,
                0
              );

              /*
               * JavaScript:
               * Sunday = 0
               * Monday = 1
               *
               * Convert to Monday-based index.
               */
              const firstWeekday =
                firstDay.getDay() === 0
                  ? 6
                  : firstDay.getDay() - 1;

              const daysInMonth =
                lastDay.getDate();

              /*
               * Number of cells required.
               */
              const totalCells =
                Math.ceil(
                  (firstWeekday + daysInMonth) / 7
                ) * 7;

              const cells: (Date | null)[] = [];

              /*
               * Empty cells before the first day.
               */
              for (
                let i = 0;
                i < firstWeekday;
                i++
              ) {
                cells.push(null);
              }

              /*
               * Actual calendar days.
               */
              for (
                let day = 1;
                day <= daysInMonth;
                day++
              ) {
                cells.push(
                  new Date(
                    currentYear,
                    monthIndex,
                    day
                  )
                );
              }

              /*
               * Empty cells after the last day.
               */
              while (cells.length < totalCells) {
                cells.push(null);
              }

              /*
               * Convert the month into vertical
               * week columns.
               */
              const weeks: (Date | null)[][] = [];

              for (
                let i = 0;
                i < cells.length;
                i += 7
              ) {
                weeks.push(
                  cells.slice(i, i + 7)
                );
              }

              return {
                name: firstDay.toLocaleString(
                  'en-US',
                  {
                    month: 'short',
                  }
                ),
                weeks,
              };
            }
          );

          return (
            <>
              {/* Activity Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

                <div className="flex items-center gap-2">

                  <span className="text-2xl font-extrabold text-[#181c1b]">
                    {isLoadingActivity
                      ? '...'
                      : activityStats.totalActivities}
                  </span>

                  <span className="text-lg text-[#404942]">
                    activities in {currentYear}
                  </span>

                  <span
                    title="Learning activities recorded from quizzes and other learning actions"
                    className="w-4 h-4 rounded-full border border-[#aeb7ae] text-[10px] text-[#717971] flex items-center justify-center"
                  >
                    i
                  </span>

                </div>

                <div className="flex items-center gap-6">

                  <div className="text-sm text-[#717971]">
                    Total active days:{' '}

                    <span className="font-semibold text-[#404942]">
                      {activityStats.activeDays}
                    </span>
                  </div>

                  <div className="text-sm text-[#717971]">
                    Max streak:{' '}

                    <span className="font-semibold text-[#404942]">
                      {activityStats.maxStreak}
                    </span>
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-[#f1f3f1] text-sm text-[#404942] font-medium">
                    {currentYear}
                  </div>

                </div>

              </div>

              {/* Loading State */}
              {isLoadingActivity ? (

                <div className="flex items-center justify-center h-40 text-sm text-[#717971]">
                  Loading activity...
                </div>

              ) : (

                <div className="overflow-x-auto pb-2">

                  <div className="min-w-[1000px]">

                    {/* Month Blocks */}
                    <div className="flex gap-5">

                      {months.map((month) => (

                        <div
                          key={month.name}
                          className="flex flex-col"
                        >

                          {/* Month Name */}
                          <div className="text-center text-sm text-[#717971] mb-3">
                            {month.name}
                          </div>

                          {/* Month Calendar */}
                          <div className="flex gap-1">

                            {month.weeks.map(
                              (week, weekIndex) => (

                                <div
                                  key={`${month.name}-week-${weekIndex}`}
                                  className="grid grid-rows-7 gap-1"
                                >

                                  {week.map(
                                    (date, dayIndex) => {

                                      /*
                                       * Empty calendar cell.
                                       */
                                      if (!date) {
                                        return (
                                          <div
                                            key={`${month.name}-${weekIndex}-${dayIndex}`}
                                            className="w-3 h-3"
                                          />
                                        );
                                      }

                                      /*
                                       * Build YYYY-MM-DD.
                                       */
                                      const year =
                                        date.getFullYear();

                                      const monthNumber =
                                        String(
                                          date.getMonth() + 1
                                        ).padStart(2, '0');

                                      const dayNumber =
                                        String(
                                          date.getDate()
                                        ).padStart(2, '0');

                                      const dateKey =
                                        `${year}-${monthNumber}-${dayNumber}`;

                                      /*
                                       * Get real activity
                                       * from backend data.
                                       */
                                      const count: number =
                                        activityMap.get(
                                          dateKey
                                        ) ?? 0;

                                      const formattedDate =
                                        date.toLocaleDateString(
                                          'en-US',
                                          {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                          }
                                        );

                                      return (
                                        <div
                                          key={dateKey}
                                          title={`${count} ${count === 1
                                              ? 'activity'
                                              : 'activities'
                                            } on ${formattedDate}`}
                                          className={`w-3 h-3 rounded-[2px] ${getActivityClass(
                                            count
                                          )}`}
                                        />
                                      );
                                    }
                                  )}

                                </div>

                              )
                            )}

                          </div>

                        </div>

                      ))}

                    </div>

                  </div>

                </div>
              )}

              {/* Legend */}
              <div className="flex items-center justify-end gap-2 mt-5 text-xs text-[#717971]">

                <span>
                  Less
                </span>

                <span className="w-3 h-3 rounded-[2px] bg-[#edf0ed]" />

                <span className="w-3 h-3 rounded-[2px] bg-[#b7e9c5]" />

                <span className="w-3 h-3 rounded-[2px] bg-[#65c982]" />

                <span className="w-3 h-3 rounded-[2px] bg-[#2e9f5b]" />

                <span className="w-3 h-3 rounded-[2px] bg-[#166534]" />

                <span>
                  More
                </span>

              </div>
            </>
          );

        })()}

      </section>

      {/* SECTION 3: EDIT ACADEMIC PROFILE FORM */}
      <form
        id="edit-profile-form"
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-[#e2e8e2] p-6 sm:p-8 space-y-6 shadow-sm"
      >

        <div className="border-b border-[#ecefec] pb-4">

          <h2 className="text-lg font-bold text-[#181c1b] flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#134e2f]" />

            Edit Student &amp; Academic Credentials
          </h2>

          <p className="text-xs text-[#717971] mt-0.5">
            Keep your degree, branch, and semester updated for automated syllabus content matching.
          </p>

        </div>

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
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
                required
              />

            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#181c1b] mb-1">
              Phone Number
            </label>

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

            <label className="block text-xs font-semibold text-[#181c1b] mb-1">
              University / Institute
            </label>

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

            <label className="block text-xs font-semibold text-[#181c1b] mb-1">
              Branch / Specialization
            </label>

            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
            >
              <option value="Computer Science & Engineering">
                Computer Science & Engineering
              </option>

              <option value="Information Science & Engineering">
                Information Science & Engineering
              </option>

              <option value="Electronics & Communication">
                Electronics & Communication
              </option>
            </select>

          </div>

          <div>

            <label className="block text-xs font-semibold text-[#181c1b] mb-1">
              Active Semester
            </label>

            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(
                (s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                )
              )}
            </select>

          </div>

          <div>

            <label className="block text-xs font-semibold text-[#181c1b] mb-1">
              GitHub Profile URL
            </label>

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

            <label className="block text-xs font-semibold text-[#181c1b] mb-1">
              LinkedIn Profile URL
            </label>

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

            <label className="block text-xs font-semibold text-[#181c1b] mb-1">
              Academic Summary / Bio
            </label>

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

            <span>
              {isSaving
                ? 'Saving Changes...'
                : 'Save Profile Changes'}
            </span>
          </button>

        </div>

      </form>

    </div>
  );
}