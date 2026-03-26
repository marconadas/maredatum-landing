# Logo Nav Fix — Design Spec

**Date:** 2026-03-26
**Project:** MareDatum Landing Page

---

## Problem

All MareDatum logo PNGs have opaque backgrounds (black or white). `mix-blend-screen` would solve this by making black pixels transparent, but `motion.nav` uses an `opacity: 0 → 1` entrance animation which forces the browser to create an isolated compositing context. Inside that context, `mix-blend-screen` blends against a transparent background instead of the actual page — so the logo's opaque background remains visible.

---

## Current State

`hero.tsx` currently has:
- `{...fadeUp(0)}` on `motion.nav` (includes `opacity: 0 → 1` — this is the root cause)
- Logo: `AF_Logos_MareDatum-04.png` inside a `bg-black mix-blend-screen` wrapper, with `style={{ filter: "invert(1)" }}` on the `<Image>` tag

The `bg-black mix-blend-screen` wrapper already exists. The two things that need to change are: the nav animation and the logo source/filter.

---

## Solution

Remove `opacity` from the `motion.nav` entrance animation. Without an opacity animation, no isolated compositing context is created. `mix-blend-screen` on the existing logo wrapper then blends directly against the page content behind the nav.

---

## Changes

### `src/components/sections/hero.tsx` — two edits only

**1. Nav animation** — replace `{...fadeUp(0)}` with explicit props using only a `y` transform (no opacity). Keep the full `className` string exactly as-is:

```tsx
<motion.nav
  initial={{ y: -8 }}
  animate={{ y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
  className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-14 py-4 transition-all duration-500 ${
    scrolled
      ? "bg-[#0D1F2E]/90 backdrop-blur-md border-b border-white/8"
      : ""
  }`}
>
```

- `fadeUp` in `src/lib/motion.ts` is **not modified** — other elements using `fadeUp` are unaffected
- Nav entrance becomes a subtle 8px slide-in from above (no fade — expected behaviour)

**2. Logo** — inside the existing `bg-black mix-blend-screen` wrapper:
- Change `src` from `AF_Logos_MareDatum-04.png` → `AF_Logos_MareDatum-03.png`
- **Remove** `style={{ filter: "invert(1)" }}` — `-03.png` is already white/grey on black; inverting it would corrupt the tones

Final logo markup:

```tsx
<div className="bg-black mix-blend-screen">
  <Image
    src="/logos/AF_Logos_MareDatum-03.png"
    alt="MareDatum"
    width={130}
    height={52}
    priority
  />
</div>
```

---

## Files

| Action | Path |
|--------|------|
| Modify | `src/components/sections/hero.tsx` |

`src/lib/motion.ts` is **not touched**.

---

## Verification

1. `npx tsc --noEmit` — no errors
2. `npm run build` — clean
3. `npm run dev` → visual check:
   - **At top (nav transparent):** logo renders as white/grey 3D wave mark with no visible black rectangle
   - **On scroll (nav gets `bg-[#0D1F2E]/90`):** logo still renders cleanly — the semi-transparent nav bg is dark enough that any blend difference is imperceptible
   - Nav entrance: slides in from slightly above (no fade — expected)
   - All other animated elements (headline, subtitle, CTA, scroll indicator) still fade+slide as before
