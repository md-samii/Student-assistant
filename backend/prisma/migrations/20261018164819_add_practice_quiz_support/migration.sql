-- AlterTable
ALTER TABLE "quiz_submissions" ADD COLUMN     "isPractice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "moduleNumber" INTEGER,
ADD COLUMN     "subjectId" TEXT,
ADD COLUMN     "timeTakenSec" INTEGER,
ALTER COLUMN "quizId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "quiz_submissions_userId_submittedAt_idx" ON "quiz_submissions"("userId", "submittedAt");

-- AddForeignKey
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
