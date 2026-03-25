# Contact Section — Design Spec

**Date:** 2026-03-25
**Project:** MareDatum Landing Page
**Section:** `#contacto`

---

## Overview

A split-layout contact section appended to the single-page landing. The section allows institutional visitors to reach MareDatum via a qualified lead form. Email delivery is handled by Resend through a Next.js Server Action.

---

## Layout

### Desktop (md+)

Two-column grid: `grid md:grid-cols-[2fr_3fr] gap-16`

**Left column — institutional info:**
- Eyebrow label: "Contacto" (small, tracking-widest, text-white/40)
- Headline: "Fale connosco." (large, font-light, text-white)
- Short subtext: "Estamos disponíveis para discutir o seu projecto." (text-white/55)
- Contact details (Lucide icons):
  - Email: `geral@maredatum.pt`
  - Location: `Lisboa · Luanda`
- LinkedIn: hidden until URL is available (comment in JSX)

**Right column — form:**
- Fields (in order): Nome, Email, Empresa, Assunto, Mensagem
- Submit button: "Enviar mensagem"
- Success state: form replaced by inline confirmation message

### Mobile

Single column. Institutional info stacked above the form.

---

## Form Fields

| Field     | Type     | Required | Validation        |
|-----------|----------|----------|-------------------|
| Nome      | text     | yes      | min 2 chars       |
| Email     | email    | yes      | valid email format|
| Empresa   | text     | yes      | min 2 chars       |
| Assunto   | text     | yes      | min 3 chars       |
| Mensagem  | textarea | yes      | min 10 chars      |

---

## Technology

### TypeScript Types

Define in `src/app/actions/contact.ts` (exported for use in the client component):

```ts
export type ContactActionState =
  | { status: "idle" }
  | { status: "error"; errors: Record<string, string[]> }
  | { status: "serverError"; message: string }
  | { status: "success" }
```

The `initialState` passed to `useActionState` is `{ status: "idle" } satisfies ContactActionState`.

### Server Action

File: `src/app/actions/contact.ts`

- Marked `"use server"`
- Accepts `ContactActionState` (prev state) and `FormData`
- Validates with Zod; on failure returns `{ status: "error", errors: z.inferFlattenedErrors<typeof schema>["fieldErrors"] }`
- On Resend failure returns `{ status: "serverError", message: "..." }`
- On success returns `{ status: "success" }`

### Form state (client)

```ts
const [state, dispatch, isPending] = useActionState(contactAction, { status: "idle" })
```

- `isPending` (third return value from `useActionState`, React 19 / Next.js 15) controls button disabled state and label ("A enviar..." when true)
- No `useFormStatus` needed — `isPending` from `useActionState` is sufficient

### Email delivery

- **Provider:** Resend (`resend` npm package)
- **API key:** `RESEND_API_KEY` in `.env.local` (never committed; already in `.gitignore` by default in Next.js)
- **To:** `geral@maredatum.pt`
- **From:** `noreply@maredatum.pt` — requires DNS verification on the Resend dashboard before the first send; during development use Resend's sandbox `onboarding@resend.dev` as the from address
- **Subject:** `[MareDatum] Novo contacto: {assunto}`
- **Body:** plain-text listing all submitted fields

**Security note:** Resend rate-limits outbound API calls, not inbound form requests. A script hammering the Server Action can exhaust the Resend quota. This is a known gap; mitigation (e.g., IP-based rate limiting via `next-rate-limit`) is deferred to a follow-up. Add a TODO comment in the action file.

### No client-side form library

Use native `<form action={dispatch}>` elements only — no React Hook Form or Formik.

---

## Visual Design

**Tailwind opacity note:** This project's Tailwind v4 setup accepts bare integer opacity modifiers (e.g., `bg-white/8`, `border-white/10`, `text-white/55`) consistent with `hero.tsx`. These are not bracket-syntax — they resolve to the percentage value directly (8 = 8%). This convention is intentional; do not convert to bracket notation.

- Section root: `<section id="contacto">` — the `id` lives on the element inside `contact.tsx`, not passed as a prop from `page.tsx`
- Section background: `bg-md-bg` (continuous with page — no colour break)
- Top border: `border-t border-white/8` (raw opacity, intentionally not a token — same pattern as nav in `hero.tsx`)
- Padding: `py-24 px-8 md:px-14`
- Inputs: `bg-md-surface border border-white/10 rounded-sm text-white placeholder:text-white/30`
- Input focus ring: `focus:border-md-gold focus:outline-none`
- Labels: `text-xs tracking-widest uppercase text-white/50`
- Submit button: matches hero CTA — `bg-white/8 hover:bg-white/14 border border-white/20 hover:border-white/40 text-white text-xs tracking-widest uppercase rounded-sm px-10 py-3.5 transition-all duration-300`
- Error messages: `text-red-400 text-xs mt-1`
- Server error banner: `text-red-400 text-sm mb-4`
- Success state: centred checkmark icon (Lucide `CheckCircle`) + "Mensagem enviada. Entraremos em contacto brevemente." in `text-white/80`

### Motion

The section uses `framer-motion` scroll-reveal. Wrap headline, subtext, contact info block, and form in `motion.div` using a `fadeUpScroll(delay)` helper — which uses `whileInView` (not `animate`) so animation triggers on scroll, not on mount. Extract both `fadeUp` (mount-based, for hero) and `fadeUpScroll` (scroll-reveal, for below-the-fold sections) to `src/lib/motion.ts`. Do NOT use `fadeUp` in the contact section — mixing the `animate` key with `whileInView` causes both to fire and breaks scroll-reveal.

---

## Error Handling

- Field errors: shown inline below each field, keyed by field name from `state.errors`
- Server error: `state.status === "serverError"` → banner above the submit button
- Network error: caught in the Server Action's try/catch, returned as `serverError`

---

## File Structure

```
src/
  app/
    actions/
      contact.ts          # Server Action + Zod schema + ContactActionState type
  components/
    sections/
      contact.tsx         # Section component ("use client")
```

`<Contact />` is added to `src/app/page.tsx` after `<Hero />`. No `id` prop needed — `id="contacto"` is on the `<section>` inside `contact.tsx`.

---

## Environment Variables

```env
# .env.local
RESEND_API_KEY=re_...
```

`.env.local` is in `.gitignore` by default in Next.js projects.

---

## Out of Scope

- File attachments
- CAPTCHA / bot protection (deferred — see security note above)
- LinkedIn link (markup placeholder left as hidden comment until URL is available)
- Multi-language support
