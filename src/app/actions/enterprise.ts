'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRequestContext } from '@/lib/request-context'
import { createAuditLog } from '@/lib/observability/audit'
import { reportError } from '@/lib/observability/error-reporting'
import {
  assessmentReviewSchema,
  assessmentSchema,
  assessmentSubmissionSchema,
  deletionDecisionSchema,
  deletionRequestSchema,
  emailTemplateSchema,
  interviewFeedbackSchema,
  interviewSchema,
  notificationCreateSchema,
} from '@/lib/validations/enterprise'
import { createNotification, createTemplatedNotification } from '@/lib/services/notifications'
import { processDeletionRequest } from '@/lib/services/compliance'

export async function createInterview(formData: FormData) {
  const user = await requireCurrentUser({
    roles: ['EMPLOYER', 'ADMIN'],
    permission: 'MANAGE_APPLICATIONS',
  })

  const parsed = interviewSchema.safeParse({
    applicationId: formData.get('applicationId'),
    title: formData.get('title'),
    scheduledAt: formData.get('scheduledAt'),
    durationMinutes: formData.get('durationMinutes'),
    timezone: formData.get('timezone'),
    location: formData.get('location') || '',
    meetingUrl: formData.get('meetingUrl') || '',
    notes: formData.get('notes') || '',
    participantEmails: formData.get('participantEmails') || '',
  })

  if (!parsed.success) {
    redirect('/employer/interviews?error=invalid-interview')
  }

  try {
    const application = await prisma.application.findUnique({
      where: { id: parsed.data.applicationId },
      include: { user: true, job: true },
    })

    if (!application) {
      redirect('/employer/interviews?error=application-not-found')
    }

    const participantEmails = parsed.data.participantEmails
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    const interview = await prisma.interview.create({
      data: {
        applicationId: application.id,
        title: parsed.data.title,
        scheduledAt: parsed.data.scheduledAt,
        durationMinutes: parsed.data.durationMinutes,
        timezone: parsed.data.timezone,
        location: parsed.data.location || null,
        meetingUrl: parsed.data.meetingUrl || null,
        notes: parsed.data.notes || null,
        createdByUserId: user.id,
        participants: {
          create: participantEmails.map((email) => ({
            email,
            role: 'INTERVIEWER',
          })),
        },
      },
    })

    await createTemplatedNotification({
      userId: application.userId,
      templateName: 'interview-invitation',
      applicationId: application.id,
      replacements: {
        candidateEmail: application.user.email,
        jobTitle: application.job.title,
        interviewTitle: interview.title,
        interviewDate: interview.scheduledAt.toISOString(),
      },
    }).catch(async () => {
      await createNotification({
        userId: application.userId,
        channel: 'EMAIL',
        applicationId: application.id,
        subject: `Interview scheduled for ${application.job.title}`,
        body: `Your interview "${interview.title}" has been scheduled for ${interview.scheduledAt.toISOString()} (${interview.timezone}).`,
      })
    })

    revalidatePath('/employer/interviews')
    revalidatePath('/employer/candidates')
    redirect('/employer/interviews?status=interview-created')
  } catch (error) {
    reportError(error, {
      scope: 'enterprise.create-interview',
      userId: user.id,
    })
    redirect('/employer/interviews?error=create-interview')
  }
}

export async function submitInterviewFeedback(formData: FormData) {
  const user = await requireCurrentUser({
    roles: ['EMPLOYER', 'ADMIN'],
    permission: 'MANAGE_APPLICATIONS',
  })

  const parsed = interviewFeedbackSchema.safeParse({
    interviewId: formData.get('interviewId'),
    applicationId: formData.get('applicationId'),
    score: formData.get('score'),
    recommendation: formData.get('recommendation'),
    comments: formData.get('comments') || '',
  })

  if (!parsed.success) {
    redirect('/employer/interviews?error=invalid-feedback')
  }

  // Authorization: verify the interview exists and belongs to the claimed application
  const interview = await prisma.interview.findUnique({
    where: { id: parsed.data.interviewId },
    include: {
      application: {
        include: { job: true },
      },
    },
  })

  if (!interview) {
    redirect('/employer/interviews?error=interview-not-found')
  }

  if (interview.applicationId !== parsed.data.applicationId) {
    redirect('/employer/interviews?error=unauthorized')
  }

  // Authorization: verify user can manage this application (job creator or admin)
  const canManage =
    user.role === 'ADMIN' ||
    interview.application.job.createdByUserId === user.id

  if (!canManage) {
    redirect('/employer/interviews?error=unauthorized')
  }

  await prisma.interviewFeedback.create({
    data: {
      interviewId: parsed.data.interviewId,
      applicationId: parsed.data.applicationId,
      authorUserId: user.id,
      score: parsed.data.score,
      recommendation: parsed.data.recommendation,
      comments: parsed.data.comments || null,
    },
  })

  revalidatePath('/employer/interviews')
  redirect('/employer/interviews?status=feedback-saved')
}

export async function createAssessment(formData: FormData) {
  const user = await requireCurrentUser({
    roles: ['EMPLOYER', 'ADMIN'],
    permission: 'MANAGE_APPLICATIONS',
  })

  const parsed = assessmentSchema.safeParse({
    applicationId: formData.get('applicationId'),
    title: formData.get('title'),
    instructions: formData.get('instructions'),
    dueAt: formData.get('dueAt') || '',
  })

  if (!parsed.success) {
    redirect('/employer/assessments?error=invalid-assessment')
  }

  try {
    const application = await prisma.application.findUnique({
      where: { id: parsed.data.applicationId },
      include: { user: true, job: true },
    })

    if (!application) {
      redirect('/employer/assessments?error=application-not-found')
    }

    const assessment = await prisma.assessment.create({
      data: {
        applicationId: application.id,
        jobId: application.jobId,
        title: parsed.data.title,
        instructions: parsed.data.instructions,
        dueAt: parsed.data.dueAt,
        createdByUserId: user.id,
        submissions: {
          create: {
            applicantUserId: application.userId,
          },
        },
      },
    })

    await createTemplatedNotification({
      userId: application.userId,
      templateName: 'assessment-invitation',
      applicationId: application.id,
      replacements: {
        jobTitle: application.job.title,
        assessmentTitle: assessment.title,
        dueDate: assessment.dueAt?.toISOString() ?? 'No deadline set',
      },
    }).catch(async () => {
      await createNotification({
        userId: application.userId,
        channel: 'EMAIL',
        applicationId: application.id,
        subject: `Assessment assigned for ${application.job.title}`,
        body: `You have been assigned "${assessment.title}".`,
      })
    })

    revalidatePath('/employer/assessments')
    redirect('/employer/assessments?status=assessment-created')
  } catch (error) {
    reportError(error, {
      scope: 'enterprise.create-assessment',
      userId: user.id,
    })
    redirect('/employer/assessments?error=create-assessment')
  }
}

export async function submitAssessment(formData: FormData) {
  const user = await requireCurrentUser({
    roles: ['APPLICANT'],
    permission: 'MANAGE_SELF_PROFILE',
  })

  const parsed = assessmentSubmissionSchema.safeParse({
    assessmentId: formData.get('assessmentId'),
    responseText: formData.get('responseText'),
  })

  if (!parsed.success) {
    redirect('/applicant/assessments?error=invalid-submission')
  }

  await prisma.$transaction(async (tx) => {
    const submission = await tx.assessmentSubmission.update({
      where: {
        assessmentId_applicantUserId: {
          assessmentId: parsed.data.assessmentId,
          applicantUserId: user.id,
        },
      },
      data: {
        responseText: parsed.data.responseText,
        submittedAt: new Date(),
      },
      include: {
        assessment: true,
      },
    })

    await tx.assessment.update({
      where: { id: parsed.data.assessmentId },
      data: { status: 'SUBMITTED' },
    })

    await createNotification({
      userId: user.id,
      channel: 'IN_APP',
      applicationId: submission.assessment.applicationId,
      subject: `Assessment submitted: ${submission.assessment.title}`,
      body: 'Your assessment response has been recorded.',
    })
  })

  revalidatePath('/applicant/assessments')
  redirect('/applicant/assessments?status=submitted')
}

export async function reviewAssessment(formData: FormData) {
  await requireCurrentUser({
    roles: ['EMPLOYER', 'ADMIN'],
    permission: 'MANAGE_APPLICATIONS',
  })

  const parsed = assessmentReviewSchema.safeParse({
    submissionId: formData.get('submissionId'),
    score: formData.get('score'),
    reviewerNotes: formData.get('reviewerNotes') || '',
  })

  if (!parsed.success) {
    redirect('/employer/assessments?error=invalid-review')
  }

  const submission = await prisma.assessmentSubmission.update({
    where: { id: parsed.data.submissionId },
    data: {
      score: parsed.data.score,
      reviewerNotes: parsed.data.reviewerNotes || null,
      reviewedAt: new Date(),
    },
    include: {
      assessment: true,
    },
  })

  await prisma.assessment.update({
    where: { id: submission.assessmentId },
    data: {
      status: 'REVIEWED',
    },
  })

  revalidatePath('/employer/assessments')
  redirect('/employer/assessments?status=review-saved')
}

export async function createEmailTemplateAction(formData: FormData) {
  const user = await requireCurrentUser({
    roles: ['EMPLOYER', 'ADMIN'],
    permission: 'MANAGE_NOTIFICATIONS',
  })

  const parsed = emailTemplateSchema.safeParse({
    name: formData.get('name'),
    subject: formData.get('subject'),
    body: formData.get('body'),
    jobId: formData.get('jobId') || '',
    isActive: formData.get('isActive') === 'true',
  })

  if (!parsed.success) {
    redirect('/admin/templates?error=invalid-template')
  }

  await prisma.emailTemplate.upsert({
    where: { name: parsed.data.name },
    update: {
      subject: parsed.data.subject,
      body: parsed.data.body,
      isActive: parsed.data.isActive,
      jobId: parsed.data.jobId || null,
    },
    create: {
      name: parsed.data.name,
      subject: parsed.data.subject,
      body: parsed.data.body,
      isActive: parsed.data.isActive,
      jobId: parsed.data.jobId || null,
      createdByUserId: user.id,
    },
  })

  revalidatePath('/admin/templates')
  redirect('/admin/templates?status=template-saved')
}

export async function createNotificationAction(formData: FormData) {
  const user = await requireCurrentUser({
    roles: ['EMPLOYER', 'ADMIN'],
    permission: 'MANAGE_NOTIFICATIONS',
  })
  void user

  const parsed = notificationCreateSchema.safeParse({
    userId: formData.get('userId'),
    applicationId: formData.get('applicationId') || '',
    channel: formData.get('channel'),
    subject: formData.get('subject'),
    body: formData.get('body'),
    templateId: formData.get('templateId') || '',
  })

  if (!parsed.success) {
    redirect('/admin/templates?error=invalid-notification')
  }

  await createNotification({
    userId: parsed.data.userId,
    channel: parsed.data.channel,
    subject: parsed.data.subject,
    body: parsed.data.body,
    applicationId: parsed.data.applicationId || null,
    templateId: parsed.data.templateId || null,
  })

  redirect('/admin/templates?status=notification-queued')
}

export async function requestDataDeletion(formData: FormData) {
  const user = await requireCurrentUser({
    roles: ['APPLICANT'],
    permission: 'MANAGE_SELF_PROFILE',
  })
  const { ipAddress, userAgent } = await getRequestContext()

  const parsed = deletionRequestSchema.safeParse({
    reason: formData.get('reason') || '',
  })

  if (!parsed.success) {
    redirect('/applicant/compliance?error=invalid-request')
  }

  await prisma.$transaction([
    prisma.dataDeletionRequest.create({
      data: {
        userId: user.id,
        reason: parsed.data.reason || null,
      },
    }),
    prisma.consentRecord.create({
      data: {
        userId: user.id,
        consentType: 'DATA_RETENTION',
        ipAddress,
        userAgent,
      },
    }),
  ])

  revalidatePath('/applicant/compliance')
  redirect('/applicant/compliance?status=deletion-requested')
}

export async function processDeletionRequestAction(formData: FormData) {
  const user = await requireCurrentUser({
    roles: ['ADMIN'],
    permission: 'MANAGE_COMPLIANCE',
  })

  const parsed = deletionDecisionSchema.safeParse({
    requestId: formData.get('requestId'),
    action: formData.get('action'),
    notes: formData.get('notes') || '',
  })

  if (!parsed.success) {
    redirect('/admin/compliance?error=invalid-decision')
  }

  await processDeletionRequest(
    parsed.data.requestId,
    parsed.data.action === 'approve',
    parsed.data.notes || undefined
  )

  await createAuditLog({
    actorUserId: user.id,
    action: 'deletion-request.processed',
    targetType: 'DataDeletionRequest',
    targetId: parsed.data.requestId,
    metadata: {
      decision: parsed.data.action,
    },
  })

  revalidatePath('/admin/compliance')
  redirect('/admin/compliance?status=request-processed')
}
