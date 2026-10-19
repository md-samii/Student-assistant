import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  User as UserIcon,
  Phone,
  CheckCircle2,
  Save,
  Github,
  Linkedin,
  BookOpen,
  Calendar,
  Share2,
  ArrowUpRight,
  Plus,
  X,
  Code,
  GraduationCap
} from 'lucide-react';

const SUGGESTED_SKILLS = [
  'React',
  'TypeScript',
  'JavaScript',
  'Python',
  'Node.js',
  'Java',
  'C++',
  'SQL',
  'PostgreSQL',
  'Docker',
  'Git & GitHub',
  'Machine Learning',
  'Tailwind CSS',
  'AWS',
  'Data Structures & Algorithms',
];

export default function Profile() {
  const { user, profile, skills: authSkills, refetchUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    university:
      profile?.university ||
      'Visvesvaraya Technological University (VTU)',
    degree: profile?.degree || 'B.E.',
    branch: profile?.branch || 'Computer Science & Engineering',
    semester: profile?.semester || 1,
    section: profile?.section || 'A',
    graduationYear: profile?.graduationYear || 2027,
    phone: profile?.phone || '',
    bio:
      profile?.bio ||
      'Computer Science student passionate about AI, Full-Stack Web Development, and Distributed Cloud Technologies.',
    githubUrl: profile?.githubUrl || '',
    linkedinUrl: profile?.linkedinUrl || '',
  });

  // savedSkills powers the top cards; formSkills is the draft edited in the form below
  const [savedSkills, setSavedSkills] = useState<string[]>([]);
  const [formSkills, setFormSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

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

  // Load detailed profile and skills on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data?.data) {
          const { user: u, profile: p, skills: s } = response.data.data;
          if (u || p) {
            setFormData((prev) => ({
              ...prev,
              fullName: u?.fullName || prev.fullName,
              university: p?.university || prev.university,
              degree: p?.degree || prev.degree,
              branch: p?.branch || prev.branch,
              semester: p?.semester !== undefined ? p.semester : prev.semester,
              section: p?.section || prev.section,
              graduationYear: p?.graduationYear || prev.graduationYear,
              phone: p?.phone || prev.phone,
              bio: p?.bio ?? prev.bio,
              githubUrl: p?.githubUrl ?? prev.githubUrl,
              linkedinUrl: p?.linkedinUrl ?? prev.linkedinUrl,
            }));
          }
          if (Array.isArray(s) && s.length > 0) {
            const loaded = s.map((item: any) => (typeof item === 'string' ? item : item.name));
            setSavedSkills(loaded);
            setFormSkills(loaded);
          }
        }
      } catch (err) {
        console.error('Failed to load full profile:', err);
      }
    };

    fetchProfileData();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        fullName: user?.fullName || prev.fullName,
        university: profile.university || prev.university,
        degree: profile.degree || prev.degree,
        branch: profile.branch || prev.branch,
        semester: profile.semester || prev.semester,
        section: profile.section || prev.section,
        graduationYear: profile.graduationYear || prev.graduationYear,
        phone: profile.phone ?? prev.phone,
        bio: profile.bio ?? prev.bio,
        githubUrl: profile.githubUrl ?? prev.githubUrl,
        linkedinUrl: profile.linkedinUrl ?? prev.linkedinUrl,
      }));
    }
    if (authSkills && authSkills.length > 0 && savedSkills.length === 0) {
      const fallback = authSkills.map((item: any) => (typeof item === 'string' ? item : item.name));
      setSavedSkills(fallback);
      setFormSkills(fallback);
    }
  }, [profile, user, authSkills]);

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

  const handleAddSkill = (skillToAdd?: string) => {
    const raw = (skillToAdd || skillInput).trim();
    if (!raw) return;
    const exists = formSkills.some((s) => s.toLowerCase() === raw.toLowerCase());
    if (!exists) {
      setFormSkills((prev) => [...prev, raw]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      setIsSaving(true);

      await api.put('/profile', {
        ...formData,
        skills: formSkills,
      });

      await refetchUser();
      setSavedSkills([...formSkills]);

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




        </div>

        {/* Profile Details Deck */}
        {/* Profile Details Deck */}
        <div className="p-6 sm:p-8 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 pb-6 border-b border-[#ecefec]">
            {/* Avatar & Core Identity */}
            <div className="flex items-end gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl ring-4 ring-white shadow-md bg-[#134e2f] text-white flex items-center justify-center text-3xl font-extrabold">
                  {user?.fullName ? user.fullName[0] : 'S'}
                </div>

                <span
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#006d3d] flex items-center justify-center text-white ring-2 ring-white"
                  title="Student Profile"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#181c1b] tracking-tight">
                    {user?.fullName || 'Student Scholar'}
                  </h1>

                  <span className="px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b5e20] text-xs font-bold border border-[#a0d2af]/50">
                    Semester {formData.semester}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#404942] flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {formData.degree} in {formData.branch}
                  </span>
                  <span className="text-[#c0c9bf]">•</span>
                  <span className="text-[#006d3d] font-semibold">
                    Visvesvaraya Technological University (VTU)
                  </span>
                </p>
              </div>
            </div>

            {/* Action Toolbar - Only Edit Profile button above */}
            <div className="flex items-center gap-2 pt-2 md:pt-0">
              <button
                type="button"
                onClick={() => {
                  const formEl = document.getElementById('edit-profile-form');
                  formEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-full bg-[#134e2f] text-white text-xs font-bold hover:bg-[#0e3b24] transition shadow-sm active:scale-95"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Academic Bio / Summary */}
          {formData.bio && formData.bio.trim() && (
            <div className="py-4 border-b border-[#ecefec]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#134e2f] mb-1">
                <BookOpen className="w-3.5 h-3.5 text-[#006d3d]" />
                <span>Bio &amp; About</span>
              </div>
              <p className="text-xs sm:text-sm text-[#404942] leading-relaxed max-w-3xl">
                {formData.bio}
              </p>
            </div>
          )}

          {/* Profile Metadata & Bottom Actions */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Left: Expected Graduation only */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ecefec] text-[#404942] font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#717971]" />
              <span>Expected Graduation: {formData.graduationYear}</span>
            </div>

            {/* Right: Logo-only buttons for GitHub, LinkedIn, and Share */}
            <div className="flex items-center gap-2">
              {formData.githubUrl && formData.githubUrl.trim() && (
                <a
                  href={formData.githubUrl.startsWith('http') ? formData.githubUrl : `https://${formData.githubUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="GitHub Profile"
                  aria-label="GitHub Profile"
                  className="w-8 h-8 rounded-full border border-[#c0c9bf] bg-white hover:bg-[#ecefec] hover:border-[#181c1b] text-[#181c1b] flex items-center justify-center transition shadow-2xs active:scale-95"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}

              {formData.linkedinUrl && formData.linkedinUrl.trim() && (
                <a
                  href={formData.linkedinUrl.startsWith('http') ? formData.linkedinUrl : `https://${formData.linkedinUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn Profile"
                  aria-label="LinkedIn Profile"
                  className="w-8 h-8 rounded-full border border-[#a0d2af] bg-[#f4fbf4] hover:bg-[#e8f5e9] hover:border-[#006d3d] text-[#0a66c2] flex items-center justify-center transition shadow-2xs active:scale-95"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}

              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
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
                title="Share Profile URL"
                aria-label="Share Profile URL"
                className="w-8 h-8 rounded-full border border-[#c0c9bf] bg-white hover:bg-[#ecefec] hover:border-[#181c1b] text-[#404942] hover:text-[#181c1b] flex items-center justify-center transition shadow-2xs active:scale-95"
              >
                <Share2 className="w-4 h-4" />
              </button>
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
            Skills Added
          </span>
          <div className="text-3xl font-extrabold text-[#181c1b] mt-3">
            {savedSkills.length}
          </div>
          <p className="text-xs text-[#006d3d] font-semibold mt-1">
            {savedSkills.length === 1 ? 'Technical skill' : 'Technical skills'}
          </p>
        </div>
      </section>

      {/* SECTION 3: SKILLS & TECHNICAL STACK */}
      <section className="bg-white border border-[#e2e8e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ecefec] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#181c1b]">
              Technical Skills &amp; Competencies
            </h2>
            <p className="text-xs text-[#717971] mt-0.5">
              Verified programming languages, frameworks, developer tools, and domain proficiencies.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#e8f5e9] text-[#134e2f] border border-[#a0d2af]">
              {savedSkills.length} {savedSkills.length === 1 ? 'Skill' : 'Skills'}
            </span>
          </div>
        </div>

        {savedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {savedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-[#e8f5e9] text-[#134e2f] text-xs font-bold border border-[#a0d2af]/70 shadow-2xs hover:bg-[#d8eedb] transition"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2] text-center space-y-2">
            <Code className="w-6 h-6 text-[#134e2f] mx-auto opacity-70" />
            <p className="text-xs font-bold text-[#181c1b]">No skills added yet</p>
            <p className="text-xs text-[#717971] max-w-md mx-auto">
              Add your technical skills, programming languages, and frameworks below in the profile edit form to highlight them on your student profile.
            </p>
          </div>
        )}
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

          <div>
            <label className="block text-xs font-semibold text-[#181c1b] mb-1">
              Graduation Year
            </label>

            <div className="relative">
              <Calendar className="w-4 h-4 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />

              <input
                type="number"
                name="graduationYear"
                min={2000}
                max={2040}
                value={formData.graduationYear}
                onChange={handleChange}
                placeholder="2027"
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
                required
              />
            </div>
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
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Add Skills Section */}
          <div className="sm:col-span-2 space-y-3 pt-3 border-t border-[#ecefec]">
            <div>
              <label className="block text-xs font-semibold text-[#181c1b] mb-1">
                Skills &amp; Technical Competencies
              </label>
              <p className="text-[11px] text-[#717971] mb-2">
                Type your skills (e.g. React, Python, Docker) and press Enter or select from quick suggestions.
              </p>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Code className="w-4 h-4 text-[#717971] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="e.g. React, Python, Machine Learning, Docker..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#f7faf7] border border-[#c0c9bf] text-xs text-[#181c1b] outline-none focus:border-[#134e2f] focus:bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  disabled={!skillInput.trim()}
                  className="px-5 py-2.5 rounded-full bg-[#134e2f] hover:bg-[#0e3b24] text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 active:scale-95 shrink-0 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill</span>
                </button>
              </div>
            </div>

            {/* Added skills chips */}
            {formSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-[#f7faf7] border border-[#e2e8e2]">
                {formSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e8f5e9] text-[#134e2f] border border-[#a0d2af] text-xs font-semibold shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="p-0.5 rounded-full hover:bg-rose-100 hover:text-rose-700 transition"
                      title={`Remove ${skill}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggestions */}
            <div>
              <span className="text-[11px] font-semibold text-[#717971] block mb-1.5">
                Quick Suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.filter(
                  (s) => !formSkills.some((existing) => existing.toLowerCase() === s.toLowerCase())
                ).slice(0, 10).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleAddSkill(suggestion)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#c0c9bf] text-[11px] font-medium text-[#404942] hover:border-[#134e2f] hover:bg-[#f4fbf4] hover:text-[#134e2f] transition shadow-2xs"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
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
                placeholder="https://github.com/your-username"
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
                placeholder="https://linkedin.com/in/your-username"
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
              placeholder="Tell others about your academic passions, projects, and career goals..."
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