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

// Lazily instantiate so the page can render in dev without secrets.
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    throw new Error("RESEND_API_KEY environment variable is not set")
  }
  return new Resend(key)
}

export async function contactAction(
  _prevState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
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

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const headersList = await headers()
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown" // shared bucket for local dev / header-stripped requests — acceptable

  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return {
      status: "serverError",
      message: "Demasiadas tentativas. Por favor aguarde antes de tentar novamente.",
    }
  }

  // ── Send email ────────────────────────────────────────────────────────────
  try {
    // Defaults: sandbox FROM works without domain verification; real TO is geral@maredatum.pt.
    // Override via env once maredatum.pt is verified in Resend.
    const from =
      process.env.CONTACT_FROM_EMAIL ?? "MareDatum <onboarding@resend.dev>"
    const to = process.env.CONTACT_TO_EMAIL ?? "geral@maredatum.pt"

    await getResend().emails.send({
      from,
      to,
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
