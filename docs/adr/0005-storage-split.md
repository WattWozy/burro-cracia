# ADR-0005: Storage split — localStorage for structured data, IndexedDB for binaries

**Status:** Accepted  
**Date:** 2026-11-26

## Context

The app needs two kinds of persistence with different characteristics:
- **Structured data** (bureaus, projects, templates): small JSON, needed synchronously at startup before first render.
- **Generated PDFs**: binary Uint8Array, potentially several MB total, produced asynchronously.

## Decision

- **localStorage**: bureaus, projects, templates. Synchronous reads at startup avoid async loading states for the main data model. 5 MB limit per origin is not a concern for JSON metadata.
- **IndexedDB**: generated PDF bytes. Async, no meaningful size limit, purpose-built for binary blobs.

## Consequences

- Startup is synchronous: `loadBureaus()` and `loadProjects()` block zero frames. No loading spinner needed for the main data model (only the `ready` gate for the initial hydration effect).
- PDFs live in IDB and are retrieved per-project lazily (`useGeneratedDocs` loads on project selection).
- Clear separation by data type makes each storage layer easy to reason about and backup/restore separately.
