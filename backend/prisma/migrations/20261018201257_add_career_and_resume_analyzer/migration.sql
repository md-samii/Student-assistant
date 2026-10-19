-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "logoUrl" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredSkills" TEXT NOT NULL,
    "preferredSkills" TEXT,
    "eligibleBranches" TEXT,
    "eligibleSemesters" TEXT,
    "location" TEXT NOT NULL,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "employmentType" TEXT NOT NULL DEFAULT 'FULL_TIME',
    "salaryRange" TEXT,
    "applyUrl" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "postedAt" TIMESTAMP(3),
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "sourceProvenance" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunity_sync_logs" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "itemsFetched" INTEGER NOT NULL DEFAULT 0,
    "itemsCreated" INTEGER NOT NULL DEFAULT 0,
    "itemsUpdated" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opportunity_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunity_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',

    CONSTRAINT "opportunity_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT,
    "resumeName" TEXT NOT NULL,
    "extractedText" TEXT NOT NULL,
    "pageCount" INTEGER NOT NULL DEFAULT 1,
    "overallScore" INTEGER NOT NULL,
    "parsingScore" INTEGER NOT NULL,
    "sectionScore" INTEGER NOT NULL,
    "skillsScore" INTEGER NOT NULL,
    "experienceScore" INTEGER NOT NULL,
    "formattingScore" INTEGER NOT NULL,
    "contactInfo" TEXT NOT NULL,
    "summary" TEXT,
    "education" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "projects" TEXT NOT NULL,
    "certifications" TEXT NOT NULL,
    "issues" TEXT NOT NULL,
    "checklist" TEXT NOT NULL,
    "targetJobTitle" TEXT,
    "targetJobDesc" TEXT,
    "targetMatchScore" INTEGER,
    "targetMatchDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "opportunities_category_status_idx" ON "opportunities"("category", "status");

-- CreateIndex
CREATE INDEX "opportunities_lastCheckedAt_idx" ON "opportunities"("lastCheckedAt");

-- CreateIndex
CREATE UNIQUE INDEX "opportunities_provider_externalId_key" ON "opportunities"("provider", "externalId");

-- CreateIndex
CREATE INDEX "opportunity_sync_logs_provider_startedAt_idx" ON "opportunity_sync_logs"("provider", "startedAt");

-- CreateIndex
CREATE INDEX "opportunity_applications_userId_idx" ON "opportunity_applications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "opportunity_applications_userId_opportunityId_key" ON "opportunity_applications"("userId", "opportunityId");

-- CreateIndex
CREATE INDEX "resume_analyses_userId_createdAt_idx" ON "resume_analyses"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "opportunity_applications" ADD CONSTRAINT "opportunity_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_applications" ADD CONSTRAINT "opportunity_applications_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_analyses" ADD CONSTRAINT "resume_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_analyses" ADD CONSTRAINT "resume_analyses_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
