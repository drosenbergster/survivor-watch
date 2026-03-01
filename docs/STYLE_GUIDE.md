# Style Guide — Survivor 50 Watch Party HQ

Design system and CSS architecture for Stitch integration.

## Structure

```
src/
├── index.css          # main entry, imports all
├── styles/
│   ├── theme.css      # design tokens (colors, fonts)
│   ├── base.css       # resets, accessibility
│   ├── animations.css # keyframes, @utility
│   └── utilities.css  # custom utilities (glow, shadow)
└── components/
    ├── ui/            # Button, Card, Input, ScreenHeader
    ├── layout/        # AppShell, UserBar, Header, TabNav, Footer
    └── screens/       # AuthScreen, DraftTab, BingoTab, etc.
```

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
| `animate-flicker` | Torch flicker |
| `animate-float-up` | Ember float |
| `animate-pulse-win` | Bingo win pulse |
| `animate-bounce-in` | Win message |
| `animate-pulse-sync` | Sync indicator |

## Stitch Integration

When integrating new Stitch designs:

1. **Fetch HTML/CSS** from Stitch via `fetch_screen_code`
2. **Map tokens** — replace Stitch colors with our theme classes (e.g. `#e8722a` → `text-fire-400` / `bg-fire-400`)
3. **Update theme.css** if Stitch introduces new colors
4. **Preserve structure** — keep semantic HTML (`<header>`, `<section>`, `<article>`, `aria-*`)

## Best Practices

- Use semantic HTML: `<header>`, `<main>`, `<section>`, `<article>`, `<nav>`
- Add `aria-label` to icon-only buttons
- Use `role="alert"` for error messages
- Use `aria-pressed` for toggle states
- Support `prefers-reduced-motion` (handled in base.css)
