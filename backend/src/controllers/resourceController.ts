import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/prisma';

const RESOURCE_TYPES = [
  'PDF_NOTES',
  'PPT',
  'TUTORIAL',
  'PREVIOUS_PAPER',
  'LAB_MANUAL',
  'CODING_EXERCISE',
];

const formatResource = (resource: any) => ({
  ...resource,
  subjectCode: resource.subject.code,
  subjectName: resource.subject.name,
  // Keep this alias for frontend components using fileUrl.
  fileUrl: resource.driveUrl,
});

export const getResources = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
      });
    }

    const { subject, moduleNumber, type, search } = req.query;

    const where: any = {};

    if (subject) {
      const subjectValue = String(subject).trim();

      where.subject = {
        OR: [
          { code: { contains: subjectValue, mode: 'insensitive' } },
          { name: { contains: subjectValue, mode: 'insensitive' } },
        ],
      };
    }

    if (moduleNumber !== undefined && moduleNumber !== '') {
      const parsedModule = Number(moduleNumber);

      if (
        !Number.isInteger(parsedModule) ||
        parsedModule < 1
      ) {
        return res.status(400).json({
          status: 'error',
          message: 'moduleNumber must be a positive integer.',
        });
      }

      where.moduleNumber = parsedModule;
    }

    if (type && String(type) !== 'ALL') {
      if (!RESOURCE_TYPES.includes(String(type))) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid resource type.',
        });
      }

      where.type = String(type);
    }

    if (search) {
      const query = String(search).trim();

      if (query) {
        where.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            subject: {
              name: { contains: query, mode: 'insensitive' },
            },
          },
          {
            subject: {
              code: { contains: query, mode: 'insensitive' },
            },
          },
        ];
      }
    }

    const resources = await prisma.studyResource.findMany({
      where,
      include: {
        subject: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedResources = resources.map(formatResource);

    return res.status(200).json({
      status: 'success',
      data: {
        total: formattedResources.length,
        resources: formattedResources,
      },
    });
  } catch (error) {
    console.error('getResources Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve study resources.',
    });
  }
};

export const createResource = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
      });
    }

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'Only administrators can create study resources.',
      });
    }

    const {
      title,
      description,
      subjectCode,
      subjectName,
      moduleNumber,
      type,
      driveUrl,
      fileSize,
    } = req.body;

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      typeof driveUrl !== 'string' ||
      !driveUrl.trim()
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Title and Google Drive URL are required.',
      });
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(driveUrl.trim());
    } catch {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid URL.',
      });
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        status: 'error',
        message: 'Only HTTP and HTTPS URLs are supported.',
      });
    }

    if (
      !subjectCode &&
      !subjectName
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'A subject code or subject name is required.',
      });
    }

    const parsedModule = Number(moduleNumber);

    if (
      !Number.isInteger(parsedModule) ||
      parsedModule < 1
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'moduleNumber must be a positive integer.',
      });
    }

    const resourceType = type || 'PDF_NOTES';

    if (!RESOURCE_TYPES.includes(resourceType)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid resource type.',
      });
    }

    const subject = subjectCode
      ? await prisma.subject.findUnique({
        where: {
          code: String(subjectCode).trim(),
        },
      })
      : await prisma.subject.findFirst({
        where: {
          name: {
            equals: String(subjectName).trim(),
            mode: 'insensitive',
          },
        },
      });

    if (!subject) {
      return res.status(404).json({
        status: 'error',
        message:
          'Subject not found. Create the subject before adding resources.',
      });
    }

    const resource = await prisma.studyResource.create({
      data: {
        title: title.trim(),
        description:
          typeof description === 'string'
            ? description.trim() || null
            : null,
        subjectId: subject.id,
        moduleNumber: parsedModule,
        type: resourceType,
        driveUrl: driveUrl.trim(),
        fileSize:
          typeof fileSize === 'string'
            ? fileSize.trim() || null
            : null,
        uploadedBy: req.user.email,
      },
      include: {
        subject: true,
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Study resource added successfully.',
      data: {
        resource: formatResource(resource),
      },
    });
  } catch (error) {
    console.error('createResource Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to create study resource.',
    });
  }
};

export const getResourceById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
      });
    }

    const resource = await prisma.studyResource.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        subject: true,
      },
    });

    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        resource: formatResource(resource),
      },
    });
  } catch (error) {
    console.error('getResourceById Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve the study resource.',
    });
  }
};