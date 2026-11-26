# ADR-0002: Auto-persist project fields on every update

**Status:** Accepted  
**Date:** 2026-11-26

## Context

`updateProjectData` previously did an optimistic React state update only. `persistCurrentProject` existed but was never wired to any user action. The "Guardar datos" button called `onSave` in `page.tsx`, which only set a UI message — it never persisted anything. Data was lost on page refresh unless the user triggered a bureau switch (which has its own save path).

## Decision

`updateProjectData` calls `saveProjects` synchronously inside the React functional state updater. The updater runs synchronously and returns the new state, so we always persist exactly what React holds.

```ts
setProjects((prev) => {
  const next = updateProjectField(prev, currentProjectId, key, value);
  saveProjects(bureauId, next); // ← persists the same value React will use
  return next;
});
```

The "Guardar datos" button remains as a UX affordance (users expect a save gesture) but is now redundant — it just shows a confirmation toast.

## Consequences

- One `localStorage.setItem` per field change (every keystroke). Acceptable: the payload is small JSON and localStorage writes are synchronous and fast on modern hardware.
- `persistCurrentProject` removed from the hook's public API — no longer needed.
- Zero data loss risk from navigation or refresh.
