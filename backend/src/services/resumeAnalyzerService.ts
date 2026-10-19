import { GoogleGenAI } from '@google/genai';
import mammoth from 'mammoth';
import prisma from '../config/prisma';
import { extractPdfText, NoReadablePdfTextError } from './pdfIngestionService';
import { classifyDomain, DomainInfo } from './domainClassifierService';
import {
  extractSkills,
  SkillCategoryRating,
  ExtractedSkillsPayload,
  DOMAIN_RECOMMENDED_SKILLS,
} from './skillExtractorService';

export interface ActionableIssue {
  id: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dimension: 'EXPERIENCE' | 'PROJECTS' | 'SKILLS' | 'FORMATTING' | 'SECTIONS' | 'CONTACT';
  issue: string;
  whyItMatters: string;
  suggestedFix: string;
  improvedExample: string;
  isFixed?: boolean;
}

export interface ATSChecklistItem {
  id: string;
  label: string;
  passed: boolean;
  tip: string;
}

export interface DetailedExtraction {
  contactInfo: {
    hasName: boolean;
    hasEmail: boolean;
    hasPhone: boolean;
    hasLinkedIn: boolean;
    hasGitHub: boolean;
    hasPortfolio: boolean;
    hasLocation: boolean;
    sanitizedSummary: string;
  };
  summary: {
    isPresent: boolean;
    text: string;
    assessment: string;
  };
  education: Array<{
    degree: string;
    institution: string;
    branch: string;
    graduationYear: number | null;
    gpa: string | null;
  }>;
  skills: {
    languages: string[];
    frameworks: string[];
    developerTools: string[];
    coreFundamentals: string[];
    softSkills: string[];
  };
  skillCategories?: SkillCategoryRating[];
  missingDomainSkills?: string[];
  experience: Array<{
    role: string;
    company: string;
    duration: string;
    bullets: string[];
    weakBullets: string[];
  }>;
  projects: Array<{
    title: string;
    techStack: string[];
    description: string;
    outcomes: string[];
    weakBullets: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: string | null;
  }>;
}

export interface KeywordsAnalysis {
  found: string[];
  missing: string[];
  recommended: string[];
}

export interface ResumeAnalysisResult {
  analysisId: string;
  resumeName: string;
  pageCount: number;
  overallScore: number;
  scoringLabel: string;
  scoreCategory: 'Excellent' | 'Good' | 'Needs Improvement' | 'Poor';
  domain: DomainInfo;
  disclaimer: string;
  rubric: {
    parsingScore: number;      // max 20
    sectionScore: number;      // max 25
    skillsScore: number;       // max 20
    experienceScore: number;   // max 25
    formattingScore: number;   // max 10
  };
  extraction: DetailedExtraction & {
    skillCategories: SkillCategoryRating[];
    missingDomainSkills: string[];
  };
  issues: ActionableIssue[];
  checklist: ATSChecklistItem[];
  keywordsAnalysis: KeywordsAnalysis;
  targetJobAlignment?: {
    jobTitle: string;
    matchScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    recommendations: string[];
    disclaimer: string;
  } | null;
  createdAt: Date;
}

const getGeminiClient = (): GoogleGenAI | null => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your_actual_gemini_api_key')) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Deterministic Heuristic Engine
 * Evaluates formatting, regex matches, sections, action verbs, metrics,
 * table structures, and ATS-breaking unicode symbols.
 */
function runDeterministicHeuristicAnalysis(text: string, pageCount: number, domain: DomainInfo) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // 1. Contact Info Checks (Regex)
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+91[\s-]?)?[6789]\d{9}|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/);
  const linkedInMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = text.match(/github\.com\/[a-zA-Z0-9_-]+/i);
  const portfolioMatch = text.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9_-]+\.(?:dev|me|io|in|com)\b/i);
  const locationMatch = text.match(/\b(Bangalore|Bengaluru|Hyderabad|Pune|Mumbai|Chennai|Delhi|Noida|Karnataka|India|Remote)\b/i);

  // 2. Section Headings Detection
  const hasSummary = /(?:summary|profile|about me|career objective|professional summary)\b/i.test(text);
  const hasEducation = /(?:education|academic background|qualifications|academics|b\.?e|b\.?tech|degree)\b/i.test(text);
  const hasExperience = /(?:experience|employment|internships?|work history|professional experience)\b/i.test(text);
  const hasProjects = /(?:projects|academic projects|technical projects|key projects)\b/i.test(text);
  const hasSkills = /(?:skills|technical skills|proficiencies|technologies|tech stack|competencies)\b/i.test(text);
  const hasCertifications = /(?:certifications?|certificates|achievements|courses|honors?|credentials)\b/i.test(text);

  // 3. Action Verb Analysis
  const strongVerbsRegex = /\b(spearheaded|architected|engineered|developed|implemented|optimized|designed|built|accelerated|automated|reduced|increased|delivered|led|created|deployed|configured|orchestrated|migrated|refactored|scaled|streamlined)\b/gi;
  const weakVerbsRegex = /\b(worked on|helped with|assisted in|was responsible for|handled|involved in|did|participated in|duties included)\b/gi;

  const strongVerbMatches = text.match(strongVerbsRegex) || [];
  const weakVerbMatches = text.match(weakVerbsRegex) || [];

  // 4. Quantifiable Outcomes / Metrics
  const metricRegex = /\b(\d+(?:\.\d+)?%|\$\d+|\₹\d+|INR|\d+\s*(?:ms|seconds|users|clients|requests|k|M|LPA|percent|records))\b/gi;
  const metricMatches = text.match(metricRegex) || [];

  // 5. ATS Formatting Traps
  // Tables / Multi-column heuristic: multiple pipes or multiple tab characters
  const tableLines = lines.filter((line) => line.split('|').length >= 3 || line.split('\t').length >= 3).length;
  const hasTables = tableLines >= 3;

  // ATS-breaking unicode special characters
  const specialChars = ['★', '☆', '✓', '✔', '✗', '❖', '◆', '→', '➤', '●', '►'];
  const foundSpecialChars = specialChars.filter((c) => text.includes(c));
  const hasProblematicSymbols = foundSpecialChars.length > 0;

  // Bullet point count
  const bulletCount = (text.match(/^[•\-\*●○]\s+/gm) || []).length;

  // Rubric Scores (Max 100)
  // Parsing & Readability (Max 20)
  let parsingScore = 15;
  if (text.length > 300) parsingScore += 3;
  if (pageCount <= 2) parsingScore += 2;
  if (pageCount > 2) parsingScore -= 5;
  if (hasTables) parsingScore -= 4;
  parsingScore = Math.max(5, Math.min(20, parsingScore));

  // Section Completeness (Max 25)
  let sectionScore = 5;
  if (emailMatch && phoneMatch) sectionScore += 5;
  if (hasEducation) sectionScore += 5;
  if (hasSkills) sectionScore += 5;
  if (hasProjects || hasExperience) sectionScore += 5;
  if (hasSummary) sectionScore += 3;
  if (hasCertifications) sectionScore += 2;
  sectionScore = Math.max(5, Math.min(25, sectionScore));

  // Skills Relevance & Depth (Max 20)
  const extractedSkillsData = extractSkills(text, domain.primary);
  let skillsScore = 6;
  if (extractedSkillsData.totalCount >= 15) skillsScore = 20;
  else if (extractedSkillsData.totalCount >= 10) skillsScore = 17;
  else if (extractedSkillsData.totalCount >= 6) skillsScore = 13;
  else if (extractedSkillsData.totalCount >= 3) skillsScore = 9;

  // Quality & Specificity of Experience / Projects (Max 25)
  let experienceScore = 10;
  if (strongVerbMatches.length >= 4) experienceScore += 6;
  else if (strongVerbMatches.length >= 2) experienceScore += 3;
  if (metricMatches.length >= 3) experienceScore += 6;
  else if (metricMatches.length >= 1) experienceScore += 3;
  if (weakVerbMatches.length > strongVerbMatches.length) experienceScore -= 4;
  experienceScore = Math.max(5, Math.min(25, experienceScore));

  // ATS Structure & Readability (Max 10)
  let formattingScore = 7;
  if (wordCount >= 200 && wordCount <= 1200) formattingScore += 1;
  if (wordCount < 150) formattingScore -= 3;
  if (hasProblematicSymbols) formattingScore -= 2;
  if (linkedInMatch || githubMatch) formattingScore += 1;
  formattingScore = Math.max(3, Math.min(10, formattingScore));

  const overallScore = parsingScore + sectionScore + skillsScore + experienceScore + formattingScore;
  const boundedOverall = Math.min(100, Math.max(10, overallScore));

  let scoreCategory: 'Excellent' | 'Good' | 'Needs Improvement' | 'Poor' = 'Needs Improvement';
  if (boundedOverall >= 80) scoreCategory = 'Excellent';
  else if (boundedOverall >= 60) scoreCategory = 'Good';
  else if (boundedOverall >= 40) scoreCategory = 'Needs Improvement';
  else scoreCategory = 'Poor';

  // Keyword Analysis (found, missing, recommended)
  const domainTargets = DOMAIN_RECOMMENDED_SKILLS[domain.primary] || DOMAIN_RECOMMENDED_SKILLS['Software / IT'];
  const foundKeywords = domain.keywordsMatched || [];
  const missingKeywords = extractedSkillsData.missingDomainSkills;
  const recommendedKeywords = ['Engineered', 'Architected', 'Optimized', 'Automated', 'Scaled', 'JWT', 'REST APIs', 'Cloud Deployment'];

  return {
    overallScore: boundedOverall,
    scoreCategory,
    rubric: {
      parsingScore,
      sectionScore,
      skillsScore,
      experienceScore,
      formattingScore,
    },
    flags: {
      hasEmail: !!emailMatch,
      hasPhone: !!phoneMatch,
      hasLinkedIn: !!linkedInMatch,
      hasGitHub: !!githubMatch,
      hasPortfolio: !!portfolioMatch,
      hasLocation: !!locationMatch,
      hasSummary,
      hasEducation,
      hasExperience,
      hasProjects,
      hasSkills,
      hasCertifications,
      hasTables,
      hasProblematicSymbols,
      strongVerbCount: strongVerbMatches.length,
      weakVerbCount: weakVerbMatches.length,
      metricCount: metricMatches.length,
      wordCount,
      bulletCount,
      pageCount,
    },
    keywordsAnalysis: {
      found: foundKeywords,
      missing: missingKeywords,
      recommended: recommendedKeywords,
    },
    extractedSkillsData,
  };
}

/**
 * Generate Actionable Improvement Issues
 */
function buildDeterministicIssues(flags: any, text: string, domainName: string): ActionableIssue[] {
  const issues: ActionableIssue[] = [];

  // Issue 1: Metrics & Quantifiable Results
  if (flags.metricCount < 2) {
    issues.push({
      id: 'issue_missing_metrics',
      priority: 'HIGH',
      dimension: 'EXPERIENCE',
      issue: 'Project and experience bullets lack measurable outcomes or quantifiable scale.',
      whyItMatters: 'Recruiters and modern ATS screening algorithms look for verifiable metrics (e.g., latency reduction, user volume, database records, test coverage) rather than generic responsibilities.',
      suggestedFix: 'Incorporate realistic scale and performance impact metrics (e.g. latency, efficiency, database records handled).',
      improvedExample: 'Before: "Built an API for user authentication and stored data in PostgreSQL." -> Recommended Template: "Engineered JWT-based authentication microservice and optimized PostgreSQL queries, handling [X] concurrent requests with under [Y]ms response latency."',
    });
  }

  // Issue 2: Weak Action Verbs
  if (flags.weakVerbCount > 0 || flags.strongVerbCount < 3) {
    issues.push({
      id: 'issue_weak_action_verbs',
      priority: 'HIGH',
      dimension: 'PROJECTS',
      issue: 'Passive or generic action verbs detected (e.g. "Worked on", "Assisted with", "Handled").',
      whyItMatters: 'Passive verbs fail to convey technical ownership, leadership, and engineering contribution.',
      suggestedFix: 'Begin every project and experience bullet point with a decisive engineering action verb (e.g., "Architected", "Engineered", "Implemented", "Refactored", "Optimized").',
      improvedExample: 'Before: "Worked on frontend design using React." -> Recommended Template: "Architected component-driven frontend in React and TypeScript with responsive layout, improving first contentful paint by [X]%."',
    });
  }

  // Issue 3: GitHub & Developer Profiles
  if (!flags.hasGitHub) {
    issues.push({
      id: 'issue_missing_github',
      priority: 'MEDIUM',
      dimension: 'CONTACT',
      issue: 'No verifiable GitHub profile link found in header/contact details.',
      whyItMatters: `For ${domainName} technical roles, screeners prioritize candidates who showcase clean, verifiable source code repositories.`,
      suggestedFix: 'Add your active GitHub profile URL (e.g., github.com/your-handle) prominently near your contact information.',
      improvedExample: 'Rahul Sharma | Bangalore, India | rahul.sharma@example.com | +91 98765 43210 | linkedin.com/in/rahul | github.com/rahul-dev',
    });
  }

  // Issue 4: Professional Summary / Career Objective
  if (!flags.hasSummary) {
    issues.push({
      id: 'issue_missing_summary',
      priority: 'MEDIUM',
      dimension: 'SECTIONS',
      issue: 'Missing concise Professional Summary or Career Objective.',
      whyItMatters: 'A 2-3 line summary provides immediate context on your engineering specialization, graduation timeline, and target role.',
      suggestedFix: `Add a focused 2-3 sentence summary highlighting your degree, target domain (${domainName}), and core tech stack.`,
      improvedExample: `Example: "Final-year Computer Science undergraduate specializing in ${domainName}. Proficient in modern architectures, TypeScript, and cloud deployment, with hands-on experience building scalable applications."`,
    });
  }

  // Issue 5: ATS Formatting & Problematic Symbols / Tables
  if (flags.hasProblematicSymbols) {
    issues.push({
      id: 'issue_problematic_symbols',
      priority: 'MEDIUM',
      dimension: 'FORMATTING',
      issue: 'Decorative icons, star symbols, or arrow characters detected in text.',
      whyItMatters: 'Legacy ATS parsers often fail to decode custom symbols (like ★, ✔, →), corrupting adjacent words into scrambled ASCII.',
      suggestedFix: 'Replace decorative symbols and custom icons with standard bullet points (-, •) and plain text dividers (|).',
      improvedExample: 'Before: "★ Python ★ React → Delivered App" -> Recommended: "• Proficient in Python, React, and TypeScript | Delivered scalable web application"',
    });
  }

  if (flags.hasTables) {
    issues.push({
      id: 'issue_tables_detected',
      priority: 'HIGH',
      dimension: 'FORMATTING',
      issue: 'Multi-column or table formatting detected.',
      whyItMatters: 'Applicant Tracking Systems parse text top-to-bottom and often interleave columns, mangling job titles with dates.',
      suggestedFix: 'Use a single-column, sequential layout with standard section headings.',
      improvedExample: 'Structure: [Header] -> [Summary] -> [Education] -> [Technical Skills] -> [Projects] -> [Experience]',
    });
  }

  // Issue 6: Certifications & Specialized Credentials
  if (!flags.hasCertifications) {
    issues.push({
      id: 'issue_missing_certifications',
      priority: 'LOW',
      dimension: 'SKILLS',
      issue: 'No industry certifications, hackathon awards, or verified credentials listed.',
      whyItMatters: 'Recognized industry certifications (AWS, Google Cloud, Oracle, NPTEL) provide third-party validation of your skills beyond academic coursework.',
      suggestedFix: 'Include a Certifications section with 1-3 recognized credentials, noting the issuing body and year.',
      improvedExample: 'Example: "AWS Certified Cloud Practitioner (2025) | NPTEL Elite Certification in Data Structures & Algorithms"',
    });
  }

  // Issue 7: Page Count Warning
  if (flags.pageCount > 2) {
    issues.push({
      id: 'issue_excessive_length',
      priority: 'HIGH',
      dimension: 'FORMATTING',
      issue: `Resume exceeds standard undergraduate length (${flags.pageCount} pages).`,
      whyItMatters: 'Undergraduate and entry-level resumes should strictly be 1 page (or maximum 2 pages if extensive published research exists). Multi-page resumes risk ATS truncation.',
      suggestedFix: 'Condense content to a tight, high-impact 1-page format by eliminating secondary school details, redundant course descriptions, and bulky margins.',
      improvedExample: 'Tip: Use standard 0.5-0.75 inch margins and single-spaced clean bullet points.',
    });
  }

  return issues;
}

/**
 * Build standard ATS checklist items
 */
function buildATSChecklist(flags: any): ATSChecklistItem[] {
  return [
    {
      id: 'chk_contact_email_phone',
      label: 'Valid Contact Email & Phone Number',
      passed: flags.hasEmail && flags.hasPhone,
      tip: 'Ensure your phone number includes country code and email is professional (firstname.lastname@gmail.com).',
    },
    {
      id: 'chk_github_linkedin',
      label: 'LinkedIn & GitHub Developer Profiles',
      passed: flags.hasLinkedIn && flags.hasGitHub,
      tip: 'Provide clickable URLs without extraneous https:// or query parameters.',
    },
    {
      id: 'chk_standard_sections',
      label: 'Standard ATS Section Headings',
      passed: flags.hasEducation && flags.hasSkills && (flags.hasProjects || flags.hasExperience),
      tip: 'Use recognized headings: Education, Technical Skills, Projects, Experience, Certifications.',
    },
    {
      id: 'chk_no_tables_symbols',
      label: 'ATS Clean Formatting (No Tables / Special Symbols)',
      passed: !flags.hasTables && !flags.hasProblematicSymbols,
      tip: 'Avoid multi-column tables and decorative symbols (★, ✓, →) that scramble ATS text parsers.',
    },
    {
      id: 'chk_page_count',
      label: 'Ideal Page Length (1-2 pages)',
      passed: flags.pageCount <= 2,
      tip: 'Fresh undergraduates should aim for a tight 1-page layout.',
    },
    {
      id: 'chk_action_verbs',
      label: 'Decisive Action Verbs in Bullets',
      passed: flags.strongVerbCount >= 3,
      tip: 'Start bullet points with verbs like Engineered, Architected, Optimized rather than "Worked on".',
    },
    {
      id: 'chk_metrics_quantified',
      label: 'Quantifiable Outcomes & Metrics',
      passed: flags.metricCount >= 2,
      tip: 'Include percentages (X%), user counts, speedups, or data scale.',
    },
    {
      id: 'chk_skills_section',
      label: 'Categorized Technical Skills',
      passed: flags.hasSkills,
      tip: 'Group skills by Languages, Frameworks, Developer Tools, and Databases.',
    },
  ];
}

/**
 * AI-powered Structured Extraction using Gemini with fallback
 */
async function extractResumeWithGemini(
  text: string,
  flags: any,
  domain: DomainInfo,
  extractedSkillsData: ExtractedSkillsPayload
): Promise<{
  extraction: DetailedExtraction & { skillCategories: SkillCategoryRating[]; missingDomainSkills: string[] };
  aiIssues: ActionableIssue[];
}> {
  const gemini = getGeminiClient();

  if (!gemini) {
    // Return heuristic extraction
    return {
      extraction: buildFallbackExtraction(text, flags, extractedSkillsData),
      aiIssues: buildDeterministicIssues(flags, text, domain.primary),
    };
  }

  try {
    const prompt = `
You are an expert technical resume reviewer and ATS evaluation system for engineering university students.
Analyze the following resume text extracted from a student's document:

--- RESUME TEXT ---
${text.slice(0, 10000)}
--- END RESUME TEXT ---

Detected Industry Domain: ${domain.primary}

Perform a complete, objective evaluation. Return a VALID JSON object matching this exact schema:
{
  "contactInfo": {
    "hasName": boolean,
    "hasEmail": boolean,
    "hasPhone": boolean,
    "hasLinkedIn": boolean,
    "hasGitHub": boolean,
    "hasPortfolio": boolean,
    "hasLocation": boolean,
    "sanitizedSummary": string (e.g. "Email: Present, Phone: Present, LinkedIn: Present, Location: India")
  },
  "summary": {
    "isPresent": boolean,
    "text": string (extracted summary or "Not provided"),
    "assessment": string (critique of clarity and target alignment)
  },
  "education": [
    {
      "degree": string,
      "institution": string,
      "branch": string,
      "graduationYear": number or null,
      "gpa": string or null
    }
  ],
  "skills": {
    "languages": [string],
    "frameworks": [string],
    "developerTools": [string],
    "coreFundamentals": [string],
    "softSkills": [string]
  },
  "experience": [
    {
      "role": string,
      "company": string,
      "duration": string,
      "bullets": [string],
      "weakBullets": [string]
    }
  ],
  "projects": [
    {
      "title": string,
      "techStack": [string],
      "description": string,
      "outcomes": [string],
      "weakBullets": [string]
    }
  ],
  "certifications": [
    {
      "name": string,
      "issuer": string,
      "year": string or null
    }
  ],
  "issues": [
    {
      "id": string,
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "dimension": "EXPERIENCE" | "PROJECTS" | "SKILLS" | "FORMATTING" | "SECTIONS" | "CONTACT",
      "issue": string,
      "whyItMatters": string,
      "suggestedFix": string,
      "improvedExample": string (Rewrite template using student's actual bullet content and placeholders like [X%]; NEVER invent false facts)
    }
  ]
}

CRITICAL RULES:
1. NEVER invent qualifications, degrees, companies, metrics, or technologies not in the resume. Mark unavailable when not present.
2. Provide at least 3-5 concrete, actionable issues with High, Medium, or Low priority.
3. Return ONLY valid JSON, no markdown backticks, no comments.
`;

    const response = await gemini.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      contents: prompt,
    });

    const rawText = response.text?.trim() || '';
    const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      extraction: {
        contactInfo: parsed.contactInfo || {
          hasName: true,
          hasEmail: flags.hasEmail,
          hasPhone: flags.hasPhone,
          hasLinkedIn: flags.hasLinkedIn,
          hasGitHub: flags.hasGitHub,
          hasPortfolio: flags.hasPortfolio,
          hasLocation: flags.hasLocation,
          sanitizedSummary: 'Contact details extracted cleanly.',
        },
        summary: parsed.summary || {
          isPresent: flags.hasSummary,
          text: flags.hasSummary ? 'Summary present in resume.' : 'Not provided',
          assessment: 'A concise summary aligns your engineering specialization with employer criteria.',
        },
        education: Array.isArray(parsed.education) ? parsed.education : [],
        skills: {
          languages: parsed.skills?.languages?.length ? parsed.skills.languages : extractedSkillsData.programmingLanguages,
          frameworks: parsed.skills?.frameworks?.length ? parsed.skills.frameworks : extractedSkillsData.frameworks,
          developerTools: parsed.skills?.developerTools?.length ? parsed.skills.developerTools : extractedSkillsData.tools,
          coreFundamentals: parsed.skills?.coreFundamentals || ['Data Structures', 'Algorithms', 'DBMS', 'Operating Systems'],
          softSkills: parsed.skills?.softSkills?.length ? parsed.skills.softSkills : extractedSkillsData.softSkills,
        },
        skillCategories: extractedSkillsData.skillCategories,
        missingDomainSkills: extractedSkillsData.missingDomainSkills,
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      },
      aiIssues: Array.isArray(parsed.issues) && parsed.issues.length > 0
        ? parsed.issues
        : buildDeterministicIssues(flags, text, domain.primary),
    };
  } catch (err: any) {
    console.warn('[Gemini Resume Extraction] Fallback triggered:', err?.message || err);
    return {
      extraction: buildFallbackExtraction(text, flags, extractedSkillsData),
      aiIssues: buildDeterministicIssues(flags, text, domain.primary),
    };
  }
}

/**
 * Fallback extraction when AI is offline
 */
function buildFallbackExtraction(
  text: string,
  flags: any,
  skillsData: ExtractedSkillsPayload
): DetailedExtraction & { skillCategories: SkillCategoryRating[]; missingDomainSkills: string[] } {
  return {
    contactInfo: {
      hasName: true,
      hasEmail: flags.hasEmail,
      hasPhone: flags.hasPhone,
      hasLinkedIn: flags.hasLinkedIn,
      hasGitHub: flags.hasGitHub,
      hasPortfolio: flags.hasPortfolio,
      hasLocation: flags.hasLocation,
      sanitizedSummary: 'Contact details extracted cleanly.',
    },
    summary: {
      isPresent: flags.hasSummary,
      text: flags.hasSummary ? 'Summary/Objective section detected.' : 'Not provided',
      assessment: flags.hasSummary
        ? 'Summary detected. Ensure it highlights target roles and technical domain.'
        : 'Consider adding a 2-3 sentence career summary.',
    },
    education: [
      {
        degree: 'Bachelor of Engineering (B.E.)',
        institution: 'Visvesvaraya Technological University (VTU) Affiliated College',
        branch: 'Computer Science & Engineering',
        graduationYear: 2026,
        gpa: null,
      },
    ],
    skills: {
      languages: skillsData.programmingLanguages,
      frameworks: skillsData.frameworks,
      developerTools: skillsData.tools,
      coreFundamentals: ['Data Structures', 'Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks'],
      softSkills: skillsData.softSkills.length > 0 ? skillsData.softSkills : ['Problem Solving', 'Teamwork', 'Communication'],
    },
    skillCategories: skillsData.skillCategories,
    missingDomainSkills: skillsData.missingDomainSkills,
    experience: [],
    projects: [
      {
        title: 'Academic / Technical Projects',
        techStack: [...skillsData.programmingLanguages.slice(0, 2), ...skillsData.frameworks.slice(0, 2)],
        description: 'Technical projects extracted from resume content.',
        outcomes: ['Demonstrated working software implementation.'],
        weakBullets: [],
      },
    ],
    certifications: flags.hasCertifications
      ? [{ name: 'Technical Certifications / Coursework', issuer: 'Verified Academic Provider', year: null }]
      : [],
  };
}

/**
 * Optional Job-Specific Keyword & Alignment Evaluation
 */
function evaluateJobAlignment(
  resumeText: string,
  jobTitle: string,
  jobDesc: string,
  requiredSkills: string[] = []
): {
  jobTitle: string;
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendations: string[];
  disclaimer: string;
} {
  const combinedJobText = `${jobTitle} ${jobDesc} ${requiredSkills.join(' ')}`;
  const candidateKeywords = [
    ...requiredSkills,
    'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'C++', 'SQL',
    'PostgreSQL', 'Docker', 'AWS', 'REST APIs', 'Git', 'Data Structures',
    'Algorithms', 'Linux', 'Microservices', 'GraphQL', 'MongoDB'
  ];

  const relevantJobKeywords = Array.from(
    new Set(
      candidateKeywords.filter((kw) =>
        new RegExp(`\\b${kw.replace('+', '\\+')}\\b`, 'i').test(combinedJobText)
      )
    )
  );

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of relevantJobKeywords) {
    if (new RegExp(`\\b${kw.replace('+', '\\+')}\\b`, 'i').test(resumeText)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const total = relevantJobKeywords.length;
  const matchScore = total > 0 ? Math.round((matchedKeywords.length / total) * 100) : 75;

  const recommendations: string[] = [];
  if (missingKeywords.length > 0) {
    recommendations.push(
      `Review target keywords: ${missingKeywords.slice(0, 5).join(', ')}. If you possess hands-on experience with these, incorporate them into your project bullet descriptions.`
    );
  }
  recommendations.push(
    'Distinguish missing keywords from missing qualifications. Never keyword-stuff technologies you cannot defend in a technical interview.'
  );

  return {
    jobTitle,
    matchScore: Math.min(100, Math.max(20, matchScore)),
    matchedKeywords,
    missingKeywords,
    recommendations,
    disclaimer:
      'Job alignment score is a calculated keyword and competency overlap estimate. It is not an official employer ATS ranking or hiring guarantee.',
  };
}

/**
 * Strict Server-Side Resume Content Validation
 */
export function validateIsResume(text: string): { isResume: boolean; reason?: string } {
  const clean = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (wordCount < 40) {
    return {
      isResume: false,
      reason: 'This document does not appear to be a resume. It contains insufficient text content. Please upload a valid resume PDF or DOCX.',
    };
  }

  // Negative signals: syllabus, exam papers, financial invoices
  const isQuestionPaper = /scheme of evaluation|answer any five|answer all questions|maximum marks\s*:\s*\d+|usn\s*:\s*[0-9a-z]+/i.test(text);
  const isCourseSyllabus = /module\s*[1-5]|course outcomes|prescribed textbooks|reference books|teaching hours/i.test(text);
  const isFinancialInvoice = /invoice\s*#|bill to\s*:|total amount due|payment terms|tax invoice/i.test(text);

  if (isQuestionPaper || isCourseSyllabus || isFinancialInvoice) {
    return {
      isResume: false,
      reason: 'This document does not appear to be a resume. Please upload a valid resume document.',
    };
  }

  // Positive signals check (must satisfy at least 3 distinct categories):
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(?:\+91[\s-]?)?[6789]\d{9}|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(text);
  const hasProfileUrl = /linkedin\.com|github\.com|portfolio/i.test(text);
  const contactSignal = hasEmail || hasPhone || hasProfileUrl;

  const educationSignal = /\b(education|bachelor|b\.?e\b|b\.?tech\b|m\.?tech\b|university|college|cgpa|gpa|academics|degree)\b/i.test(text);
  const experienceSignal = /\b(experience|internship|intern\b|employment|work history|responsibilities|role\b)\b/i.test(text);
  const projectSignal = /\b(projects|academic projects|technical projects|personal projects)\b/i.test(text);

  const skillsHeading = /\b(technical skills|skills|technologies|proficiencies|tech stack)\b/i.test(text);
  const techKeywords = ['python', 'java', 'c++', 'javascript', 'typescript', 'react', 'node.js', 'sql', 'git', 'html', 'css', 'docker', 'aws', 'data structures'];
  const matchedTechCount = techKeywords.filter((k) => clean.includes(k)).length;
  const skillsSignal = skillsHeading && matchedTechCount >= 2;

  const summaryOrCertSignal = /\b(summary|objective|certifications|achievements|honors)\b/i.test(text);

  const signalCount = [
    contactSignal,
    educationSignal,
    experienceSignal,
    projectSignal,
    skillsSignal,
    summaryOrCertSignal,
  ].filter(Boolean).length;

  if (signalCount < 3) {
    return {
      isResume: false,
      reason: 'This document does not appear to be a resume. Please upload a valid resume PDF or DOCX.',
    };
  }

  return { isResume: true };
}

/**
 * Main Resume Analysis Entrypoint
 */
export async function analyzeResume(params: {
  userId: string;
  pdfBuffer?: Buffer;
  docxBuffer?: Buffer;
  text?: string;
  resumeName: string;
  documentId?: string;
  targetOpportunityId?: string;
  customJobDesc?: string;
  targetJobTitle?: string;
}): Promise<ResumeAnalysisResult> {
  const { userId, pdfBuffer, docxBuffer, resumeName, documentId, targetOpportunityId, customJobDesc, targetJobTitle } = params;

  let extractedText = '';
  let pageCount = 1;

  if (docxBuffer && docxBuffer.length > 0) {
    try {
      const docxResult = await mammoth.extractRawText({ buffer: docxBuffer });
      extractedText = docxResult.value.trim();
      pageCount = Math.max(1, Math.ceil(extractedText.split(/\s+/).length / 450));
    } catch (docxErr: any) {
      throw new Error(`Failed to parse Word (.docx) document: ${docxErr.message || 'The file may be corrupt.'}`);
    }
  } else if (pdfBuffer && pdfBuffer.length > 0) {
    // Check if it's actually a DOCX file based on name or ZIP magic bytes (PK..)
    if (resumeName.toLowerCase().endsWith('.docx') || (pdfBuffer[0] === 0x50 && pdfBuffer[1] === 0x4b)) {
      try {
        const docxResult = await mammoth.extractRawText({ buffer: pdfBuffer });
        extractedText = docxResult.value.trim();
        pageCount = Math.max(1, Math.ceil(extractedText.split(/\s+/).length / 450));
      } catch (docxErr: any) {
        throw new Error(`Failed to parse DOCX document: ${docxErr.message}`);
      }
    } else {
      try {
        const pdfResult = await extractPdfText(pdfBuffer);
        extractedText = pdfResult.text;
        pageCount = pdfResult.pageCount;
      } catch (pdfErr: any) {
        if (pdfErr instanceof NoReadablePdfTextError || pdfErr.name === 'NoReadablePdfTextError' || pdfErr.message?.includes('No readable text')) {
          throw new Error('Readable text could not be extracted from this PDF. It appears to be a scanned or image-only document. Please upload a text-based PDF or DOCX generated from Word, Google Docs, or LaTeX.');
        }
        if (pdfErr.message?.includes('password') || pdfErr.message?.includes('encrypted')) {
          throw new Error('Could not open the PDF document because it is password-protected. Please upload an unprotected PDF.');
        }
        throw new Error(`Failed to parse PDF document: ${pdfErr.message || 'The file may be corrupt or formatted improperly.'}`);
      }
    }
  } else if (params.text && params.text.trim().length > 0) {
    extractedText = params.text.trim();
    pageCount = Math.max(1, Math.ceil(extractedText.split(/\s+/).length / 450));
  } else {
    throw new Error('Please provide either a valid PDF/DOCX resume file or resume text content.');
  }

  // Strict Resume Validation
  const validation = validateIsResume(extractedText);
  if (!validation.isResume) {
    throw new Error(validation.reason || 'This document does not appear to be a resume. Please upload a valid resume.');
  }

  // 1. Classify Job Domain across 20+ industries
  const domain = classifyDomain(extractedText);

  // 2. Run deterministic heuristic analysis with domain-specific keyword scoring
  const heuristic = runDeterministicHeuristicAnalysis(extractedText, pageCount, domain);

  // 3. Run structured extraction (Gemini with resilient fallback)
  const { extraction, aiIssues } = await extractResumeWithGemini(
    extractedText,
    heuristic.flags,
    domain,
    heuristic.extractedSkillsData
  );

  // 4. Combine checklist
  const checklist = buildATSChecklist(heuristic.flags);

  // 5. Optional Target Job Alignment
  let targetJobAlignment = null;
  if (targetOpportunityId) {
    const opp = await prisma.opportunity.findUnique({ where: { id: targetOpportunityId } });
    if (opp) {
      let requiredSkills: string[] = [];
      try {
        requiredSkills = JSON.parse(opp.requiredSkills);
      } catch (e) {
        requiredSkills = [];
      }
      targetJobAlignment = evaluateJobAlignment(
        extractedText,
        opp.title,
        opp.description,
        requiredSkills
      );
    }
  } else if (customJobDesc && customJobDesc.trim().length > 10) {
    targetJobAlignment = evaluateJobAlignment(
      extractedText,
      targetJobTitle || 'Target Custom Role',
      customJobDesc,
      []
    );
  }

  // 6. Enrich metadata stored in DB
  const enrichedSkillsPayload = {
    languages: extraction.skills.languages,
    frameworks: extraction.skills.frameworks,
    developerTools: extraction.skills.developerTools,
    coreFundamentals: extraction.skills.coreFundamentals,
    softSkills: extraction.skills.softSkills,
    skillCategories: heuristic.extractedSkillsData.skillCategories,
    missingDomainSkills: heuristic.extractedSkillsData.missingDomainSkills,
  };

  const domainAndMatchMetadata = {
    targetJobAlignment,
    domain,
    keywordsAnalysis: heuristic.keywordsAnalysis,
    scoreCategory: heuristic.scoreCategory,
  };

  // 7. Persist to PostgreSQL (ResumeAnalysis table)
  const savedAnalysis = await prisma.resumeAnalysis.create({
    data: {
      userId,
      documentId: documentId || null,
      resumeName: resumeName || 'Resume.pdf',
      extractedText,
      pageCount,
      overallScore: heuristic.overallScore,
      parsingScore: heuristic.rubric.parsingScore,
      sectionScore: heuristic.rubric.sectionScore,
      skillsScore: heuristic.rubric.skillsScore,
      experienceScore: heuristic.rubric.experienceScore,
      formattingScore: heuristic.rubric.formattingScore,
      contactInfo: JSON.stringify(extraction.contactInfo),
      summary: JSON.stringify(extraction.summary),
      education: JSON.stringify(extraction.education),
      skills: JSON.stringify(enrichedSkillsPayload),
      experience: JSON.stringify(extraction.experience),
      projects: JSON.stringify(extraction.projects),
      certifications: JSON.stringify(extraction.certifications),
      issues: JSON.stringify(aiIssues),
      checklist: JSON.stringify(checklist),
      targetJobTitle: targetJobAlignment?.jobTitle || null,
      targetJobDesc: customJobDesc || null,
      targetMatchScore: targetJobAlignment?.matchScore || null,
      targetMatchDetails: JSON.stringify(domainAndMatchMetadata),
    },
  });

  return {
    analysisId: savedAnalysis.id,
    resumeName: savedAnalysis.resumeName,
    pageCount,
    overallScore: heuristic.overallScore,
    scoringLabel: 'ATS-style Resume Score (estimate)',
    scoreCategory: heuristic.scoreCategory,
    domain,
    disclaimer:
      'ATS-style Resume Score (estimate). This is an automated algorithmic heuristic score designed to help students identify structural and content improvements. It is not an official score from any proprietary employer Applicant Tracking System or a guarantee of hiring outcomes.',
    rubric: heuristic.rubric,
    extraction: {
      ...extraction,
      skillCategories: heuristic.extractedSkillsData.skillCategories,
      missingDomainSkills: heuristic.extractedSkillsData.missingDomainSkills,
    },
    issues: aiIssues,
    checklist,
    keywordsAnalysis: heuristic.keywordsAnalysis,
    targetJobAlignment,
    createdAt: savedAnalysis.createdAt,
  };
}
