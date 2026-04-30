import { Lock } from 'lucide-react'

export function PrivacyBadge() {
  return (
    <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-2 text-xs font-semibold text-muted-foreground backdrop-blur-sm hover:bg-card transition-colors">
      <Lock className="h-3 w-3" />
      <span>Private session</span>
    </div>
  )
}
