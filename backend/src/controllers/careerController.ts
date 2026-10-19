import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/prisma';
import {
  syncAllOpportunityProviders,
} from '../services/jobDiscoveryService';
import {
  analyzeResume,
  ResumeAnalysisResult,
} from '../services/resumeAnalyzerService';
import {
  generateResumeReportPdf,
} from '../services/reportGeneratorService';
import {
  matchOpportunityWithResume,
} from '../services/opportunityMatcherService';
import {
  extractSkills,
} from '../services/skillExtractorService';
import {
  StudentProjectItem,
  DEFAULT_STUDENT_PROJECTS,
} from '../utils/careerSeed';

const mockProjects = new Map<string, StudentProjectItem[]>();

/**
 * GET /api/careers/opportunities
 * Fetches opportunities, applies category & search filters,
 * and ranks listings against the user's analyzed resume if one exists.
 */
export const getOpportunities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const userId = req.user.userId;
    const {
      category,
      search,
      minMatch,
      role,
      location,
      isRemote,
      employmentType,
      source,
      provider,
      includeResumeMatch,
    } = req.query;

    // Check if opportunities exist in database; if not, trigger initial sync
    const totalCount = await prisma.opportunity.count();
    if (totalCount === 0) {
      console.log('[Careers] Initializing first opportunity sync...');
      await syncAllOpportunityProviders();
    }

    // Build filter query
    const whereClause: any = {
      status: 'ACTIVE',
    };

    if (category && category !== 'ALL') {
      whereClause.category = String(category);
    }

    const andConditions: any[] = [];

    // Role filter (supports preset list or custom role search)
    if (role && role !== 'ALL' && role !== 'Other') {
      const roleQuery = String(role).trim();
      andConditions.push({
        OR: [
          { title: { contains: roleQuery, mode: 'insensitive' } },
          { description: { contains: roleQuery, mode: 'insensitive' } },
          { requiredSkills: { contains: roleQuery, mode: 'insensitive' } },
        ],
      });
    }

    // Search query
    if (search) {
      const q = String(search).trim();
      andConditions.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { company: { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } },
          { requiredSkills: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    // Location filter
    if (location) {
      const loc = String(location).trim();
      andConditions.push({
        location: { contains: loc, mode: 'insensitive' },
      });
    }

    // Remote-only filter
    if (isRemote === 'true') {
      whereClause.isRemote = true;
    }

    // Employment type filter
    if (employmentType && employmentType !== 'ALL') {
      const emp = String(employmentType).toUpperCase().replace(/\s+/g, '_');
      whereClause.employmentType = emp;
    }

    // Source / Provider filter
    const selectedProvider = provider || source;
    if (selectedProvider && selectedProvider !== 'ALL') {
      const pStr = String(selectedProvider).trim().toUpperCase();
      if (pStr.includes('ADZUNA')) {
        whereClause.provider = 'ADZUNA';
      } else if (pStr.includes('REMOTE')) {
        whereClause.provider = 'REMOTE_OK';
      } else if (pStr.includes('CAMPUS') || pStr.includes('VTU')) {
        whereClause.provider = 'VTU_CAMPUS_FEED';
      } else if (pStr.includes('GOVT')) {
        whereClause.provider = 'GOVT_NATIONAL_PORTAL';
      } else {
        whereClause.provider = { contains: pStr, mode: 'insensitive' };
      }
    }

    if (andConditions.length > 0) {
      whereClause.AND = andConditions;
    }

    const opportunities = await prisma.opportunity.findMany({
      where: whereClause,
      orderBy: { postedAt: 'desc' },
    });

    // Check student's applications (for historical reference only)
    const userApplications = await prisma.opportunityApplication.findMany({
      where: { userId },
      select: { opportunityId: true },
    });
    const appliedOppIds = new Set(userApplications.map((a) => a.opportunityId));

    // Optional resume personalization (only if explicitly requested via includeResumeMatch=true)
    const shouldPersonalize = includeResumeMatch === 'true';
    let latestAnalysis: any = null;
    let extractedResumeSkills: any = {};
    let studentProfile: any = null;

    if (shouldPersonalize) {
      latestAnalysis = await prisma.resumeAnalysis.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      studentProfile = await prisma.studentProfile.findUnique({
        where: { userId },
        select: { branch: true, semester: true },
      });

      if (latestAnalysis?.skills) {
        try {
          extractedResumeSkills = JSON.parse(latestAnalysis.skills);
        } catch (e) {
          extractedResumeSkills = {};
        }
      }
    }

    // Enrich opportunities
    let enriched = opportunities.map((opp) => {
      let reqSkills: string[] = [];
      let prefSkills: string[] = [];
      let eligibleBranches: string[] = [];
      let eligibleSemesters: number[] = [];

      try { reqSkills = JSON.parse(opp.requiredSkills); } catch (e) { reqSkills = []; }
      try { prefSkills = opp.preferredSkills ? JSON.parse(opp.preferredSkills) : []; } catch (e) { prefSkills = []; }
      try { eligibleBranches = opp.eligibleBranches ? JSON.parse(opp.eligibleBranches) : []; } catch (e) { eligibleBranches = []; }
      try { eligibleSemesters = opp.eligibleSemesters ? JSON.parse(opp.eligibleSemesters) : []; } catch (e) { eligibleSemesters = []; }

      const baseOpp = {
        id: opp.id,
        provider: opp.provider,
        externalId: opp.externalId,
        title: opp.title,
        company: opp.company,
        logoUrl: opp.logoUrl,
        category: opp.category,
        description: opp.description,
        requiredSkills: reqSkills,
        preferredSkills: prefSkills,
        eligibleBranches,
        eligibleSemesters,
        location: opp.location,
        isRemote: opp.isRemote,
        employmentType: opp.employmentType,
        salaryRange: opp.salaryRange,
        stipendOrSalary: opp.salaryRange || null,
        applyUrl: opp.applyUrl,
        deadline: opp.deadline,
        postedAt: opp.postedAt,
        status: opp.status,
        sourceProvenance: opp.sourceProvenance,
        hasApplied: appliedOppIds.has(opp.id),
      };

      if (shouldPersonalize && latestAnalysis) {
        const matchResult = matchOpportunityWithResume({
          opportunity: {
            title: opp.title,
            description: opp.description,
            category: opp.category,
            requiredSkills: reqSkills,
            preferredSkills: prefSkills,
            eligibleBranches,
            eligibleSemesters,
            location: opp.location,
            isRemote: opp.isRemote,
          },
          resumeText: latestAnalysis.extractedText,
          extractedSkills: extractedResumeSkills,
          studentProfile,
        });

        return {
          ...baseOpp,
          isPersonalized: true,
          matchPercentage: matchResult.matchPercentage,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
          rankingReasons: matchResult.rankingReasons,
          eligibilityEvidence: matchResult.eligibilityEvidence,
          scoringRuleSummary: matchResult.scoringRuleSummary,
        };
      }

      return {
        ...baseOpp,
        isPersonalized: false,
        matchPercentage: null,
        matchedSkills: [],
        missingSkills: [],
        rankingReasons: ['Standard provider listing'],
        eligibilityEvidence: studentProfile?.branch || 'General Undergraduate',
        scoringRuleSummary: null,
      };
    });

    if (shouldPersonalize && latestAnalysis) {
      enriched.sort((a, b) => ((b.matchPercentage || 0) - (a.matchPercentage || 0)));
      if (minMatch) {
        const minVal = parseInt(String(minMatch), 10);
        if (!isNaN(minVal)) {
          enriched = enriched.filter((o) => (o.matchPercentage || 0) >= minVal);
        }
      }
    }

    // Get last successful sync info
    const lastSyncLog = await prisma.opportunitySyncLog.findFirst({
      where: { status: 'SUCCESS' },
      orderBy: { completedAt: 'desc' },
    });

    return res.status(200).json({
      status: 'success',
      data: {
        total: enriched.length,
        hasPersonalizedRanking: !!latestAnalysis,
        analyzedResume: latestAnalysis
          ? {
              id: latestAnalysis.id,
              resumeName: latestAnalysis.resumeName,
              overallScore: latestAnalysis.overallScore,
              analyzedAt: latestAnalysis.createdAt,
            }
          : null,
        dataFreshness: {
          lastSyncTime: lastSyncLog?.completedAt || new Date(),
          isFresh: true,
          sourceProviders: ['Adzuna India Developer API', 'RemoteOK Developer Feed', 'VTU Campus Placement & Govt. Exam Feed'],
        },
        opportunities: enriched,
      },
    });
  } catch (error: any) {
    console.error('getOpportunities Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * POST /api/careers/apply/:id
 * Apply for an opportunity, persisted in PostgreSQL scoped to userId
 */
export const applyForOpportunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const userId = req.user.userId;
    const { id } = req.params;

    const opp = await prisma.opportunity.findUnique({
      where: { id },
    });

    if (!opp) {
      return res.status(404).json({ status: 'error', message: 'Opportunity not found' });
    }

    await prisma.opportunityApplication.upsert({
      where: {
        userId_opportunityId: {
          userId,
          opportunityId: id,
        },
      },
      update: {
        appliedAt: new Date(),
        status: 'SUBMITTED',
      },
      create: {
        userId,
        opportunityId: id,
        status: 'SUBMITTED',
      },
    });

    return res.status(200).json({
      status: 'success',
      message: `Application submitted successfully for ${opp.title} at ${opp.company}! Your credentials and digital profile have been linked.`,
      data: {
        opportunityId: opp.id,
        applyUrl: opp.applyUrl,
      },
    });
  } catch (error: any) {
    console.error('applyForOpportunity Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * POST /api/careers/sync
 * Manually trigger daily opportunity synchronization (admin / test)
 */
export const syncOpportunities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const result = await syncAllOpportunityProviders();

    return res.status(200).json({
      status: 'success',
      message: result.message,
      data: result,
    });
  } catch (error: any) {
    console.error('syncOpportunities Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * GET /api/careers/sync/status
 * Check current opportunity synchronization status and freshness
 */
export const getSyncStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lastLog = await prisma.opportunitySyncLog.findFirst({
      orderBy: { completedAt: 'desc' },
    });

    const totalActive = await prisma.opportunity.count({
      where: { status: 'ACTIVE' },
    });

    return res.status(200).json({
      status: 'success',
      data: {
        lastSync: lastLog || null,
        totalActiveOpportunities: totalActive,
        isFresh: lastLog ? (Date.now() - new Date(lastLog.completedAt).getTime() < 24 * 60 * 60 * 1000) : false,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * POST /api/careers/resume/analyze
 * Comprehensive Resume Evaluation with ATS Scoring and Actionable Improvement Report
 */
export const analyzeResumeController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const userId = req.user.userId;
    const {
      documentId,
      fileBase64,
      fileName,
      resumeText,
      targetOpportunityId,
      customJobDesc,
      targetJobTitle,
    } = req.body;

    let buffer: Buffer | undefined;
    let effectiveResumeName = fileName || 'Student_Resume.pdf';
    let effectiveDocumentId = documentId;

    // Case 1: Existing document chosen from Document Locker
    if (documentId) {
      const doc = await prisma.document.findUnique({
        where: { id: documentId, userId },
      });

      if (!doc) {
        return res.status(404).json({
          status: 'error',
          message: 'Document not found in your Document Locker.',
        });
      }

      if (!doc.fileData || doc.fileData.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Selected document has no binary data stored. Please upload a fresh PDF.',
        });
      }

      buffer = Buffer.from(doc.fileData);
      effectiveResumeName = doc.name;
    }
    // Case 2: New file uploaded directly (PDF or DOCX)
    else if (fileBase64) {
      const base64Data = String(fileBase64).replace(/^data:[^;]+;base64,/, '').trim();
      buffer = Buffer.from(base64Data, 'base64');

      if (buffer.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'The uploaded file is empty.',
        });
      }

      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({
          status: 'error',
          message: 'Resume file size exceeds the 5 MB limit.',
        });
      }

      const isPdfBytes = buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii').startsWith('%PDF-');
      const nameLower = (fileName || '').toLowerCase();
      const hasPdfExt = nameLower.endsWith('.pdf');

      if (!isPdfBytes || (fileName && !hasPdfExt)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid file format. Only PDF (.pdf) resume documents up to 5 MB are supported in Resume Analyzer.',
        });
      }

      effectiveResumeName = fileName || 'Uploaded_Resume.pdf';
    }

    const result = await analyzeResume({
      userId,
      pdfBuffer: buffer,
      text: resumeText,
      resumeName: effectiveResumeName,
      documentId: effectiveDocumentId,
      targetOpportunityId,
      customJobDesc,
      targetJobTitle,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Resume evaluated successfully with ATS-style score & improvement checklist.',
      data: result,
    });
  } catch (error: any) {
    console.error('analyzeResumeController Error:', error);
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to analyze resume.',
    });
  }
};

/**
 * GET /api/careers/resume/latest
 * Get the latest resume analysis for the authenticated student
 */
export const getLatestResumeAnalysis = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const analysis = await prisma.resumeAnalysis.findFirst({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!analysis) {
      return res.status(200).json({
        status: 'success',
        data: null,
      });
    }

    let extraction: any = {};
    let issues = [];
    let checklist = [];
    let targetJobAlignment = null;
    let domain = null;
    let keywordsAnalysis = null;
    let scoreCategory: 'Excellent' | 'Good' | 'Needs Improvement' | 'Poor' =
      analysis.overallScore >= 80 ? 'Excellent' : analysis.overallScore >= 60 ? 'Good' : analysis.overallScore >= 40 ? 'Needs Improvement' : 'Poor';

    try {
      extraction = {
        contactInfo: JSON.parse(analysis.contactInfo),
        summary: analysis.summary ? JSON.parse(analysis.summary) : null,
        education: JSON.parse(analysis.education),
        skills: JSON.parse(analysis.skills),
        experience: JSON.parse(analysis.experience),
        projects: JSON.parse(analysis.projects),
        certifications: JSON.parse(analysis.certifications),
      };
    } catch (e) {}

    try { issues = JSON.parse(analysis.issues); } catch (e) {}
    try { checklist = JSON.parse(analysis.checklist); } catch (e) {}

    try {
      const matchDetails = analysis.targetMatchDetails ? JSON.parse(analysis.targetMatchDetails) : null;
      if (matchDetails) {
        if (matchDetails.domain) {
          domain = matchDetails.domain;
          keywordsAnalysis = matchDetails.keywordsAnalysis;
          scoreCategory = matchDetails.scoreCategory || scoreCategory;
          targetJobAlignment = matchDetails.targetJobAlignment;
        } else {
          targetJobAlignment = matchDetails;
        }
      }
    } catch (e) {}

    // Fallback domain if legacy record
    if (!domain) {
      domain = {
        primary: 'Software / IT',
        confidence: 0.85,
        secondary: null,
        keywordsMatched: ['software', 'developer', 'engineer'],
        description: 'Software development, web/mobile applications, and IT systems',
      };
    }

    if (!keywordsAnalysis) {
      keywordsAnalysis = {
        found: domain.keywordsMatched || [],
        missing: extraction.skills?.missingDomainSkills || ['AWS', 'Docker', 'PostgreSQL', 'Microservices'],
        recommended: ['Engineered', 'Architected', 'Optimized', 'Automated'],
      };
    }

    return res.status(200).json({
      status: 'success',
      data: {
        analysisId: analysis.id,
        resumeName: analysis.resumeName,
        pageCount: analysis.pageCount,
        overallScore: analysis.overallScore,
        scoringLabel: 'ATS-style Resume Score (estimate)',
        scoreCategory,
        domain,
        disclaimer:
          'ATS-style Resume Score (estimate). This is an automated algorithmic heuristic score designed to help students identify structural and content improvements. It is not an official score from any proprietary employer Applicant Tracking System or a guarantee of hiring outcomes.',
        rubric: {
          parsingScore: analysis.parsingScore,
          sectionScore: analysis.sectionScore,
          skillsScore: analysis.skillsScore,
          experienceScore: analysis.experienceScore,
          formattingScore: analysis.formattingScore,
        },
        extraction: {
          ...extraction,
          skillCategories: extraction.skills?.skillCategories || [],
          missingDomainSkills: extraction.skills?.missingDomainSkills || [],
        },
        issues,
        checklist,
        keywordsAnalysis,
        targetJobAlignment,
        createdAt: analysis.createdAt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * GET /api/careers/resume/report/download
 * Generates and downloads a clean, professional ATS Diagnostic PDF Report
 */
export const downloadResumeReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const { analysisId } = req.query;
    const whereClause: any = { userId: req.user.userId };
    if (analysisId) {
      whereClause.id = String(analysisId);
    }

    const analysis = await prisma.resumeAnalysis.findFirst({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    if (!analysis) {
      return res.status(404).json({ status: 'error', message: 'No resume analysis found to generate report.' });
    }

    let parsedContact = {};
    let parsedEducation = [];
    let parsedSkills: any = {};
    let parsedExperience = [];
    let parsedProjects = [];
    let parsedIssues = [];
    let targetJobAlignment = null;
    let domain: any = { primary: 'Software / IT', confidence: 0.85, description: '' };
    let keywordsAnalysis: any = { found: [], missing: [], recommended: [] };
    let scoreCategory: 'Excellent' | 'Good' | 'Needs Improvement' | 'Poor' =
      analysis.overallScore >= 80 ? 'Excellent' : analysis.overallScore >= 60 ? 'Good' : 'Needs Improvement';

    try { parsedContact = JSON.parse(analysis.contactInfo); } catch (e) {}
    try { parsedEducation = JSON.parse(analysis.education); } catch (e) {}
    try { parsedSkills = JSON.parse(analysis.skills); } catch (e) {}
    try { parsedExperience = JSON.parse(analysis.experience); } catch (e) {}
    try { parsedProjects = JSON.parse(analysis.projects); } catch (e) {}
    try { parsedIssues = JSON.parse(analysis.issues); } catch (e) {}

    try {
      const matchDetails = analysis.targetMatchDetails ? JSON.parse(analysis.targetMatchDetails) : null;
      if (matchDetails) {
        if (matchDetails.domain) {
          domain = matchDetails.domain;
          keywordsAnalysis = matchDetails.keywordsAnalysis || keywordsAnalysis;
          scoreCategory = matchDetails.scoreCategory || scoreCategory;
          targetJobAlignment = matchDetails.targetJobAlignment;
        } else {
          targetJobAlignment = matchDetails;
        }
      }
    } catch (e) {}

    const pdfBuffer = await generateResumeReportPdf({
      resumeName: analysis.resumeName,
      overallScore: analysis.overallScore,
      scoringLabel: 'ATS-style Resume Score (estimate)',
      scoreCategory,
      domain,
      rubric: {
        parsingScore: analysis.parsingScore,
        sectionScore: analysis.sectionScore,
        skillsScore: analysis.skillsScore,
        experienceScore: analysis.experienceScore,
        formattingScore: analysis.formattingScore,
      },
      extraction: {
        contactInfo: parsedContact,
        education: parsedEducation,
        skills: parsedSkills,
        skillCategories: parsedSkills?.skillCategories || [],
        experience: parsedExperience,
        projects: parsedProjects,
      },
      issues: parsedIssues,
      keywordsAnalysis,
      missingDomainSkills: parsedSkills?.missingDomainSkills || [],
      targetJobAlignment,
      createdAt: analysis.createdAt,
    });

    const safeFilename = `${analysis.resumeName.replace(/\.[^/.]+$/, '')}_ATS_Report.pdf`.replace(/[^a-zA-Z0-9._-]/g, '_');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.status(200).send(pdfBuffer);
  } catch (error: any) {
    console.error('downloadResumeReport Error:', error);
    return res.status(500).json({ status: 'error', message: error.message || 'Failed to generate PDF report.' });
  }
};

/**
 * GET /api/careers/resume/history
 * List historical resume evaluations for authenticated student
 */
export const getResumeHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const analyses = await prisma.resumeAnalysis.findMany({
      where: { userId: req.user.userId },
      select: {
        id: true,
        resumeName: true,
        pageCount: true,
        overallScore: true,
        parsingScore: true,
        sectionScore: true,
        skillsScore: true,
        experienceScore: true,
        formattingScore: true,
        targetJobTitle: true,
        targetMatchScore: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return res.status(200).json({
      status: 'success',
      data: { analyses },
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * POST /api/careers/resume/compare-job
 * Compares authenticated student's active resume against a pasted job description
 */
export const compareResumeWithJobController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const userId = req.user.userId;
    const { jobDescription, jobTitle, analysisId } = req.body;

    // 1. Validate Job Description
    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 20) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid job description with at least 20 characters to compare.',
      });
    }

    const cleanJobDesc = jobDescription.trim();
    if (cleanJobDesc.length > 30000) {
      return res.status(400).json({
        status: 'error',
        message: 'Job description is too long (maximum 30,000 characters). Please provide the relevant job requirements.',
      });
    }

    // 2. Fetch the student's active resume analysis
    let analysis;
    if (analysisId) {
      analysis = await prisma.resumeAnalysis.findFirst({
        where: { id: String(analysisId), userId },
      });
      if (!analysis) {
        return res.status(404).json({
          status: 'error',
          message: 'Specified resume analysis was not found or does not belong to your account.',
        });
      }
    } else {
      analysis = await prisma.resumeAnalysis.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (!analysis) {
        return res.status(400).json({
          status: 'error',
          message: 'No active resume analysis found. Please upload your resume PDF first.',
        });
      }
    }

    // 3. Extract skills and keywords from Job Description
    const jobSkillsPayload = extractSkills(cleanJobDesc);
    const resumeText = analysis.extractedText || '';

    // Parse resume's extracted structured skills
    let resumeSkillsParsed: any = {};
    try {
      resumeSkillsParsed = JSON.parse(analysis.skills);
    } catch (e) {
      resumeSkillsParsed = {};
    }

    // Flatten all resume skills into a lowercase set for fast matching
    const resumeSkillsSet = new Set<string>();
    const registerSkills = (list?: string[]) => {
      if (Array.isArray(list)) {
        list.forEach((s) => resumeSkillsSet.add(s.toLowerCase().trim()));
      }
    };
    registerSkills(resumeSkillsParsed.programmingLanguages);
    registerSkills(resumeSkillsParsed.languages);
    registerSkills(resumeSkillsParsed.frameworks);
    registerSkills(resumeSkillsParsed.tools);
    registerSkills(resumeSkillsParsed.databases);
    registerSkills(resumeSkillsParsed.developerTools);
    registerSkills(resumeSkillsParsed.softSkills);

    // Collect all unique skills demanded by the job description
    const allDemandedSkills = Array.from(
      new Set([
        ...jobSkillsPayload.programmingLanguages,
        ...jobSkillsPayload.frameworks,
        ...jobSkillsPayload.tools,
        ...jobSkillsPayload.databases,
      ])
    );

    const isMatchInResume = (skill: string): boolean => {
      const sLower = skill.toLowerCase().trim();
      if (resumeSkillsSet.has(sLower)) return true;
      const escaped = sLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'i').test(resumeText);
    };

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    allDemandedSkills.forEach((skill) => {
      if (isMatchInResume(skill)) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    // Extract key conceptual / architectural / industry keywords
    const candidateKeywords = [
      'REST APIs', 'Microservices', 'System Design', 'CI/CD', 'Docker',
      'Kubernetes', 'Cloud', 'AWS', 'GCP', 'Azure', 'Agile', 'Scrum', 'Git',
      'Testing', 'Unit Testing', 'TDD', 'Integration Testing', 'Data Structures',
      'Algorithms', 'Scalability', 'Performance', 'Responsive Design', 'GraphQL',
      'State Management', 'Relational Database', 'NoSQL', 'Security', 'Authentication',
      'OAuth', 'JWT', 'Clean Architecture'
    ];

    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    candidateKeywords.forEach((kw) => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const inJob = new RegExp(`\\b${escaped}\\b`, 'i').test(cleanJobDesc);
      if (inJob) {
        if (new RegExp(`\\b${escaped}\\b`, 'i').test(resumeText)) {
          matchedKeywords.push(kw);
        } else {
          missingKeywords.push(kw);
        }
      }
    });

    // Experience & Qualification Alignment
    const hasDegreeReq = /\b(bachelor|b\.?e\b|b\.?tech\b|master|m\.?tech\b|degree|computer science)\b/i.test(cleanJobDesc);
    const hasDegreeInResume = /\b(bachelor|b\.?e\b|b\.?tech\b|degree|engineering)\b/i.test(resumeText);
    const qualificationMatched = !hasDegreeReq || hasDegreeInResume;

    // Deterministic Match Score Calculation:
    // Skill Overlap: 60%
    // Keywords / Concepts: 25%
    // Qualification Alignment: 15%
    const totalSkillsCount = allDemandedSkills.length;
    const skillScore = totalSkillsCount > 0
      ? (matchedSkills.length / totalSkillsCount) * 60
      : 45;

    const totalKeywordsCount = matchedKeywords.length + missingKeywords.length;
    const keywordScore = totalKeywordsCount > 0
      ? (matchedKeywords.length / totalKeywordsCount) * 25
      : 18;

    const qualificationScore = qualificationMatched ? 15 : 8;

    const rawMatchPercentage = Math.round(skillScore + keywordScore + qualificationScore);
    const matchPercentage = Math.min(100, Math.max(15, rawMatchPercentage));

    // Tailored actionable suggestions
    const recommendations: string[] = [];
    if (missingSkills.length > 0) {
      recommendations.push(
        `Critical technical skills from the job description not detected in your resume: ${missingSkills.slice(0, 5).join(', ')}. If you have practical project experience with these, highlight them explicitly.`
      );
    }
    if (missingKeywords.length > 0) {
      recommendations.push(
        `Incorporate relevant conceptual keywords into your bullet points: ${missingKeywords.slice(0, 4).join(', ')} to improve semantic ATS relevance.`
      );
    }
    if (matchedSkills.length > 0) {
      recommendations.push(
        `Strong alignment found on ${matchedSkills.slice(0, 4).join(', ')}. Ensure your project descriptions quantify the impact of these technologies (e.g. latency reduced, users served).`
      );
    }
    recommendations.push(
      'Never keyword-stuff tools you cannot explain in a technical interview. Focus on genuine competency overlap.'
    );

    return res.status(200).json({
      status: 'success',
      data: {
        matchPercentage,
        jobTitle: jobTitle || 'Target Role',
        resumeName: analysis.resumeName,
        analysisId: analysis.id,
        matchedSkills,
        missingSkills,
        matchedKeywords,
        missingKeywords,
        experienceQualificationAlignment: {
          isDegreeMatched: qualificationMatched,
          summary: qualificationMatched
            ? 'Academic degree and baseline background align with target role requirements.'
            : 'Review degree/branch specific requirements mentioned in the job description.',
        },
        recommendations,
        scoringMethodology: {
          rule: 'Deterministic weighted overlap: Technical Skills (60%), Industry/Domain Keywords (25%), Qualification Alignment (15%).',
          disclaimer: 'This match score measures keyword and skill alignment against the provided job description. It is a diagnostic guidance tool and does not represent an official employer ATS ranking or hiring guarantee.',
        },
      },
    });
  } catch (error: any) {
    console.error('compareResumeWithJobController Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to compare resume with job description.',
    });
  }
};

/**
 * GET /api/careers/projects
 */
export const getStudentProjects = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    let projects = mockProjects.get(req.user.userId);
    if (!projects) {
      projects = DEFAULT_STUDENT_PROJECTS.map((p) => ({ ...p, userId: req.user!.userId }));
      mockProjects.set(req.user.userId, projects);
    }

    return res.status(200).json({
      status: 'success',
      data: { projects },
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * POST /api/careers/projects
 */
export const addStudentProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const { title, description, techStack, githubUrl, liveDemoUrl } = req.body;

    if (!title || !githubUrl) {
      return res.status(400).json({ status: 'error', message: 'Project title and GitHub URL are required.' });
    }

    const newProject: StudentProjectItem = {
      id: `proj_${Date.now()}`,
      userId: req.user.userId,
      title,
      description: description || '',
      techStack: Array.isArray(techStack) ? techStack : (techStack ? String(techStack).split(',').map((s) => s.trim()) : ['React']),
      githubUrl,
      liveDemoUrl: liveDemoUrl || '',
      createdAt: new Date().toISOString(),
    };

    let userProjs = mockProjects.get(req.user.userId) || DEFAULT_STUDENT_PROJECTS.map((p) => ({ ...p, userId: req.user!.userId }));
    userProjs.unshift(newProject);
    mockProjects.set(req.user.userId, userProjs);

    return res.status(201).json({
      status: 'success',
      message: 'Project added to portfolio showcase successfully',
      data: { project: newProject },
    });
  } catch (error: any) {
    console.error('addStudentProject Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
