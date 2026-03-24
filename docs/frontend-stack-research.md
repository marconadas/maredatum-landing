# Frontend Stack Research — MareDatum Landing Page

## Objective
Avoid a generic “vibecoding” look and choose a frontend stack that supports a premium, institutional, data-driven landing page.

## Sources consulted
- https://ui.shadcn.com
- https://www.radix-ui.com/
- https://motion.dev/
- https://tailwindcss.com/
- https://www.lenis.dev/
- https://lucide.dev/

## Findings

### 1. Tailwind CSS
**Why it fits**
- utility-first control helps achieve a custom visual system without fighting opinionated defaults
- ships small production CSS when unused styles are removed
- does not force a templated visual identity

**Risk**
- can still look generic if paired with lazy spacing, weak typography, and default component styling

**Decision**
- **Use it**, but impose strong design discipline

Source: https://tailwindcss.com/

---

### 2. shadcn/ui
**Why it fits**
- explicitly presented as “beautifully designed components that you can customize, extend, and build on”
- gives a strong base for forms, navigation, cards, dialogs, etc.
- ideal when used as a starting kit rather than a visual endpoint

**Risk**
- if copied without restyling, the result can look like many other AI-generated product sites

**Decision**
- **Use it as foundation only**
- every component must be adapted to MareDatum’s identity

Source: https://ui.shadcn.com

---

### 3. Radix UI
**Why it fits**
- accessible primitives
- strong fit for maintainable interaction patterns
- useful for menus, tabs, accordions, overlays, and structured UI without imposing a look

**Decision**
- **Use selectively** where accessibility and interaction quality matter

Source: https://www.radix-ui.com/

---

### 4. Motion
**Why it fits**
- production-grade animation library
- strong support for layout animation, gestures, exits, scroll-linked motion, and sequencing
- ideal for refined section reveals and subtle premium motion language

**Risk**
- easy to overuse and turn an institutional landing page into a demo reel

**Decision**
- **Use carefully**, focused on polish rather than spectacle

Source: https://motion.dev/

---

### 5. Lenis
**Why it fits**
- lightweight smooth scrolling approach
- explicitly emphasizes accessibility and preserving the platform
- good option if the page relies on scroll rhythm and section choreography

**Risk**
- unnecessary if native scroll already feels excellent
- should not be used just because it is fashionable

**Decision**
- **Optional**
- only keep it if it materially improves the experience

Source: https://www.lenis.dev/

---

### 6. Lucide
**Why it fits**
- lightweight SVG icons
- consistent design rules
- tree-shakeable and easy to style

**Decision**
- **Use** for restrained iconography

Source: https://lucide.dev/

---

## Recommended stack
- Next.js (App Router)
- TypeScript strict mode
- Tailwind CSS
- shadcn/ui
- Radix UI
- Motion
- Lucide
- Lenis (optional)

## Anti-vibecoding rules
1. No overuse of gradients.
2. No default shadcn look left untouched.
3. No empty “AI / innovation / future” copy.
4. No decorative motion without narrative purpose.
5. No section should exist without strategic value.
6. Typography and spacing must do most of the heavy lifting.
7. The page must feel closer to premium institutional strategy than startup hype.

## Practical visual direction
- deep maritime blues
- disciplined whitespace
- strong headline hierarchy
- restrained cards
- subtle data/tech cues
- elegant transitions
- minimal icon usage
- project-led credibility

## Conclusion
The best approach is **not** to chase a flashy library stack. The right move is to combine:
- **Tailwind** for precise control
- **shadcn/ui + Radix** for solid building blocks
- **Motion** for tasteful polish
- **Lucide** for clean iconography
- **Lenis only if justified**

The quality of the MareDatum landing page will depend less on novelty and more on **discipline, restraint, hierarchy, and brand-specific execution**.
