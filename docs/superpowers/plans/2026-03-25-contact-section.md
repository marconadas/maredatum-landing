# Contact Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a split-layout contact section with a Server Action form (Resend delivery) to the MareDatum landing page.

**Architecture:** A `"use server"` action in `src/app/actions/contact.ts` validates with Zod and sends email via Resend. A `"use client"` component in `src/components/sections/contact.tsx` uses `useActionState` for form state. The section is appended to `page.tsx` after `<Hero />`.

**Tech Stack:** Next.js 16 Server Actions, React 19 `useActionState`, Zod, Resend SDK, framer-motion, lucide-react, Tailwind CSS v4

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/lib/motion.ts` | Shared motion helpers: `fadeUp` (mount-based) and `fadeUpScroll` (scroll-reveal) |
| Create | `src/app/actions/contact.ts` | Server Action + Zod schema + `ContactActionState` type |
| Create | `src/components/sections/contact.tsx` | Contact section UI component |
| Modify | `src/app/page.tsx` | Add `<Contact />` after `<Hero />` |
| Modify | `src/components/sections/hero.tsx` | Import `fadeUp` from `src/lib/motion.ts` instead of local definition |

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install resend and zod**

Run from the project root (`/Users/marconadas/dev/projects/maredatum-landing`):

```bash
npm install resend zod
```

Expected output: `added N packages` with no errors.

- [ ] **Step 2: Verify packages are in dependencies**

```bash
cat package.json | grep -E '"resend|"zod'
```

Expected: both keys appear under `"dependencies"`.

- [ ] **Step 3: Set up .env.local**

Create `.env.local` in the project root (if it doesn't exist):

```env
RESEND_API_KEY=re_placeholder_replace_before_testing
```

> **Note:** During development without a real key the Server Action will fail with a Resend auth error — this is expected. Replace with a real key from resend.com to test email delivery. The `from` address must be `onboarding@resend.dev` in sandbox mode (before DNS verification of `maredatum.pt`). `.env.local` is already in `.gitignore` by default in Next.js — do NOT commit it.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add resend and zod dependencies"
```

---

## Task 2: Extract shared motion helpers

The `fadeUp` helper is currently defined inline in `hero.tsx`. Extract it — and add a scroll-reveal variant `fadeUpScroll` — so both can be shared across sections.

**Important distinction:**
- `fadeUp(delay)` uses `animate` — fires immediately on mount. Used in the hero (always visible on load).
- `fadeUpScroll(delay)` uses `whileInView` — fires when element enters the viewport. Used in sections further down the page. Do NOT mix `animate` from `fadeUp` with `whileInView` — they conflict.

**Files:**
- Create: `src/lib/motion.ts`
- Modify: `src/components/sections/hero.tsx` (replace local definition with import)

- [ ] **Step 1: Create `src/lib/motion.ts`**

```ts
// fadeUp: animates on mount (use for above-the-fold elements like Hero)
export const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  },
})

// fadeUpScroll: animates when element enters the viewport (use for below-the-fold sections)
export const fadeUpScroll = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  },
  viewport: { once: true as const },
})
```

- [ ] **Step 2: Update `hero.tsx` to import from the shared helper**

Remove the local `fadeUp` function definition (lines 8–15 of `hero.tsx`) and add the import at the top after the existing imports:

```ts
import { fadeUp } from "@/lib/motion"
```

The rest of `hero.tsx` is unchanged — `fadeUp` is called identically throughout.

- [ ] **Step 3: Verify the dev server compiles cleanly**

```bash
npm run dev
```

Open `http://localhost:3000` — hero animations should still work. No console errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/motion.ts src/components/sections/hero.tsx
git commit -m "refactor: extract motion helpers to src/lib/motion.ts, add fadeUpScroll variant"
```

---

## Task 3: Create the Server Action

**Files:**
- Create: `src/app/actions/contact.ts`

- [ ] **Step 1: Create `src/app/actions/contact.ts`**

```ts
"use server"

import { z } from "zod"
import { Resend } from "resend"

// TODO: Add IP-based rate limiting (e.g., next-rate-limit) to prevent
// Resend quota exhaustion from automated form submissions.

export type ContactActionState =
  | { status: "idle" }
  | { status: "error"; errors: Record<string, string[]> }
  | { status: "serverError"; message: string }
  | { status: "success" }

const contactSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  empresa: z.string().min(2, "Empresa deve ter pelo menos 2 caracteres"),
  assunto: z.string().min(3, "Assunto deve ter pelo menos 3 caracteres"),
  mensagem: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
})

const resend = new Resend(process.env.RESEND_API_KEY)

export async function contactAction(
  _prevState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const raw = {
    nome: formData.get("nome"),
    email: formData.get("email"),
    empresa: formData.get("empresa"),
    assunto: formData.get("assunto"),
    mensagem: formData.get("mensagem"),
  }

  const result = contactSchema.safeParse(raw)

  if (!result.success) {
    return {
      status: "error",
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { nome, email, empresa, assunto, mensagem } = result.data

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev", // Change to noreply@maredatum.pt after DNS verification
      to: "geral@maredatum.pt",
      subject: `[MareDatum] Novo contacto: ${assunto}`,
      text: `Nome: ${nome}\nEmail: ${email}\nEmpresa: ${empresa}\nAssunto: ${assunto}\n\n${mensagem}`,
    })

    return { status: "success" }
  } catch (err) {
    console.error("[contactAction] Resend error:", err)
    return {
      status: "serverError",
      message: "Não foi possível enviar a mensagem. Por favor tente novamente.",
    }
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/actions/contact.ts
git commit -m "feat: add contact server action with Zod validation and Resend delivery"
```

---

## Task 4: Create the Contact section component

**Files:**
- Create: `src/components/sections/contact.tsx`

Use `fadeUpScroll` (not `fadeUp`) for all motion elements — this fires on scroll into view, not on mount.

- [ ] **Step 1: Create `src/components/sections/contact.tsx`**

```tsx
"use client"

import { useActionState } from "react"
import { motion } from "framer-motion"
import { Mail, MapPin, CheckCircle } from "lucide-react"
import { contactAction, type ContactActionState } from "@/app/actions/contact"
import { fadeUpScroll } from "@/lib/motion"

const initialState = { status: "idle" } satisfies ContactActionState

function FieldError({ errors, field }: { errors?: Record<string, string[]>; field: string }) {
  const msgs = errors?.[field]
  if (!msgs?.length) return null
  return <p className="text-red-400 text-xs mt-1">{msgs[0]}</p>
}

export function Contact() {
  const [state, dispatch, isPending] = useActionState(contactAction, initialState)

  return (
    <section id="contacto" className="bg-md-bg border-t border-white/8 py-24 px-8 md:px-14">
      <div className="max-w-5xl mx-auto grid md:grid-cols-[2fr_3fr] gap-16">

        {/* Left column — institutional info */}
        <div className="flex flex-col justify-center">
          <motion.p
            {...fadeUpScroll(0)}
            className="text-xs tracking-widest uppercase text-white/40 mb-4"
          >
            Contacto
          </motion.p>

          <motion.h2
            {...fadeUpScroll(0.1)}
            className="text-3xl md:text-4xl font-light tracking-tight text-white mb-4"
          >
            Fale connosco.
          </motion.h2>

          <motion.p
            {...fadeUpScroll(0.2)}
            className="text-sm text-white/55 leading-relaxed mb-10"
          >
            Estamos disponíveis para discutir o seu projecto.
          </motion.p>

          <motion.div
            {...fadeUpScroll(0.3)}
            className="flex flex-col gap-4"
          >
            <a
              href="mailto:geral@maredatum.pt"
              className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors duration-200"
            >
              <Mail size={16} className="text-md-gold shrink-0" />
              geral@maredatum.pt
            </a>

            <div className="flex items-center gap-3 text-sm text-white/60">
              <MapPin size={16} className="text-md-gold shrink-0" />
              Lisboa · Luanda
            </div>

            {/* LinkedIn — add href when URL is available
            <a href="https://linkedin.com/company/maredatum" ...>
              <Linkedin size={16} />
              LinkedIn
            </a>
            */}
          </motion.div>
        </div>

        {/* Right column — form */}
        <motion.div {...fadeUpScroll(0.15)}>
          {state.status === "success" ? (
            <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
              <CheckCircle size={40} className="text-md-gold" />
              <p className="text-white/80 text-sm leading-relaxed">
                Mensagem enviada.<br />Entraremos em contacto brevemente.
              </p>
            </div>
          ) : (
            <form action={dispatch} className="flex flex-col gap-5">

              {state.status === "serverError" && (
                <p className="text-red-400 text-sm mb-4">{state.message}</p>
              )}

              {/* Nome */}
              <div>
                <label htmlFor="nome" className="block text-xs tracking-widest uppercase text-white/50 mb-1.5">
                  Nome
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  autoComplete="name"
                  className="w-full bg-md-surface border border-white/10 rounded-sm text-white placeholder:text-white/30 text-sm px-4 py-3 focus:border-md-gold focus:outline-none transition-colors duration-200"
                />
                <FieldError errors={state.status === "error" ? state.errors : undefined} field="nome" />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs tracking-widest uppercase text-white/50 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="w-full bg-md-surface border border-white/10 rounded-sm text-white placeholder:text-white/30 text-sm px-4 py-3 focus:border-md-gold focus:outline-none transition-colors duration-200"
                />
                <FieldError errors={state.status === "error" ? state.errors : undefined} field="email" />
              </div>

              {/* Empresa */}
              <div>
                <label htmlFor="empresa" className="block text-xs tracking-widest uppercase text-white/50 mb-1.5">
                  Empresa
                </label>
                <input
                  id="empresa"
                  name="empresa"
                  type="text"
                  autoComplete="organization"
                  className="w-full bg-md-surface border border-white/10 rounded-sm text-white placeholder:text-white/30 text-sm px-4 py-3 focus:border-md-gold focus:outline-none transition-colors duration-200"
                />
                <FieldError errors={state.status === "error" ? state.errors : undefined} field="empresa" />
              </div>

              {/* Assunto */}
              <div>
                <label htmlFor="assunto" className="block text-xs tracking-widest uppercase text-white/50 mb-1.5">
                  Assunto
                </label>
                <input
                  id="assunto"
                  name="assunto"
                  type="text"
                  className="w-full bg-md-surface border border-white/10 rounded-sm text-white placeholder:text-white/30 text-sm px-4 py-3 focus:border-md-gold focus:outline-none transition-colors duration-200"
                />
                <FieldError errors={state.status === "error" ? state.errors : undefined} field="assunto" />
              </div>

              {/* Mensagem */}
              <div>
                <label htmlFor="mensagem" className="block text-xs tracking-widest uppercase text-white/50 mb-1.5">
                  Mensagem
                </label>
                <textarea
                  id="mensagem"
                  name="mensagem"
                  rows={5}
                  className="w-full bg-md-surface border border-white/10 rounded-sm text-white placeholder:text-white/30 text-sm px-4 py-3 focus:border-md-gold focus:outline-none transition-colors duration-200 resize-none"
                />
                <FieldError errors={state.status === "error" ? state.errors : undefined} field="mensagem" />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-white/8 hover:bg-white/14 border border-white/20 hover:border-white/40 text-white text-xs tracking-widest uppercase rounded-sm px-10 py-3.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "A enviar..." : "Enviar mensagem"}
                </button>
              </div>

            </form>
          )}
        </motion.div>

      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/contact.tsx
git commit -m "feat: add Contact section component with split layout and form state"
```

---

## Task 5: Wire Contact into the page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update `src/app/page.tsx`**

```tsx
import { Hero } from "@/components/sections/hero"
import { Contact } from "@/components/sections/contact"
import { DottedSurface } from "@/components/ui/dotted-surface"

export default function Home() {
  return (
    <main>
      <DottedSurface />
      <Hero />
      <Contact />
    </main>
  )
}
```

- [ ] **Step 2: Verify dev server builds and renders**

```bash
npm run dev
```

Open `http://localhost:3000`. Scroll to the bottom — the contact section should be visible with the split layout. Verify:
- Left column shows eyebrow, headline, subtext, email, and location
- Right column shows the 5-field form
- Mobile (resize to < 768px): single column, info above form
- Left column content fades in when scrolled into view

- [ ] **Step 3: Test validation errors**

In the browser, click "Enviar mensagem" with all fields empty. Verify:
- Field-level error messages appear below each input in red
- Form does not submit (stays on screen)

- [ ] **Step 4: Test success flow (optional — requires valid RESEND_API_KEY)**

Fill in all fields with valid data and submit. If `RESEND_API_KEY` is set to a real key:
- Button shows "A enviar..." while pending
- On success: form is replaced by CheckCircle icon + confirmation text

If `RESEND_API_KEY` is the placeholder, the Server Action returns a server error banner — expected behaviour.

- [ ] **Step 5: Run production build**

```bash
npm run build
```

Expected: build completes without TypeScript or lint errors. The output will show the route table with `/` listed.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire Contact section into landing page"
```

---

## Verification Checklist

After all tasks complete:

- [ ] `npm run build` completes without errors
- [ ] `npx tsc --noEmit` exits clean
- [ ] `npm run lint` exits clean
- [ ] Nav "Contacto" link scrolls smoothly to `#contacto`
- [ ] Empty form submission shows all 5 field errors
- [ ] Form button disabled and shows "A enviar..." during submission
- [ ] Success state replaces form with confirmation message
- [ ] Server error state shows red banner above submit button
- [ ] Layout is two-column on desktop, single-column on mobile
- [ ] Scroll-reveal animations trigger when section enters viewport (not on mount)
- [ ] `.env.local` is NOT committed — verify with `git status`

---

## Notes

- **Resend from address:** Use `onboarding@resend.dev` until DNS records for `maredatum.pt` are verified in the Resend dashboard. After verification, change to `noreply@maredatum.pt` in `contact.ts`.
- **Rate limiting:** The Server Action has no inbound rate limiting. Add `next-rate-limit` or similar before going to production to prevent Resend quota exhaustion.
- **LinkedIn:** A JSX comment placeholder is left in `contact.tsx` — uncomment and add the URL when available.
- **Motion variants:** `fadeUp` (in `src/lib/motion.ts`) uses `animate` for mount-based animation (hero). `fadeUpScroll` uses `whileInView` for scroll-triggered animation (contact and future sections). Never mix `fadeUp` with `whileInView`.
