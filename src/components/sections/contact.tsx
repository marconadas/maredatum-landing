"use client"

import { useActionState, useState } from "react"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import { Mail, MapPin, CheckCircle } from "lucide-react"
import { contactAction, type ContactActionState } from "@/app/actions/contact"
import { fadeUpScroll } from "@/lib/motion"

const initialState = { status: "idle" } satisfies ContactActionState

// ── Animated input: gold radial gradient follows cursor on hover ──────────────
function MareInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const [visible, setVisible] = useState(false)

  const background = useMotionTemplate`radial-gradient(
    ${visible ? "120px" : "0px"} circle at ${mouseX}px ${mouseY}px,
    rgba(245,166,35,0.12),
    transparent 80%
  )`

  return (
    <motion.div
      style={{ background }}
      onMouseMove={({ currentTarget, clientX, clientY }) => {
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
      }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="rounded-sm p-px"
    >
      <input
        {...props}
        className="w-full rounded-sm bg-md-surface border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-md-gold/50 focus:outline-none focus:ring-1 focus:ring-md-gold/20 transition-colors duration-200"
      />
    </motion.div>
  )
}

// ── Animated textarea: same gold radial gradient pattern ──────────────────────
function MareTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const [visible, setVisible] = useState(false)

  const background = useMotionTemplate`radial-gradient(
    ${visible ? "160px" : "0px"} circle at ${mouseX}px ${mouseY}px,
    rgba(245,166,35,0.10),
    transparent 80%
  )`

  return (
    <motion.div
      style={{ background }}
      onMouseMove={({ currentTarget, clientX, clientY }) => {
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
      }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="rounded-sm p-px"
    >
      <textarea
        {...props}
        className="w-full rounded-sm bg-md-surface border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-md-gold/50 focus:outline-none focus:ring-1 focus:ring-md-gold/20 transition-colors duration-200 resize-none"
      />
    </motion.div>
  )
}

// ── Field-level error display ─────────────────────────────────────────────────
function FieldError({ errors, field }: { errors?: Record<string, string[] | undefined>; field: string }) {
  const msgs = errors?.[field]
  if (!msgs?.length) return null
  return <p id={`${field}-error`} className="text-red-400 text-xs mt-1">{msgs[0]}</p>
}

// ── Contact section ───────────────────────────────────────────────────────────
export function Contact() {
  const [state, dispatch, isPending] = useActionState(contactAction, initialState)
  const fieldErrors = state.status === "error" ? state.errors : undefined

  return (
    <section id="contacto" className="bg-md-bg border-t border-white/8 py-24 px-8 md:px-14">
      <div className="max-w-5xl mx-auto grid md:grid-cols-[2fr_3fr] gap-16">

        {/* Left column — institutional info */}
        <div className="flex flex-col justify-center">
          <motion.p
            {...fadeUpScroll(0)}
            className="text-xs tracking-widest uppercase text-md-gold mb-4"
          >
            Contacto
          </motion.p>

          <motion.h2
            {...fadeUpScroll(0.1)}
            className="text-3xl md:text-4xl tracking-tight text-white mb-4"
          >
            <span className="font-light">Inicie uma </span>
            <span className="font-semibold">conversa estratégica.</span>
          </motion.h2>

          <motion.p
            {...fadeUpScroll(0.2)}
            className="text-sm text-white/55 leading-relaxed mb-10"
          >
            Para projectos de Economia Azul, parcerias institucionais
            ou saber mais sobre Neptune e NavDatum.
          </motion.p>

          <motion.div
            {...fadeUpScroll(0.3)}
            className="flex flex-col gap-5"
          >
            {/* Gold rule */}
            <div className="w-8 h-px bg-md-gold/40" />

            <a
              href="mailto:geral@maredatum.pt"
              className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors duration-200"
            >
              <Mail size={15} className="text-md-gold shrink-0" />
              geral@maredatum.pt
            </a>

            <div className="flex items-center gap-3 text-sm text-white/60">
              <MapPin size={15} className="text-md-gold shrink-0" />
              Lisboa · Luanda
            </div>

            {/* LinkedIn — add href when URL is available
            <a href="https://linkedin.com/company/maredatum" ...>
              <Linkedin size={15} />
              LinkedIn
            </a>
            */}
          </motion.div>
        </div>

        {/* Right column — form */}
        <motion.div {...fadeUpScroll(0.15)}>
          {state.status === "success" ? (
            <div className="flex flex-col py-16 gap-3">
              <CheckCircle size={32} className="text-md-gold" />
              <p className="text-xs tracking-widest uppercase text-md-gold font-medium">
                Mensagem recebida
              </p>
              <p className="text-white text-xl font-light">
                Entraremos em contacto brevemente.
              </p>
            </div>
          ) : (
            <form action={dispatch} className="flex flex-col gap-5">

              {state.status === "serverError" && (
                <p role="alert" className="text-red-400 text-sm mb-2">{state.message}</p>
              )}

              {/* Nome + Empresa side-by-side */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="nome" className="block text-xs tracking-widest uppercase text-white/50 mb-1.5">
                    Nome
                  </label>
                  <MareInput id="nome" name="nome" type="text" autoComplete="name" aria-describedby={fieldErrors?.nome ? "nome-error" : undefined} />
                  <FieldError errors={fieldErrors} field="nome" />
                </div>
                <div>
                  <label htmlFor="empresa" className="block text-xs tracking-widest uppercase text-white/50 mb-1.5">
                    Empresa
                  </label>
                  <MareInput id="empresa" name="empresa" type="text" autoComplete="organization" aria-describedby={fieldErrors?.empresa ? "empresa-error" : undefined} />
                  <FieldError errors={fieldErrors} field="empresa" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs tracking-widest uppercase text-white/50 mb-1.5">
                  Email
                </label>
                <MareInput id="email" name="email" type="email" autoComplete="email" aria-describedby={fieldErrors?.email ? "email-error" : undefined} />
                <FieldError errors={fieldErrors} field="email" />
              </div>

              {/* Assunto */}
              <div>
                <label htmlFor="assunto" className="block text-xs tracking-widest uppercase text-white/50 mb-1.5">
                  Assunto
                </label>
                <MareInput id="assunto" name="assunto" type="text" aria-describedby={fieldErrors?.assunto ? "assunto-error" : undefined} />
                <FieldError errors={fieldErrors} field="assunto" />
              </div>

              {/* Mensagem */}
              <div>
                <label htmlFor="mensagem" className="block text-xs tracking-widest uppercase text-white/50 mb-1.5">
                  Mensagem
                </label>
                <MareTextarea id="mensagem" name="mensagem" rows={5} aria-describedby={fieldErrors?.mensagem ? "mensagem-error" : undefined} />
                <FieldError errors={fieldErrors} field="mensagem" />
              </div>

              {/* Submit — solid gold CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="group relative bg-md-gold hover:bg-md-gold/90 text-md-bg text-xs font-semibold tracking-widest uppercase px-10 py-3.5 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-md-gold/50 focus:ring-offset-2 focus:ring-offset-md-bg"
                >
                  {isPending ? "A enviar..." : "Enviar mensagem"}
                  {/* Shimmer line on hover */}
                  <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>

            </form>
          )}
        </motion.div>

      </div>
    </section>
  )
}
