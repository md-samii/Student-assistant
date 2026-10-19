import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/prisma';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB = 5,242,880 bytes
const ALLOWED_CATEGORIES = ['RESUME', 'MARKS_CARD', 'CERTIFICATE', 'INTERNSHIP_CERTIFICATE'];

/**
 * Format raw bytes into user-friendly storage string (KB or MB)
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Sanitize filename to prevent header injection or unsafe characters
 */
function getSafePdfFilename(rawName: string): string {
  const clean = rawName.replace(/[^a-zA-Z0-9._-]/g, '_').trim();
  const base = clean.replace(/\.pdf$/i, '');
  return `${base || 'document'}.pdf`;
}

/**
 * GET /api/documents
 * List all documents for authenticated user (excluding binary BYTEA from listing).
 * Calculates account-wide storage across all user documents regardless of category filter.
 */
export const getDocuments = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
      });
      return;
    }

    const userId = req.user.userId;
    const { type, category } = req.query;
    const filter = (category || type) as string | undefined;

    // Fetch documents matching filter, strictly excluding binary fileData
    const documents = await prisma.document.findMany({
      where: {
        userId,
        ...(filter && filter !== 'ALL'
          ? {
              type: String(filter),
            }
          : {}),
      },
      select: {
        id: true,
        userId: true,
        name: true,
        type: true,
        fileUrl: true,
        storagePath: true,
        fileSize: true,
        mimeType: true,
        createdAt: true,
        updatedAt: true,
        // fileData is intentionally omitted for speed and low memory footprint
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Account-wide storage calculation across ALL documents owned by user
    const allUserDocs = await prisma.document.findMany({
      where: { userId },
      select: { fileSize: true },
    });

    const totalStorageBytes = allUserDocs.reduce(
      (sum, doc) => sum + (doc.fileSize || 0),
      0
    );
    const totalFilesCount = allUserDocs.length;
    const formattedStorage = formatBytes(totalStorageBytes);

    const mappedDocuments = documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      category: doc.type,
      fileSize: doc.fileSize,
      fileSizeFormatted: formatBytes(doc.fileSize),
      mimeType: doc.mimeType,
      fileUrl: doc.fileUrl || `/api/documents/${doc.id}/view`,
      hasBinaryData: true,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      uploadedAt: doc.createdAt,
    }));

    res.status(200).json({
      status: 'success',
      data: {
        totalFiles: totalFilesCount,
        totalStorageBytes,
        totalStorageUsed: formattedStorage,
        storageUsed: formattedStorage,
        maxFileSizeBytes: MAX_FILE_SIZE,
        maxFileSizeFormatted: '5 MB',
        documents: mappedDocuments,
      },
    });
  } catch (error: any) {
    console.error('getDocuments Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch documents from database storage.',
    });
  }
};

/**
 * POST /api/documents & POST /api/documents/upload
 * Upload PDF and store actual bytes directly in PostgreSQL BYTEA.
 */
export const uploadDocument = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
      });
      return;
    }

    const userId = req.user.userId;
    const { name, title, type, category, fileBase64, fileUrl, fileSize } = req.body;

    // 1. Validate Document Title
    const rawTitle = (title || name || '').trim();
    if (!rawTitle) {
      res.status(400).json({
        status: 'error',
        message: 'Document title is required.',
      });
      return;
    }

    const sanitizedName = getSafePdfFilename(rawTitle);

    // 2. Validate Category
    const selectedCategory = String(category || type || 'RESUME').toUpperCase().trim();
    if (!ALLOWED_CATEGORIES.includes(selectedCategory)) {
      res.status(400).json({
        status: 'error',
        message: `Invalid document category. Allowed categories: ${ALLOWED_CATEGORIES.join(', ')}`,
      });
      return;
    }

    // 3. Validate & Decode PDF File Data
    if (!fileBase64 && !fileUrl) {
      res.status(400).json({
        status: 'error',
        message: 'Please select a PDF document file to upload.',
      });
      return;
    }

    let buffer: Buffer | null = null;

    if (fileBase64) {
      // Strip base64 data URL prefix if present (e.g. data:application/pdf;base64,...)
      const base64Data = fileBase64.replace(/^data:[^;]+;base64,/, '').trim();

      if (!base64Data) {
        res.status(400).json({
          status: 'error',
          message: 'The selected PDF file is empty.',
        });
        return;
      }

      try {
        buffer = Buffer.from(base64Data, 'base64');
      } catch (decodeErr) {
        res.status(400).json({
          status: 'error',
          message: 'Malformed file payload. Could not decode base64 file data.',
        });
        return;
      }

      // Check empty buffer
      if (buffer.length === 0) {
        res.status(400).json({
          status: 'error',
          message: 'The selected PDF file is empty (0 bytes).',
        });
        return;
      }

      // Enforce 5 MB maximum file size limit
      if (buffer.length > MAX_FILE_SIZE) {
        res.status(400).json({
          status: 'error',
          message: `File size (${formatBytes(buffer.length)}) exceeds the maximum allowed limit of 5 MB.`,
        });
        return;
      }

      // Validate PDF Magic Header (%PDF-)
      const magicHeader = buffer.subarray(0, 5).toString('ascii');
      if (!magicHeader.startsWith('%PDF-')) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid file content. The uploaded file is not a valid PDF document (missing %PDF- signature).',
        });
        return;
      }
    }

    const calculatedSize = buffer ? buffer.length : Number(fileSize) || 512000;

    // 4. Save to PostgreSQL with BYTEA storage
    const newDoc = await prisma.document.create({
      data: {
        userId,
        name: sanitizedName,
        type: selectedCategory,
        fileUrl: `/api/documents/pending/view`, // updated right below with real ID
        storagePath: buffer ? 'postgresql_bytea' : 'legacy_url',
        fileSize: calculatedSize,
        mimeType: 'application/pdf',
        fileData: buffer,
      },
    });

    // Update fileUrl to self-referential authenticated view path
    const updatedDoc = await prisma.document.update({
      where: { id: newDoc.id },
      data: {
        fileUrl: `/api/documents/${newDoc.id}/view`,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        type: true,
        fileUrl: true,
        storagePath: true,
        fileSize: true,
        mimeType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'PDF document uploaded and stored in database locker successfully.',
      data: {
        document: {
          id: updatedDoc.id,
          name: updatedDoc.name,
          type: updatedDoc.type,
          category: updatedDoc.type,
          fileSize: updatedDoc.fileSize,
          fileSizeFormatted: formatBytes(updatedDoc.fileSize),
          mimeType: updatedDoc.mimeType,
          fileUrl: updatedDoc.fileUrl,
          hasBinaryData: !!buffer,
          createdAt: updatedDoc.createdAt,
          uploadedAt: updatedDoc.createdAt,
        },
      },
    });
  } catch (error: any) {
    console.error('uploadDocument Error:', error);
    res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to save document to PostgreSQL database storage.',
    });
  }
};

/**
 * GET /api/documents/:id/view
 * Retrieve actual PDF BYTEA from PostgreSQL and stream inline for in-browser viewer.
 */
export const viewDocument = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
      });
      return;
    }

    const { id } = req.params;
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!document) {
      res.status(404).json({
        status: 'error',
        message: 'Document not found or does not belong to your account.',
      });
      return;
    }

    if (!document.fileData) {
      res.status(404).json({
        status: 'error',
        message: 'Document file content is not stored in database BYTEA storage (legacy record). Please upload the PDF again to view.',
      });
      return;
    }

    const safeFilename = getSafePdfFilename(document.name);

    res.setHeader('Content-Type', document.mimeType || 'application/pdf');
    res.setHeader('Content-Length', document.fileData.length);
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    res.end(document.fileData);
  } catch (error: any) {
    console.error('viewDocument Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to stream document from database storage.',
    });
  }
};

/**
 * GET /api/documents/:id/download
 * Retrieve actual PDF BYTEA from PostgreSQL with attachment header for download.
 */
export const downloadDocument = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
      });
      return;
    }

    const { id } = req.params;
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!document) {
      res.status(404).json({
        status: 'error',
        message: 'Document not found or does not belong to your account.',
      });
      return;
    }

    if (!document.fileData) {
      res.status(404).json({
        status: 'error',
        message: 'Document file content is not stored in database BYTEA storage (legacy record). Please upload the PDF again to download.',
      });
      return;
    }

    const safeFilename = getSafePdfFilename(document.name);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', document.fileData.length);
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    res.end(document.fileData);
  } catch (error: any) {
    console.error('downloadDocument Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to download document from database storage.',
    });
  }
};

/**
 * DELETE /api/documents/:id
 * Delete document and its BYTEA content from PostgreSQL.
 */
export const deleteDocument = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
      });
      return;
    }

    const { id } = req.params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: req.user.userId,
      },
    });

    if (!document) {
      res.status(404).json({
        status: 'error',
        message: 'Document not found or does not belong to your account.',
      });
      return;
    }

    await prisma.document.delete({
      where: {
        id: document.id,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Document deleted successfully from database storage.',
    });
  } catch (error: any) {
    console.error('deleteDocument Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete document from database storage.',
    });
  }
};