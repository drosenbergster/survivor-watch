# Style Guide — Survivor 50 Watch Party HQ

Design system and CSS architecture.

## Structure

```
src/
├── index.css          # main entry, imports all
├── styles/
│   ├── theme.css      # design tokens (colors, fonts)
│   ├── base.css       # resets, accessibility
│   └── fijian.css     # masi pattern, wood-texture, tribal motifs
└── components/
    ├── fijian/        # Shared Fijian components — use for all new pages
    ├── layout/        # AppShell, UserBar, Header, TabNav, Footer
    └── screens/       # All app screens
```

## New Pages — Use Fijian Components

**All new screens/pages must use the shared Fijian components** for visual consistency.

Import from `../fijian`:

| Component | Use for |
|-----------|---------|
| `MasiBackground` | Full-screen backgrounds (e.g. AuthScreen) |
| `FijianHero` | Hero title block (SURVIVOR 50) |
| `FijianCard` | Cards, sections, containers |
| `FijianSectionHeader` | Section titles with optional subtitle |
| `FijianInput` | Text inputs with optional label (auto-wires `htmlFor`/`id`) |
| `FijianPrimaryButton` | Primary CTAs |
| `FijianLabel` | Small Fijian/English label pairs |
| `BingoSquare` | Bingo cells |
| `Icon` | Material Symbols Outlined |

**Colors:** Use theme tokens — `ochre`, `clay`, `sand-warm`, `earth`, `stone-dark`, `fire-400`, `torch`, `jungle-400`.

**Patterns:** `.masi-pattern`, `.wood-texture` (see `fijian.css`). Use `border border-sand-warm/20` for bamboo-style, `clip-[ellipse(50%_40%_at_50%_50%)]` for tabua shape.

**No hardcoded values:** Use theme tokens only. For JS (inline styles, e.g. player colors), import from `src/theme.js`. For CSS, use `var(--color-*)` or Tailwind classes.

**No dynamic Tailwind classes:** Never use string interpolation for Tailwind class names (e.g., `bg-${color}/20`). JIT compilation cannot resolve these. Use a static lookup map with inline styles instead.

## Design Tokens

**Location:** `src/styles/theme.css`

| Token | Hex | Usage |
|-------|-----|-------|
| fire-400 | `#e8722a` | Primary accent, tribal torch |
| torch | `#f5b731` | Highlights, secondary |
| jungle-400 | `#1db954` | Success, marked squares |
| ocean-400 | `#1a8cbb` | Kalo tribe, waters |
| sand | `#d4b483` | Warm neutrals |

**Fijian earth tones:** earth `#2b1d12`, ochre `#8b4513`, sienna `#a0522d`, clay `#d2691e`, stone-dark `#0f0f0f`, sand-warm `#d4b483`

**Tribe colors:** Cila `#e0a030`, Vatu `#c43e1c`, Kalo `#1a8cbb`

**Player colors (8):**

| Token | Hex | Color |
|-------|-----|-------|
| player-1 | `#e8722a` | Fire orange |
| player-2 | `#1db954` | Jungle green |
| player-3 | `#1a8cbb` | Ocean blue |
| player-4 | `#c77dff` | Purple |
| player-5 | `#f472b6` | Pink |
| player-6 | `#facc15` | Yellow |
| player-7 | `#2dd4bf` | Teal |
| player-8 | `#fb923c` | Amber |

## Typography

- **Display:** Bebas Neue (headers, titles)
- **Body:** Inter (content, UI)

## Tailwind Utilities

| Class | Purpose |
|-------|---------|
| `font-display` | Bebas Neue |
| `text-glow-fire` | Fire orange glow |
| `text-glow-torch` | Torch yellow glow |
| `shadow-fire` | Soft fire shadow |
| `shadow-fire-lg` | Strong fire shadow |
| `animate-flicker` | Torch flicker (theme) |
| `animate-float-up` | Ember float (theme) |
| `animate-pulse-win` | Bingo win pulse (theme) |
| `animate-bounce-in` | Win message (theme) |
| `animate-pulse-sync` | Sync indicator (theme) |
| `drop-shadow-cina` | Torch drop shadow (theme) |
| `text-shadow-glow-fire` | Fire text glow (theme) |

## React

- Functional components, hooks only
- Shared components from `fijian/` for screens
- `useApp()` for auth and game state; `data.js` for cast/events
- Tailwind for styling; `COLORS` from `theme.js` for dynamic inline styles
- No hardcoded colors in JSX

## Best Practices

- Use semantic HTML: `<header>`, `<main>`, `<section>`, `<article>`, `<nav>`
- Add `aria-label` to icon-only buttons
- Use `role="alert"` for error messages
- Use `aria-pressed` for toggle states
- Support `prefers-reduced-motion` (handled in base.css)
- Wrap async Firebase calls in try/catch, show errors via `role="alert"` elements
- Never call `setState` in the render body — use `useEffect`
