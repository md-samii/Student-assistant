import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/prisma';
import { DEFAULT_RESOURCES_CATALOG, ResourceSeedItem } from '../utils/resourceSeed';

export const getResources = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const { subject, moduleNumber, type, search } = req.query;

    let resources: ResourceSeedItem[] = DEFAULT_RESOURCES_CATALOG;

    if (subject) {
      const subjStr = String(subject).toLowerCase();
      resources = resources.filter(
        (r) =>
          r.subjectName.toLowerCase().includes(subjStr) ||
          r.subjectCode.toLowerCase().includes(subjStr)
      );
    }

    if (moduleNumber) {
      const modNum = parseInt(String(moduleNumber), 10);
      if (!isNaN(modNum)) {
        resources = resources.filter((r) => r.moduleNumber === modNum);
      }
    }

    if (type && type !== 'ALL') {
      resources = resources.filter((r) => r.type === String(type));
    }

    if (search) {
      const q = String(search).toLowerCase();
      resources = resources.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.subjectName.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      status: 'success',
      data: {
        total: resources.length,
        resources,
      },
    });
  } catch (error: any) {
    console.error('getResources Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createResource = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const { title, description, subjectCode, subjectName, moduleNumber, type, driveUrl, fileSize } = req.body;

    if (!title || !driveUrl) {
      return res.status(400).json({ status: 'error', message: 'Title and Google Drive URL are required.' });
    }

    const newResource: ResourceSeedItem = {
      id: `res_${Date.now()}`,
      title,
      description: description || '',
      subjectCode: subjectCode || 'CS501',
      subjectName: subjectName || 'Operating Systems',
      moduleNumber: moduleNumber ? parseInt(moduleNumber, 10) : 1,
      type: type || 'PDF_NOTES',
      driveUrl,
      fileSize: fileSize || '3.5 MB',
      uploadedBy: req.user.email,
    };

    DEFAULT_RESOURCES_CATALOG.unshift(newResource);

    return res.status(201).json({
      status: 'success',
      message: 'Study resource added successfully',
      data: { resource: newResource },
    });
  } catch (error: any) {
    console.error('createResource Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getResourceById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const item = DEFAULT_RESOURCES_CATALOG.find((r) => r.id === id);

    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Resource not found' });
    }

    return res.status(200).json({
      status: 'success',
      data: { resource: item },
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
