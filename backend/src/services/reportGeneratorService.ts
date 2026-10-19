import PDFDocument from 'pdfkit';

export interface ReportData {
  resumeName: string;
  overallScore: number;
  scoringLabel: string;
  scoreCategory?: string;
  domain?: {
    primary: string;
    confidence: number;
    secondary?: string | null;
    description?: string;
  };
  rubric: {
    parsingScore: number;
    sectionScore: number;
    skillsScore: number;
    experienceScore: number;
    formattingScore: number;
  };
  extraction: {
    contactInfo: {
      hasName?: boolean;
      hasEmail?: boolean;
      hasPhone?: boolean;
      hasLinkedIn?: boolean;
      hasGitHub?: boolean;
      hasPortfolio?: boolean;
      hasLocation?: boolean;
      sanitizedSummary?: string;
    };
    summary?: {
      isPresent?: boolean;
      text?: string;
      assessment?: string;
    };
    education?: Array<{
      degree?: string;
      institution?: string;
      branch?: string;
      graduationYear?: number | null;
      gpa?: string | null;
    }>;
    skills?: {
      languages?: string[];
      frameworks?: string[];
      developerTools?: string[];
      coreFundamentals?: string[];
      softSkills?: string[];
    };
    skillCategories?: Array<{
      name: string;
      skills: string[];
      strength: string;
    }>;
    experience?: Array<{
      role?: string;
      company?: string;
      duration?: string;
      bullets?: string[];
    }>;
    projects?: Array<{
      title?: string;
      techStack?: string[];
      description?: string;
    }>;
  };
  issues?: Array<{
    id?: string;
    priority: string;
    dimension: string;
    issue: string;
    whyItMatters: string;
    suggestedFix: string;
    improvedExample?: string;
  }>;
  keywordsAnalysis?: {
    found: string[];
    missing: string[];
    recommended: string[];
  };
  missingDomainSkills?: string[];
  targetJobAlignment?: {
    jobTitle: string;
    matchScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
  } | null;
  createdAt?: string | Date;
}

/**
 * Generates an official, beautifully styled 2-page PDF ATS Evaluation Report.
 * Uses strict page budgeting and dynamic text heights to prevent clipping and text overlap.
 */
export function generateResumeReportPdf(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        autoFirstPage: true,
        bufferPages: true,
        info: {
          Title: `ATS Resume Report - ${data.resumeName || 'Student'}`,
          Author: 'AI Student Assistant - VTU Career Engine',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Brand Colors
      const primaryColor = '#134e2f'; // Deep Forest Green
      const secondaryColor = '#006d3d';
      const textColor = '#181c1b';
      const mutedColor = '#5c645d';
      const accentGreen = '#1b5e20';
      const accentRed = '#b3261e';
      const accentAmber = '#b26b00';
      const lightBg = '#f4f6f4';

      // ==================== PAGE 1: EXECUTIVE SUMMARY ====================
      // Header Banner
      doc.rect(40, 40, 515, 60).fill(primaryColor);
      doc.fillColor('#ffffff').fontSize(19).font('Helvetica-Bold').text('ATS RESUME DIAGNOSTIC REPORT', 55, 50);
      doc.fillColor('#c0e8c8').fontSize(9.5).font('Helvetica').text('Automated Industry ATS Compatibility & Career Assessment', 55, 73);
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica').text(`Generated: ${new Date(data.createdAt || Date.now()).toLocaleDateString()}`, 400, 73);

      // Score Callout Box
      const score = Math.max(0, Math.min(100, data.overallScore || 0));
      const scoreBadgeColor = score >= 80 ? accentGreen : score >= 60 ? accentAmber : accentRed;
      const scoreCategory = score >= 80 ? 'Strong Alignment' : score >= 60 ? 'Moderate Alignment' : 'Needs Optimization';

      doc.rect(40, 110, 160, 95).fill(lightBg).stroke('#dce2dc');
      doc.fillColor(scoreBadgeColor).fontSize(36).font('Helvetica-Bold').text(String(score), 55, 122);
      doc.fillColor(mutedColor).fontSize(13).font('Helvetica').text('/100', 115, 132);
      doc.fillColor(scoreBadgeColor).fontSize(10.5).font('Helvetica-Bold').text(scoreCategory.toUpperCase(), 55, 165);
      const safeDocName = (data.resumeName || 'Resume.pdf').length > 22
        ? `${data.resumeName.slice(0, 19)}...`
        : data.resumeName || 'Resume.pdf';
      doc.fillColor(mutedColor).fontSize(8).font('Helvetica').text(`Document: ${safeDocName}`, 55, 182);

      // 5-Dimension Rubric
      doc.rect(210, 110, 345, 95).fill('#ffffff').stroke('#dce2dc');
      doc.fillColor(textColor).fontSize(10.5).font('Helvetica-Bold').text('5-Dimension ATS Evaluation Rubric', 222, 120);

      const rubrics = [
        { label: 'Parsing & Extraction Quality', val: data.rubric.parsingScore, max: 20 },
        { label: 'Section Completeness & Order', val: data.rubric.sectionScore, max: 25 },
        { label: 'Skills Depth & Breadth', val: data.rubric.skillsScore, max: 20 },
        { label: 'Experience & Project Outcomes', val: data.rubric.experienceScore, max: 25 },
        { label: 'ATS Cleanliness & Formatting', val: data.rubric.formattingScore, max: 10 },
      ];

      let ry = 136;
      for (const item of rubrics) {
        doc.fillColor(textColor).fontSize(8).font('Helvetica').text(item.label, 222, ry);
        doc.fillColor(secondaryColor).font('Helvetica-Bold').text(`${item.val} / ${item.max}`, 485, ry, { align: 'right', width: 55 });
        ry += 11.5;
      }

      // Candidate & Domain Profile
      doc.rect(40, 215, 515, 75).fill(lightBg).stroke('#dce2dc');
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('Candidate & Domain Classification', 55, 224);

      const contact = data.extraction.contactInfo || {};
      const domain = data.domain || { primary: 'Software / IT', confidence: 0.85 };
      const confPct = Math.round((domain.confidence || 0.85) * 100);

      doc.fillColor(textColor).fontSize(8.5).font('Helvetica');
      doc.text(
        `Contact Signals: Email (${contact.hasEmail ? 'Present ✓' : 'Missing ✗'}), Phone (${contact.hasPhone ? 'Present ✓' : 'Missing ✗'}), LinkedIn (${contact.hasLinkedIn ? 'Linked ✓' : 'Missing ✗'}), GitHub (${contact.hasGitHub ? 'Linked ✓' : 'Missing ✗'})`,
        55,
        240
      );
      doc.font('Helvetica-Bold').text(`Detected Domain: `, 55, 255, { continued: true });
      doc.fillColor(secondaryColor).text(`${domain.primary} (${confPct}% confidence rating)`);

      const desc = domain.description ? domain.description.slice(0, 130) : '';
      if (desc) {
        doc.fillColor(mutedColor).fontSize(8).font('Helvetica-Oblique').text(desc, 55, 269, { width: 485 });
      }

      // Skills Profile & Strengths
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('Categorized Skill Profile & Strengths', 40, 302);
      doc.strokeColor('#dce2dc').lineWidth(1).moveTo(40, 315).lineTo(555, 315).stroke();

      let sy = 322;
      const categories = (data.extraction.skillCategories || []).slice(0, 5);
      if (categories.length > 0) {
        for (const cat of categories) {
          const strengthColor = cat.strength === 'Strong' ? accentGreen : cat.strength === 'Moderate' ? accentAmber : accentRed;
          doc.fillColor(textColor).fontSize(8.5).font('Helvetica-Bold').text(cat.name, 40, sy, { continued: true });
          doc.fillColor(strengthColor).fontSize(7.5).text(`  [${cat.strength}]`, { continued: true });
          const skillListStr = cat.skills.slice(0, 9).join(', ');
          doc.fillColor(mutedColor).fontSize(8).font('Helvetica').text(`: ${skillListStr}`, { width: 490 });
          sy += 14;
        }
      } else {
        const skillsObj = data.extraction.skills || {};
        const pairs: Array<[string, string[] | undefined]> = [
          ['Languages', skillsObj.languages],
          ['Frameworks', skillsObj.frameworks],
          ['Developer Tools', skillsObj.developerTools],
          ['Core CS', skillsObj.coreFundamentals],
          ['Soft Skills', skillsObj.softSkills],
        ];
        for (const [title, list] of pairs) {
          if (Array.isArray(list) && list.length > 0) {
            doc.fillColor(textColor).fontSize(8.5).font('Helvetica-Bold').text(`${title}: `, 40, sy, { continued: true });
            doc.fillColor(mutedColor).fontSize(8).font('Helvetica').text(list.slice(0, 9).join(', '));
            sy += 14;
          }
        }
      }

      // Keywords Analysis (Found & Missing)
      sy += 4;
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('Domain Keyword Overlap & Industry Demand', 40, sy);
      doc.strokeColor('#dce2dc').lineWidth(1).moveTo(40, sy + 13).lineTo(555, sy + 13).stroke();
      sy += 19;

      const kwFound = data.keywordsAnalysis?.found || [];
      const kwMissing = data.missingDomainSkills || data.keywordsAnalysis?.missing || [];

      doc.fillColor(accentGreen).fontSize(8).font('Helvetica-Bold').text('Matched Domain Keywords: ', 40, sy, { continued: true });
      doc.fillColor(textColor).font('Helvetica').text(kwFound.slice(0, 8).join(', ') || 'Core domain terminology verified');
      sy += 13;

      doc.fillColor(accentRed).fontSize(8).font('Helvetica-Bold').text('In-Demand Keywords to Consider: ', 40, sy, { continued: true });
      doc.fillColor(textColor).font('Helvetica').text(kwMissing.slice(0, 6).join(', ') || 'All critical domain proficiencies detected');
      sy += 18;

      // Experience & Projects Overview
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('Extracted Experience & Project Highlights', 40, sy);
      doc.strokeColor('#dce2dc').lineWidth(1).moveTo(40, sy + 13).lineTo(555, sy + 13).stroke();
      sy += 20;

      const projs = (data.extraction.projects || []).slice(0, 2);
      const exps = (data.extraction.experience || []).slice(0, 2);

      if (exps.length > 0) {
        for (const exp of exps) {
          doc.fillColor(textColor).fontSize(8.5).font('Helvetica-Bold').text(`${exp.role || 'Role'} at ${exp.company || 'Company'}`, 40, sy);
          doc.fillColor(mutedColor).fontSize(7.5).font('Helvetica').text(exp.duration || '', 400, sy, { align: 'right', width: 155 });
          sy += 11;
          if (exp.bullets && exp.bullets[0]) {
            const bulletText = exp.bullets[0].length > 110 ? `${exp.bullets[0].slice(0, 107)}...` : exp.bullets[0];
            doc.fillColor('#333333').fontSize(7.5).font('Helvetica').text(`• ${bulletText}`, 50, sy, { width: 490 });
            sy += 12;
          }
        }
      }

      if (projs.length > 0) {
        for (const pr of projs) {
          doc.fillColor(textColor).fontSize(8.5).font('Helvetica-Bold').text(`Project: ${pr.title || 'Technical Project'}`, 40, sy);
          if (pr.techStack && pr.techStack.length > 0) {
            doc.fillColor(secondaryColor).fontSize(7.5).font('Helvetica').text(`[${pr.techStack.slice(0, 4).join(', ')}]`, 350, sy, { align: 'right', width: 205 });
          }
          sy += 11;
          if (pr.description) {
            const descText = pr.description.length > 110 ? `${pr.description.slice(0, 107)}...` : pr.description;
            doc.fillColor('#333333').fontSize(7.5).font('Helvetica').text(`• ${descText}`, 50, sy, { width: 490 });
            sy += 12;
          }
        }
      }

      // Page 1 Footer (Anchored near bottom)
      doc.fillColor(mutedColor).fontSize(7.5).font('Helvetica').text('VTU AI Student Assistant • Resume Diagnostics • Page 1 of 2', 40, 785, { align: 'center', width: 515 });

      // ==================== PAGE 2: ACTIONABLE IMPROVEMENTS ====================
      doc.addPage();

      // Page 2 Header Banner
      doc.rect(40, 40, 515, 45).fill(primaryColor);
      doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text('PRIORITIZED ACTIONABLE IMPROVEMENTS', 55, 52);
      doc.fillColor('#c0e8c8').fontSize(9).font('Helvetica').text('Concrete issues detected with recommended bullet templates', 55, 70);

      let iy = 98;
      const issues = (data.issues || []).slice(0, 3); // Top 3 high-impact issues to guarantee 2-page fit

      if (issues.length === 0) {
        doc.rect(40, iy, 515, 60).fill(lightBg).stroke('#dce2dc');
        doc.fillColor(accentGreen).fontSize(11).font('Helvetica-Bold').text('No critical issues detected! Your resume aligns well with ATS requirements.', 55, iy + 22);
        iy += 80;
      } else {
        for (const issue of issues) {
          const pColor = issue.priority === 'HIGH' ? accentRed : issue.priority === 'MEDIUM' ? accentAmber : accentGreen;

          // Card Background
          doc.rect(40, iy, 515, 140).fill(lightBg).stroke('#dce2dc');

          // Priority badge
          doc.rect(50, iy + 10, 75, 15).fill(pColor);
          doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold').text(`${issue.priority} PRIORITY`, 54, iy + 14);

          // Dimension & Issue Title
          doc.fillColor(mutedColor).fontSize(7.5).font('Helvetica-Bold').text((issue.dimension || 'SECTION').toUpperCase(), 135, iy + 14);

          const safeIssueTitle = issue.issue.length > 95 ? `${issue.issue.slice(0, 92)}...` : issue.issue;
          doc.fillColor(textColor).fontSize(9.5).font('Helvetica-Bold').text(safeIssueTitle, 50, iy + 29, { width: 495 });

          // Why It Matters
          const safeWhy = issue.whyItMatters.length > 130 ? `${issue.whyItMatters.slice(0, 127)}...` : issue.whyItMatters;
          doc.fillColor(accentRed).fontSize(7.5).font('Helvetica-Bold').text('Why It Matters: ', 50, iy + 46, { continued: true });
          doc.fillColor(textColor).font('Helvetica').text(safeWhy, { width: 495 });

          // Suggested Fix
          const safeFix = issue.suggestedFix.length > 130 ? `${issue.suggestedFix.slice(0, 127)}...` : issue.suggestedFix;
          doc.fillColor(secondaryColor).fontSize(7.5).font('Helvetica-Bold').text('Suggested Fix: ', 50, iy + 63, { continued: true });
          doc.fillColor(textColor).font('Helvetica').text(safeFix, { width: 495 });

          // Template Box (Dynamic safe placement)
          if (issue.improvedExample) {
            doc.rect(50, iy + 82, 495, 48).fill('#ffffff').stroke('#a0d2af');
            doc.fillColor(secondaryColor).fontSize(7.5).font('Helvetica-Bold').text('Recommended Template:', 55, iy + 87);
            const safeExample = issue.improvedExample.length > 190 ? `${issue.improvedExample.slice(0, 187)}...` : issue.improvedExample;
            doc.fillColor('#1b3d27').fontSize(7.5).font('Courier').text(safeExample, 55, iy + 99, { width: 485 });
          }

          iy += 152;
        }
      }

      // Target Job Alignment Box (if provided)
      if (data.targetJobAlignment && iy <= 590) {
        doc.rect(40, iy, 515, 68).fill('#ffffff').stroke('#a0d2af');
        doc.fillColor(primaryColor).fontSize(9.5).font('Helvetica-Bold').text(`Target Role Alignment: ${data.targetJobAlignment.jobTitle}`, 50, iy + 10);
        doc.fillColor(secondaryColor).fontSize(8.5).font('Helvetica-Bold').text(`Match Score: ${data.targetJobAlignment.matchScore}% Keyword Overlap`, 50, iy + 24);
        doc.fillColor(mutedColor).fontSize(7.5).font('Helvetica').text(
          `Matched: ${data.targetJobAlignment.matchedKeywords.slice(0, 5).join(', ')} • Missing: ${data.targetJobAlignment.missingKeywords.slice(0, 5).join(', ')}`,
          50,
          iy + 38,
          { width: 495 }
        );
      } else if (iy <= 590) {
        // Pre-submission ATS Quick Tip Box
        doc.rect(40, iy, 515, 68).fill('#ffffff').stroke('#dce2dc');
        doc.fillColor(primaryColor).fontSize(9.5).font('Helvetica-Bold').text('Pre-Submission Checklist Advice', 50, iy + 10);
        doc.fillColor(mutedColor).fontSize(7.5).font('Helvetica').text(
          '1. Ensure phone number includes country code (+91) and email address is professional.\n2. Keep fresh undergraduate technical resumes strictly to a single page.\n3. Quantify outcomes with realistic percentage improvements, latency reductions, or concurrent user volume.',
          50,
          iy + 25,
          { width: 495, lineGap: 3 }
        );
      }

      // Disclaimer & Page 2 Footer
      doc.fillColor(mutedColor).fontSize(7.5).font('Helvetica').text(
        'Disclaimer: This report is an automated algorithmic heuristic assessment to assist students with structural and technical improvements. It is not an official score from any proprietary employer ATS.',
        40,
        760,
        { align: 'center', width: 515 }
      );
      doc.text('VTU AI Student Assistant • Resume Diagnostics • Page 2 of 2', 40, 785, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
