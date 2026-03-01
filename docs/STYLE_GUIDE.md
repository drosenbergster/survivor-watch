# Style Guide — Survivor 50 Watch Party HQ

Design system and CSS architecture for Stitch integration.

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
    └── screens/       # AuthScreen, DraftTab, BingoTab, etc.
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
| `FijianInput` | Text inputs with optional label |
| `FijianPrimaryButton` | Primary CTAs |
| `FijianLabel` | Small Fijian/English label pairs |
| `BingoSquare` | Bingo cells |
| `Icon` | Material Symbols Outlined |

**Colors:** Use theme tokens — `ochre`, `clay`, `sand-warm`, `earth`, `stone-dark`, `fire-400`, `torch`, `jungle-400`.

**Patterns:** `.masi-pattern`, `.wood-texture` (see `fijian.css`). Use `border border-sand-warm/20` for bamboo-style, `clip-[ellipse(50%_40%_at_50%_50%)]` for tabua shape.

**No hardcoded values:** Use theme tokens only. For JS (inline styles, e.g. player colors), import from `src/theme.js`. For CSS, use `var(--color-*)` or Tailwind classes.

## Design Tokens

**Location:** `src/styles/theme.css`

Update these when integrating Stitch designs. Keep in sync with Stitch project 17298965758760609228.

| Token | Hex | Usage |
|-------|-----|-------|
| fire-400 | `#e8722a` | Primary accent, tribal torch |
| torch | `#f5b731` | Highlights, secondary |
| jungle-400 | `#1db954` | Success, marked squares |
| ocean-400 | `#1a8cbb` | Kalo tribe, waters |
| sand | `#d4b483` | Warm neutrals |

**Fijian earth tones:** earth `#2b1d12`, ochre `#8b4513`, sienna `#a0522d`, clay `#d2691e`, stone-dark `#0f0f0f`, sand-warm `#d4b483`

**Tribe colors:** Cila `#e0a030`, Vatu `#c43e1c`, Kalo `#1a8cbb`  
**Player colors:** `#e8722a`, `#1db954`, `#1a8cbb`, `#c77dff`

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
| `shadow-fire` | Fire glow box shadow (theme) |
| `drop-shadow-cina` | Torch drop shadow (theme) |
| `text-shadow-glow-fire` | Fire text glow (theme) |

## Stitch Integration

When integrating new Stitch designs:

1. **Fetch HTML/CSS** from Stitch via `fetch_screen_code`
2. **Map tokens** — replace Stitch colors with our theme classes (e.g. `#e8722a` → `text-fire-400` / `bg-fire-400`)
3. **Update theme.css** if Stitch introduces new colors
4. **Preserve structure** — keep semantic HTML (`<header>`, `<section>`, `<article>`, `aria-*`)

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
