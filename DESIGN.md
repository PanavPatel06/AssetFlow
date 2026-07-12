# Agentic — Complete Design System & Replication Spec

Source: v0-modern-agentic.vercel.app (AI agent orchestration SaaS landing page)
Purpose: implementation-ready reference so a rebuild matches the original's exact taste —
spacing, type, color, components, and motion.

---

## 1. Theme Summary

Minimal, premium, near-monochrome "quiet luxury" SaaS aesthetic (Linear/Vercel/Stripe-adjacent).
Warm cream canvas, near-black light-weight type, hairline borders instead of shadows, huge
whitespace, and a recurring "eyebrow block" pattern (animated pixel glyph + tracked-out pill
label + light-weight heading that reveals word-by-word) opening every section. Color is
almost entirely grayscale; the only real color comes from decorative iridescent/holographic
3D renders and a single green "live" status dot.

---

## 2. Design Tokens (Colors)

| Token | Value | Notes |
|---|---|---|
| `--background` | `#F5F4F0` | Page canvas (warm cream, NOT pure white) |
| `--foreground` | `#111111` | Headings, primary text |
| `--card` | `#FFFFFF` | Card background |
| `--card-hover` | `#FAFAF8` | Card hover background |
| `--card-border` | `rgba(0,0,0,0.07)` | Default card border |
| `--card-border-hover` | `rgba(0,0,0,0.15)` | Card border on hover |
| `--muted-foreground` | `rgba(0,0,0,0.45)` | Paragraph/body copy |
| `--label-foreground` | `rgba(0,0,0,0.40)` | Eyebrow badge text |
| `--nav-link` | `rgba(0,0,0,0.60)` | Nav link text |
| `--border-hairline` | `rgba(0,0,0,0.06)` | Section dividers, nav pill border |
| `--border-subtle` | `rgba(0,0,0,0.10)` | Button/icon-tile borders |
| `--fill-subtle` | `rgba(0,0,0,0.03)` – `rgba(0,0,0,0.05)` | Hover fills, badge pill bg, code bg |
| `--primary` | `#111111` | Filled button background |
| `--primary-hover` | `#333333` | Filled button hover background |
| `--primary-foreground` | `#FFFFFF` | Text on filled button |
| `--status-live` | green (~`#22C55E`) | "running"/live status dots |
| `--radius` | `0.625rem` (10px base token; components mostly use 14–16px) | |

All CSS custom properties in the live site are defined as grayscale `lab()` values (zero
chroma) except a single warm destructive/orange token that isn't visibly used anywhere in the UI.

---

## 3. Typography — Complete Matrix

Font stacks loaded: **Geist** (UI sans, variable), **Geist Mono** (code), **IBM Plex Sans**
(hero H1 + stat numbers only, weight 300), **Courier Prime** (logo only, monospace).
**Every heading and large numeral on this site is font-weight 300 (light) — bold is never used.**

| Role | Font | Size | Weight | Line-height | Letter-spacing | Color | Text transform |
|---|---|---|---|---|---|---|---|
| Body base | Geist | 16px | 400 | 24px | normal | `#111` | none |
| Hero H1 | IBM Plex Sans | 60px → 72px → 96px (responsive `text-6xl/7xl/8xl`) | 300 | 1.0 (equal to font-size) | `-2.4px` | `#111` | none |
| Section H2 | Geist | 36px → 48px → 60px (`text-4xl/5xl/6xl`) | 300 | 1.05 | `-1.2px`(at 48px base) | `#111` | none |
| Card H3 | Geist | 18px (`text-lg`) | 300 | 28px | normal | `#111` | none |
| Small card title alt | Geist | 20px | 300 | 28px | normal | `#111` | none |
| Body/paragraph copy | Geist | 14px | 400 | 22.75px (1.625) | normal | `rgba(0,0,0,.45)` | none |
| Nav links | system-ui | 11px | 400 | 16.5px | `0.275px` | `rgba(0,0,0,.6)` | none |
| Eyebrow/badge label | Geist (font-sans) | 11px | 400 | normal | tracking-widest (~`0.1em`) | `rgba(0,0,0,.4)` | uppercase (source is already caps) |
| Stat number (hero) | IBM Plex Sans | 36px | 300 | 40px | `-0.9px` | `#111` | none |
| Stat label (hero, e.g. "Tasks") | Geist | 12px (`text-xs`) | 400 | normal | tracking-widest | `rgba(0,0,0,.4)` | **uppercase** (CSS `text-transform: uppercase`, source text is capitalized "Tasks") |
| Agent-card stat sub-label ("tasks run") | Geist | 11px | 400 | normal | tracking-widest | `rgba(0,0,0,.35)` | none |
| Logo "AGENTIC" | Courier Prime | 12px | 400 | normal | `0.25em` | `rgba(0,0,0,.7)` | uppercase |
| Button label (outline & filled) | Geist | 11–14px depending on button | 400 | 20px | tracking-widest (`1.4px` on 14px btns) | varies (see §6) | none (source already caps for CTA copy) |
| Code / terminal text | Geist Mono | 11px | 400 | relaxed (1.6) | normal | `rgba(0,0,0,.5)` | none |
| Table / log timestamps | Geist Mono | 12–13px | 400 | normal | normal | `rgba(0,0,0,.4)` | none |

---

## 4. Spacing System (exact px values)

Base spacing follows Tailwind's default scale; the values actually used across the site:

**Section-level**
- Section vertical padding: `128px` top & bottom (`py-32`) on every section.
- Section horizontal padding: `24px` mobile → `48px` (`md:`) → `80px` (`lg:`).
- Section top divider: `1px solid rgba(0,0,0,0.06)` on every section except the hero.
- Content max-width: `1152px` (`max-w-6xl`), horizontally centered. Hero copy block uses a
  narrower `768px` (`max-w-3xl`).

**Section "eyebrow block" (repeats identically at the top of every section)**
- Wrapping container margin-bottom: `64px` (`mb-16`) before the feature content starts.
- Canvas pixel-glyph icon: `40×40px` box, sits first, no extra top margin.
- Eyebrow pill: `margin-top: 16px` (`mt-4`) from the glyph icon.
- H2 heading: `margin-top: 20px` (`mt-5`) from the eyebrow pill.

**Cards / grids**
- Feature-grid gap: `12px` (`gap-3`) between cards in the 12-col grid.
- Card padding: `32px` all sides (`p-8`); min-height `200px` (feature cards) or `320px`
  (agent-type / larger cards).
- Icon tile inside card: `40×40px` (`w-10 h-10`), `border-radius: 14px` (`rounded-xl`),
  `border: 1px solid rgba(0,0,0,0.10)`, background `rgba(255,255,255,0.6)`, margin-bottom
  `24px` (`mb-6`) before the card title.
- Card title → description spacing: `8px` (`mb-2`).
- Pricing card padding: `32px` (`p-8`), internal `flex flex-col justify-between` so CTA
  button pins to bottom.

**Buttons**
- Nav "outline" small button: padding `8px 16px` (`py-2 px-4`), `border-radius: 14px`.
- Nav pill container itself: padding `12px 20px`, `border-radius: 16px`.
- Full-width card CTA buttons (pricing "GET STARTED"): padding `12px 0` (`py-3`, full width
  so no horizontal padding needed), `border-radius: 14px` (`rounded-xl`).
- Email-capture "JOIN" button (final CTA): matches full-width button padding pattern, `12px`
  vertical padding, dark fill.

**Nav**
- Fixed pill sits `16px` (`top-4`) from viewport top, centered, `max-w-3xl` (768px) wide.
- Gap between nav links: `28px`.
- Gap between hero stat blocks: `32px` mobile (`gap-8`) → `48px` desktop (`gap-12`).

**Lists**
- Security section left-border list items: each item has a colored `border-left` accent bar,
  title and description stacked with small (~`4px`) gap, `~24px` gap between list items.
- Pricing feature bullet list: plain small dot bullets, ~`12px` vertical gap per line item,
  14px text.

---

## 5. Animation System (exact mechanics)

This is the site's signature detail — nearly everything reveals on scroll with a **blur +
slide + fade**, not a simple fade.

### 5.1 Heading word-by-word "blur-in" reveal (used on every single H1/H2 on the page)
Implementation pattern: each word of the heading is wrapped in its own
`<span style="display:inline-block">`, so words (not the whole line) animate independently.

- **Initial state (pre-scroll-into-view):**
  `opacity: 0; filter: blur(8px); transform: translateY(12px); transition: none;`
- **Animated/final state (triggered on scroll into viewport, likely via IntersectionObserver):**
  `opacity: 1; filter: blur(0px); transform: translateY(0px);`
- **Transition:** `700ms cubic-bezier(0.16, 1, 0.3, 1)` (an "ease-out-expo"-style curve)
  applied to `opacity`, `filter`, and `transform` simultaneously.
- **Stagger:** each subsequent word gets an additional `80ms` transition-delay
  (word 1 = 0ms, word 2 = 80ms, word 3 = 160ms, word 4 = 240ms, …).
- Net effect: heading appears to "focus in" word by word, softly sliding up and sharpening
  from a blur, left to right.

### 5.2 Card / block reveal on scroll
Similar concept applied to whole cards/blocks (not per-word):
- **Initial:** `opacity: 0; transform: translateY(Npx);` where `N` is `12–28px` depending on
  the component (small text blocks use ~12px, large cards use ~28px).
- **Final:** `opacity: 1; transform: translateY(0px);`
- **Transition:** `0.7s` duration, `ease` timing function (simple ease, not the cubic-bezier
  used for headings) for opacity/transform, plus separate faster `0.3s ease` transitions
  reserved for `border-color` and `background-color` (used for the hover state, decoupled
  from the entrance animation).
- **Stagger:** siblings in a row/grid receive incremental delays — observed values were
  `0ms, 120ms, 160ms, 200ms` for a 4-card row and `0ms, 80ms, 160ms,…` for larger stacked
  cards — i.e., roughly a `40–80ms` incremental stagger per sibling index, not perfectly
  linear (small extra offset before the group starts).

### 5.3 Animated pixel/glyph icon (appears above every section's eyebrow label)
This is **not an SVG or static image** — it's a `<canvas>` element:
- Canvas element: CSS size `40×40px`, internal buffer `80×80px` (rendered at 2x for
  sharpness), with `image-rendering: pixelated` — this produces the deliberately blocky,
  low-res "pixel art" look.
- Content: a sparse grid of small squares in varying gray shades (blacks, mid-grays, near-
  whites) arranged in a loose scattered/glyph-like pattern (different per section, e.g. a
  different "glyph" for Platform vs. Agent Types vs. Workflow).
- Behavior: continuously animated — individual pixels change shade/opacity over time on a
  loop (confirmed by sampling the canvas ~2 seconds apart and seeing different pixels lit),
  i.e. a subtle generative/flicker animation drawn via `requestAnimationFrame` and the
  Canvas 2D API, not a CSS animation.
- Rebuild approach: a small React component that owns a `<canvas ref>`, sets
  `canvas.width = canvas.height = 80`, scales context by 2, and on each animation frame
  redraws an 8×8-ish grid of squares (e.g. 4–5px cells) with randomized/noise-based opacity
  per cell, masked into a rough glyph/icon silhouette.

### 5.4 Nav bar (glassmorphism, always visible, no scroll-hide)
- Fixed, floating pill, `top: 16px`, centered, does not hide on scroll or change on scroll
  in the captured session (stays identical glass pill throughout).
- `backdrop-filter: blur(16px)`, background `rgba(245,244,240,0.3)` (translucent cream over
  whatever scrolls behind it), `box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)`.

### 5.5 Button hover
- All buttons: `transition-all duration-200` (200ms) — noticeably snappier than the 700ms
  content-reveal animations. Hover changes border color, text color, and/or background tint
  only; no scale/transform changes.

### 5.6 Card hover
- `transition-all duration-700` — cards intentionally use a **slow, deliberate** 700ms hover
  transition for border-color and background-color (matches the entrance animation speed,
  giving a consistently unhurried feel site-wide).

### 5.7 Agent Types section — sticky stacking cards
- Each of the 4 agent-type panels (Researcher, Coder, Analyst, Executor) is a full-bleed
  rounded panel that becomes `position: sticky` while scrolling through this section, so each
  new card slides over/covers the previous one rather than the page scrolling past them
  normally. Implement via `position: sticky; top: <offset>` on each stacked panel with
  increasing z-index per panel.

### 5.8 Marquee ticker (skills band)
- Full-bleed (no section padding), two rows of pill tags, each row scrolling horizontally on
  an infinite loop (CSS `@keyframes` translateX -50% with `animation: marquee Ns linear
  infinite`, content duplicated back-to-back to create the seamless loop illusion).

### 5.9 "Live" data illusion (audit trail + agents table)
- Both the Security section's "LIVE AUDIT TRAIL" list and the "Agents working 24/7" table
  are styled to look like continuously updating real-time feeds: monospace timestamps, a
  small green pulsing/status dot per row, and rows that appear to rotate — implement with a
  `setInterval` that reorders/updates row data every few seconds, not necessarily real data.

---

## 6. Component Specs

### Navigation
- Structure: fixed, centered glass pill (`max-w-3xl`), containing: logo (left) → nav links
  (center, 28px gap) → outline button "START BUILDING" (right).
- Logo: Courier Prime, 12px, `letter-spacing: 0.25em`, `rgba(0,0,0,.7)`.
- Links: system-ui, 11px, `rgba(0,0,0,.6)` → hover `#111`.
- CTA button: `border: 1px solid rgba(0,0,0,.1)`, transparent bg, `rounded-xl` (14px), padding
  `8px 16px`, hover: border `rgba(0,0,0,.2)`, bg tint `rgba(0,0,0,.03)`, text → `#111`.

### Buttons (two variants only, reused everywhere)
1. **Outline/ghost** — transparent bg, `border: 1px solid rgba(0,0,0,.10)`, text
   `rgba(0,0,0,.6)`; hover → border `rgba(0,0,0,.20–.25)`, text `#111`, bg
   `rgba(0,0,0,.03–.04)`. `rounded-xl` (14px). `transition 200ms`.
2. **Filled/dark** — bg `#111`, text `#FFF`; hover bg `#333`. Same radius/transition. Used for
   the emphasized pricing tier CTA and the newsletter "JOIN" button.
- All button label text: `tracking-widest`, uppercase-styled copy (written in caps already:
  "GET STARTED", "START BUILDING", "JOIN", "CONTACT SALES").

### Badges / Eyebrow pills
- `inline-flex items-center gap-1.5`, padding `4px 12px` (`py-1 px-3`), `rounded-full`, text
  11px tracking-widest, color `rgba(0,0,0,.4)`, background `rgba(0,0,0,.04)`.

### Cards (feature / agent-type / pricing — same base recipe, different sizing)
- `border-radius: 16px`, `border: 1px solid rgba(0,0,0,.07)`, bg `#fff`; hover → border
  `rgba(0,0,0,.15)`, bg `#fafaf8`; `transition 700ms` for the color changes.
- Feature card: padding 32px, min-height 200px, icon tile + title (18px, weight 300, mb 8px)
  + description (14px, `rgba(0,0,0,.45)`).
- Pricing card: padding 32px, flex-column with `justify-between` so the CTA sits at the
  bottom regardless of content length; plan name small/muted, price large (light weight),
  bullet feature list with plain dot markers, CTA button full width.

### Stat blocks (hero)
- Number: IBM Plex Sans, 36px, weight 300, `-0.9px` tracking.
- Label: Geist, 12px, uppercase, tracking-widest, `rgba(0,0,0,.4)`, `margin-top: 4px`.
- Row gap: 32px → 48px responsive.

### Tables / log rows (audit trail, live agents table)
- Row background: white or very light gray card, `rounded-xl`, subtle border.
- Monospace timestamp/ID column, regular column for description, small colored status pill
  or dot on the right (green = active/running, gray = queued).

### Footer
- Flat cream background (no card/border), logo left, link row (Platform/Agents/Workflow/
  Integrations/Live/Pricing) plus secondary links (Privacy/Terms/Docs/GitHub) right, thin
  `1px rgba(0,0,0,.06)` divider, copyright line bottom-left in muted small text.

---

## 7. Imagery / Assets Needed

- Looping ambient hero background **video**: abstract iridescent/holographic glass shapes,
  slow motion, muted pastel colors on light background — recreate with a similar licensed
  clip, a WebGL/Three.js shader blob, or a CSS gradient animation if video isn't available.
- Decorative **iridescent/holographic 3D renders** (glass cube, sphere/marble, hourglass,
  magnifying glass, faceted gem, connector/node shape) used throughout Agent Types,
  Workflow, and Integrations sections — chrome/glass material, soft studio lighting, light
  backdrop, rainbow dispersion highlights.
- Outline icon set (~20px, 1.5px stroke) for feature-card icon tiles — Lucide or Phosphor
  "outline" style matches the existing look closely.

---

## 8. Implementation Guidance for Claude Code

- **Stack:** Next.js + Tailwind CSS (matches the utility-class patterns found throughout,
  e.g. `col-span-12 md:col-span-4`, `text-6xl sm:text-7xl md:text-8xl`).
- **Fonts:** load Geist + Geist Mono (via `next/font/google` or Vercel's Geist package),
  IBM Plex Sans (need the `300` weight specifically), and Courier Prime (logo only, 400 weight).
- **Motion:** implement the word-blur-in heading reveal and card fade-slide reveal as a
  reusable component using either Framer Motion (`whileInView` + custom `variants` matching
  the exact timing/easing above) or a plain IntersectionObserver hook that toggles inline
  styles — the site's markup pattern (inline `style` attributes per word `span`, not CSS
  classes) suggests the latter, so a custom hook/component is more faithful than a generic
  animation library preset.
- **Canvas glyph icon:** build as its own small component (`<PixelGlyph seed="platform" />`)
  so each section can pass a different pattern/seed while sharing the same rendering/
  animation logic.
- **Global rules to enforce everywhere:** headings always weight 300 with negative letter-
  spacing; body copy always muted gray, never pure black; every section (except hero) gets a
  `border-t border-black/[0.06]` top divider instead of background/shadow separation; buttons
  and cards share the same two border-radius sizes (14px small components, 16px cards/nav)
  for consistency; hover transitions are fast (200ms) but entrance/reveal transitions are
  slow (700ms) — do not mix these up, the contrast between the two speeds is part of the feel.