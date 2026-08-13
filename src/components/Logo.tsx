interface LogoProps {
  className?: string
  showCampaign?: boolean
}

export function Logo({ className = '', showCampaign = true }: LogoProps) {
  return (
    <div className={`flex min-w-0 items-center gap-2.5 sm:gap-4 ${className}`}>
      <div className="relative shrink-0 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-brand-200/70">
        <img
          src="/logo.png"
          alt="Assembleia de Deus Barreto Triunfo"
          className="h-14 w-14 object-contain sm:h-[4.5rem] sm:w-[4.5rem]"
          width={72}
          height={72}
        />
      </div>
      {showCampaign && (
        <div className="min-w-0 leading-tight">
          <p className="font-display text-base font-bold tracking-tight text-brand-600 sm:text-2xl">
            Ação Entre Amigos
          </p>
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-ad-blue sm:text-sm sm:normal-case sm:tracking-normal">
            Assembleia de Deus Barreto Triunfo
          </p>
        </div>
      )}
    </div>
  )
}
