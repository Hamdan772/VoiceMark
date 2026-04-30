import { Mic2 } from 'lucide-react'

export default function Loading() {
    return (
        <main className="brand-loader-screen">
            <div className="loader-ambient" aria-hidden="true">
                <div className="loader-orb loader-orb-1"></div>
                <div className="loader-orb loader-orb-2"></div>
                <div className="loader-sheen"></div>
            </div>
            <div className="loader-panel relative overflow-hidden">
                <div className="loader-sweep" aria-hidden="true"></div>
                <div className="flex items-center gap-4">
                    <div className="relative float-soft loader-core">
                        <div className="orbital-ring loader-ring"></div>
                        <div className="pulse-ring" aria-hidden="true"></div>
                        <div className="absolute inset-0 m-auto h-12 w-12 rounded-2xl bg-foreground text-background grid place-items-center shadow-sm mic-plate">
                            <Mic2 className="h-5 w-5" />
                        </div>
                    </div>

                    <div>
                        <p className="font-display text-2xl leading-none reveal-seq" style={{ animationDelay: '50ms' }}>VoiceMark</p>
                        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground reveal-seq" style={{ animationDelay: '180ms' }}>
                            Speech Intelligence Studio
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground reveal-seq" style={{ animationDelay: '280ms' }}>
                            Calibrating your feedback session...
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
