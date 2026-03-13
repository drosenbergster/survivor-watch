# Remaining Lint Issues

9 issues (4 errors, 5 warnings) that require careful refactoring. Grouped by category with context and suggested fixes.

## setState in useEffect (3 errors)

The React Compiler flags synchronous `setState` inside `useEffect` as a cascading render risk. Each of these hydrates local state from async context data. The recommended fix is to use initializer functions in `useState` or derive state directly instead of syncing via effects.

### `src/App.jsx` — line 38

```
setJoinParam(code.toUpperCase())
```

Reads a `?join=CODE` URL param on mount and sets state. Refactor: initialize `joinParam` via a `useState` initializer that reads `URLSearchParams` directly, removing the effect entirely.

### `src/components/screens/Predictions.jsx` — line 20

```
setPropAnswers(myPredictions.propBets || {})
```

Hydrates local `propAnswers` state from `myPredictions` context on first load (guarded by a `hydrated` ref). Refactor: use a `useState` initializer that reads from `myPredictions`, or derive `propAnswers` from context with a fallback to local edits.

### `src/components/screens/WeeklyPicks.jsx` — line 23

```
setSelected(myPicks)
```

Same pattern as Predictions — hydrates local `selected` state from `myPicks` context. Refactor: same approach — `useState(() => myPicks.length > 0 ? myPicks : [])` and remove the effect.

---

## Variable accessed before declaration (1 error)

### `src/components/screens/AdminScoring.jsx` — line 761

```
applyAutoImport(data)  // called here
// ...
const applyAutoImport = useCallback(...)  // declared later
```

`applyAutoImport` is a `useCallback` that's called inside a `useEffect` defined above it. JavaScript hoisting doesn't apply to `const`. Refactor: move the `applyAutoImport` `useCallback` declaration above the `useEffect` that calls it.

---

## Hook dependency warnings (5 warnings)

### `src/AppContext.jsx` — lines 930, 998

```
useEffect has an unnecessary dependency: 'db'
```

`db` is a module-level Firebase import — it's stable and doesn't trigger re-renders. Safe fix: remove `db` from both dependency arrays.

### `src/components/screens/AdminScoring.jsx` — line 845

```
useMemo has a missing dependency: 'isPostMerge'
```

`tribalAttendees` memo uses `isPostMerge` in its body but doesn't list it as a dependency. Fix: add `isPostMerge` to the dependency array. Verify the memo doesn't produce stale results when merge status changes.

### `src/components/screens/LeagueSwitcher.jsx` — line 35

```
useEffect has a missing dependency: 'leagueIds'
useEffect has a complex expression in the dependency array
```

The effect uses `leagueIds.join(',')` as a dependency — the compiler can't statically verify this. Refactor: extract `const leagueIdsKey = leagueIds.join(',')` as a separate variable, then use `leagueIdsKey` in the dependency array. This also resolves the missing `leagueIds` warning since the derived value captures the dependency.
