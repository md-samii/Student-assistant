import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/prisma';



export const getDocuments = async (
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

    const { type, category } = req.query;
    const filter = (category || type) as string | undefined;

    const documents = await prisma.document.findMany({
      where: {
        userId: req.user.userId,
        ...(filter && filter !== 'ALL'
          ? {
            type: String(filter),
          }
          : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalBytes = documents.reduce(
      (sum, document) => sum + document.fileSize,
      0
    );

    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

    const mappedDocuments = documents.map((document) => ({
      ...document,
      category: document.type,
      fileSizeFormatted: `${(document.fileSize / 1024).toFixed(0)} KB`,
      uploadedAt: document.createdAt,
      isVerified: true,
    }));

    return res.status(200).json({
      status: 'success',
      data: {
        totalFiles: documents.length,
        totalStorageUsed: `${totalMB} MB`,
        storageUsed: `${totalMB} MB`,
        documents: mappedDocuments,
      },
    });
  } catch (error: any) {
    console.error('getDocuments Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch documents.',
    });
  }
};

export const uploadDocument = async (
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

    const { name, type, category, fileUrl, fileSize, mimeType } = req.body;

    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Document name is required.',
      });
    }

    if (!fileUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'File URL is required.',
      });
    }

    const docType = String(category || type || 'RESUME');

    const sizeInBytes =
      fileSize && !isNaN(parseInt(fileSize, 10))
        ? parseInt(fileSize, 10)
        : 512000;

    const document = await prisma.document.create({
      data: {
        userId: req.user.userId,
        name: name.endsWith('.pdf') ? name : `${name}.pdf`,
        type: docType,
        fileUrl,
        storagePath: `firebase-storage/student-docs/${req.user.userId}/${name}`,
        fileSize: sizeInBytes,
        mimeType: mimeType || 'application/pdf',
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Document uploaded to cloud locker successfully',
      data: {
        document: {
          ...document,
          category: document.type,
          fileSizeFormatted: `${(document.fileSize / 1024).toFixed(0)} KB`,
          uploadedAt: document.createdAt,
          isVerified: true,
        },
      },
    });
  } catch (error: any) {
    console.error('uploadDocument Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to upload document.',
    });
  }
};

export const deleteDocument = async (
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

    const { id } = req.params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!document) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found.',
      });
    }

    await prisma.document.delete({
      where: {
        id: document.id,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Document deleted from cloud locker.',
    });
  } catch (error: any) {
    console.error('deleteDocument Error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete document.',
    });
  }
};