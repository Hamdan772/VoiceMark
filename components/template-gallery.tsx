'use client'

import { useState } from 'react'
import { Copy, ChevronRight } from 'lucide-react'
import { useCaseTemplates, getAllCategories } from '@/lib/use-case-templates'
import type { UseCaseTemplate } from '@/lib/use-case-templates'

interface TemplateGalleryProps {
  onSelectTemplate: (script: string, title: string) => void
}

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const categories = getAllCategories()
  const filteredTemplates = selectedCategory
    ? useCaseTemplates.filter((t) => t.category === selectedCategory)
    : useCaseTemplates

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Get started with templates</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Choose a scenario and practice immediately. These scripts are designed to help you build speaking confidence.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template list */}
      <div className="space-y-2">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="rounded-lg border border-border/50 bg-card/30 overflow-hidden hover:bg-card/50 transition-colors"
          >
            <button
              onClick={() => setExpanded(expanded === template.id ? null : template.id)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-lg">{template.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-foreground">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
              </div>
              <ChevronRight
                className="h-4 w-4 text-muted-foreground transition-transform"
                style={{ transform: expanded === template.id ? 'rotate(90deg)' : 'rotate(0deg)' }}
              />
            </button>

            {expanded === template.id && (
              <div className="border-t border-border/30 px-4 py-3 bg-muted/20 space-y-3">
                {/* Template script */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Template</p>
                  <div className="bg-background/50 rounded p-3 text-xs leading-relaxed text-foreground max-h-40 overflow-y-auto font-mono">
                    {template.script}
                  </div>
                </div>

                {/* Tips */}
                {template.tips.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Coaching tips</p>
                    <ul className="space-y-1">
                      {template.tips.map((tip, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex gap-2">
                          <span className="text-lg leading-none mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                    {template.difficulty}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    ~{template.estimatedDuration}s
                  </span>
                </div>

                {/* CTA */}
                <button
                  onClick={() => {
                    onSelectTemplate(template.script, template.name)
                    setExpanded(null)
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <Copy className="h-4 w-4" />
                  Use this template
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center pt-2">
        💡 Tip: Customize any template for your specific situation before recording.
      </p>
    </div>
  )
}
