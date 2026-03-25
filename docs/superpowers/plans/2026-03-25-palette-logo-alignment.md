# Palette Logo Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 5 brand colour tokens in `globals.css` with values derived from the MareDatum logo, and update the one hardcoded background reference in `hero.tsx`.

**Architecture:** Two-file change. All components consume `md-*` Tailwind tokens, so updating the `@theme` block in `globals.css` propagates everywhere automatically. The only hardcoded hex that bypasses the token system is the nav scroll background in `hero.tsx:37`.

**Tech Stack:** Tailwind CSS v4 (CSS-first, `@theme` block), Next.js App Router

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/app/globals.css:120–127` | Replace 5 brand colour tokens (`@theme` block) |
| Modify | `src/components/sections/hero.tsx:37` | Replace hardcoded nav background hex |

---

## Task 1: Update brand colour tokens and hardcoded reference

**Files:**
- Modify: `src/app/globals.css:120–127`
- Modify: `src/components/sections/hero.tsx:37`

**Tailwind v4 note:** Brand tokens live in a plain `@theme` block (not `@theme inline`) near the bottom of `globals.css`, labelled `/* MareDatum brand tokens */`. Edit only that block — do not touch the `@theme inline` block above it (shadcn internals).

**Colour reference (logo-derived):**

| Token | Before | After |
|---|---|---|
| `--color-md-bg` | `#0A1628` | `#0D1F2E` |
| `--color-md-surface` | `#142240` | `#132333` |
| `--color-md-blue` | `#1D6FA4` | `#3A9EC8` |
| `--color-md-accent` | `#4B9FFF` | `#2ABDD4` |
| `--color-md-gold` | `#F5A623` | `#F5B500` |

- [ ] **Step 1: Update the `@theme` block in `globals.css`**

Replace lines 122–126 so the block reads:

```css
/* MareDatum brand tokens */
@theme {
  --color-md-bg:      #0D1F2E;
  --color-md-surface: #132333;
  --color-md-blue:    #3A9EC8;
  --color-md-accent:  #2ABDD4;
  --color-md-gold:    #F5B500;
}
```

- [ ] **Step 2: Update the hardcoded nav background in `hero.tsx`**

In `src/components/sections/hero.tsx` at line 37, change:

```tsx
? "bg-[#0A1628]/90 backdrop-blur-md border-b border-white/8"
```

to:

```tsx
? "bg-[#0D1F2E]/90 backdrop-blur-md border-b border-white/8"
```

- [ ] **Step 3: Verify no old hex values remain**

```bash
grep -r '#0A1628\|#142240\|#1D6FA4\|#4B9FFF\|#F5A623' src/
```

Expected: zero results.

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/marconadas/dev/projects/maredatum-landing && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Production build**

```bash
npm run build
```

Expected: build completes without errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/components/sections/hero.tsx
git commit -m "feat: align brand palette with logo colours (gold, teal, blue, bg)"
```

---

## Verification Checklist

- [ ] `grep` for old hex values returns zero results
- [ ] `npx tsc --noEmit` exits clean
- [ ] `npm run build` exits clean
- [ ] `npm run dev` → hero background reads oceanic navy (not void-black)
- [ ] Gold CTA button reads solar-yellow (not amber-orange)
- [ ] Nav scrolled background matches page background seamlessly
