import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { DEFAULT_VIDEO_CATALOG, VideoRecommendationItem } from '../services/videoService';

export const getRecommendedVideos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const { subject, channel, search } = req.query;

    let videos: VideoRecommendationItem[] = DEFAULT_VIDEO_CATALOG;

    if (subject) {
      const subjStr = String(subject).toLowerCase();
      videos = videos.filter(
        (v) =>
          v.subjectName.toLowerCase().includes(subjStr) ||
          v.subjectCode.toLowerCase().includes(subjStr)
      );
    }

    if (channel && channel !== 'ALL') {
      const chStr = String(channel).toLowerCase();
      videos = videos.filter((v) => v.channelName.toLowerCase().includes(chStr));
    }

    if (search) {
      const q = String(search).toLowerCase();
      videos = videos.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.channelName.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      status: 'success',
      data: {
        total: videos.length,
        videos,
      },
    });
  } catch (error: any) {
    console.error('getRecommendedVideos Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getVideoById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const item = DEFAULT_VIDEO_CATALOG.find((v) => v.id === id || v.youtubeVideoId === id);

    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Video recommendation not found' });
    }

    return res.status(200).json({
      status: 'success',
      data: { video: item },
    });
  } catch (error: any) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
