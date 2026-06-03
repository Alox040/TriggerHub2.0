import { useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'

export const smoothEase = [0.25, 0.46, 0.45, 0.94] as const

export const scrollViewport = {
  once: true,
  margin: '-80px',
} as const

type MotionSet = {
  fade: Variants
  slideUp: Variants
  staggerContainer: Variants
  staggerItem: Variants
  heroEntry: Variants
  previewEntry: Variants
}

export function useMotionConfig(): MotionSet {
  const reduceMotion = useReducedMotion()
  const offset = reduceMotion ? 0 : 18
  const previewOffset = reduceMotion ? 0 : 28
  const duration = reduceMotion ? 0.18 : 0.55

  return {
    fade: {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration, ease: smoothEase } },
    },
    slideUp: {
      hidden: { opacity: 0, y: offset },
      show: { opacity: 1, y: 0, transition: { duration, ease: smoothEase } },
    },
    staggerContainer: {
      hidden: {},
      show: {
        transition: {
          staggerChildren: reduceMotion ? 0 : 0.08,
          delayChildren: reduceMotion ? 0 : 0.04,
        },
      },
    },
    staggerItem: {
      hidden: { opacity: 0, y: offset },
      show: { opacity: 1, y: 0, transition: { duration, ease: smoothEase } },
    },
    heroEntry: {
      hidden: { opacity: 0, y: offset },
      show: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0.18 : 0.65, ease: smoothEase } },
    },
    previewEntry: {
      hidden: { opacity: 0, y: previewOffset, scale: reduceMotion ? 1 : 0.98 },
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: reduceMotion ? 0.18 : 0.7, ease: smoothEase },
      },
    },
  }
}
