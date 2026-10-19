import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  Search,
  X,
  Compass,
  Laptop,
  RefreshCw,
  Clock,
} from 'lucide-react';

type CategoryTab = 'ALL' | 'JOB' | 'INTERNSHIP';

interface Opportunity {
  id: string | number;
  title: string;
  company?: string | null;
  provider?: string | null;
  location?: string | null;
  isRemote?: boolean | null;
  employmentType?: string | null;
  experienceLevel?: string | null;
  salaryRange?: string | null;
  description?: string | null;
  requiredSkills?: string[] | null;
  logoUrl?: string | null;
  postedAt?: string | null;
  applyUrl?: string | null;
}

const PRESET_ROLES = [
  'All Roles',
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Java Developer',
  'Python Developer',
  'Data Analyst',
  'Data Scientist',
  'AI/ML Engineer',
  'Cybersecurity Analyst',
  'Cloud Engineer',
  'DevOps Engineer',
  'QA Engineer',
  'Intern',
  'Other',
];

const EXPERIENCE_LEVELS = [
  { label: 'All Experience Levels', value: 'ALL' },
  { label: 'Internship', value: 'INTERNSHIP' },
  { label: 'Fresher / Entry Level', value: 'FRESHER' },
  { label: 'Associate', value: 'ASSOCIATE' },
  { label: 'Mid-Level', value: 'MID' },
  { label: 'Senior', value: 'SENIOR' },
];

const EMPLOYMENT_TYPES = [
  { label: 'All Employment Types', value: 'ALL' },
  { label: 'Full-time', value: 'FULL_TIME' },
  { label: 'Part-time', value: 'PART_TIME' },
  { label: 'Internship', value: 'INTERNSHIP' },
  { label: 'Contract', value: 'CONTRACT' },
];

const SOURCE_PROVIDERS = [
  { label: 'All Sources', value: 'ALL' },
  { label: 'Adzuna India', value: 'ADZUNA' },
  { label: 'RemoteOK', value: 'REMOTE_OK' },
  { label: 'VTU Campus Placement', value: 'VTU_CAMPUS_FEED' },
];

const inputClass =
  'w-full rounded-full border border-[#c0c9bf] bg-[#f7faf7] px-4 py-2.5 text-sm text-[#181c1b] outline-none transition placeholder:text-[#717971] focus:border-[#134e2f] focus:bg-white';

const selectClass =
  'rounded-full border border-[#c0c9bf] bg-[#f7faf7] px-3 py-2 text-xs font-medium text-[#181c1b] outline-none focus:border-[#134e2f]';

function validateExternalUrl(value?: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function getSourceBadgeInfo(provider?: string | null) {
  const source = (provider || '').toUpperCase();

  if (source.includes('ADZUNA')) {
    return {
      label: 'Adzuna India',
      classes: 'bg-[#e8f5e9] text-[#1b5e20] border-[#a0d2af]',
    };
  }

  if (source.includes('REMOTE')) {
    return {
      label: 'RemoteOK',
      classes: 'bg-[#f3e8ff] text-[#6b21a8] border-[#d8b4fe]',
    };
  }

  if (source.includes('CAMPUS') || source.includes('VTU')) {
    return {
      label: 'VTU Campus Placement',
      classes: 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]',
    };
  }

  return {
    label: provider || 'Job Provider',
    classes: 'bg-[#f4f6f4] text-[#404942] border-[#dce2dc]',
  };
}

function formatEmploymentType(value?: string | null) {
  if (!value) return null;

  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function CareersAndOpportunities() {
  const { profile } = useAuth();

  // Search preferences
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [customRole, setCustomRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [workMode, setWorkMode] = useState('ALL');
  const [experienceLevel, setExperienceLevel] = useState('ALL');
  const [employmentType, setEmploymentType] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [activeCategoryTab, setActiveCategoryTab] =
    useState<CategoryTab>('ALL');

  // Results and request state
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dataFreshness, setDataFreshness] = useState<unknown>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchOpportunities = useCallback(
    async (overrides?: {
      category?: CategoryTab;
      clearFilters?: boolean;
    }) => {
      const category = overrides?.category ?? activeCategoryTab;
      const clearFilters = overrides?.clearFilters ?? false;

      const effectiveRole = clearFilters
        ? ''
        : customRole.trim() ||
        (selectedRole !== 'All Roles' && selectedRole !== 'Other'
          ? selectedRole
          : '');

      const keyword = clearFilters ? '' : searchQuery.trim();
      const location = clearFilters ? '' : locationInput.trim();
      const mode = clearFilters ? 'ALL' : workMode;
      const level = clearFilters ? 'ALL' : experienceLevel;
      const type = clearFilters ? 'ALL' : employmentType;
      const source = clearFilters ? 'ALL' : sourceFilter;

      const params: Record<string, string> = {};

      if (category !== 'ALL') {
        params.category = category;
      }

      if (effectiveRole) {
        params.role = effectiveRole;
      }

      if (keyword) {
        params.search = keyword;
      }

      if (location) {
        params.location = location;
      }

      if (mode === 'REMOTE') {
        params.isRemote = 'true';
      } else if (mode === 'ONSITE') {
        params.isRemote = 'false';
      }

      if (level !== 'ALL') {
        params.experienceLevel = level;
      }

      if (type !== 'ALL') {
        params.employmentType = type;
      }

      if (source !== 'ALL') {
        params.source = source;
      }

      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await api.get('/careers/opportunities', {
          params,
        });

        const data = response.data?.data;
        const fetched = data?.opportunities;

        setOpportunities(Array.isArray(fetched) ? fetched : []);
        setDataFreshness(data?.dataFreshness ?? null);
        setHasSearched(true);
      } catch (error) {
        console.error('Failed to fetch career opportunities:', error);
        setErrorMessage(
          'We could not load job listings. Check that the backend and database are running, then try again.',
        );
        setOpportunities([]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      activeCategoryTab,
      customRole,
      selectedRole,
      searchQuery,
      locationInput,
      workMode,
      experienceLevel,
      employmentType,
      sourceFilter,
    ],
  );

  // Load opportunities when the page opens.
  useEffect(() => {
    void fetchOpportunities({ category: 'ALL' });
  }, []);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void fetchOpportunities();
  };

  const handleCategoryChange = (category: CategoryTab) => {
    setActiveCategoryTab(category);
    void fetchOpportunities({ category });
  };

  const handleClearFilters = () => {
    setSelectedRole('All Roles');
    setCustomRole('');
    setSearchQuery('');
    setLocationInput('');
    setWorkMode('ALL');
    setExperienceLevel('ALL');
    setEmploymentType('ALL');
    setSourceFilter('ALL');
    setActiveCategoryTab('ALL');

    void fetchOpportunities({
      category: 'ALL',
      clearFilters: true,
    });
  };

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      setErrorMessage('');

      await api.post('/careers/sync');
      await fetchOpportunities();
    } catch (error) {
      console.error('Opportunity sync error:', error);
      setErrorMessage(
        'Unable to synchronize listings right now. Existing results have not been submitted as applications.',
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const buildLinkedInJobsUrl = () => {
    const role =
      customRole.trim() ||
      (selectedRole !== 'All Roles' && selectedRole !== 'Other'
        ? selectedRole
        : searchQuery.trim());

    const params = new URLSearchParams();

    if (role) params.set('keywords', role);
    if (locationInput.trim()) {
      params.set('location', locationInput.trim());
    }

    if (workMode === 'REMOTE') params.set('f_WT', '2');
    if (workMode === 'ONSITE') params.set('f_WT', '1');

    if (experienceLevel === 'INTERNSHIP') params.set('f_E', '1');
    if (experienceLevel === 'FRESHER') params.set('f_E', '2');
    if (experienceLevel === 'ASSOCIATE') params.set('f_E', '3');
    if (experienceLevel === 'MID') params.set('f_E', '4');
    if (experienceLevel === 'SENIOR') params.set('f_E', '5');

    if (employmentType === 'FULL_TIME') params.set('f_JT', 'F');
    if (employmentType === 'PART_TIME') params.set('f_JT', 'P');
    if (employmentType === 'CONTRACT') params.set('f_JT', 'C');
    if (employmentType === 'INTERNSHIP') params.set('f_JT', 'I');

    const query = params.toString();

    return `https://www.linkedin.com/jobs/search/${query ? `?${query}` : ''}`;
  };

  const hasActiveFilters =
    selectedRole !== 'All Roles' ||
    Boolean(customRole.trim()) ||
    Boolean(searchQuery.trim()) ||
    Boolean(locationInput.trim()) ||
    workMode !== 'ALL' ||
    experienceLevel !== 'ALL' ||
    employmentType !== 'ALL' ||
    sourceFilter !== 'ALL' ||
    activeCategoryTab !== 'ALL';

  const activeRoleLabel =
    customRole.trim() ||
    (selectedRole !== 'All Roles' ? selectedRole : searchQuery.trim()) ||
    'all roles';

  const validOpportunityCount = opportunities.length;

  return (
    <div className="mx-auto max-w-7xl animate-fade-in space-y-7 pb-20 font-sans text-[#181c1b]">
      {/* Page heading */}
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#181c1b]">
            Careers &amp; Opportunities
          </h1>

          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#404942]">
            Search jobs and internships from our available providers. Review
            each original listing and apply directly on the employer's or job
            portal's website.
          </p>
        </div>

        <button
          type="button"
          onClick={handleManualSync}
          disabled={isSyncing || isLoading}
          className="stitch-btn-secondary shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
          title="Refresh listings from configured providers"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-[#006d3d] ${isSyncing ? 'animate-spin' : ''
              }`}
          />
          <span>{isSyncing ? 'Syncing...' : 'Sync Opportunities'}</span>
        </button>
      </header>

      {/* Main job-search panel */}
      <section className="stitch-card space-y-5 bg-white p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#181c1b]">
            <Briefcase className="h-4 w-4 text-[#006d3d]" />
            Find Your Next Opportunity
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#b3261e] hover:underline"
            >
              <X className="h-3 w-3" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Role choices */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#717971]">
            Select a job role or enter your own
          </p>

          <div className="flex flex-wrap gap-2">
            {PRESET_ROLES.map((role) => {
              const isSelected = selectedRole === role;

              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role);

                    if (role !== 'Other') {
                      setCustomRole('');
                    }
                  }}
                  aria-pressed={isSelected}
                  className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${isSelected
                    ? 'border-[#134e2f] bg-[#134e2f] text-white shadow-sm'
                    : 'border-[#dce2dc] bg-[#f0f4f0] text-[#181c1b] hover:border-[#a0b6a2] hover:bg-[#e8f5e9]'
                    }`}
                >
                  {role}
                </button>
              );
            })}
          </div>

          {selectedRole === 'Other' && (
            <input
              type="text"
              value={customRole}
              onChange={(event) => setCustomRole(event.target.value)}
              placeholder="Enter a job title, e.g. Embedded Systems Engineer"
              className={inputClass}
              aria-label="Custom job role"
            />
          )}
        </div>

        {/* Search form */}
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="relative lg:col-span-5">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#717971]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Keywords, skills, or company"
                className={`${inputClass} pl-11`}
                aria-label="Search keywords, skills, or company"
              />
            </div>

            <div className="relative lg:col-span-3">
              <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#717971]" />
              <input
                type="text"
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
                placeholder="City, state, or country"
                className={`${inputClass} pl-11`}
                aria-label="Preferred job location"
              />
            </div>

            <div className="lg:col-span-4">
              <button
                type="submit"
                disabled={isLoading}
                className="stitch-btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Search className="h-4 w-4" />
                {isLoading ? 'Searching...' : 'Search Jobs'}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 border-t border-[#e2e8e2] pt-4">
            <label className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-[#717971]">Work mode</span>
              <select
                value={workMode}
                onChange={(event) => setWorkMode(event.target.value)}
                className={selectClass}
              >
                <option value="ALL">All modes</option>
                <option value="REMOTE">Remote</option>
                <option value="ONSITE">On-site</option>
              </select>
            </label>

            <label className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-[#717971]">Experience</span>
              <select
                value={experienceLevel}
                onChange={(event) => setExperienceLevel(event.target.value)}
                className={selectClass}
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-[#717971]">Employment</span>
              <select
                value={employmentType}
                onChange={(event) => setEmploymentType(event.target.value)}
                className={selectClass}
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-[#717971]">Source</span>
              <select
                value={sourceFilter}
                onChange={(event) => setSourceFilter(event.target.value)}
                className={selectClass}
              >
                {SOURCE_PROVIDERS.map((source) => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
            </label>

            <a
              href={buildLinkedInJobsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#0a66c2] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#004182]"
              title="Search LinkedIn Jobs using your selected preferences"
            >
              <svg
                className="h-3.5 w-3.5 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              Search on LinkedIn
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <p className="text-xs leading-relaxed text-[#717971]">
            LinkedIn search opens LinkedIn in a new tab. LinkedIn job cards
            appear here only if an authorized listing integration is available.
          </p>
        </form>
      </section>

      {/* Only job-related categories remain */}
      <nav
        className="flex items-center gap-2 overflow-x-auto border-b border-[#dce2dc] pb-3"
        aria-label="Job categories"
      >
        {(
          [
            { id: 'ALL', label: 'All Opportunities', icon: Briefcase },
            { id: 'JOB', label: 'Full-Time Jobs', icon: Building2 },
            { id: 'INTERNSHIP', label: 'Internships', icon: Clock },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategoryTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleCategoryChange(tab.id)}
              aria-pressed={isActive}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${isActive
                ? 'border-[#134e2f] bg-[#134e2f] text-white shadow-sm'
                : 'border-[#e2e8e2] bg-white text-[#404942] hover:bg-[#ecefec] hover:text-[#181c1b]'
                }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Results heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#181c1b]">
            {activeCategoryTab === 'INTERNSHIP'
              ? 'Internship Opportunities'
              : activeCategoryTab === 'JOB'
                ? 'Full-Time Job Opportunities'
                : 'Available Jobs & Internships'}
          </h2>
          <p className="mt-1 text-xs text-[#717971]">
            {hasSearched
              ? `${validOpportunityCount} listing${validOpportunityCount === 1 ? '' : 's'} returned by the current search`
              : 'Search available listings from the integrated providers'}
          </p>
        </div>

        {dataFreshness != null && (
          <span className="text-xs text-[#717971]">
            Provider freshness information available
          </span>
        )}
      </div>

      {/* Error state */}
      {errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-[#f0c6c2] bg-[#fff5f4] p-4 text-sm text-[#8c2720]"
        >
          <div className="flex items-start justify-between gap-3">
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={() => void fetchOpportunities()}
              className="shrink-0 font-semibold underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Job results */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-64 animate-pulse rounded-3xl border border-[#e2e8e2] bg-white"
            />
          ))}
        </div>
      ) : !errorMessage && opportunities.length === 0 ? (
        <div className="stitch-card space-y-4 bg-white p-8 text-center md:p-12">
          <Briefcase className="mx-auto h-12 w-12 text-[#c0c9bf]" />
          <h3 className="text-base font-bold text-[#181c1b]">
            No Matching Jobs Found
          </h3>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-[#404942]">
            No available listings matched {activeRoleLabel}. Try a different
            role, location, or filter. You can also search LinkedIn directly
            using the preferences above.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleClearFilters}
              className="stitch-btn-secondary px-4 py-2 text-xs"
            >
              Clear Filters
            </button>

            <a
              href={buildLinkedInJobsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#0a66c2] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#004182]"
            >
              Search on LinkedIn
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      ) : !errorMessage ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {opportunities.map((opportunity) => {
            const sourceBadge = getSourceBadgeInfo(opportunity.provider);
            const safeUrl = validateExternalUrl(opportunity.applyUrl);
            const postedDate = formatDate(opportunity.postedAt);
            const companyName = opportunity.company?.trim() || 'Company not specified';
            const skills = Array.isArray(opportunity.requiredSkills)
              ? opportunity.requiredSkills.filter(
                (skill): skill is string =>
                  typeof skill === 'string' && skill.trim().length > 0,
              )
              : [];

            return (
              <article
                key={opportunity.id}
                className="stitch-card group flex flex-col justify-between space-y-4 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(19,78,47,0.08)] md:p-6"
              >
                <div className="space-y-4">
                  {/* Job title and source */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#c0c9bf]/40 bg-[#ecefec] text-base font-bold text-[#134e2f]">
                        {validateExternalUrl(opportunity.logoUrl) ? (
                          <img
                            src={validateExternalUrl(opportunity.logoUrl)!}
                            alt={`${companyName} logo`}
                            className="h-6 w-6 object-contain"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          companyName.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#181c1b] transition group-hover:text-[#134e2f]">
                          {opportunity.title}
                        </h3>
                        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[#404942]">
                          <Building2 className="h-3 w-3 shrink-0 text-[#717971]" />
                          <span className="line-clamp-1">{companyName}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${sourceBadge.classes}`}
                    >
                      {sourceBadge.label}
                    </span>
                  </div>

                  {/* Location and work metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {opportunity.location && (
                      <span className="flex items-center gap-1 text-[#717971]">
                        <MapPin className="h-3.5 w-3.5 text-[#006d3d]" />
                        {opportunity.location}
                      </span>
                    )}

                    {opportunity.isRemote === true && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f5e9] px-2 py-1 text-[10px] font-bold text-[#1b5e20]">
                        <Laptop className="h-3 w-3" />
                        Remote
                      </span>
                    )}

                    {opportunity.employmentType && (
                      <span className="rounded-full border border-[#e2e8e2] bg-[#f4f6f4] px-2 py-1 text-[10px] font-medium text-[#404942]">
                        {formatEmploymentType(opportunity.employmentType)}
                      </span>
                    )}

                    {opportunity.experienceLevel && (
                      <span className="rounded-full border border-[#e2e8e2] bg-white px-2 py-1 text-[10px] font-medium text-[#404942]">
                        {formatEmploymentType(opportunity.experienceLevel)}
                      </span>
                    )}
                  </div>

                  {/* Salary appears only when the source supplied it */}
                  {opportunity.salaryRange && (
                    <div className="inline-flex rounded-full border border-[#e2e8e2] bg-[#f7faf7] px-3 py-1 text-xs font-bold text-[#134e2f]">
                      {opportunity.salaryRange}
                    </div>
                  )}

                  {opportunity.description && (
                    <p className="line-clamp-3 text-xs leading-relaxed text-[#404942]">
                      {opportunity.description}
                    </p>
                  )}

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {skills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-[#e2e8e2] bg-[#f0f4f0] px-2.5 py-1 text-[10px] font-medium text-[#404942]"
                        >
                          {skill}
                        </span>
                      ))}

                      {skills.length > 5 && (
                        <span className="px-1 py-1 text-[10px] text-[#717971]">
                          +{skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* External listing action */}
                <footer className="flex items-center justify-between gap-3 border-t border-[#ecefec] pt-4">
                  <div className="flex min-w-0 items-center gap-1 text-[11px] text-[#717971]">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {postedDate || 'Posting date unavailable'}
                    </span>
                  </div>

                  {safeUrl ? (
                    <a
                      href={safeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="stitch-btn-primary shrink-0 px-4 py-2 text-xs"
                    >
                      View Job
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      title="The provider did not supply a valid external listing URL"
                      className="shrink-0 cursor-not-allowed rounded-full bg-[#f0f2f0] px-3 py-2 text-xs font-semibold text-[#8a918a]"
                    >
                      Link Unavailable
                    </button>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
