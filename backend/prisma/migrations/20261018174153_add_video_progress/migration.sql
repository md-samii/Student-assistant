-- CreateTable
CREATE TABLE "video_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "channelTitle" TEXT,
    "subjectCode" TEXT,
    "moduleNumber" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "lastWatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "video_progress_userId_status_idx" ON "video_progress"("userId", "status");

-- CreateIndex
CREATE INDEX "video_progress_userId_isFavorite_idx" ON "video_progress"("userId", "isFavorite");

-- CreateIndex
CREATE UNIQUE INDEX "video_progress_userId_youtubeVideoId_key" ON "video_progress"("userId", "youtubeVideoId");

-- AddForeignKey
ALTER TABLE "video_progress" ADD CONSTRAINT "video_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
