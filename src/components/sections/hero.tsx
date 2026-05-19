"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Typewriter } from "@/components/ui/typewriter"
import { fadeUp } from "@/lib/motion"

const NAV_LINKS = [
  { label: "Contacto", href: "#contacto" },
]

const TYPEWRITER_PHRASES = [
  "da economia azul.",
  "de Angola.",
  "da aquacultura.",
  "do domínio marítimo.",
  "de Portugal.",
]

export function Hero() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -8 }}
        animate={{ y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-14 py-4 transition-all duration-500 ${
          scrolled
            ? "bg-[#0D1F2E]/90 backdrop-blur-md border-b border-white/8"
            : ""
        }`}
      >
        <Image
          src="/logos/MareDatum-logo.png"
          alt="MareDatum"
          width={130}
          height={92}
          priority
          style={{ height: "auto" }}
        />

        <ul className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className="text-xs tracking-widest uppercase text-white/60 hover:text-white transition-colors duration-200"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </motion.nav>

      {/* Hero content */}
      <div className="flex-1 flex items-center justify-center px-8 pt-28 pb-24">
        <div className="text-center max-w-4xl mx-auto">

          {/* Main headline */}
          <motion.h1
            {...fadeUp(0.2)}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight leading-[1.1] text-white"
          >
            A Excelência ao serviço
          </motion.h1>

          {/* Typewriter line */}
          <motion.div
            {...fadeUp(0.35)}
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight leading-[1.1] mt-2 md:mt-3"
          >
            <Typewriter
              text={TYPEWRITER_PHRASES}
              speed={60}
              deleteSpeed={35}
              waitTime={2500}
              loop
              initialDelay={1200}
              cursorChar="_"
              className="text-md-gold"
              cursorClassName="ml-0.5 text-md-gold"
            />
          </motion.div>

          {/* Divider */}
          <motion.div {...fadeUp(0.45)} className="mt-10 mb-8 flex justify-center">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            {...fadeUp(0.5)}
            className="text-sm md:text-base text-white/55 max-w-md mx-auto leading-relaxed tracking-wide"
          >
            Tecnologia e dados ao serviço das operações marítimas,
            aquacultura e vigilância costeira.
          </motion.p>

          {/* CTA */}
          <motion.div {...fadeUp(0.65)} className="mt-10">
            <a
              href="#neptune"
              className="inline-block bg-white/8 hover:bg-white/14 border border-white/20 hover:border-white/40 text-white transition-all duration-300 px-10 py-3.5 text-xs tracking-widest uppercase rounded-sm"
            >
              Conhecer mais
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        {...fadeUp(1.2)}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/35 text-[10px] tracking-[0.25em] uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
      </motion.div>

      {/* Subtle radial overlay — creates depth without hiding the dots */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(26,58,106,0.45) 0%, transparent 65%)",
        }}
      />

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-md-bg to-transparent pointer-events-none" />
    </section>
  )
}
