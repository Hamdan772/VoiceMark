'use client'

import { useEffect } from 'react'

export function RevealObserver() {
    useEffect(() => {
        // Defer to avoid hydration mismatch
        setTimeout(() => {
            const targets = Array.from(document.querySelectorAll<HTMLElement>('.reveal-on-scroll'))
            if (targets.length === 0) return

            // Track elements we've already seen to handle initial render
            const initiallyVisible = new Set<HTMLElement>()

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            // Only add class after initial visibility check
                            if (!initiallyVisible.has(entry.target as HTMLElement)) {
                                initiallyVisible.add(entry.target as HTMLElement)
                            } else {
                                entry.target.classList.add('reveal-active')
                            }
                        }
                    })
                },
                { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
            )

            targets.forEach((target) => observer.observe(target))

            return () => observer.disconnect()
        }, 0)
    }, [])

    return null
}
