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

Two hardcoded colour references that bypass the token system must be updated to match the new `md-bg`:

| Location | Before | After |
|---|---|---|
| Nav scroll background | `bg-[#0A1628]/90` | `bg-[#0D1F2E]/90` |
| Logo blend wrapper | `bg-[#0F1828]` | `bg-[#0D1F2E]` |

---

## Propagation

All other components (`contact.tsx`, inputs, buttons, borders, section dividers) already consume `md-*` tokens via Tailwind classes. No further changes needed — the two files above cover the entire update.

---

## Out of Scope

- Typography changes
- Layout changes
- Adding new tokens
- Changing any component structure

---

## Verification

- `npm run build` exits clean
- `npm run dev` → visual check: hero background reads as oceanic navy (not void-black), gold CTA reads solar (not amber-orange), teal accent visible in any `md-accent` usage, nav logo wrapper seamless
