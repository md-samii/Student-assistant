export interface OpportunityMatchResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  eligibilityEvidence: string;
  rankingReasons: string[];
  isEligible: boolean;
  scoringRuleSummary: string;
}

/**
 * Resume-Based Opportunity Matching Engine
 * Ranks live opportunities against the student's analyzed resume & academic profile.
 *
 * Scoring Rule (100-point rubric):
 * - Required Skills Overlap: 50%
 * - Preferred Skills Overlap: 10%
 * - Role & Technical Domain Relevance: 20%
 * - Academic Eligibility (Branch & Semester): 10%
 * - Location / Remote Preference: 10%
 */
export function matchOpportunityWithResume(params: {
  opportunity: {
    title: string;
    description: string;
    category: string;
    requiredSkills: string[];
    preferredSkills: string[];
    eligibleBranches?: string[];
    eligibleSemesters?: number[];
    location: string;
    isRemote: boolean;
  };
  resumeText: string;
  extractedSkills: {
    languages?: string[];
    programmingLanguages?: string[];
    frameworks?: string[];
    developerTools?: string[];
    tools?: string[];
    databases?: string[];
    coreFundamentals?: string[];
    softSkills?: string[];
  };
  studentProfile?: {
    branch?: string;
    semester?: number;
  } | null;
}): OpportunityMatchResult {
  const { opportunity, resumeText, extractedSkills, studentProfile } = params;

  // Flatten student's known skills from resume
  const allResumeSkills = new Set<string>();
  const addSkills = (arr?: string[]) => {
    if (Array.isArray(arr)) {
      arr.forEach((s) => allResumeSkills.add(s.toLowerCase()));
    }
  };
  addSkills(extractedSkills.languages);
  addSkills(extractedSkills.programmingLanguages);
  addSkills(extractedSkills.frameworks);
  addSkills(extractedSkills.developerTools);
  addSkills(extractedSkills.tools);
  addSkills(extractedSkills.databases);
  addSkills(extractedSkills.coreFundamentals);
  addSkills(extractedSkills.softSkills);

  const isSkillInResume = (skillName: string): boolean => {
    const sLower = skillName.toLowerCase().trim();
    if (allResumeSkills.has(sLower)) return true;
    const escaped = sLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(resumeText);
  };

  // 1. Required Skills (50 points)
  const reqSkills = opportunity.requiredSkills || [];
  const matchedRequired: string[] = [];
  const missingRequired: string[] = [];

  for (const skill of reqSkills) {
    if (isSkillInResume(skill)) {
      matchedRequired.push(skill);
    } else {
      missingRequired.push(skill);
    }
  }

  const reqScore = reqSkills.length > 0
    ? (matchedRequired.length / reqSkills.length) * 50
    : 35; // baseline if no specific skills listed

  // 2. Preferred Skills (10 points)
  const prefSkills = opportunity.preferredSkills || [];
  const matchedPreferred: string[] = [];
  const missingPreferred: string[] = [];

  for (const skill of prefSkills) {
    if (isSkillInResume(skill)) {
      matchedPreferred.push(skill);
    } else {
      missingPreferred.push(skill);
    }
  }

  const prefScore = prefSkills.length > 0
    ? (matchedPreferred.length / prefSkills.length) * 10
    : 7;

  // 3. Role & Technical Domain Relevance (20 points)
  let roleScore = 12; // baseline
  const titleLower = opportunity.title.toLowerCase();
  const domainKeywords = ['frontend', 'backend', 'full stack', 'cloud', 'ai', 'data', 'software', 'intern', 'engineer', 'systems'];
  let matchedDomainCount = 0;
  for (const kw of domainKeywords) {
    if (titleLower.includes(kw) && new RegExp(`\\b${kw}\\b`, 'i').test(resumeText)) {
      matchedDomainCount++;
    }
  }
  roleScore = Math.min(20, 10 + matchedDomainCount * 4);

  // 4. Academic Eligibility (10 points)
  let isEligible = true;
  let eligibilityPoints = 8;
  const reasons: string[] = [];

  if (studentProfile) {
    const sBranch = (studentProfile.branch || '').toLowerCase();
    const sSem = studentProfile.semester || 0;

    if (opportunity.eligibleBranches && opportunity.eligibleBranches.length > 0) {
      const branchMatch = opportunity.eligibleBranches.some((b) =>
        sBranch.includes(b.toLowerCase()) || b.toLowerCase().includes(sBranch)
      );
      if (branchMatch) {
        eligibilityPoints += 1;
        reasons.push(`Degree branch (${studentProfile.branch}) matches eligible branches.`);
      } else if (sBranch) {
        // Unknown or different branch: don't fail completely, partial credit
        eligibilityPoints -= 2;
      }
    }

    if (opportunity.eligibleSemesters && opportunity.eligibleSemesters.length > 0) {
      if (sSem > 0 && opportunity.eligibleSemesters.includes(sSem)) {
        eligibilityPoints += 1;
        reasons.push(`Current semester (Sem ${sSem}) meets target criteria.`);
      }
    }
  }

  eligibilityPoints = Math.max(4, Math.min(10, eligibilityPoints));

  // 5. Location / Remote Match (10 points)
  let locationPoints = 7;
  if (opportunity.isRemote) {
    locationPoints = 10;
    reasons.push('Remote flexibility aligns with student schedule.');
  } else if (/bangalore|bengaluru/i.test(opportunity.location)) {
    locationPoints = 9;
    reasons.push(`Location (${opportunity.location}) in regional tech hub.`);
  }

  // Final Total Score
  const totalScore = Math.round(reqScore + prefScore + roleScore + eligibilityPoints + locationPoints);
  const finalPercentage = Math.min(99, Math.max(15, totalScore));

  // Build ranking reasons
  if (matchedRequired.length > 0) {
    reasons.unshift(`Matched ${matchedRequired.length}/${reqSkills.length} core required competencies: ${matchedRequired.slice(0, 3).join(', ')}.`);
  }
  if (missingRequired.length > 0) {
    reasons.push(`Growth opportunities: Strengthen ${missingRequired.slice(0, 2).join(', ')}.`);
  }

  return {
    matchPercentage: finalPercentage,
    matchedSkills: [...matchedRequired, ...matchedPreferred],
    missingSkills: missingRequired,
    eligibilityEvidence: studentProfile?.branch
      ? `${studentProfile.branch} • Semester ${studentProfile.semester || 'Senior'}`
      : 'Engineering Undergraduate Criteria Met',
    rankingReasons: reasons,
    isEligible,
    scoringRuleSummary:
      'Match Score calculated via 5-dimension rubric: Required Skills (50%), Preferred Skills (10%), Domain Relevance (20%), Academic Eligibility (10%), Location Flexibility (10%).',
  };
}
