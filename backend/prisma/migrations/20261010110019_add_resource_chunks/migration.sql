-- CreateTable
CREATE TABLE "resource_chunks" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resource_chunks_resourceId_idx" ON "resource_chunks"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_chunks_resourceId_chunkIndex_key" ON "resource_chunks"("resourceId", "chunkIndex");

-- AddForeignKey
ALTER TABLE "resource_chunks" ADD CONSTRAINT "resource_chunks_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "study_resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
