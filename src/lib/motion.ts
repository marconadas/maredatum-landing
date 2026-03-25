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
