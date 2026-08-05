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
    <div className="animate-fade-up flex min-w-0 items-center gap-2 rounded-xl border border-brand-200/60 bg-white/80 px-2.5 py-2.5 shadow-sm backdrop-blur-sm sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 sm:h-10 sm:w-10 sm:rounded-xl ${accent}`}
      >
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted sm:text-xs">
          {label}
        </p>
        <p className="truncate font-display text-base font-semibold text-ink sm:text-xl">
          {value}
        </p>
      </div>
    </div>
  )
}
