# Component Guide — Survivor 50 Watch Party HQ

React component architecture and conventions.

## Structure

```
src/components/
├── fijian/       # Shared Fijian UI (FijianCard, FijianInput, BingoSquare, Icon)
├── layout/       # App shell (AppShell, UserBar, Header, TabNav, Footer)
└── screens/      # App views (AuthScreen, DraftTab, etc.)
```

## Fijian Components

Use these for all screens. See `src/components/fijian/` and `docs/STYLE_GUIDE.md`.

| Component | Usage |
|-----------|-------|
| **FijianCard** | Containers, sections |
| **FijianInput** | Text inputs with optional label |
| **FijianPrimaryButton** | Primary CTAs |
| **FijianSectionHeader** | Section titles |
| **BingoSquare** | Bingo cells |
| **Icon** | Material Symbols Outlined |

## Layout Components

| Component | Purpose |
|-----------|---------|
| **AppShell** | Main layout: UserBar | Header | TabNav | Content | Footer |
| **UserBar** | Sync status, email, logout |
| **AppHeader** | Logo, title, embers |
| **TabNav** | Tab buttons with `aria-current` |
| **AppFooter** | Footer text |

## React Conventions

### Component composition
- Prefer composition over prop drilling
- Use `children` for flexible layouts
- Pass `className` for one-off overrides

### Props
- Destructure props at top of component
- Use JSDoc for optional/complex props
- Spread `...rest` to underlying elements

### State
- Keep state close to where it's used
- Use `useApp()` for global state (context)
- Lift state only when needed

### Event handlers
- Name handlers `handle*` (e.g. `handleSubmit`)
- Use `async` for handlers that await
- Avoid inline arrow functions in JSX when possible (for perf)

### Accessibility
- Use semantic HTML (`<header>`, `<main>`, `<section>`)
- Add `aria-label` to icon-only buttons
- Use `aria-current="page"` for active nav
- Pass `aria-*` through to underlying elements

## Stitch Integration

When integrating Stitch designs:

1. **Map to Fijian components** — Stitch buttons → `FijianPrimaryButton`, cards → `FijianCard`
2. **Preserve structure** — Keep semantic HTML from Stitch
3. **Use theme classes** — Replace Stitch hex with `text-fire-400`, `bg-stone-900`, etc.
4. **Add to theme.css / fijian.css** — New tokens or patterns as needed
