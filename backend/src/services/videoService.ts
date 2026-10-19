import prisma from '../config/prisma';

export interface VideoRecommendationItem {
  id: string;
  youtubeVideoId: string;
  title: string;
  description: string;
  subjectCode: string;
  subjectName: string;
  channelName: string;
  thumbnailUrl: string;
  duration?: string;
  viewsCount?: string;
  publishedDate?: string;
  isVerifiedChannel?: boolean;
}

export interface YouTubeVideoItem {
  id: string;
  youtubeVideoId: string;
  title: string;
  description: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
  subjectCode?: string;
  subjectName?: string;
  moduleNumber?: number;
  isFavorite?: boolean;
  progressStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface CurriculumModuleItem {
  moduleNumber: number;
  title: string;
  description?: string;
}

// In-memory query cache to avoid burning YouTube API quota (30-minute TTL)
interface CacheEntry {
  timestamp: number;
  videos: YouTubeVideoItem[];
}

const SEARCH_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export class YouTubeServiceError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.name = 'YouTubeServiceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Retrieves the module syllabus for a subject from the curriculum database,
 * falling back to default syllabus modules if resources are not yet uploaded.
 */
export async function getCurriculumModules(subjectCode: string): Promise<CurriculumModuleItem[]> {
  try {
    const resources = await prisma.studyResource.findMany({
      where: {
        subject: {
          code: {
            equals: subjectCode,
            mode: 'insensitive',
          },
        },
      },
      orderBy: { moduleNumber: 'asc' },
      select: {
        moduleNumber: true,
        title: true,
        description: true,
      },
    });

    if (resources && resources.length > 0) {
      // Group by module number
      const moduleMap = new Map<number, CurriculumModuleItem>();
      for (const r of resources) {
        if (!moduleMap.has(r.moduleNumber)) {
          // Clean up title if it contains boilerplate notes text
          let cleanTitle = r.title
            .replace(/Notes/gi, '')
            .replace(new RegExp(subjectCode, 'gi'), '')
            .replace(/[-–—]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          if (!cleanTitle || cleanTitle.toLowerCase().includes('module')) {
            cleanTitle = `Module ${r.moduleNumber} Syllabus Topics`;
          }

          moduleMap.set(r.moduleNumber, {
            moduleNumber: r.moduleNumber,
            title: cleanTitle,
            description: r.description || undefined,
          });
        }
      }

      const list = Array.from(moduleMap.values()).sort((a, b) => a.moduleNumber - b.moduleNumber);
      if (list.length > 0) return list;
    }
  } catch (err) {
    console.warn(`Could not load DB resources for ${subjectCode}:`, err);
  }

  // Standard VTU engineering subjects default to 5 modules
  return [1, 2, 3, 4, 5].map((m) => ({
    moduleNumber: m,
    title: `Module ${m}`,
    description: `Module ${m} Core Topics`,
  }));
}

export interface SearchVideosParams {
  subjectCode?: string;
  subjectName?: string;
  moduleNumber?: number;
  moduleTitle?: string;
  search?: string;
  channel?: string;
  limit?: number;
}

/**
 * Executes a real search using the YouTube Data API v3.
 * Throws explicit YouTubeServiceError when credentials are missing or API fails.
 */
export async function searchYouTubeVideos(params: SearchVideosParams): Promise<{
  videos: YouTubeVideoItem[];
  queryUsed: string;
  isCached: boolean;
}> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();

  if (!apiKey) {
    throw new YouTubeServiceError(
      'YouTube Data API key is not configured on the backend. Set YOUTUBE_API_KEY in backend/.env to enable live search.',
      'YOUTUBE_API_KEY_MISSING',
      503
    );
  }

  // Construct search query
  const queryParts: string[] = [];

  if (params.subjectCode) {
    queryParts.push(params.subjectCode);
  }
  if (params.subjectName) {
    queryParts.push(params.subjectName);
  }
  if (params.moduleNumber) {
    queryParts.push(`Module ${params.moduleNumber}`);
  }
  if (params.moduleTitle && !params.moduleTitle.toLowerCase().startsWith('module')) {
    queryParts.push(params.moduleTitle);
  }
  if (params.search?.trim()) {
    queryParts.push(params.search.trim());
  }

  // Add academic context for high-quality engineering lecture results
  queryParts.push('lecture engineering');

  if (params.channel && params.channel !== 'ALL') {
    queryParts.push(params.channel);
  }

  const queryUsed = queryParts.join(' ').replace(/\s+/g, ' ').trim();

  // Check cache
  const cacheKey = `${queryUsed.toLowerCase()}_limit${params.limit || 12}`;
  const cached = SEARCH_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      videos: cached.videos,
      queryUsed,
      isCached: true,
    };
  }

  // Query YouTube Data API v3
  const maxResults = Math.min(Math.max(params.limit || 12, 1), 25);
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', String(maxResults));
  url.searchParams.set('q', queryUsed);
  url.searchParams.set('key', apiKey);

  let response: globalThis.Response;
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  } catch (netErr: any) {
    throw new YouTubeServiceError(
      `Failed to connect to YouTube Data API: ${netErr?.message || 'Network error'}`,
      'YOUTUBE_NETWORK_ERROR',
      502
    );
  }

  const data: any = await response.json();

  if (!response.ok) {
    const errorDetails = data?.error?.errors?.[0];
    const reason = errorDetails?.reason || data?.error?.status || '';
    const message = data?.error?.message || 'YouTube Data API error';

    if (reason === 'quotaExceeded' || response.status === 429) {
      throw new YouTubeServiceError(
        'YouTube API quota exceeded for today. Please try again tomorrow or use another key.',
        'YOUTUBE_QUOTA_EXCEEDED',
        429
      );
    }

    if (reason === 'keyInvalid' || response.status === 400 || response.status === 401) {
      throw new YouTubeServiceError(
        `YouTube API key error: ${message}`,
        'YOUTUBE_API_KEY_INVALID',
        response.status
      );
    }

    throw new YouTubeServiceError(message, 'YOUTUBE_API_ERROR', response.status);
  }

  const items = Array.isArray(data.items) ? data.items : [];
  const seenIds = new Set<string>();
  const videos: YouTubeVideoItem[] = [];

  for (const item of items) {
    const videoId = item?.id?.videoId;
    if (!videoId || seenIds.has(videoId)) continue;
    seenIds.add(videoId);

    const snippet = item.snippet || {};
    const thumbnails = snippet.thumbnails || {};
    const thumbnail =
      thumbnails.high?.url ||
      thumbnails.medium?.url ||
      thumbnails.default?.url ||
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    videos.push({
      id: videoId,
      youtubeVideoId: videoId,
      title: snippet.title || 'Untitled Lecture',
      description: snippet.description || '',
      channelTitle: snippet.channelTitle || 'Educator',
      thumbnailUrl: thumbnail,
      publishedAt: snippet.publishedAt || new Date().toISOString(),
      subjectCode: params.subjectCode,
      subjectName: params.subjectName,
      moduleNumber: params.moduleNumber,
      progressStatus: 'NOT_STARTED',
      isFavorite: false,
    });
  }

  // Store in cache
  SEARCH_CACHE.set(cacheKey, {
    timestamp: Date.now(),
    videos,
  });

  return {
    videos,
    queryUsed,
    isCached: false,
  };
}

/**
 * Returns user's saved/favorite videos and progress tracking
 */
export async function getUserLibrary(userId: string) {
  const records = await prisma.videoProgress.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });

  const favorites = records
    .filter((r) => r.isFavorite)
    .map((r) => ({
      id: r.youtubeVideoId,
      youtubeVideoId: r.youtubeVideoId,
      title: r.title,
      description: '',
      channelTitle: r.channelTitle || 'Educator',
      thumbnailUrl: r.thumbnailUrl || `https://i.ytimg.com/vi/${r.youtubeVideoId}/hqdefault.jpg`,
      publishedAt: r.createdAt.toISOString(),
      subjectCode: r.subjectCode || undefined,
      moduleNumber: r.moduleNumber || undefined,
      isFavorite: true,
      progressStatus: r.status as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED',
      lastWatchedAt: r.lastWatchedAt,
    }));

  const tracked = records
    .filter((r) => r.status === 'IN_PROGRESS' || r.status === 'COMPLETED')
    .map((r) => ({
      id: r.youtubeVideoId,
      youtubeVideoId: r.youtubeVideoId,
      title: r.title,
      description: '',
      channelTitle: r.channelTitle || 'Educator',
      thumbnailUrl: r.thumbnailUrl || `https://i.ytimg.com/vi/${r.youtubeVideoId}/hqdefault.jpg`,
      publishedAt: r.createdAt.toISOString(),
      subjectCode: r.subjectCode || undefined,
      moduleNumber: r.moduleNumber || undefined,
      isFavorite: r.isFavorite,
      progressStatus: r.status as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED',
      lastWatchedAt: r.lastWatchedAt,
    }));

  const completedCount = records.filter((r) => r.status === 'COMPLETED').length;
  const inProgressCount = records.filter((r) => r.status === 'IN_PROGRESS').length;
  const favoritesCount = favorites.length;

  return {
    favorites,
    tracked,
    stats: {
      totalTracked: tracked.length,
      completedCount,
      inProgressCount,
      favoritesCount,
    },
  };
}
