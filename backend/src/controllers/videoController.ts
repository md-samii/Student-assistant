import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import prisma from '../config/prisma';
import {
  searchYouTubeVideos,
  getCurriculumModules,
  getUserLibrary as getUserLibraryService,
  YouTubeServiceError,
  YouTubeVideoItem,
} from '../services/videoService';

export const getRecommendedVideos = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Not authenticated' });
      return;
    }

    const {
      subjectCode,
      subjectName,
      moduleNumber,
      moduleTitle,
      search,
      channel,
      limit,
    } = req.query;

    const parsedModule = moduleNumber ? Number(moduleNumber) : undefined;
    const parsedLimit = limit ? Number(limit) : 12;

    const searchParams = {
      subjectCode: subjectCode ? String(subjectCode).trim() : undefined,
      subjectName: subjectName ? String(subjectName).trim() : undefined,
      moduleNumber: parsedModule && !isNaN(parsedModule) ? parsedModule : undefined,
      moduleTitle: moduleTitle ? String(moduleTitle).trim() : undefined,
      search: search ? String(search).trim() : undefined,
      channel: channel ? String(channel).trim() : undefined,
      limit: parsedLimit,
    };

    // If neither subject nor search is provided, we can default to user's profile subject
    if (!searchParams.subjectCode && !searchParams.search) {
      res.status(400).json({
        status: 'error',
        message: 'A subjectCode or search query is required to search video lectures.',
      });
      return;
    }

    const { videos, queryUsed, isCached } = await searchYouTubeVideos(searchParams);

    // Overlay user's saved favorites and progress status
    const videoIds = videos.map((v) => v.youtubeVideoId);
    const userRecords = await prisma.videoProgress.findMany({
      where: {
        userId: req.user.userId,
        youtubeVideoId: { in: videoIds },
      },
    });

    const progressMap = new Map(userRecords.map((r) => [r.youtubeVideoId, r]));

    const enrichedVideos: YouTubeVideoItem[] = videos.map((v) => {
      const record = progressMap.get(v.youtubeVideoId);
      return {
        ...v,
        isFavorite: record ? record.isFavorite : false,
        progressStatus: record
          ? (record.status as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED')
          : 'NOT_STARTED',
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        total: enrichedVideos.length,
        queryUsed,
        isCached,
        videos: enrichedVideos,
      },
    });
  } catch (error: any) {
    if (error instanceof YouTubeServiceError) {
      res.status(error.statusCode).json({
        status: 'error',
        code: error.code,
        message: error.message,
      });
      return;
    }

    console.error('getRecommendedVideos Error:', error);
    res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to search video lectures.',
    });
  }
};

export const getSubjectModules = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { subjectCode } = req.query;

    if (!subjectCode || typeof subjectCode !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'subjectCode query parameter is required.',
      });
      return;
    }

    const modules = await getCurriculumModules(subjectCode.trim());

    res.status(200).json({
      status: 'success',
      data: {
        subjectCode,
        modules,
      },
    });
  } catch (error: any) {
    console.error('getSubjectModules Error:', error);
    res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to load subject modules.',
    });
  }
};

export const getUserLibrary = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Not authenticated' });
      return;
    }

    const library = await getUserLibraryService(req.user.userId);

    res.status(200).json({
      status: 'success',
      data: library,
    });
  } catch (error: any) {
    console.error('getUserLibrary Error:', error);
    res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to load video library.',
    });
  }
};

export const toggleFavorite = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Not authenticated' });
      return;
    }

    const {
      youtubeVideoId,
      title,
      thumbnailUrl,
      channelTitle,
      subjectCode,
      moduleNumber,
      isFavorite,
    } = req.body;

    if (!youtubeVideoId) {
      res.status(400).json({
        status: 'error',
        message: 'youtubeVideoId is required.',
      });
      return;
    }

    const favStatus = isFavorite !== undefined ? Boolean(isFavorite) : true;
    const parsedModule = moduleNumber !== undefined && moduleNumber !== null
      ? Number(moduleNumber)
      : null;

    const record = await prisma.videoProgress.upsert({
      where: {
        userId_youtubeVideoId: {
          userId: req.user.userId,
          youtubeVideoId,
        },
      },
      update: {
        isFavorite: favStatus,
        ...(title ? { title } : {}),
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
        ...(channelTitle ? { channelTitle } : {}),
        ...(subjectCode ? { subjectCode } : {}),
        ...(parsedModule !== null && !isNaN(parsedModule) ? { moduleNumber: parsedModule } : {}),
      },
      create: {
        userId: req.user.userId,
        youtubeVideoId,
        title: title || 'Academic Lecture',
        thumbnailUrl: thumbnailUrl || `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`,
        channelTitle: channelTitle || 'Educator',
        subjectCode: subjectCode || null,
        moduleNumber: parsedModule !== null && !isNaN(parsedModule) ? parsedModule : null,
        isFavorite: favStatus,
        status: 'NOT_STARTED',
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        videoProgress: record,
      },
    });
  } catch (error: any) {
    console.error('toggleFavorite Error:', error);
    res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to update favorite status.',
    });
  }
};

export const updateVideoProgress = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Not authenticated' });
      return;
    }

    const {
      youtubeVideoId,
      title,
      thumbnailUrl,
      channelTitle,
      subjectCode,
      moduleNumber,
      status,
    } = req.body;

    if (!youtubeVideoId) {
      res.status(400).json({
        status: 'error',
        message: 'youtubeVideoId is required.',
      });
      return;
    }

    const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        status: 'error',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const parsedModule = moduleNumber !== undefined && moduleNumber !== null
      ? Number(moduleNumber)
      : null;

    const record = await prisma.videoProgress.upsert({
      where: {
        userId_youtubeVideoId: {
          userId: req.user.userId,
          youtubeVideoId,
        },
      },
      update: {
        status,
        lastWatchedAt: new Date(),
        ...(title ? { title } : {}),
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
        ...(channelTitle ? { channelTitle } : {}),
        ...(subjectCode ? { subjectCode } : {}),
        ...(parsedModule !== null && !isNaN(parsedModule) ? { moduleNumber: parsedModule } : {}),
      },
      create: {
        userId: req.user.userId,
        youtubeVideoId,
        title: title || 'Academic Lecture',
        thumbnailUrl: thumbnailUrl || `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`,
        channelTitle: channelTitle || 'Educator',
        subjectCode: subjectCode || null,
        moduleNumber: parsedModule !== null && !isNaN(parsedModule) ? parsedModule : null,
        status,
        lastWatchedAt: new Date(),
      },
    });

    // If in progress or completed, log learning activity
    if (status === 'IN_PROGRESS' || status === 'COMPLETED') {
      await prisma.learningActivity.create({
        data: {
          userId: req.user.userId,
          type: 'VIDEO',
        },
      }).catch((e) => {
        // Non-blocking log
        console.warn('Could not record learning activity:', e?.message);
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        videoProgress: record,
      },
    });
  } catch (error: any) {
    console.error('updateVideoProgress Error:', error);
    res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to update video progress.',
    });
  }
};

export const getVideoById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const record = await prisma.videoProgress.findFirst({
      where: {
        userId: req.user.userId,
        youtubeVideoId: id,
      },
    });

    if (record) {
      res.status(200).json({
        status: 'success',
        data: {
          video: {
            id: record.youtubeVideoId,
            youtubeVideoId: record.youtubeVideoId,
            title: record.title,
            thumbnailUrl: record.thumbnailUrl,
            channelTitle: record.channelTitle,
            subjectCode: record.subjectCode,
            moduleNumber: record.moduleNumber,
            isFavorite: record.isFavorite,
            progressStatus: record.status,
            lastWatchedAt: record.lastWatchedAt,
          },
        },
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        video: {
          id,
          youtubeVideoId: id,
          title: 'YouTube Lecture',
          thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          progressStatus: 'NOT_STARTED',
          isFavorite: false,
        },
      },
    });
  } catch (error: any) {
    console.error('getVideoById Error:', error);
    res.status(500).json({ status: 'error', message: error?.message });
  }
};

export const clearVideoHistory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Not authenticated' });
      return;
    }

    const userId = req.user.userId;

    // For favorited videos, reset progress status to NOT_STARTED so favorite remains intact
    await prisma.videoProgress.updateMany({
      where: {
        userId,
        isFavorite: true,
        status: { in: ['IN_PROGRESS', 'COMPLETED'] },
      },
      data: {
        status: 'NOT_STARTED',
      },
    });

    // For non-favorited videos, remove the progress records completely
    await prisma.videoProgress.deleteMany({
      where: {
        userId,
        isFavorite: false,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Video learning history cleared successfully.',
    });
  } catch (error: any) {
    console.error('clearVideoHistory Error:', error);
    res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to clear video history.',
    });
  }
};

export const removeHistoryItem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Not authenticated' });
      return;
    }

    const userId = req.user.userId;
    const { videoId } = req.params;

    const existing = await prisma.videoProgress.findUnique({
      where: {
        userId_youtubeVideoId: {
          userId,
          youtubeVideoId: videoId,
        },
      },
    });

    if (!existing) {
      res.status(404).json({
        status: 'error',
        message: 'Video history record not found.',
      });
      return;
    }

    if (existing.isFavorite) {
      await prisma.videoProgress.update({
        where: { id: existing.id },
        data: { status: 'NOT_STARTED' },
      });
    } else {
      await prisma.videoProgress.delete({
        where: { id: existing.id },
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Video removed from history.',
    });
  } catch (error: any) {
    console.error('removeHistoryItem Error:', error);
    res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to remove video from history.',
    });
  }
};
