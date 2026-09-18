import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/prisma';
import { DEFAULT_DOCUMENTS_CATALOG, DocumentSeedItem } from '../utils/documentSeed';

const mockUserDocs = new Map<string, DocumentSeedItem[]>();

export const getDocuments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const { type, category } = req.query;
    const filter = (category || type) as string | undefined;

    let userDocs = mockUserDocs.get(req.user.userId);
    if (!userDocs) {
      // Initialize with default sample document set for student
      userDocs = DEFAULT_DOCUMENTS_CATALOG.map((d) => ({ ...d, userId: req.user!.userId }));
      mockUserDocs.set(req.user.userId, userDocs);
    }

    let filtered = userDocs;
    if (filter && filter !== 'ALL') {
      filtered = userDocs.filter((d) => d.type === String(filter) || (d as any).category === String(filter));
    }

    const totalBytes = userDocs.reduce((sum, d) => sum + (d.fileSize || 0), 0);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

    const mappedDocs = filtered.map((d) => ({
      ...d,
      type: d.type || (d as any).category || 'RESUME',
      category: (d as any).category || d.type || 'RESUME',
      createdAt: (d as any).createdAt || d.uploadedAt || new Date().toISOString(),
      uploadedAt: d.uploadedAt || (d as any).createdAt || new Date().toISOString(),
      fileSize: (d as any).fileSizeFormatted || (d.fileSize ? `${(d.fileSize / 1024).toFixed(0)} KB` : '1.2 MB'),
      fileSizeFormatted: (d as any).fileSizeFormatted || `${((d.fileSize || 500000) / 1024).toFixed(0)} KB`,
      isVerified: true,
    }));

    return res.status(200).json({
      status: 'success',
      data: {
        totalFiles: userDocs.length,
        totalStorageUsed: `${totalMB} MB`,
        storageUsed: `${totalMB} MB`,
        documents: mappedDocs,
      },
    });
  } catch (error: any) {
    console.error('getDocuments Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const uploadDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const { name, type, category, fileUrl, fileSize } = req.body;

    if (!name) {
      return res.status(400).json({ status: 'error', message: 'Document name is required.' });
    }

    const docType = (category || type || 'RESUME') as any;
    const sizeInBytes = fileSize && !isNaN(parseInt(fileSize, 10)) ? parseInt(fileSize, 10) : 512000;
    const formattedSize = typeof fileSize === 'string' && fileSize.includes('B') ? fileSize : `${(sizeInBytes / 1024).toFixed(0)} KB`;

    const newDoc = {
      id: `doc_${Date.now()}`,
      userId: req.user.userId,
      name: name.endsWith('.pdf') ? name : `${name}.pdf`,
      type: docType,
      category: docType,
      fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      storagePath: `firebase-storage/student-docs/${req.user.userId}/${name}`,
      fileSize: sizeInBytes,
      fileSizeFormatted: formattedSize,
      mimeType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isVerified: true,
    };

    let userDocs = mockUserDocs.get(req.user.userId) || DEFAULT_DOCUMENTS_CATALOG.map(d => ({ ...d, userId: req.user!.userId }));
    userDocs.unshift(newDoc as any);
    mockUserDocs.set(req.user.userId, userDocs);

    return res.status(201).json({
      status: 'success',
      message: 'Document uploaded to cloud locker successfully',
      data: { document: newDoc },
    });
  } catch (error: any) {
    console.error('uploadDocument Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const { id } = req.params;

    let userDocs = mockUserDocs.get(req.user.userId) || DEFAULT_DOCUMENTS_CATALOG.map(d => ({ ...d, userId: req.user!.userId }));
    userDocs = userDocs.filter((d) => d.id !== id);
    mockUserDocs.set(req.user.userId, userDocs);

    return res.status(200).json({
      status: 'success',
      message: 'Document deleted from cloud locker.',
    });
  } catch (error: any) {
    console.error('deleteDocument Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
