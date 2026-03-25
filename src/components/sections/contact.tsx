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
