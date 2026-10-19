-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "creatorId" TEXT;

-- CreateIndex
CREATE INDEX "quizzes_creatorId_idx" ON "quizzes"("creatorId");

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
