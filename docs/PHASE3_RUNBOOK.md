# Phase 3 Runbook

## Outbox Worker

- Command: `pnpm process:outbox`
- Purpose: processes queued notification and enterprise messaging jobs stored in `OutboxJob`
- Recommended production mode: run on a recurring schedule or as a dedicated worker

## Candidate Data Export

- Endpoint: `GET /api/compliance/export`
- Access: authenticated applicant only
- Output: JSON export of user, profile, applications, documents, notifications, and deletion requests

## Deletion Requests

- Applicants can submit requests from `/applicant/compliance`
- Admins process requests from `/admin/compliance`
- Approval path:
  - removes private files from `/tmp/recruitme-private-files`
  - deletes notifications
  - deletes candidate documents
  - deletes applications
  - deletes applicant profile
  - marks the request as completed

## Backup Guidance

- Database:
  - run scheduled PostgreSQL dumps
  - verify restore in a non-production environment
- Private files:
  - move `private-files` storage to production object storage before launch
  - ensure backups cover document objects and metadata together

## Recommended Production Ops

1. Run Prisma migrations before deploying app changes.
2. Seed RBAC after permission enum changes with `pnpm seed:rbac`.
3. Run the outbox worker continuously or on a short interval.
4. Monitor failed `OutboxJob` and `DeliveryLog` records.
