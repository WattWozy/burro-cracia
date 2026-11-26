# ADR-0003: Upsert generated docs by (projectId, templateName)

**Status:** Accepted  
**Date:** 2026-11-26

## Context

`saveGeneratedDoc` always inserted with a fresh UUID as the IDB key. Regenerating the same template accumulated duplicate entries — the generated docs list would show 3 versions of "Acta" after 3 runs.

## Decision

`upsertGeneratedDoc` deletes all existing IDB entries where `projectId` and `templateName` match, then inserts the new doc — all within the same `readwrite` transaction (no async yield between delete and put, so the transaction stays open).

A schema migration (version bump) is avoided by keeping the existing `keyPath: "id"` store and doing the dedup in application code.

## Consequences

- Each (project, template) pair always has exactly one generated doc entry. Historical versions are not preserved — acceptable for this use case (architects re-generate when data changes, not for audit trail).
- Old orphan entries from the pre-upsert era (random UUID keys) will persist in IDB until cleared. They surface in the generated list (filtered by `projectId`) but will be replaced on first regeneration. Acceptable transient artifact.
