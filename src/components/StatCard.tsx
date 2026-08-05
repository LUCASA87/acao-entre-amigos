import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'text-brand-600',
}: StatCardProps) {
  return (
    <div className="animate-fade-up flex items-center gap-3 rounded-2xl border border-brand-200/60 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 ${accent}`}
      >
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </p>
        <p className="truncate font-display text-xl font-semibold text-ink">
          {value}
        </p>
      </div>
    </div>
  )
}
