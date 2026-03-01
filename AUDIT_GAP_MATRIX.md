# Recruitment Platform Gap Matrix

This document converts the production-readiness audit into an execution matrix mapped to the current codebase, required schema changes, and implementation tickets.

## Current State Summary

- Current product scope is an applicant-profile MVP with:
  - Landing/waitlist page
  - Applicant dashboard
  - Applicant profile CRUD
  - Mock CV upload UI
  - Basic `User`, `ApplicantProfile`, `Job`, `Application` Prisma models
- Current product does not yet implement:
  - Public job board
  - Real authentication
  - HR/Admin console
  - Recruitment pipeline management
  - Notifications
  - Interviews/assessments
  - Compliance and audit controls

## Gap Matrix

| Domain | Required Capability | Current Evidence / File Mapping | Gap | Required Schema Changes | Ticket IDs |
|---|---|---|---|---|---|
| Authentication | Candidate/HR/Admin login | [src/lib/auth.ts](./src/lib/auth.ts), [src/hooks/use-mock-user.ts](./src/hooks/use-mock-user.ts), [src/app/applicant/layout.tsx](./src/app/applicant/layout.tsx) | App uses a shared mock identity and has no real auth/session system | Add `Account`, `Session`, `VerificationToken`, password reset and lockout entities or adopt auth provider schema | AUTH-01, AUTH-02, AUTH-03, AUTH-04 |
| Authorization | RBAC and permission matrix | [prisma/schema.prisma](./prisma/schema.prisma), [src/lib/constants/routes.ts](./src/lib/constants/routes.ts) | Only a coarse role enum exists; no permission enforcement | Add `Permission`, `RolePermission`, optionally `UserOrganizationRole` | AUTH-05, AUTH-06 |
| Route Protection | Protected applicant/admin/employer areas | [src/app/applicant/layout.tsx](./src/app/applicant/layout.tsx) | No middleware or server-side auth guard | No direct schema need | ARCH-01, AUTH-07 |
| User-specific Rendering | Dynamic rendering for authenticated pages | [src/app/applicant/dashboard/page.tsx](./src/app/applicant/dashboard/page.tsx), [src/app/applicant/profile/page.tsx](./src/app/applicant/profile/page.tsx) | User pages are currently build-time prerendered | No direct schema need | ARCH-02 |
| Public Website | SEO landing + metadata | [src/app/layout.tsx](./src/app/layout.tsx), [src/app/page.tsx](./src/app/page.tsx), [next.config.ts](./next.config.ts) | Minimal metadata, no OG/Twitter/schema.org/sitemap/robots | Add optional SEO fields on `Job` if job pages are public | WEB-01, WEB-02, WEB-03 |
| Public Job Board | Listings, filters, search, pagination | No route/files exist | Entire module missing | Extend `Job`; add `Department`, `Office`, searchable fields and indexes | JOB-01, JOB-02, JOB-03, JOB-04 |
| Job Detail Pages | Structured public job pages | No route/files exist | Missing | Add `slug`, `employmentType`, `workplaceType`, salary fields, publish state | JOB-05, JOB-06 |
| Candidate Applications | Apply to jobs | No application form routes/components exist | Missing end-to-end flow | Extend `Application` with draft/submitted lifecycle, tracking ID, source, consent fields | APP-01, APP-02, APP-03 |
| Draft Applications | Save/edit before submission | No implementation | Missing | Add `Application.status`, `submittedAt`, `draftExpiresAt`, partial payload fields | APP-04 |
| Duplicate Prevention | Prevent duplicate applications | [prisma/schema.prisma](./prisma/schema.prisma) `@@unique([userId, jobId])` | Only covers logged-in single-user duplicate constraint; no UX, no email-based or draft-aware policy | Add duplicate policy fields and tracking identifiers | APP-05 |
| File Upload | CV/supporting docs upload | [src/app/applicant/upload-cv/page.tsx](./src/app/applicant/upload-cv/page.tsx), [src/lib/services/file-upload.ts](./src/lib/services/file-upload.ts) | UI is simulated; storage helper is not integrated into product flow | Add `CandidateDocument` with file key, hash, mime, size, scan status, visibility | FILE-01, FILE-02, FILE-03, FILE-04 |
| Secure Document Access | Private documents and signed URLs | [src/lib/services/file-upload.ts](./src/lib/services/file-upload.ts) | Helper returns public URL; not safe for candidate docs | Add fields for private object key, signed access policy, retention flags | FILE-05 |
| Pipeline Management | Structured recruitment stages | [prisma/schema.prisma](./prisma/schema.prisma) `ApplicationStatus` enum | Too limited; no per-job pipeline, no movement history | Add `PipelineStage`, `JobPipelineStage`, `ApplicationStageEvent` | PIPE-01, PIPE-02, PIPE-03 |
| Notes / Ratings / Tags | Internal evaluation | No implementation | Missing | Add `ApplicationNote`, `ApplicationRating`, `Tag`, `ApplicationTag` | PIPE-04, PIPE-05 |
| Candidate Timeline | End-to-end activity view | No implementation | Missing | Timeline can be derived from `ApplicationStageEvent`, notes, interviews, notifications | PIPE-06 |
| Interviews | Scheduling and panel management | No implementation | Missing | Add `Interview`, `InterviewParticipant`, `InterviewFeedback`, `Scorecard` | INT-01, INT-02, INT-03 |
| Assessments | Questionnaire and scorecards | No implementation | Missing | Add `Assessment`, `AssessmentSubmission`, `AssessmentScore` | INT-04, INT-05 |
| Notifications | Email/in-app/SMS | No implementation | Missing | Add `Notification`, `EmailTemplate`, `DeliveryLog`, `OutboxJob` | NOTIF-01, NOTIF-02, NOTIF-03, NOTIF-04 |
| Admin/HR Console | Job, candidate, analytics, users | No admin/employer routes exist | Entire module missing | Add organization and admin-side entities as needed | ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04 |
| Analytics | Conversion, time-to-hire, reporting | No implementation | Missing | Add event/history entities, maybe analytics snapshots later | ANALYTICS-01, ANALYTICS-02 |
| Export | Candidate CSV export | No implementation | Missing | No direct schema need beyond clean normalized data | ADMIN-05 |
| Audit Logging | Sensitive action logs | No implementation | Missing | Add `AuditLog`, `ActivityLog` | SEC-01, OPS-01 |
| Compliance | Consent, deletion, retention | No implementation | Missing | Add `ConsentRecord`, `DataDeletionRequest`, retention markers on candidate records/documents | COMP-01, COMP-02, COMP-03 |
| Security Hardening | Headers, rate limits, env validation | [next.config.ts](./next.config.ts), [.env.example](./.env.example), [src/app/actions.ts](./src/app/actions.ts) | Missing security middleware and operational controls | No direct schema need | SEC-02, SEC-03, SEC-04 |
| DevOps | CI/CD, testing, monitoring, backup strategy | No CI/test/deploy files detected | Missing | No direct schema need | OPS-02, OPS-03, OPS-04, OPS-05 |

## File-Level Gap Map

### Current Files Requiring Change

| File | Problem | Required Change |
|---|---|---|
| [src/lib/auth.ts](./src/lib/auth.ts) | Hardcoded mock user | Replace with real server-side session/auth accessor |
| [src/hooks/use-mock-user.ts](./src/hooks/use-mock-user.ts) | Client mock identity | Replace with real session/user hook or remove |
| [src/app/applicant/layout.tsx](./src/app/applicant/layout.tsx) | No auth guard in applicant area | Convert to protected route pattern and move auth checks server-side |
| [src/app/applicant/dashboard/page.tsx](./src/app/applicant/dashboard/page.tsx) | User-specific page is statically prerendered | Mark dynamic, load real session user, use scoped queries |
| [src/app/applicant/profile/page.tsx](./src/app/applicant/profile/page.tsx) | User-specific page is statically prerendered | Mark dynamic, load real session user, use scoped queries |
| [src/app/applicant/upload-cv/page.tsx](./src/app/applicant/upload-cv/page.tsx) | Fake upload success flow | Wire to real upload + persistence + error handling |
| [src/app/actions/profile.ts](./src/app/actions/profile.ts) | Mock user, mixed concerns, repeated update patterns | Add authz checks, transactions, service layer extraction |
| [src/app/actions/education.ts](./src/app/actions/education.ts) | Repeated CRUD pattern, no transaction boundaries | Move to service layer and unify profile recomputation |
| [src/app/actions/work-experience.ts](./src/app/actions/work-experience.ts) | Repeated CRUD pattern and derived field recomputation | Use transaction/service abstraction |
| [src/app/actions/certifications.ts](./src/app/actions/certifications.ts) | Same issue as above | Use transaction/service abstraction |
| [src/app/actions.ts](./src/app/actions.ts) | Weak validation, no rate limiting, `any` types | Replace with typed validation and throttle protection |
| [src/lib/services/file-upload.ts](./src/lib/services/file-upload.ts) | Public URL approach not suitable for secure docs | Move to private object access with signed upload/download |
| [src/app/layout.tsx](./src/app/layout.tsx) | Minimal metadata only | Add complete SEO metadata, app shell concerns, providers as needed |
| [src/app/page.tsx](./src/app/page.tsx) | Marketing placeholder, no public jobs | Redesign to support real landing/job discovery |
| [next.config.ts](./next.config.ts) | No hardening or config | Add security headers and image/host config |
| [prisma/schema.prisma](./prisma/schema.prisma) | MVP schema far below target domain | Expand domain model substantially |

### New Modules/Folders Needed

| Path | Purpose |
|---|---|
| `src/app/jobs/` | Public job listings and job detail routes |
| `src/app/apply/` or `src/app/jobs/[slug]/apply/` | Candidate application flow |
| `src/app/admin/` | Admin dashboard and system management |
| `src/app/hr/` or `src/app/employer/` | Recruiter/HR operations area |
| `src/app/api/` | Webhooks, uploads, integrations, exports, notifications |
| `src/lib/auth/` | Auth provider, RBAC, session helpers |
| `src/lib/services/applications/` | Application domain logic |
| `src/lib/services/jobs/` | Job listing/detail/search logic |
| `src/lib/services/pipeline/` | Stage movement, notes, ratings, timeline |
| `src/lib/services/notifications/` | Email/SMS/in-app notification orchestration |
| `src/lib/services/interviews/` | Interview scheduling and feedback |
| `src/lib/security/` | Headers, rate limits, audit helpers, env validation |
| `src/lib/queues/` | Async job producers/consumers |
| `src/components/jobs/` | Public job board UI |
| `src/components/admin/` | Admin UI components |
| `src/components/hr/` | HR operations UI components |

## Required Schema Expansion

### 1. Identity and Access

- `Organization`
- `UserOrganizationMembership`
- `Role`
- `Permission`
- `RolePermission`
- `Account`
- `Session`
- `VerificationToken`
- `PasswordResetToken`
- `AuthSecurityEvent`

### 2. Recruitment Domain

- `Department`
- `Office`
- `Job`
  - add `slug`
  - add `descriptionHtml` or normalized rich text strategy
  - add `employmentType`
  - add `workplaceType`
  - add `salaryMin`
  - add `salaryMax`
  - add `salaryCurrency`
  - add `status`
  - add `publishedAt`
  - add `expiresAt`
  - add `createdByUserId`
- `PipelineStage`
- `JobPipelineStage`
- `Application`
  - replace simple enum lifecycle with richer state model
  - add `trackingId`
  - add `submittedAt`
  - add `source`
  - add `consentAcceptedAt`
  - add `duplicateOfApplicationId` optional
- `ApplicationStageEvent`
- `ApplicationNote`
- `ApplicationRating`
- `Tag`
- `ApplicationTag`

### 3. Candidate Documents and Compliance

- `CandidateDocument`
  - `storageKey`
  - `originalFileName`
  - `mimeType`
  - `sizeBytes`
  - `sha256`
  - `scanStatus`
  - `uploadedByUserId`
  - `documentType`
  - `isPrivate`
- `ConsentRecord`
- `DataDeletionRequest`
- retention fields on candidate/document/application records

### 4. Interviews and Assessments

- `Interview`
- `InterviewParticipant`
- `InterviewFeedback`
- `Scorecard`
- `Assessment`
- `AssessmentSubmission`
- `AssessmentScore`

### 5. Communication and Audit

- `EmailTemplate`
- `Notification`
- `DeliveryLog`
- `OutboxJob`
- `AuditLog`
- `ActivityLog`

## Ticket Backlog

### Phase 1: Critical Platform Corrections

| ID | Ticket | Scope | Depends On | Acceptance Criteria |
|---|---|---|---|---|
| AUTH-01 | Replace mock auth with real auth provider | Remove [src/lib/auth.ts](./src/lib/auth.ts) mock flow and implement login/session retrieval | None | Users can sign in/out; session identity is real and scoped |
| AUTH-02 | Implement auth schema and migrations | Add auth tables/entities and migrate | AUTH-01 | Prisma schema supports sessions/accounts/tokens |
| AUTH-03 | Add password hashing/reset/verification flow | Candidate + admin auth lifecycle | AUTH-01 | Passwords hashed securely; reset + verification supported |
| AUTH-04 | Add lockout/security event logging | Brute-force and anomaly controls | AUTH-01 | Failed login attempts tracked; lockout policy enforced |
| AUTH-05 | Add RBAC model | Permission matrix and role assignment | AUTH-02 | Endpoints and pages enforce permissions |
| AUTH-06 | Enforce authorization in server actions/services | All protected writes | AUTH-05 | Unauthorized actions are rejected server-side |
| AUTH-07 | Add route protection middleware | Applicant/HR/Admin route gating | AUTH-01 | Protected routes redirect/deny unauthenticated users |
| ARCH-01 | Convert app sections to protected route groups | Route organization for public/applicant/hr/admin | AUTH-07 | Route structure clearly separates public and protected areas |
| ARCH-02 | Fix user-page rendering mode | Make applicant pages dynamic and cache-safe | AUTH-01 | Dashboard/profile are not statically emitted |
| SEC-01 | Add audit/activity logging foundation | Shared logging utility and DB entities | AUTH-05 | Sensitive actions create auditable records |
| SEC-02 | Add secure headers and base hardening | Update [next.config.ts](./next.config.ts) and runtime config | None | CSP/HSTS/referrer/frame protections applied |
| SEC-03 | Add rate limiting to public/auth/application flows | Waitlist + auth + apply paths | None | Repeated abuse is throttled |
| SEC-04 | Add environment validation | Validate required env vars at startup | None | App fails fast on invalid/missing secrets |
| OPS-01 | Integrate structured error reporting | Sentry or equivalent | None | Server/client errors are captured with context |
| OPS-02 | Add CI for lint/typecheck/build | GitHub Actions or equivalent | None | PRs must pass pipeline |
| OPS-03 | Add test harness | Unit + integration baseline | OPS-02 | Core flows have automated coverage |

### Phase 2: Core Recruitment Product

| ID | Ticket | Scope | Depends On | Acceptance Criteria |
|---|---|---|---|---|
| JOB-01 | Redesign job schema | Add public-job fields and relations | AUTH-02 | Job model supports filtering and publishing |
| JOB-02 | Build public jobs listing page | Search/filter/pagination UI + query layer | JOB-01 | Public users can browse jobs |
| JOB-03 | Add DB indexing/search strategy | Query performance for jobs | JOB-01 | Listings performant under filter/search |
| JOB-04 | Add department/office/job taxonomy | Normalized relations | JOB-01 | Jobs can be filtered by taxonomy |
| JOB-05 | Build job detail page | Structured detail page with metadata | JOB-01 | Jobs have canonical public detail pages |
| JOB-06 | Add SEO metadata stack | OG/Twitter/schema.org/sitemap/robots | JOB-05 | Public jobs are SEO-ready |
| APP-01 | Redesign application schema | Draft/submitted lifecycle and tracking ID | JOB-01 | Applications support enterprise workflow states |
| APP-02 | Build apply flow | Candidate application form + validation | APP-01 | Candidate can submit applications |
| APP-03 | Add confirmation and tracking ID UX | Success page/email linkage | APP-02, NOTIF-01 | Candidate gets tracking reference |
| APP-04 | Add save-draft/edit flow | Draft persistence and resume | APP-01 | Candidate can save and continue later |
| APP-05 | Add duplicate prevention policy | Backend + UX-level duplicate handling | APP-01 | Duplicate apply attempts are detected and explained |
| FILE-01 | Build secure upload endpoint flow | Signed upload + persisted document metadata | AUTH-01 | CV upload stores real document metadata |
| FILE-02 | Add supporting-document uploads | Multiple document types | FILE-01 | Candidate can attach extra docs |
| FILE-03 | Add server-side validation/scanning pipeline | MIME sniffing/hash/AV hook | FILE-01 | Unsafe files are blocked or quarantined |
| FILE-04 | Link documents to applications/profile | Candidate document management | FILE-01, APP-01 | Uploaded docs appear in application records |
| FILE-05 | Replace public URLs with signed access | Secure document retrieval | FILE-01 | Documents are not publicly exposed |
| ADMIN-01 | Build HR dashboard shell | Protected recruiter area | AUTH-07 | HR users have working dashboard area |
| ADMIN-02 | Build job management CRUD | Create/edit/publish/archive jobs | JOB-01, ADMIN-01 | HR can manage jobs |
| ADMIN-03 | Build application management workspace | Candidate list/detail/filter/status views | APP-01, ADMIN-01 | HR can manage applications |
| ADMIN-04 | Build user/role management | Admin-only user administration | AUTH-05 | Admins can manage users and roles |
| ADMIN-05 | Add CSV export | Candidate export workflow | ADMIN-03 | HR can export filtered candidates |
| PIPE-01 | Create per-job pipeline stage model | Configurable pipeline | JOB-01 | Jobs can define custom stages |
| PIPE-02 | Add stage movement workflow | Transition service + permissions | PIPE-01, ADMIN-03 | Applications move through stages safely |
| PIPE-03 | Add stage history timeline | Persisted audit trail | PIPE-02 | Every movement is historically traceable |
| PIPE-04 | Add internal notes and ratings | Reviewer collaboration | ADMIN-03 | HR can add notes and scores |
| PIPE-05 | Add tagging and bulk actions | Candidate segmentation/operations | ADMIN-03 | HR can tag and bulk update candidates |
| PIPE-06 | Build candidate timeline UI | Unified chronology view | PIPE-03, PIPE-04 | HR can review end-to-end candidate history |

### Phase 3: Enterprise Enhancements

| ID | Ticket | Scope | Depends On | Acceptance Criteria |
|---|---|---|---|---|
| INT-01 | Add interview scheduling model/service | Interviews, calendars, timezone handling | PIPE-02 | Interviews can be scheduled and updated |
| INT-02 | Build interview management UI | Panels, slots, invites | INT-01 | HR can manage interview rounds |
| INT-03 | Add interview feedback and scorecards | Structured evaluator feedback | INT-01 | Panelists can submit scorecards |
| INT-04 | Add assessment module | Assignments and questionnaires | APP-01 | Candidates can receive and complete assessments |
| INT-05 | Add assessment scoring workflow | Review and scoring | INT-04 | Assessments are scored and surfaced in pipeline |
| NOTIF-01 | Add email template system | Template storage and rendering | AUTH-01 | Admin can manage templates |
| NOTIF-02 | Add queue-backed notification dispatch | Async email/in-app delivery | NOTIF-01, OPS-04 | Notifications do not block requests |
| NOTIF-03 | Add delivery logs and retries | Operational delivery visibility | NOTIF-02 | Failed sends are retried and logged |
| NOTIF-04 | Add in-app notifications center | User notification inbox | NOTIF-02 | Users can view recent notifications |
| ANALYTICS-01 | Build recruitment analytics data layer | Stage conversion/time-to-hire | PIPE-03 | Metrics are queryable accurately |
| ANALYTICS-02 | Build analytics dashboard | HR/admin reporting UI | ANALYTICS-01 | Admin can view core recruitment KPIs |
| COMP-01 | Add consent logging | Privacy consent persistence | APP-01 | Candidate consent is recorded per submission |
| COMP-02 | Add deletion/export workflows | Privacy operations | COMP-01 | Candidate data can be exported/deleted safely |
| COMP-03 | Add retention policy enforcement | Data lifecycle management | COMP-02 | Old candidate data/documents can be purged by policy |
| OPS-04 | Add queue/worker infrastructure | Async jobs for notifications/scanning/parsing | None | Worker processes async jobs reliably |
| OPS-05 | Add backup/restore and production runbooks | Operational resilience | None | Restore process and runbooks are documented and tested |

## Suggested Delivery Order

1. Identity, route protection, rendering correctness
2. Schema redesign and migration strategy
3. Secure upload and candidate application flow
4. HR/admin application management
5. Pipeline history, notes, tags, ratings
6. Notifications and async jobs
7. Interviews, assessments, analytics, compliance

## Execution Notes

- Do not incrementally bolt enterprise features onto the current schema without a redesign pass first.
- Treat `Job`, `Application`, and auth as foundational redesign areas.
- Fix auth and dynamic rendering before building more user-facing functionality.
- Add CI before broad feature work so regressions are caught early.
