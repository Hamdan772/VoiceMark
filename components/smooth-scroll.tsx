'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'
import Lenis from 'lenis'

type SmoothScrollProps = {
    children: ReactNode
}

export function SmoothScroll({ children }: SmoothScrollProps) {
    useEffect(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReduced) return

        const lenis = new Lenis({
            duration: 1.15,
            easing: (t: number) => 1 - Math.pow(1 - t, 3),
            smoothWheel: true,
        })

        let rafId = 0
        const raf = (time: number) => {
            lenis.raf(time)
            rafId = requestAnimationFrame(raf)
        }

        rafId = requestAnimationFrame(raf)

        return () => {
            cancelAnimationFrame(rafId)
            lenis.destroy()
        }
    }, [])

    return children
}
