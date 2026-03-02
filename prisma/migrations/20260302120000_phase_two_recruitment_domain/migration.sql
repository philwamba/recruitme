-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY');
CREATE TYPE "WorkplaceType" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');
CREATE TYPE "DocumentType" AS ENUM ('CV', 'SUPPORTING_DOCUMENT');
CREATE TYPE "DocumentScanStatus" AS ENUM ('PENDING', 'CLEAN', 'REJECTED');

-- AlterEnum
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
CREATE TYPE "ApplicationStatus" AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW_PHASE_1',
  'INTERVIEW_PHASE_2',
  'ASSESSMENT',
  'OFFER',
  'REJECTED',
  'HIRED',
  'WITHDRAWN'
);

ALTER TABLE "Application" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "status" TYPE "ApplicationStatus" USING
  CASE
    WHEN "status"::text = 'PENDING' THEN 'SUBMITTED'::"ApplicationStatus"
    WHEN "status"::text = 'REVIEWING' THEN 'UNDER_REVIEW'::"ApplicationStatus"
    WHEN "status"::text = 'SHORTLISTED' THEN 'SHORTLISTED'::"ApplicationStatus"
    WHEN "status"::text = 'REJECTED' THEN 'REJECTED'::"ApplicationStatus"
    WHEN "status"::text = 'HIRED' THEN 'HIRED'::"ApplicationStatus"
    ELSE 'DRAFT'::"ApplicationStatus"
  END;
ALTER TABLE "Application" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
DROP TYPE "ApplicationStatus_old";

-- CreateTable
CREATE TABLE "Department" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobPipelineStage" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "JobPipelineStage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApplicationStageEvent" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "fromStageId" TEXT,
  "toStageId" TEXT,
  "changedByUserId" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ApplicationStageEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApplicationNote" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "authorUserId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ApplicationNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tag" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApplicationTag" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,

  CONSTRAINT "ApplicationTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApplicationRating" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "authorUserId" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ApplicationRating_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CandidateDocument" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT,
  "applicantProfileId" TEXT,
  "uploadedByUserId" TEXT NOT NULL,
  "documentType" "DocumentType" NOT NULL,
  "storageKey" TEXT NOT NULL,
  "originalFileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "sha256" TEXT NOT NULL,
  "scanStatus" "DocumentScanStatus" NOT NULL DEFAULT 'PENDING',
  "isPrivate" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CandidateDocument_pkey" PRIMARY KEY ("id")
);

-- AlterTable Job
ALTER TABLE "Job"
  ADD COLUMN "slug" TEXT,
  ADD COLUMN "benefits" TEXT,
  ADD COLUMN "salaryMin" INTEGER,
  ADD COLUMN "salaryMax" INTEGER,
  ADD COLUMN "salaryCurrency" TEXT,
  ADD COLUMN "employmentType" "EmploymentType",
  ADD COLUMN "workplaceType" "WorkplaceType",
  ADD COLUMN "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "departmentId" TEXT,
  ADD COLUMN "createdByUserId" TEXT,
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "expiresAt" TIMESTAMP(3);

UPDATE "Job"
SET
  "slug" = lower(regexp_replace("title", '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring("id" from 1 for 6),
  "salaryCurrency" = 'USD',
  "employmentType" = 'FULL_TIME',
  "workplaceType" = 'ONSITE',
  "status" = CASE WHEN "isActive" = true THEN 'PUBLISHED'::"JobStatus" ELSE 'DRAFT'::"JobStatus" END,
  "publishedAt" = CASE WHEN "isActive" = true THEN "createdAt" ELSE NULL END;

ALTER TABLE "Job"
  ALTER COLUMN "slug" SET NOT NULL,
  ALTER COLUMN "salaryCurrency" SET NOT NULL,
  ALTER COLUMN "employmentType" SET NOT NULL,
  ALTER COLUMN "workplaceType" SET NOT NULL;

ALTER TABLE "Job" DROP COLUMN "salary";
ALTER TABLE "Job" DROP COLUMN "isActive";

-- AlterTable Application
ALTER TABLE "Application"
  ADD COLUMN "trackingId" TEXT,
  ADD COLUMN "currentStageId" TEXT,
  ADD COLUMN "source" TEXT,
  ADD COLUMN "consentAcceptedAt" TIMESTAMP(3),
  ADD COLUMN "submittedAt" TIMESTAMP(3);

UPDATE "Application"
SET
  "trackingId" = 'APP-' || upper(substring("id" from 1 for 8)),
  "submittedAt" = "appliedAt";

ALTER TABLE "Application"
  ALTER COLUMN "trackingId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");
CREATE UNIQUE INDEX "Department_slug_key" ON "Department"("slug");
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");
CREATE INDEX "Job_status_publishedAt_idx" ON "Job"("status", "publishedAt");
CREATE INDEX "Job_departmentId_idx" ON "Job"("departmentId");
CREATE INDEX "Job_employmentType_workplaceType_idx" ON "Job"("employmentType", "workplaceType");
CREATE UNIQUE INDEX "Application_trackingId_key" ON "Application"("trackingId");
CREATE INDEX "Application_status_currentStageId_idx" ON "Application"("status", "currentStageId");
CREATE UNIQUE INDEX "JobPipelineStage_jobId_order_key" ON "JobPipelineStage"("jobId", "order");
CREATE INDEX "JobPipelineStage_jobId_idx" ON "JobPipelineStage"("jobId");
CREATE INDEX "ApplicationStageEvent_applicationId_idx" ON "ApplicationStageEvent"("applicationId");
CREATE INDEX "ApplicationStageEvent_changedByUserId_idx" ON "ApplicationStageEvent"("changedByUserId");
CREATE INDEX "ApplicationNote_applicationId_idx" ON "ApplicationNote"("applicationId");
CREATE INDEX "ApplicationNote_authorUserId_idx" ON "ApplicationNote"("authorUserId");
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
CREATE UNIQUE INDEX "ApplicationTag_applicationId_tagId_key" ON "ApplicationTag"("applicationId", "tagId");
CREATE INDEX "ApplicationTag_tagId_idx" ON "ApplicationTag"("tagId");
CREATE INDEX "ApplicationRating_applicationId_idx" ON "ApplicationRating"("applicationId");
CREATE INDEX "ApplicationRating_authorUserId_idx" ON "ApplicationRating"("authorUserId");
CREATE UNIQUE INDEX "CandidateDocument_storageKey_key" ON "CandidateDocument"("storageKey");
CREATE INDEX "CandidateDocument_applicationId_idx" ON "CandidateDocument"("applicationId");
CREATE INDEX "CandidateDocument_applicantProfileId_idx" ON "CandidateDocument"("applicantProfileId");
CREATE INDEX "CandidateDocument_uploadedByUserId_idx" ON "CandidateDocument"("uploadedByUserId");

-- Foreign Keys
ALTER TABLE "Job" ADD CONSTRAINT "Job_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_currentStageId_fkey" FOREIGN KEY ("currentStageId") REFERENCES "JobPipelineStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobPipelineStage" ADD CONSTRAINT "JobPipelineStage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationStageEvent" ADD CONSTRAINT "ApplicationStageEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationStageEvent" ADD CONSTRAINT "ApplicationStageEvent_fromStageId_fkey" FOREIGN KEY ("fromStageId") REFERENCES "JobPipelineStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ApplicationStageEvent" ADD CONSTRAINT "ApplicationStageEvent_toStageId_fkey" FOREIGN KEY ("toStageId") REFERENCES "JobPipelineStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ApplicationStageEvent" ADD CONSTRAINT "ApplicationStageEvent_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ApplicationNote" ADD CONSTRAINT "ApplicationNote_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationNote" ADD CONSTRAINT "ApplicationNote_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationTag" ADD CONSTRAINT "ApplicationTag_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationTag" ADD CONSTRAINT "ApplicationTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationRating" ADD CONSTRAINT "ApplicationRating_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationRating" ADD CONSTRAINT "ApplicationRating_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CandidateDocument" ADD CONSTRAINT "CandidateDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CandidateDocument" ADD CONSTRAINT "CandidateDocument_applicantProfileId_fkey" FOREIGN KEY ("applicantProfileId") REFERENCES "ApplicantProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CandidateDocument" ADD CONSTRAINT "CandidateDocument_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
