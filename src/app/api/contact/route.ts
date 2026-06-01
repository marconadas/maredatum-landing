import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Resend } from "resend"
import { ratelimit } from "@/lib/ratelimit"

// Force Node runtime (Resend SDK uses Node-only APIs).
export const runtime = "nodejs"

const contactSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  empresa: z.string().min(2, "Empresa deve ter pelo menos 2 caracteres"),
  assunto: z.string().min(3, "Assunto deve ter pelo menos 3 caracteres"),
  mensagem: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
})

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow the cPanel-hosted static site (maredatum.pt) plus Vercel preview/local.
const ALLOWED_ORIGINS = new Set([
  "https://maredatum.pt",
  "https://www.maredatum.pt",
  "https://maredatum-landing.vercel.app",
  "http://localhost:3000",
])

function corsHeaders(origin: string | null): HeadersInit {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://maredatum.pt"
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  }
}

export function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error("RESEND_API_KEY environment variable is not set")
  return new Resend(key)
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const cors = corsHeaders(req.headers.get("origin"))

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { status: "serverError", message: "Pedido inválido." },
      { status: 400, headers: cors },
    )
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        status: "error",
        errors: parsed.error.flatten().fieldErrors as Record<
          string,
          string[] | undefined
        >,
      },
      { status: 422, headers: cors },
    )
  }

  // Fail-open: if Upstash flakes or creds rotate, don't block the form.
  let allowed = true
  try {
    const { success } = await ratelimit.limit(clientIp(req))
    allowed = success
  } catch (err) {
    console.error("[/api/contact] ratelimit failure (fail-open):", err)
  }
  if (!allowed) {
    return NextResponse.json(
      {
        status: "serverError",
        message:
          "Demasiadas tentativas. Por favor aguarde antes de tentar novamente.",
      },
      { status: 429, headers: cors },
    )
  }

  const { nome, email, empresa, assunto, mensagem } = parsed.data

  try {
    const from =
      process.env.CONTACT_FROM_EMAIL ?? "MareDatum <onboarding@resend.dev>"
    const to = process.env.CONTACT_TO_EMAIL ?? "geral@maredatum.pt"

    const { data, error } = await getResend().emails.send({
      from,
      to,
      replyTo: email,
      subject: `[MareDatum] Novo contacto: ${assunto}`,
      text: `Nome: ${nome}\nEmail: ${email}\nEmpresa: ${empresa}\nAssunto: ${assunto}\n\n${mensagem}`,
    })

    // The Resend SDK does NOT throw on validation/quota/sandbox errors —
    // it returns { data: null, error: { ... } }. Treat that as a failure.
    if (error) {
      console.error("[/api/contact] Resend rejected the send:", error)
      return NextResponse.json(
        {
          status: "serverError",
          message:
            "Não foi possível enviar a mensagem. Por favor tente novamente.",
        },
        { status: 502, headers: cors },
      )
    }

    console.log("[/api/contact] Resend accepted email id:", data?.id)
    return NextResponse.json(
      { status: "success" },
      { status: 200, headers: cors },
    )
  } catch (err) {
    console.error("[/api/contact] Resend error:", err)
    return NextResponse.json(
      {
        status: "serverError",
        message:
          "Não foi possível enviar a mensagem. Por favor tente novamente.",
      },
      { status: 502, headers: cors },
    )
  }
}
