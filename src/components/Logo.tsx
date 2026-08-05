interface LogoProps {
  className?: string
  showCampaign?: boolean
}

export function Logo({ className = '', showCampaign = true }: LogoProps) {
  return (
    <div className={`flex min-w-0 items-center gap-2.5 sm:gap-4 ${className}`}>
      <img
        src="/logo.png"
        alt="Assembleia de Deus — Triunfo - RS"
        className="h-14 w-14 shrink-0 object-contain sm:h-20 sm:w-20"
        width={80}
        height={80}
      />
      {showCampaign && (
        <div className="min-w-0 leading-tight">
          <p className="font-display text-base font-bold tracking-tight text-brand-800 sm:text-2xl">
            Ação Entre Amigos
          </p>
          <p className="truncate text-[11px] text-muted sm:text-sm">
            Assembleia de Deus — Triunfo/RS
          </p>
        </div>
      )}
    </div>
  )
}
