'use client'

import { useEffect, useState } from 'react'
import { Mic2 } from 'lucide-react'

type BrandPreloaderProps = {
    children: React.ReactNode
}

export function BrandPreloader({ children }: BrandPreloaderProps) {
    const [isVisible, setIsVisible] = useState(true)
    const [isFading, setIsFading] = useState(false)

    useEffect(() => {
        const fadeTimer = window.setTimeout(() => setIsFading(true), 1250)
        const hideTimer = window.setTimeout(() => setIsVisible(false), 1650)

        return () => {
            window.clearTimeout(fadeTimer)
            window.clearTimeout(hideTimer)
        }
    }, [])

    return (
        <>
            {isVisible && (
                <div className={`brand-loader-screen transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="loader-panel relative overflow-hidden">
                        <div className="flex items-center gap-4">
                            <div className="relative float-soft">
                                <div className="orbital-ring"></div>
                                <div className="absolute inset-0 m-auto h-12 w-12 rounded-2xl bg-foreground text-background grid place-items-center shadow-sm">
                                    <Mic2 className="h-5 w-5" />
                                </div>
                            </div>

                            <div>
                                <p className="font-display text-2xl leading-none reveal-seq" style={{ animationDelay: '50ms' }}>VoiceMark</p>
                                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground reveal-seq" style={{ animationDelay: '180ms' }}>
                                    Speech Intelligence Studio
                                </p>
                                <p className="mt-3 text-sm text-muted-foreground reveal-seq" style={{ animationDelay: '280ms' }}>
                                    Warming up analysis engine...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {children}
        </>
    )
}
