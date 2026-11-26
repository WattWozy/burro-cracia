# ADR-0001: Per-template PDF generation

**Status:** Accepted  
**Date:** 2026-11-26

## Context

The original design had a checkbox multi-selection panel and a single "Generar todos" button that called `anchor.click()` in a `for` loop. Browser security policy blocks programmatic `.click()` calls that are not a direct response to a user gesture — only the first download in the loop lands; the rest are silently swallowed.

## Decision

Each template card has its own "Generar PDF" button. One button click = one `.click()` = one download. No loop, no blocked downloads.

Batch saving (all previously generated PDFs at once) is handled separately by the File System Access API (`showDirectoryPicker`), which is explicitly designed for that use case.

## Consequences

- No "generate all" button on the generation tab. Tradeoff accepted: for a 4-document workflow, clicking four buttons is acceptable and forces the user to review each document's dates before generating.
- Download failures surface immediately per document rather than silently.
- `selectedDocs` checkbox state removed entirely — it was orphaned (no checkbox UI existed) and is no longer needed.
