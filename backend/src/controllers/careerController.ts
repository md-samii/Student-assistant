import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import {
  DEFAULT_CAREER_OPPORTUNITIES,
  DEFAULT_STUDENT_PROJECTS,
  CareerOpportunityItem,
  StudentProjectItem,
} from '../utils/careerSeed';

const mockApplications = new Set<string>();
const mockProjects = new Map<string, StudentProjectItem[]>();

export const getOpportunities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const { category, search } = req.query;

    let opportunities: CareerOpportunityItem[] = DEFAULT_CAREER_OPPORTUNITIES;

    if (category && category !== 'ALL') {
      opportunities = opportunities.filter((o) => o.category === String(category));
    }

    if (search) {
      const q = String(search).toLowerCase();
      opportunities = opportunities.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.company.toLowerCase().includes(q) ||
          o.requiredSkills.some((s) => s.toLowerCase().includes(q))
      );
    }

    const appliedIds = Array.from(mockApplications);
    const enriched = opportunities.map((opp) => ({
      ...opp,
      hasApplied: appliedIds.includes(`${req.user!.userId}_${opp.id}`),
    }));

    return res.status(200).json({
      status: 'success',
      data: {
        total: enriched.length,
        opportunities: enriched,
      },
    });
  } catch (error: any) {
    console.error('getOpportunities Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const applyForOpportunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const { id } = req.params;
    const opp = DEFAULT_CAREER_OPPORTUNITIES.find((o) => o.id === id);

    if (!opp) {
      return res.status(404).json({ status: 'error', message: 'Opportunity not found' });
    }

    const key = `${req.user.userId}_${id}`;
    mockApplications.add(key);

    return res.status(200).json({
      status: 'success',
      message: `Application submitted successfully for ${opp.title} at ${opp.company}!`,
    });
  } catch (error: any) {
    console.error('applyForOpportunity Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

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
      techStack: Array.isArray(techStack) ? techStack : (techStack ? String(techStack).split(',').map(s=>s.trim()) : ['React']),
      githubUrl,
      liveDemoUrl: liveDemoUrl || '',
      createdAt: new Date().toISOString(),
    };

    let userProjs = mockProjects.get(req.user.userId) || DEFAULT_STUDENT_PROJECTS.map(p => ({ ...p, userId: req.user!.userId }));
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
