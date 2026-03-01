# Component Guide — Survivor 50 Watch Party HQ

React component architecture and conventions.

## Structure

```
src/components/
├── ui/           # Reusable primitives (Button, Card, Input)
├── layout/       # App shell (AppShell, UserBar, Header, TabNav, Footer)
└── screens/      # App views (AuthScreen, DraftTab, etc.)
```

## UI Components

| Component | Props | Usage |
|-----------|-------|-------|
| **Button** | `variant` (primary|secondary|ghost), `disabled`, `className` | `type="submit"` for forms |
| **Card** | `title`, `accentColor` (hex), `className` | Containers with optional border accent |
| **Input** | spread to `<input>` | Themed text inputs |
| **ScreenHeader** | `title`, `subtitle` (string or JSX) | Screen title + subtitle |

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

1. **Map to UI components** — Stitch buttons → `<Button>`, cards → `<Card>`
2. **Preserve structure** — Keep semantic HTML from Stitch
3. **Use theme classes** — Replace Stitch hex with `text-fire-400`, `bg-stone-900`, etc.
4. **Add to stitch-overrides.css** — Screen-specific tweaks that don't fit the theme
