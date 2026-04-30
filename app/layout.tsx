import type { Metadata } from 'next'
import { Fraunces, Manrope, JetBrains_Mono } from 'next/font/google'
import { BrandPreloader } from '@/components/brand-preloader'
import { AskAIWidget } from '@/components/ask-ai-widget'
import { PrivacyBadge } from '@/components/privacy-badge'
import { SmoothScroll } from '@/components/smooth-scroll'
import { SessionProvider } from '@/lib/session-context'
import './globals.css'

const manrope = Manrope({ subsets: ['latin'], variable: '--font-body' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display' })
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'VoiceMark — AI Speaking Coach',
  description: 'A privacy-first AI speaking coach. Record yourself, get instant feedback on clarity, pace, filler words, and confidence. No audio stored — ever.',
  keywords: ['speaking coach', 'public speaking', 'AI feedback', 'filler words', 'communication'],
  authors: [{ name: 'Signal Over Noise' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${manrope.variable} ${fraunces.variable} ${jetBrainsMono.variable} font-sans antialiased`}>
        <SessionProvider>
          <SmoothScroll>
            <BrandPreloader>{children}</BrandPreloader>
            <AskAIWidget />
            <PrivacyBadge />
          </SmoothScroll>
        </SessionProvider>
      </body>
    </html>
  )
}
