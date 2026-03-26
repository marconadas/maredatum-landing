# Logo Nav Fix — Design Spec

**Date:** 2026-03-26
**Project:** MareDatum Landing Page

---

## Problem

All MareDatum logo PNGs have opaque backgrounds (black or white). `mix-blend-screen` would solve this by making black pixels transparent, but `motion.nav` uses an `opacity: 0 → 1` entrance animation which forces the browser to create an isolated compositing context. Inside that context, `mix-blend-screen` blends against a transparent background instead of the actual page — so the logo's opaque background remains visible.

---

## Solution

Remove `opacity` from the `motion.nav` entrance animation. Without an opacity animation, no isolated compositing context is created. `mix-blend-screen` on the logo wrapper then blends directly against the page content behind the nav (the `#0D1F2E` background + Three.js dots animation).

---

## Changes

### `src/components/sections/hero.tsx`

**1. Nav animation** — replace `{...fadeUp(0)}` spread with explicit props that use only a `y` transform (no opacity):

```tsx
<motion.nav
  initial={{ y: -8 }}
  animate={{ y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
  className={`fixed top-0 left-0 right-0 z-50 ...`}
>
```

- `fadeUp` is NOT modified in `src/lib/motion.ts` — other elements that use `fadeUp` are unaffected
- The nav entrance becomes a subtle 8px slide-down instead of fade+slide

**2. Logo element** — replace current logo markup with a `mix-blend-screen` wrapper around `-03.png`:

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

- `AF_Logos_MareDatum-03.png` is the 3D monochrome logo (grey/white wave on black background)
- `bg-black` matches the logo's own black background exactly
- `mix-blend-screen` on the wrapper: black areas → transparent (blends to page bg), grey/white areas → logo mark shows

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
3. `npm run dev` → scroll to top:
   - Logo renders as white/grey wave mark with no visible rectangle behind it
   - On scroll (nav gets `bg-[#0D1F2E]/90`): logo still renders cleanly
   - Nav entrance: slides in from slightly above (no fade — expected)
