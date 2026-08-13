import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: string
  tone?: 'green' | 'gold' | 'red' | 'blue'
}

const toneStyles = {
  green: {
    wrap: 'border-ad-green/25 bg-ad-green-soft/60',
    icon: 'bg-ad-green text-white',
    accent: 'text-ad-green',
  },
  gold: {
    wrap: 'border-ad-gold/40 bg-ad-gold-soft/80',
    icon: 'bg-ad-gold text-ink',
    accent: 'text-reserved',
  },
  red: {
    wrap: 'border-brand-200 bg-brand-50/90',
    icon: 'bg-brand-600 text-white',
    accent: 'text-brand-600',
  },
  blue: {
    wrap: 'border-ad-blue/25 bg-ad-blue-soft/70',
    icon: 'bg-ad-blue text-white',
    accent: 'text-ad-blue',
  },
} as const

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'red',
}: StatCardProps) {
  const styles = toneStyles[tone]

  return (
    <div
      className={`animate-fade-up flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2.5 shadow-sm sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3 ${styles.wrap}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl ${styles.icon}`}
      >
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
          {label}
        </p>
        <p
          className={`truncate font-display text-base font-semibold sm:text-xl ${styles.accent}`}
        >
          {value}
        </p>
      </div>
    </div>
  )
}
