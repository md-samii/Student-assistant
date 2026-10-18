import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/prisma';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_CATEGORIES = new Set(['RESUME', 'MARKS_CARD', 'CERTIFICATE', 'INTERNSHIP_CERTIFICATE']);

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function safeFilename(name: string): string {
  return name.replace(/["\\\\\r\n]/g, '_').replace(/[\\/\0]/g, '_').slice(0, 180);
}

export const getDocuments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    const rawFilter = req.query.category || req.query.type;
    const filter = typeof rawFilter === 'string' ? rawFilter : undefined;
    if (filter && filter !== 'ALL' && !ALLOWED_CATEGORIES.has(filter)) {
      return res.status(400).json({ status: 'error', message: 'Invalid document category.' });
    }

    const [documents, storageAggregate] = await Promise.all([
      prisma.document.findMany({
        where: { userId: req.user.userId, ...(filter && filter !== 'ALL' ? { type: filter } : {}) },
        select: { id: true, name: true, type: true, fileSize: true, mimeType: true, createdAt: true, updatedAt: true, fileData: false },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.document.aggregate({
        where: { userId: req.user.userId },
        _sum: { fileSize: true },
      }),
    ]);
    // Storage is account-wide, independent of the selected category filter.
    const totalBytes = storageAggregate._sum.fileSize || 0;
    const storageUsed = `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;

    return res.status(200).json({
      status: 'success',
      data: {
        totalFiles: documents.length,
        totalStorageBytes: totalBytes,
        totalStorageUsed: storageUsed,
        storageUsed,
        documents: documents.map((document) => ({
          ...document,
          category: document.type,
          fileSizeFormatted: formatSize(document.fileSize),
          uploadedAt: document.createdAt,
          isVerified: false,
        })),
      },
    });
  } catch (error) {
    console.error('getDocuments Error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch documents.' });
  }
};

export const uploadDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    const { name, type, category, fileData, mimeType } = req.body ?? {};
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ status: 'error', message: 'Document name is required.' });
    }
    const docType = String(category || type || 'RESUME');
    if (!ALLOWED_CATEGORIES.has(docType)) {
      return res.status(400).json({ status: 'error', message: 'Invalid document category.' });
    }
    if (mimeType !== 'application/pdf') {
      return res.status(400).json({ status: 'error', message: 'Only PDF files are allowed.' });
    }
    if (typeof fileData !== 'string' || !fileData) {
      return res.status(400).json({ status: 'error', message: 'PDF file data is required.' });
    }

    const base64 = fileData.replace(/^data:application\\/pdf;base64,/, '');
    if (!base64 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64) || base64.length % 4 !== 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid PDF data.' });
    }
    const bytes = Buffer.from(base64, 'base64');
    if (!bytes.length) return res.status(400).json({ status: 'error', message: 'The selected file is empty.' });
    if (bytes.length > MAX_FILE_BYTES) {
      return res.status(413).json({ status: 'error', message: 'File exceeds the 5 MB limit.' });
    }
    if (bytes.subarray(0, 5).toString('ascii') !== '%PDF-') {
      return res.status(400).json({ status: 'error', message: 'The selected file is not a valid PDF.' });
    }

    const safeName = name.trim().replace(/[\\/\0]/g, '').slice(0, 180);
    const document = await prisma.document.create({
      data: {
        userId: req.user.userId,
        name: safeName.toLowerCase().endsWith('.pdf') ? safeName : `${safeName}.pdf`,
        type: docType,
        fileUrl: 'postgresql://document-bytea',
        storagePath: 'postgresql://documents',
        fileSize: bytes.length,
        mimeType: 'application/pdf',
        fileData: bytes,
      },
      select: { id: true, name: true, type: true, fileSize: true, mimeType: true, createdAt: true, updatedAt: true },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Document saved to PostgreSQL successfully.',
      data: { document: { ...document, category: document.type, fileSizeFormatted: formatSize(document.fileSize), uploadedAt: document.createdAt, isVerified: false, hasFileData: true } },
    });
  } catch (error) {
    console.error('uploadDocument Error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to save document.' });
  }
};

export const getDocumentFile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
      select: { id: true, name: true, mimeType: true, fileData: true },
    });
    if (!document) return res.status(404).json({ status: 'error', message: 'Document not found.' });
    if (!document.fileData) return res.status(410).json({ status: 'error', message: 'This older record has no stored PDF bytes. Please upload the PDF again.' });

    res.setHeader('Content-Type', document.mimeType || 'application/pdf');
    res.setHeader('Content-Length', document.fileData.byteLength);
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename(document.name)}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).send(Buffer.from(document.fileData));
  } catch (error) {
    console.error('getDocumentFile Error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve document.' });
  }
};

export const downloadDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
      select: { name: true, mimeType: true, fileData: true },
    });
    if (!document) return res.status(404).json({ status: 'error', message: 'Document not found.' });
    if (!document.fileData) return res.status(410).json({ status: 'error', message: 'This older record has no stored PDF bytes. Please upload the PDF again.' });

    res.setHeader('Content-Type', document.mimeType || 'application/pdf');
    res.setHeader('Content-Length', document.fileData.byteLength);
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename(document.name)}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).send(Buffer.from(document.fileData));
  } catch (error) {
    console.error('downloadDocument Error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to download document.' });
  }
};

export const deleteDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
      select: { id: true },
    });
    if (!document) return res.status(404).json({ status: 'error', message: 'Document not found.' });
    await prisma.document.delete({ where: { id: document.id } });
    return res.status(200).json({ status: 'success', message: 'Document deleted.' });
  } catch (error) {
    console.error('deleteDocument Error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to delete document.' });
  }
};
