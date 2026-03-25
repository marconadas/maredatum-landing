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
