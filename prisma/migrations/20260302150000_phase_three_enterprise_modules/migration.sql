-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "InterviewParticipantRole" AS ENUM ('INTERVIEWER', 'COORDINATOR', 'OBSERVER');
CREATE TYPE "Recommendation" AS ENUM ('STRONG_YES', 'YES', 'MAYBE', 'NO', 'STRONG_NO');
CREATE TYPE "AssessmentStatus" AS ENUM ('ASSIGNED', 'SUBMITTED', 'REVIEWED', 'CANCELLED');
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'READ');
CREATE TYPE "DeliveryStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED');
CREATE TYPE "OutboxJobType" AS ENUM ('SEND_NOTIFICATION', 'SEND_STAGE_NOTIFICATION', 'SEND_INTERVIEW_INVITATION', 'SEND_ASSESSMENT_INVITATION');
CREATE TYPE "OutboxJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE "ConsentType" AS ENUM ('APPLICATION_PROCESSING', 'EMAIL_COMMUNICATION', 'DATA_RETENTION');
CREATE TYPE "DataDeletionRequestStatus" AS ENUM ('REQUESTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- AlterEnum
ALTER TYPE "Permission" ADD VALUE IF NOT EXISTS 'VIEW_ANALYTICS';
ALTER TYPE "Permission" ADD VALUE IF NOT EXISTS 'MANAGE_NOTIFICATIONS';
ALTER TYPE "Permission" ADD VALUE IF NOT EXISTS 'MANAGE_COMPLIANCE';

-- CreateTable
CREATE TABLE "Interview" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "durationMinutes" INTEGER NOT NULL DEFAULT 60,
  "timezone" TEXT NOT NULL,
  "location" TEXT,
  "meetingUrl" TEXT,
  "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
  "notes" TEXT,
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterviewParticipant" (
  "id" TEXT NOT NULL,
  "interviewId" TEXT NOT NULL,
  "userId" TEXT,
  "email" TEXT NOT NULL,
  "role" "InterviewParticipantRole" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InterviewParticipant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterviewFeedback" (
  "id" TEXT NOT NULL,
  "interviewId" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "authorUserId" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "recommendation" "Recommendation" NOT NULL,
  "comments" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InterviewFeedback_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Assessment" (
  "id" TEXT NOT NULL,
  "jobId" TEXT,
  "applicationId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "instructions" TEXT NOT NULL,
  "dueAt" TIMESTAMP(3),
  "status" "AssessmentStatus" NOT NULL DEFAULT 'ASSIGNED',
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssessmentSubmission" (
  "id" TEXT NOT NULL,
  "assessmentId" TEXT NOT NULL,
  "applicantUserId" TEXT NOT NULL,
  "responseText" TEXT,
  "score" INTEGER,
  "reviewerNotes" TEXT,
  "submittedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AssessmentSubmission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailTemplate" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "jobId" TEXT,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "applicationId" TEXT,
  "templateId" TEXT,
  "channel" "NotificationChannel" NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeliveryLog" (
  "id" TEXT NOT NULL,
  "notificationId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "status" "DeliveryStatus" NOT NULL,
  "responseCode" TEXT,
  "responseBody" TEXT,
  "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeliveryLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OutboxJob" (
  "id" TEXT NOT NULL,
  "type" "OutboxJobType" NOT NULL,
  "payload" JSONB NOT NULL,
  "status" "OutboxJobStatus" NOT NULL DEFAULT 'PENDING',
  "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OutboxJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConsentRecord" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "applicationId" TEXT,
  "consentType" "ConsentType" NOT NULL,
  "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DataDeletionRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "DataDeletionRequestStatus" NOT NULL DEFAULT 'REQUESTED',
  "reason" TEXT,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DataDeletionRequest_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "Interview_applicationId_idx" ON "Interview"("applicationId");
CREATE INDEX "Interview_scheduledAt_idx" ON "Interview"("scheduledAt");
CREATE INDEX "InterviewParticipant_interviewId_idx" ON "InterviewParticipant"("interviewId");
CREATE INDEX "InterviewParticipant_userId_idx" ON "InterviewParticipant"("userId");
CREATE INDEX "InterviewFeedback_interviewId_idx" ON "InterviewFeedback"("interviewId");
CREATE INDEX "InterviewFeedback_applicationId_idx" ON "InterviewFeedback"("applicationId");
CREATE INDEX "InterviewFeedback_authorUserId_idx" ON "InterviewFeedback"("authorUserId");
CREATE INDEX "Assessment_applicationId_idx" ON "Assessment"("applicationId");
CREATE INDEX "Assessment_jobId_idx" ON "Assessment"("jobId");
CREATE UNIQUE INDEX "AssessmentSubmission_assessmentId_applicantUserId_key" ON "AssessmentSubmission"("assessmentId", "applicantUserId");
CREATE INDEX "AssessmentSubmission_assessmentId_idx" ON "AssessmentSubmission"("assessmentId");
CREATE INDEX "AssessmentSubmission_applicantUserId_idx" ON "AssessmentSubmission"("applicantUserId");
CREATE UNIQUE INDEX "EmailTemplate_name_key" ON "EmailTemplate"("name");
CREATE INDEX "EmailTemplate_jobId_idx" ON "EmailTemplate"("jobId");
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");
CREATE INDEX "Notification_applicationId_idx" ON "Notification"("applicationId");
CREATE INDEX "DeliveryLog_notificationId_idx" ON "DeliveryLog"("notificationId");
CREATE INDEX "OutboxJob_status_availableAt_idx" ON "OutboxJob"("status", "availableAt");
CREATE INDEX "ConsentRecord_userId_consentType_idx" ON "ConsentRecord"("userId", "consentType");
CREATE INDEX "ConsentRecord_applicationId_idx" ON "ConsentRecord"("applicationId");
CREATE INDEX "DataDeletionRequest_userId_status_idx" ON "DataDeletionRequest"("userId", "status");

-- Foreign Keys
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InterviewParticipant" ADD CONSTRAINT "InterviewParticipant_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterviewParticipant" ADD CONSTRAINT "InterviewParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InterviewFeedback" ADD CONSTRAINT "InterviewFeedback_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterviewFeedback" ADD CONSTRAINT "InterviewFeedback_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterviewFeedback" ADD CONSTRAINT "InterviewFeedback_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AssessmentSubmission" ADD CONSTRAINT "AssessmentSubmission_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentSubmission" ADD CONSTRAINT "AssessmentSubmission_applicantUserId_fkey" FOREIGN KEY ("applicantUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DeliveryLog" ADD CONSTRAINT "DeliveryLog_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DataDeletionRequest" ADD CONSTRAINT "DataDeletionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
