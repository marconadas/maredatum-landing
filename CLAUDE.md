# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project:** MareDatum Landing Page
**Organisation:** MareDatum Consultoria e Gestão de Projectos Unipessoal LDA
**Primary motto:** **"A Excelência ao serviço da economia azul."**

## Status

The Next.js project has not been scaffolded yet. To initialise:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npx shadcn@latest init
```

## Commands

Once scaffolded, use these standard commands:

```bash
npm run dev       # start dev server (localhost:3000)
npm run build     # production build
npm run lint      # ESLint
npm run typecheck # tsc --noEmit (add to package.json scripts)
```

No test runner is configured yet. Add Playwright for E2E via `.mcp.json`'s playwright MCP.

## Stack

- **Next.js** (App Router) + **TypeScript** strict
- **Tailwind CSS** — utility-first, strong design discipline required
- **shadcn/ui** — use as foundation only; every component must be restyled to MareDatum identity
- **Radix UI** — accessible primitives for menus, tabs, dialogs
- **Motion** (`motion.dev`) — tasteful polish only, not spectacle
- **Lenis** — smooth scroll, optional; remove if it doesn't materially improve the experience
- **Lucide** — restrained iconography

Stack rationale is in `docs/frontend-stack-research.md`.

## Architecture

App Router structure expected:

```
src/
  app/
    layout.tsx        # root layout, fonts, providers
    page.tsx          # single-page landing (all sections)
  components/
    sections/         # Hero, Positioning, Domains, Technology, Credibility, Contact
    ui/               # restyled shadcn primitives
  lib/                # utilities, motion variants, constants
```

The landing page is a **single scrolling page** — no routing needed beyond the root. All content lives in `app/page.tsx` composed from section components.

## Section Architecture

Six strategic sections — each must justify its existence:

1. **Hero** — motto, immediate brand positioning
2. **Positioning** — what MareDatum does (company above projects)
3. **Strategic Domains** — Neptune (MDA/Angola), CEFOPECAS aquaculture (Luanda), Portugal expansion
4. **Data & Technology** — capability signal, not buzzwords
5. **Credibility** — institutional trust
6. **Contact / CTA** — minimal friction

## Core Business Context

MareDatum is not Neptune alone. The landing must position the company first, then its initiatives:

- **Neptune** — Maritime Domain Awareness for Angola
- **CEFOPECAS pilot** — aquaculture project in Luanda
- **Portugal market** — expansion into the Portuguese Blue Economy ecosystem

## Brand & Tone

- Calm authority, institutional clarity, premium restraint
- No startup hype, no buzzword soup, no empty futurism
- If a section looks like a generic SaaS landing page, redesign it

## Design Guardrails

- Deep maritime blues as structural base; accent color used sparingly
- Strong headline hierarchy; typography and spacing do the heavy lifting
- No random gradients, excessive glassmorphism, or childish illustrations
- Motion: scroll reveals and subtle transitions only — no animation that delays comprehension
- Lenis: only if scroll rhythm genuinely benefits from extra smoothness

## Anti-vibecoding Rules

1. No default shadcn look left untouched.
2. No overuse of gradients.
3. No decorative motion without narrative purpose.
4. No section without strategic value.
5. No "AI / innovation / future" filler copy.
6. Mobile-first; desktop-premium.

## MCPs

Local `.mcp.json` configures: `filesystem`, `playwright`, `browsermcp`, `shadcn`, `sequential-thinking`, `github`, `firecrawl`. Prefer these over raw web searches for component lookup (`shadcn`) and visual verification (`playwright`/`browsermcp`).
