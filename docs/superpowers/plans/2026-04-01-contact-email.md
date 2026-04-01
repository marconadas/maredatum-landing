# Contact Form Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add IP-based rate limiting (Upstash Redis) and reply-to header to the contact form Server Action, and document DNS records for domain verification.

**Architecture:** A dedicated `src/lib/ratelimit.ts` module owns the Upstash client and rate limiter instance. `contactAction` imports it, checks the limit before validation, and passes `replyTo` to Resend. DNS records are documented in a handoff file for Zé Luís Lucena.

**Tech Stack:** `@upstash/ratelimit`, `@upstash/redis`, Resend, Next.js Server Actions, Zod.

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/ratelimit.ts` | Create | Upstash Redis client + Ratelimit instance (sliding window, 3 req/hr) |
| `src/app/actions/contact.ts` | Modify | Import rate limiter, check IP before Zod, add replyTo to Resend call |
| `.env.local` | Modify | Add Upstash placeholder vars |
| `docs/dns-handoff.md` | Create | DNS records + instructions for Zé Luís Lucena |

---

## Task 1: Install dependencies

**Files:** `package.json`, `package-lock.json`

- [ ] **Step 1: Install Upstash packages**

```bash
npm install @upstash/ratelimit @upstash/redis
```

Expected: both packages appear in `package.json` dependencies.

- [ ] **Step 2: Verify install**

```bash
npm ls @upstash/ratelimit @upstash/redis
```

Expected: versions listed without errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add upstash ratelimit and redis dependencies"
```

---

## Task 2: Add environment variables

**Files:** `.env.local`

- [ ] **Step 1: Add Upstash placeholders to `.env.local`**

Append to `.env.local`:

```bash
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

> Get real values from: https://console.upstash.com → create a Redis database → REST API tab.

- [ ] **Step 2: Verify `.env.local` is in `.gitignore`**

```bash
grep ".env.local" .gitignore
```

Expected: `.env.local` is listed. If not, add it.

- [ ] **Step 3: No commit** — `.env.local` must never be committed.

---

## Task 3: Create rate limiter module

**Files:**
- Create: `src/lib/ratelimit.ts`

- [ ] **Step 1: Create `src/lib/ratelimit.ts`**

```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "60 m"),
  analytics: false,
})
```

`Redis.fromEnv()` reads `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` automatically.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/ratelimit.ts
git commit -m "feat: add upstash rate limiter module"
```

---

## Task 4: Add rate limiting to contactAction

**Files:**
- Modify: `src/app/actions/contact.ts`

- [ ] **Step 1: Read the current file before editing**

Open `src/app/actions/contact.ts` and confirm its current state.

- [ ] **Step 2: Update `contact.ts`**

Replace the entire file with:

```typescript
"use server"

import { headers } from "next/headers"
import { z } from "zod"
import { Resend } from "resend"
import { ratelimit } from "@/lib/ratelimit"

// TODO: Add honeypot or CAPTCHA if spam becomes an issue.

export type ContactActionState =
  | { status: "idle" }
  | { status: "error"; errors: Record<string, string[] | undefined> }
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
  // ── Rate limiting ─────────────────────────────────────────────────────────
  const headersList = await headers()
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown"

  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return {
      status: "serverError",
      message: "Demasiadas tentativas. Por favor aguarde antes de tentar novamente.",
    }
  }

  // ── Validation ────────────────────────────────────────────────────────────
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
      errors: result.error.flatten().fieldErrors as Record<string, string[] | undefined>,
    }
  }

  const { nome, email, empresa, assunto, mensagem } = result.data

  // ── Send email ────────────────────────────────────────────────────────────
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev", // Change to noreply@maredatum.pt after DNS verification
      to: "geral@maredatum.pt",
      replyTo: email,
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

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/actions/contact.ts
git commit -m "feat: add rate limiting and reply-to to contact action"
```

---

## Task 5: Manual smoke test

**Prerequisites:** Real Upstash credentials in `.env.local` (not placeholders).

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Submit the form once**

Open http://localhost:3000#contacto, fill in all fields, submit.
Expected: success state ("Mensagem recebida"), email arrives at `geral@maredatum.pt` with reply-to set to the submitted email address.

- [ ] **Step 3: Test rate limit**

Submit the form 3 more times (total 4 submissions from the same IP within a minute).
Expected: 4th submission shows "Demasiadas tentativas..." error message.

- [ ] **Step 4: Test validation**

Submit with empty fields.
Expected: field-level error messages appear.

---

## Task 6: Create DNS handoff document

**Files:**
- Create: `docs/dns-handoff.md`

- [ ] **Step 1: Add `maredatum.pt` domain in Resend dashboard**

Go to https://resend.com/domains → Add Domain → enter `maredatum.pt`.
Copy the exact DNS record values shown by Resend.

- [ ] **Step 2: Create `docs/dns-handoff.md`** with the real values from Resend:

```markdown
# DNS Records for maredatum.pt — Resend Verification

**Para:** Zé Luís Lucena
**Assunto:** Registos DNS para activar envio de email via maredatum.pt

## Registos a adicionar

| Tipo | Nome | Valor |
|------|------|-------|
| TXT | maredatum.pt | v=spf1 include:amazonses.com ~all |
| CNAME | resend._domainkey.maredatum.pt | [valor do Resend] |

## Notas

- MX records não são necessários (apenas enviamos, não recebemos por este domínio)
- Após aplicar os registos, a propagação demora entre 15 minutos e 24 horas
- Confirmar com Marco quando estiver feito para verificar no painel Resend

## Após verificação

Marco irá actualizar o remetente de `onboarding@resend.dev` para `noreply@maredatum.pt`.
```

- [ ] **Step 3: Commit**

```bash
git add docs/dns-handoff.md
git commit -m "docs: add DNS handoff document for Zé Luís Lucena"
```

---

## Task 7: Post-DNS — switch sender domain

> **Only do this after Zé Luís Lucena confirms DNS records are applied AND Resend dashboard shows the domain as verified.**

**Files:**
- Modify: `src/app/actions/contact.ts:` (the `from` field)

- [ ] **Step 1: Verify domain in Resend**

Go to https://resend.com/domains — status must show "Verified" for `maredatum.pt`.

- [ ] **Step 2: Update `from` in `contact.ts`**

Change:
```typescript
from: "onboarding@resend.dev", // Change to noreply@maredatum.pt after DNS verification
```
To:
```typescript
from: "MareDatum <noreply@maredatum.pt>",
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit and deploy**

```bash
git add src/app/actions/contact.ts
git commit -m "feat: switch email sender to noreply@maredatum.pt"
git push
```

Deploy on Vercel will trigger automatically if CI is configured, otherwise deploy manually from Vercel dashboard.

---

## Vercel Environment Variables Checklist

Before going live, add these in Vercel dashboard → Project Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | From resend.com → API Keys |
| `UPSTASH_REDIS_REST_URL` | From console.upstash.com → database → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | From console.upstash.com → database → REST API |
