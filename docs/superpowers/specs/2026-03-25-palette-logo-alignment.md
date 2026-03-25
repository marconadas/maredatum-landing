# Palette Logo Alignment — Design Spec

**Date:** 2026-03-25
**Project:** MareDatum Landing Page

---

## Goal

Align the landing page colour palette with the actual colours of the MareDatum logo. Every token should have a direct anchor in the logo mark (sun gradient + wave teal + "MARE DATUM" text blue).

---

## Logo Colour Analysis

The logo contains three distinct colour families:

| Element | Representative Hex | Notes |
|---|---|---|
| Sun gradient (top) | `#FFD43B` | Bright solar yellow |
| Sun gradient (midpoint) | `#F5B500` | Dominant visual impression of the sun |
| Sun gradient (bottom/amber) | `#F5A023` | Transition into wave |
| Wave teal (highlight) | `#2ABDD4` | Most saturated, representative wave colour |
| Wave teal (deep) | `#0F9EC0` | Darker wave base |
| "MARE DATUM" text | `#3A9EC8` | Medium maritime blue |

---

## Token Changes

### `src/app/globals.css`

| Token | Before | After | Logo anchor |
|---|---|---|---|
| `md-bg` | `#0A1628` | `#0D1F2E` | Deep ocean — darker variant of wave family, +luminosity, teal-shifted |
| `md-surface` | `#142240` | `#132333` | Same deep ocean family, less indigo |
| `md-blue` | `#1D6FA4` | `#3A9EC8` | Exact match to "MARE DATUM" text |
| `md-accent` | `#4B9FFF` | `#2ABDD4` | Wave teal — representative wave colour |
| `md-gold` | `#F5A623` | `#F5B500` | Solar gold — midpoint of sun gradient |

### `src/components/sections/hero.tsx`

One hardcoded colour reference that bypasses the token system must be updated to match the new `md-bg`:

| Location | Before | After |
|---|---|---|
| Nav scroll background (`hero.tsx:37`) | `bg-[#0A1628]/90` | `bg-[#0D1F2E]/90` |

**Note on radial gradient overlay (`hero.tsx:133`):** The hero section contains an inline `radial-gradient` with `rgba(26,58,106,0.45)` — a hardcoded decorative depth overlay unrelated to the brand palette. This is intentionally out of scope: it is a one-off visual effect, not a brand colour, and changing it would alter the hero's depth appearance without palette benefit.

---

## Propagation

All other components (`contact.tsx`, inputs, buttons, borders, section dividers) already consume `md-*` tokens via Tailwind classes. No further changes needed — the two files above cover the entire update.

**Token format:** New hex values remain in hex (consistent with the existing `@theme` brand token block). No conversion to `oklch` required.

---

## Out of Scope

- Typography changes
- Layout changes
- Adding new tokens
- Changing any component structure

---

## Verification

1. **Grep for old hex values** — after applying changes, run:
   ```bash
   grep -r '#0A1628\|#142240\|#1D6FA4\|#4B9FFF\|#F5A623' src/
   ```
   Expected: zero results — all old hex values will have been replaced, leaving no stale hardcoded references in `src/`.

2. `npx tsc --noEmit` exits clean.

3. `npm run build` exits clean.

4. `npm run dev` → visual check:
   - Hero background reads as oceanic navy (not void-black)
   - Gold CTA button reads solar-yellow (not amber-orange)
   - Nav background on scroll matches the page background seamlessly
