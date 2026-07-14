# Design system brief — my-noodles

> Locked decisions from design-system brainstorm (Phase 2 prep).  
> **Litmus test for every token and override:** does this make the customer feel more welcome, more delighted, and more confident to try something new today?

Implementation target: `packages/theme` (MUI theme + skin engine) and Storybook (`pnpm exec nx storybook theme`).

---

## 1. Base mood

**Direction: cozy pantry + pop accents (A+B)**

- Default store feel is **warm and approachable** — friendly neighborhood import shop, not a cold product grid or luxury-minimal boutique.
- **Discovery surfaces** get a controlled pop (saturated accents, display type moments).
- **Checkout and trust surfaces** stay calm and clear — no decorative wash, maximum readability.

---

## 2. Color — base theme (light only)

### MVP scope

- **Light theme only** for Phase 2. No dark mode, no `prefers-color-scheme` branch, no dark country skins.
- Token names are **mode-agnostic** (`surface.page`, not `surface.pageLight`) so dark can ship later without renames.

### Primary accent

- **Terracotta / coral** as base `buttonFill.primary` (~hue 8°, high saturation, mid lightness — exact hex in `baseColors`).
- Appetizing and warm; not generic e-commerce red or tech orange.
- Country skins **shift hue** from this family; they do not replace the button system wholesale.

### Surface neutrals

- **Page:** warm parchment (e.g. `#FBF7F2` territory).
- **Card:** white (`#FFFFFF`).
- **Elevated:** white or one step warmer than card.
- **Borders:** warm gray (e.g. `#E8E0D8`), never cool `#E0E0E0`.
- **D-lite wash:** barely perceptible warm tint on **discovery surfaces only** (home hero, collection headers). **Not** on checkout.

### Elevation

**Soft lift (B)** — trays on a counter, not floating SaaS cards.

| Surface                 | Treatment                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------ |
| Product cards           | `border.subtle` + one warm-tinted shadow tier (low blur, low opacity)                |
| Sticky CTAs / cart bar  | Same tier or one step up — never dramatic drop shadow                                |
| Bottom sheets / dialogs | Surface step + top border first; shadow only if needed vs backdrop                   |
| Filter chips            | No shadow; selected = fill color                                                     |
| Skin gradients          | Top ~20% of card only; card body stays flat white — no heavy shadow + gradient combo |

---

## 3. Token architecture

**Layered (plan-aligned):**

```text
baseColors          # raw hex — never used in components
  └── colors        # theme.colors — ONLY layer components/skins touch
        ├── text.{primary, secondary, disabled, inverse}
        ├── icon.{primary, secondary, accent}
        ├── surface.{page, card, elevated, bgHueBrand}   ← skin hook (hue value)
        ├── border.{subtle, strong, focus}
        └── buttonFill.{primary, primaryHover, secondary, disabled}
  └── palette       # MUI standard — mapped FROM colors, not authored separately
        └── primary.main ← colors.buttonFill.primary
```

### Hard rules

1. Components use **semantic tokens only** — never `baseColors`, never raw hex in `apps/web`.
2. Skin resolver overrides **`colors.*` only** — never `baseColors`, never per-component hacks.
3. `surface.bgHueBrand` is a **hue value** (number or HSL fragment), not a full background. D-lite wash and skin gradients derive from it.
4. CSS variables mirror `colors` keys in kebab-case: `--colors-surface-page`, `--colors-surface-bg-hue-brand`.
5. `theme.d.ts` augments MUI with `colors`, `customSpacing`, `borderRadius`, `modalWidths` — single source of truth.

---

## 4. Shape language

**Split personality (C)**

| Layer     | Radius              | Examples                                         |
| --------- | ------------------- | ------------------------------------------------ |
| Discovery | **20px**            | Product cards, collection tiles, hero blocks     |
| Action    | **pill** (`9999px`) | Primary / secondary buttons                      |
| Utility   | **12px**            | Filter chips, text fields, toggles, icon buttons |

**Global rule:** never `none` (0px) on customer-facing surfaces.

Spacing: 8px base unit; gap/padding scales and `modalWidths` per mvp-plan.

---

## 5. Typography

**Balanced discovery (B)** — Unbounded + Manrope, Cyrillic-ready, self-hosted via `next/font`.

| Role                                             | Font                           |
| ------------------------------------------------ | ------------------------------ |
| H1, H2                                           | Unbounded                      |
| Collection hero titles                           | Unbounded                      |
| PDP product title                                | Unbounded                      |
| Product names on **catalog cards**               | Manrope semibold, 2-line clamp |
| Prices, CTAs, buttons, chips, nav, filters, body | Manrope                        |

### Hard rules

- Unbounded **max weight 600** — playful, not poster.
- Unbounded **never below `text-lg` (~18px)** on mobile.
- **No uppercase** on buttons (`textTransform: none`).
- Prices always **Manrope tabular**.

---

## 6. Country skins

**Intensity: Flavor (B)** — variety in a mixed catalog, still one shop.

### Product card

- Top **~20%** soft skin gradient, opacity **12–18%**.
- Card body stays **white parchment card**.
- Accent per country in the **same saturation/lightness band** as base terracotta.

### Restrictions

- **No flag patterns** as backgrounds. Flag emoji in metadata only.
- **Motifs:** optional low-contrast watermark on **collection pages only** in MVP — not on every card.
- **Secondaries** (gold, teal, navy, pine, jade): **collection watermarks / tags only** — never primary buttons.
- **US navy** and **CA pine:** icon, chip, or gradient stop only — never large background fills.

### Registry (initial MVP)

Base terracotta reference: ~hue **8°**, sat **~75%**, light **~55%** for `buttonFill.primary`.

| Code   | Mood                     | `bgHueBrand`         | Main accent      | Secondary (tags/watermarks only) | Gradient           |
| ------ | ------------------------ | -------------------- | ---------------- | -------------------------------- | ------------------ |
| **CN** | Lunar warmth, tea-house  | 0° vermilion         | Deeper vermilion | Gold `#D4A853`                   | Red → warm gold    |
| **KR** | K-pop clean neon pop     | 320° magenta-rose    | Rose `#E84A8A`   | —                                | Rose → soft violet |
| **TH** | Tropical fruit, temple   | 38° mango-gold       | Mango family     | Teal `#2A9D8F`                   | Mango → teal       |
| **US** | Diner retro, bold pack   | 355° cherry          | Cherry family    | Navy `#1E3A5F`                   | Cherry → navy fade |
| **CA** | Maple cozy, outdoors     | 28° maple-amber      | Amber family     | Pine `#2D6A4F`                   | Amber → green mist |
| **TW** | Night market, bubble tea | 340° bubble-tea pink | Pink family      | Jade `#40916C`                   | Pink → jade        |

### Fallback (`hash(slug)`)

- `hue = hash(slug) % 360`
- Clamp saturation **40–60%**, lightness **50–60%**
- **Whisper** intensity only — slight hue nudge, not random neon

### Resolution order

`brand → country → category → hash(slug)` → base theme.

Light skin (MVP): CSS variable overrides on card/page root. Deep skin (future): nested `ThemeProvider` — out of Phase 2 scope.

---

## 7. Component overrides — Phase 2 scope

**MVP-critical (B)**

### P0 — ship in Phase 2 (`components.ts`)

| Component                     | Key overrides                                                             |
| ----------------------------- | ------------------------------------------------------------------------- |
| **Button**                    | Pill, Manrope semibold, terracotta fill, no uppercase, `disableElevation` |
| **IconButton**                | Min 44px tap target, 12px radius                                          |
| **Chip**                      | 12px radius; selected = filled accent                                     |
| **TextField / OutlinedInput** | 12px radius, warm border, focus from `border.focus`                       |
| **Paper / Card**              | 20px radius, soft lift + `border.subtle`                                  |
| **Dialog + Drawer**           | Top radius 20–24px, `surface.elevated`, border-first elevation            |
| **CssBaseline**               | `surface.page`, Manrope default                                           |

### P1 — Phase 7 (with pages)

ToggleButton, Switch, Menu/Select, Slider, Badge, Skeleton.

### P2 — later

Table, Tabs, Accordion, Tooltip polish.

---

## 8. Storybook (visual reference)

**Location:** `packages/theme` — **Storybook 10.4.6** (`@storybook/react-vite`).

Storybook is the **living styleguide**. It consumes the same MUI `theme` object as `apps/web` — **not** a parallel HTML/CSS file. Change tokens in `packages/theme` → stories update automatically.

### Source of truth

```text
packages/theme/src/theme.ts     ← tokens, overrides, skin resolver
        ↓ ThemeProvider in .storybook/preview.tsx
packages/theme/src/stories/     ← read theme.colors, resolveSkin(), render P0 components
        ↓ same exports
apps/web                        ← production UI
```

**`docs/design-system-brief.md`** = decisions and rules (why). **Storybook** = visual proof (what). No static HTML styleguide.

### Hard rules

1. Stories **import from `../theme` (or package exports)** — never hardcode hex swatches.
2. Token swatch stories **map `theme.colors` programmatically**.
3. Skin stories wrap content with **`resolveSkin()` CSS variables** on a root element.
4. Font setup in Storybook uses the same **`fonts.css` / `@font-face`** families the web app references (Unbounded + Manrope).
5. Run via Nx: `nx storybook theme` / `nx build-storybook theme`.

### Story sections (mirror this brief)

1. **Foundations** — `colors.*` swatches derived from theme (+ dev note for `baseColors`)
2. **Typography** — Unbounded vs Manrope; allowed / forbidden Unbounded usage
3. **Shape & spacing** — radius scale, spacing steps, modal widths
4. **Elevation** — flat+border vs soft-lift card comparison
5. **P0 components** — Button, IconButton, Chip, TextField, Card, Dialog/Drawer chrome
6. **Country skins** — CN/KR/TH/US/CA/TW + hash fallback; product card mock per skin; six cards in one row
7. **Discovery vs checkout** — D-lite hero vs clean checkout strip
8. **Do / Don't** — e.g. flag background ❌ vs flavor gradient ✅

---

## 9. Explicit non-goals (Phase 2)

- Dark mode / system theme switching
- Deep brand skins (nested full theme takeover)
- Motifs on every product card
- P1 component overrides
- Raw hex or `baseColors` in `apps/web`

---

## 10. Build checklist (Phase 2)

- [x] `packages/theme`: `palette.ts`, `typography.ts`, `shape.ts`, `spacing.ts`, `breakpoints.ts`, `components.ts`, module augmentation in `types.ts`, `fonts.css`, `theme.ts` (`cssVariables: true`)
- [x] Self-host Unbounded + Manrope via `next/font` (web app wires fonts; theme references families)
- [x] Semantic tokens tuned to this brief
- [x] Skin engine: `resolveSkin({ brand, country, category, slug })` + registry + Vitest
- [x] Storybook in `packages/theme` (10.4.6, `@storybook/react-vite`) with stories per section 8
