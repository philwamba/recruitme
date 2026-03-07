import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface EmailTemplateData {
    name: string
    subject: string
    body: string
    isActive: boolean
}

const emailTemplates: EmailTemplateData[] = [
    {
        name: 'application-received',
        subject: 'Application Received - {{jobTitle}} at {{companyName}}',
        body: `Dear {{candidateName}},

Thank you for applying for the {{jobTitle}} position at {{companyName}}. We have successfully received your application and our recruitment team will review it carefully.

What happens next:
- Our team will review your application within 5-7 business days
- If your profile matches our requirements, we will contact you to schedule an interview
- You can track your application status through your candidate portal

Application Details:
- Position: {{jobTitle}}
- Department: {{department}}
- Location: {{location}}
- Application ID: {{applicationId}}

If you have any questions, please don't hesitate to reach out to our recruitment team.

Best regards,
{{recruiterName}}
{{companyName}} Recruitment Team`,
        isActive: true,
    },
    {
        name: 'interview-invitation',
        subject: 'Interview Invitation - {{jobTitle}} at {{companyName}}',
        body: `Dear {{candidateName}},

Congratulations! We were impressed by your application for the {{jobTitle}} position and would like to invite you for an interview.

Interview Details:
- Date: {{interviewDate}}
- Time: {{interviewTime}}
- Duration: {{interviewDuration}}
- Format: {{interviewFormat}}
- Location/Link: {{interviewLocation}}

Interview Panel:
{{interviewerNames}}

What to prepare:
- Review the job description and your application
- Prepare examples of relevant work experience
- Have questions ready about the role and company
- {{additionalPreparation}}

Please confirm your attendance by clicking the link below:
{{confirmationLink}}

If you need to reschedule, please let us know at least 24 hours in advance.

Looking forward to meeting you!

Best regards,
{{recruiterName}}
{{companyName}} Recruitment Team`,
        isActive: true,
    },
    {
        name: 'interview-reminder',
        subject: 'Reminder: Interview Tomorrow - {{jobTitle}}',
        body: `Dear {{candidateName}},

This is a friendly reminder about your upcoming interview for the {{jobTitle}} position.

Interview Details:
- Date: {{interviewDate}}
- Time: {{interviewTime}}
- Format: {{interviewFormat}}
- Location/Link: {{interviewLocation}}

Quick Checklist:
- Test your video/audio equipment (for virtual interviews)
- Have a copy of your resume ready
- Prepare your questions for the interviewers
- Join 5 minutes early

If you have any last-minute questions or concerns, please contact us.

Good luck!

Best regards,
{{recruiterName}}
{{companyName}} Recruitment Team`,
        isActive: true,
    },
    {
        name: 'interview-feedback-request',
        subject: 'How was your interview experience? - {{companyName}}',
        body: `Dear {{candidateName}},

Thank you for taking the time to interview with us for the {{jobTitle}} position. We hope you had a positive experience!

We're always looking to improve our recruitment process, and your feedback is invaluable. Please take a moment to share your thoughts:

{{feedbackLink}}

This brief survey will take approximately 2-3 minutes to complete.

We will be in touch regarding the next steps in the interview process within {{timeframe}}.

Thank you again for your interest in {{companyName}}.

Best regards,
{{recruiterName}}
{{companyName}} Recruitment Team`,
        isActive: true,
    },
    {
        name: 'application-status-update',
        subject: 'Update on Your Application - {{jobTitle}}',
        body: `Dear {{candidateName}},

We wanted to update you on the status of your application for the {{jobTitle}} position at {{companyName}}.

Current Status: {{applicationStatus}}

{{statusMessage}}

Next Steps:
{{nextSteps}}

If you have any questions about your application, please don't hesitate to reach out.

Thank you for your patience and continued interest in joining our team.

Best regards,
{{recruiterName}}
{{companyName}} Recruitment Team`,
        isActive: true,
    },
    {
        name: 'offer-letter',
        subject: 'Job Offer - {{jobTitle}} at {{companyName}}',
        body: `Dear {{candidateName}},

We are thrilled to extend an offer for the position of {{jobTitle}} at {{companyName}}!

After careful consideration, we believe your skills, experience, and passion make you an excellent fit for our team.

Offer Details:
- Position: {{jobTitle}}
- Department: {{department}}
- Start Date: {{startDate}}
- Reporting To: {{managerName}}
- Location: {{location}}
- Compensation: {{compensation}}
- Benefits: {{benefits}}

To accept this offer, please:
1. Review the attached offer letter carefully
2. Sign and return it by {{offerDeadline}}
3. Complete the pre-employment requirements

We are excited about the possibility of you joining our team and look forward to your positive response.

If you have any questions about the offer, please contact {{recruiterName}} at {{recruiterEmail}}.

Congratulations!

Best regards,
{{recruiterName}}
{{companyName}} Recruitment Team`,
        isActive: true,
    },
    {
        name: 'rejection-after-interview',
        subject: 'Update on Your Application - {{jobTitle}}',
        body: `Dear {{candidateName}},

Thank you for taking the time to interview with us for the {{jobTitle}} position. We appreciate your interest in {{companyName}} and the effort you put into the interview process.

After careful consideration, we have decided to move forward with another candidate whose experience more closely aligns with our current needs.

This decision was not easy, as we were impressed by your qualifications. We encourage you to:
- Keep an eye on our careers page for future opportunities
- Connect with us on LinkedIn for company updates
- Apply again when you see a role that matches your skills

We will keep your information on file and may reach out if a suitable position opens up.

Thank you again for your interest in {{companyName}}, and we wish you the best in your career journey.

Best regards,
{{recruiterName}}
{{companyName}} Recruitment Team`,
        isActive: true,
    },
    {
        name: 'rejection-initial-screen',
        subject: 'Update on Your Application - {{jobTitle}}',
        body: `Dear {{candidateName}},

Thank you for your interest in the {{jobTitle}} position at {{companyName}} and for taking the time to apply.

After reviewing your application, we have decided not to proceed with your candidacy at this time. While your background is impressive, we are looking for candidates with different qualifications for this particular role.

We encourage you to:
- Explore other open positions on our careers page
- Follow us for updates on new opportunities
- Consider reapplying for future roles that match your experience

We appreciate your interest in {{companyName}} and wish you success in your job search.

Best regards,
{{companyName}} Recruitment Team`,
        isActive: true,
    },
    {
        name: 'assessment-invitation',
        subject: 'Complete Your Assessment - {{jobTitle}} Application',
        body: `Dear {{candidateName}},

As the next step in your application for the {{jobTitle}} position, we invite you to complete an online assessment.

Assessment Details:
- Type: {{assessmentType}}
- Duration: {{assessmentDuration}}
- Deadline: {{assessmentDeadline}}
- Link: {{assessmentLink}}

Important Instructions:
- Ensure you have a stable internet connection
- Complete the assessment in one sitting
- Find a quiet environment with minimal distractions
- Have any required materials ready

Tips for Success:
{{assessmentTips}}

If you experience any technical difficulties, please contact {{supportEmail}}.

Good luck!

Best regards,
{{recruiterName}}
{{companyName}} Recruitment Team`,
        isActive: true,
    },
    {
        name: 'welcome-onboarding',
        subject: 'Welcome to {{companyName}}! - Your Onboarding Guide',
        body: `Dear {{candidateName}},

Welcome to {{companyName}}! We are excited to have you join our team as {{jobTitle}}.

Your First Day:
- Date: {{startDate}}
- Time: {{startTime}}
- Location: {{officeLocation}}
- Who to ask for: {{contactPerson}}

Before You Start:
- Complete the online onboarding forms: {{onboardingLink}}
- Review the employee handbook
- Set up your company email and accounts
- Prepare required documents (ID, tax forms, etc.)

What to Bring:
- Government-issued ID
- Completed new hire paperwork
- Bank details for payroll

Your First Week:
{{firstWeekSchedule}}

We have prepared everything to make your transition as smooth as possible. Your manager, {{managerName}}, and the team are looking forward to meeting you!

If you have any questions before your start date, please contact {{hrContact}}.

Welcome aboard!

Best regards,
{{hrName}}
{{companyName}} HR Team`,
        isActive: true,
    },
    {
        name: 'reference-check-request',
        subject: 'Reference Check Request - {{candidateName}}',
        body: `Dear {{referenceName}},

{{candidateName}} has applied for the position of {{jobTitle}} at {{companyName}} and has provided your name as a professional reference.

We would greatly appreciate a few minutes of your time to answer some questions about {{candidateName}}'s work performance and professional abilities.

You can provide your feedback:
- Online: {{referenceLink}}
- By phone: {{recruiterPhone}} (ask for {{recruiterName}})

The reference check typically takes 10-15 minutes and covers:
- Working relationship and duration
- Job responsibilities and performance
- Strengths and areas for development
- Rehire eligibility

Your feedback will be kept confidential and used solely for the purpose of evaluating {{candidateName}}'s candidacy.

Thank you for your time and assistance.

Best regards,
{{recruiterName}}
{{companyName}} Recruitment Team`,
        isActive: true,
    },
    {
        name: 'pipeline-stage-change',
        subject: 'Application Update - {{jobTitle}}',
        body: `Dear {{candidateName}},

Great news! Your application for the {{jobTitle}} position has moved to the next stage.

Previous Stage: {{previousStage}}
Current Stage: {{currentStage}}

{{stageDescription}}

Next Steps:
{{nextSteps}}

Expected Timeline: {{timeline}}

We will be in touch with more details soon. In the meantime, if you have any questions, please don't hesitate to reach out.

Thank you for your continued interest in {{companyName}}.

Best regards,
{{recruiterName}}
{{companyName}} Recruitment Team`,
        isActive: true,
    },
]

async function main() {
    console.log('Seeding email templates...')

    for (const template of emailTemplates) {
        await prisma.emailTemplate.upsert({
            where: { name: template.name },
            update: {
                subject: template.subject,
                body: template.body,
                isActive: template.isActive,
            },
            create: {
                name: template.name,
                subject: template.subject,
                body: template.body,
                isActive: template.isActive,
            },
        })
        console.log(`  - ${template.name}`)
    }

    console.log(`\nSeeded ${emailTemplates.length} email templates.`)
}

main()
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
