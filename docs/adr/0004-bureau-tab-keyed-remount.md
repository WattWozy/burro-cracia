# ADR-0004: BureauDataTab remounts via React key

**Status:** Accepted  
**Date:** 2026-11-26

## Context

`BureauDataTab` manages its own local form state (`useState(initialBureau)`). React only runs `useState` initializers once — on mount. When the user switched bureaus, the `bureau` prop updated but local state stayed stale (showing the previously selected bureau's data).

The standard fix is `useEffect` to sync props → state, but this creates a subtle two-render flicker and is generally an anti-pattern.

## Decision

The parent passes `key={currentBureauId}` to `BureauDataTab`. React destroys and remounts the component whenever the key changes, so `useState(initialBureau)` always initializes with the current bureau.

## Consequences

- Clean, idiomatic React. No `useEffect` syncing props to state.
- Full remount cost on bureau switch — negligible for this component (no expensive setup).
- Form state is always consistent with the selected bureau.
