interface LogoProps {
  className?: string
  showCampaign?: boolean
}

export function Logo({ className = '', showCampaign = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
      <img
        src="/logo.png"
        alt="Assembleia de Deus — Triunfo - RS"
        className="h-16 w-16 object-contain sm:h-20 sm:w-20"
        width={80}
        height={80}
      />
      {showCampaign && (
        <div className="leading-tight">
          <p className="font-display text-lg font-bold tracking-tight text-brand-800 sm:text-2xl">
            Ação Entre Amigos
          </p>
          <p className="text-xs text-muted sm:text-sm">
            Assembleia de Deus — Triunfo/RS
          </p>
        </div>
      )}
    </div>
  )
}
