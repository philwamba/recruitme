# RecruitMe Audit Gap Matrix

This document reflects the repository state as verified on March 2, 2026. It replaces the older root-level gap matrix, which still described the pre-Phase-1 MVP.

## Status Legend

- `COMPLETE`: implemented in the repo and verified by code inspection/build validation
- `PARTIAL`: foundation exists, but production completion still depends on follow-up work or runtime configuration
- `OPEN`: not implemented yet
- `OPTIONAL`: only required if product scope explicitly demands it

## Verification Summary

Verified against the current codebase:

- Real authentication, session management, password reset, email verification, lockout handling
- RBAC permission enforcement and protected route handling
- Public jobs board, job detail pages, application flow, tracking IDs, draft/submission lifecycle
- Employer/admin areas for jobs, candidates, analytics, compliance, templates, users, and operations
- Pipeline stages, stage history, notes, tags, ratings, candidate timeline
- Interviews, assessments, notifications, outbox worker, delivery logs
- Compliance export/deletion flows
- CI validation, lint, typecheck, tests, and production build
- Phase 4 hardening: health endpoints, readiness checks, error boundaries, admin operations console, outbox retry/backoff, provider-backed email abstraction, private storage abstraction

Latest verification result:

- `pnpm prisma generate`: passed
- `pnpm lint`: passed
- `pnpm typecheck`: passed
- `pnpm test`: passed
- `pnpm build`: passed

## Phase Status

### Phase 1

| Ticket | Status | Notes |
|---|---|---|
| AUTH-01 | COMPLETE | DB-backed auth/session flow is implemented in `src/lib/auth.ts` and `src/app/auth/actions.ts`. |
| AUTH-02 | COMPLETE | Prisma auth/session/token schema is present. |
| AUTH-03 | COMPLETE | Password hashing, reset, and email verification are implemented. |
| AUTH-04 | COMPLETE | Failed sign-in tracking and lockout exist. |
| AUTH-05 | COMPLETE | Permission model exists in schema and code. |
| AUTH-06 | COMPLETE | Protected actions/pages enforce authorization. |
| AUTH-07 | COMPLETE | Proxy-based route protection is implemented. |
| ARCH-01 | COMPLETE | Public/applicant/employer/admin areas exist as distinct route areas. |
| ARCH-02 | COMPLETE | Authenticated pages are dynamic. |
| SEC-01 | COMPLETE | Audit and activity logs are implemented. |
| SEC-02 | PARTIAL | Security headers exist, but CSP still allows `'unsafe-inline'` for scripts/styles. |
| SEC-03 | COMPLETE | Rate limiting exists for waitlist/auth flows. |
| SEC-04 | COMPLETE | Runtime env validation exists. |
| OPS-01 | PARTIAL | Structured error reporting exists with optional webhook forwarding, but no full managed monitoring stack is wired. |
| OPS-02 | COMPLETE | GitHub Actions CI exists. |
| OPS-03 | PARTIAL | Test harness exists, but coverage is still light. |

### Phase 2

| Ticket | Status | Notes |
|---|---|---|
| JOB-01 | COMPLETE | Job schema supports publishing/filtering fields. |
| JOB-02 | COMPLETE | Public jobs listing exists. |
| JOB-03 | COMPLETE | Core job indexes/search filtering are implemented at app level; no verified FTS engine beyond current approach. |
| JOB-04 | COMPLETE | Department taxonomy exists. |
| JOB-05 | COMPLETE | Public job detail pages exist. |
| JOB-06 | PARTIAL | SEO stack includes sitemap/robots/basic metadata, but not full schema.org/OpenGraph depth across all pages. |
| APP-01 | COMPLETE | Application schema supports tracking IDs, drafts, and submission lifecycle. |
| APP-02 | COMPLETE | Application flow exists. |
| APP-03 | COMPLETE | Tracking/success flow exists. |
| APP-04 | COMPLETE | Draft save/edit flow exists. |
| APP-05 | COMPLETE | Duplicate prevention exists in backend and UX pathing. |
| FILE-01 | COMPLETE | Secure private upload flow is integrated into application actions. |
| FILE-02 | COMPLETE | Supporting-document upload exists. |
| FILE-03 | PARTIAL | Type/size/magic-byte validation exists, but no antivirus scanning or quarantine flow exists. |
| FILE-04 | COMPLETE | Candidate documents are linked to applications/profile records. |
| FILE-05 | COMPLETE | Documents are accessed through protected download flow, not public URLs. |
| ADMIN-01 | COMPLETE | Employer workspace exists. |
| ADMIN-02 | PARTIAL | Job creation exists, but editing/publishing/archive controls are still basic. |
| ADMIN-03 | COMPLETE | Candidate management workspace exists. |
| ADMIN-04 | COMPLETE | User/role management exists. |
| ADMIN-05 | COMPLETE | Candidate CSV export exists. |
| PIPE-01 | COMPLETE | Per-job pipeline stage model exists. |
| PIPE-02 | COMPLETE | Stage movement workflow exists. |
| PIPE-03 | COMPLETE | Stage history is persisted. |
| PIPE-04 | COMPLETE | Notes and ratings exist. |
| PIPE-05 | PARTIAL | Tags exist, but bulk actions do not. |
| PIPE-06 | COMPLETE | Candidate timeline UI exists. |

### Phase 3

| Ticket | Status | Notes |
|---|---|---|
| INT-01 | COMPLETE | Interview scheduling model/service exists. |
| INT-02 | COMPLETE | Interview management UI exists. |
| INT-03 | COMPLETE | Interview feedback exists. |
| INT-04 | COMPLETE | Assessment assignment/submission exists. |
| INT-05 | COMPLETE | Assessment review/scoring exists. |
| NOTIF-01 | COMPLETE | Template system exists. |
| NOTIF-02 | COMPLETE | Queue-backed notifications exist. |
| NOTIF-03 | COMPLETE | Delivery logs now exist with retry/backoff handling. |
| NOTIF-04 | COMPLETE | Applicant notification center exists. |
| ANALYTICS-01 | COMPLETE | Basic analytics data layer exists. |
| ANALYTICS-02 | COMPLETE | Admin analytics dashboard exists. |
| COMP-01 | COMPLETE | Consent logging exists. |
| COMP-02 | COMPLETE | Export/deletion flows exist. |
| COMP-03 | OPEN | Policy-driven retention enforcement is still not automated. |
| OPS-04 | COMPLETE | Outbox worker flow exists. |
| OPS-05 | PARTIAL | Runbook guidance exists, but backup/restore rehearsal is not evidenced in repo. |

### Phase 4

| Ticket | Status | Notes |
|---|---|---|
| OPS-06 | PARTIAL | Observability abstraction now supports webhook forwarding, but there is still no integrated managed vendor like Sentry/APM. |
| OPS-07 | COMPLETE | `/api/health` and `/api/ready` exist. |
| OPS-08 | OPEN | Backup/restore automation and verified restore drills are still not implemented. |
| TEST-01 | OPEN | Integration/E2E coverage is still missing. |
| SEC-05 | PARTIAL | `'unsafe-eval'` was removed, but `'unsafe-inline'` remains in CSP. |
| FILE-06 | PARTIAL | Private storage now supports durable R2-backed storage, but production completeness depends on env/configuration. |
| FILE-07 | PARTIAL | Storage architecture is closer to unified, but `src/lib/services/file-upload.ts` remains as compatibility/legacy surface and should be removed or fully aligned. |
| NOTIF-05 | PARTIAL | Real email provider support exists in code (`resend`), but production setup depends on env/configuration. |
| NOTIF-06 | COMPLETE | Retry/backoff and failed-job surfacing are implemented in outbox processing and admin operations UI. |
| NOTIF-07 | COMPLETE | SMS was removed from production-facing admin notification controls. |
| INT-06 | OPEN | No calendar sync or ICS invite generation exists. |
| PIPE-07 | OPEN | No stage-management UI for creating/reordering custom job pipelines exists. |
| PIPE-08 | OPEN | No bulk candidate actions exist. |
| ADMIN-06 | COMPLETE | Admin operations console shows audit/activity/delivery/outbox records. |
| ANALYTICS-03 | OPEN | Analytics remain topline-only; no filters, trends, exports, or recruiter breakdowns. |
| COMP-04 | OPEN | No retention automation, anonymization, or legal-hold workflow exists. |
| UX-01 | COMPLETE | `error.tsx`, `global-error.tsx`, and `not-found.tsx` now exist. |
| UX-02 | OPEN | Many enterprise actions still communicate via redirect query params instead of richer UI status patterns. |
| AUTH-08 | OPTIONAL | OAuth is not implemented and is only needed if product scope requires it. |

## Verified Remaining Open Gaps

These are the items that are still genuinely open or only partially complete after the latest verification pass.

### Still Open

- Managed monitoring/alerting stack beyond webhook-capable logging
- Backup/restore automation and tested restore drills
- Integration and E2E test coverage
- Calendar integration or ICS invite export
- Pipeline stage management UI
- Bulk candidate actions
- Richer analytics and reporting
- Compliance retention automation/anonymization/legal-hold support
- Richer enterprise success/error UX for complex actions

### Still Partial

- CSP hardening
- SEO depth
- Antivirus/quarantine document scanning
- Durable object storage production rollout
- Final storage-layer consolidation
- Real email-provider production configuration
- Backup/restore operational evidence

## Recommended Next Delivery Order

1. Monitoring/alerting and backup/restore verification
2. E2E/integration coverage for auth, applications, and recruiter workflows
3. Calendar integration and recruiter bulk operations
4. Analytics expansion and compliance retention automation
5. UX improvements for enterprise action feedback and recovery
