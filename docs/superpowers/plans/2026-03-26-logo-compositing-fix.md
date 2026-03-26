# Logo Nav Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the logo background appearing in the nav by removing the opacity animation from `motion.nav` (which created an isolated compositing context that broke `mix-blend-screen`) and switching to the correct logo file.

**Architecture:** Two targeted edits in `src/components/sections/hero.tsx`. The `motion.nav` at line 33 currently spreads `{...fadeUp(0)}` which includes `opacity: 0 → 1` — this forces a compositing context that prevents `mix-blend-screen` from blending against the page. Replacing it with a `y`-only animation removes that context. The logo `src` and `style` prop are updated in the same file. `src/lib/motion.ts` is not touched.

**Tech Stack:** Next.js App Router, framer-motion, Tailwind CSS v4

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/components/sections/hero.tsx:33–50` | Nav animation + logo src/filter |

---

## Task 1: Fix nav animation and logo

**Files:**
- Modify: `src/components/sections/hero.tsx:33–50`

**Current state of lines 33–50:**
```tsx
      <motion.nav
        {...fadeUp(0)}
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-14 py-4 transition-all duration-500 ${
          scrolled
            ? "bg-[#0D1F2E]/90 backdrop-blur-md border-b border-white/8"
            : ""
        }`}
      >
        <div className="bg-black mix-blend-screen">
          <Image
            src="/logos/AF_Logos_MareDatum-04.png"
            alt="MareDatum"
            width={130}
            height={52}
            style={{ filter: "invert(1)" }}
            priority
          />
        </div>
```

- [ ] **Step 1: Replace `{...fadeUp(0)}` with y-only animation props**

Change lines 33–40 from:
```tsx
      <motion.nav
        {...fadeUp(0)}
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-14 py-4 transition-all duration-500 ${
          scrolled
            ? "bg-[#0D1F2E]/90 backdrop-blur-md border-b border-white/8"
            : ""
        }`}
      >
```

To:
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

- [ ] **Step 2: Update logo — change src and remove invert filter**

Change lines 41–50 from:
```tsx
        <div className="bg-black mix-blend-screen">
          <Image
            src="/logos/AF_Logos_MareDatum-04.png"
            alt="MareDatum"
            width={130}
            height={52}
            style={{ filter: "invert(1)" }}
            priority
          />
        </div>
```

To:
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

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/marconadas/dev/projects/maredatum-landing && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Production build**

```bash
npm run build
```

Expected: build completes without errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/hero.tsx
git commit -m "fix: remove opacity from nav animation to fix logo mix-blend-screen, switch to -03 logo"
```

---

## Verification Checklist

- [ ] `npx tsc --noEmit` exits clean
- [ ] `npm run build` exits clean
- [ ] `npm run dev` → **at top of page (nav transparent):** logo renders as white/grey 3D wave with no black rectangle
- [ ] **On scroll (nav gets dark bg):** logo still renders cleanly
- [ ] **Mobile (375px):** logo renders without visible background
- [ ] Nav entrance: slides in from slightly above (no fade — expected behaviour)
- [ ] All other animated elements (headline, subtitle, CTA, scroll indicator) still fade+slide correctly — `fadeUp` in `motion.ts` is untouched
