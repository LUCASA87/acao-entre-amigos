import type { RifaNumero } from '@/types/rifa'
import { formatNumero } from '@/lib/format'

interface NumberGridProps {
  numeros: RifaNumero[]
  onSelect: (numero: RifaNumero) => void
  selectedIds?: Set<string>
}

export function NumberGrid({
  numeros,
  onSelect,
  selectedIds,
}: NumberGridProps) {
  if (numeros.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-300 bg-white/70 px-4 py-12 text-center sm:px-6 sm:py-16">
        <p className="font-display text-lg text-brand-600">
          Nenhum número disponível
        </p>
        <p className="mt-1 text-sm text-muted">
          Todos foram vendidos ou a pesquisa não encontrou resultado.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ad-green/20 bg-white/70 p-2 shadow-sm sm:p-3">
      <div className="brand-stripe mb-2 h-1 rounded-full sm:mb-3" />
      <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 sm:gap-2 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-[repeat(16,minmax(0,1fr))]">
        {numeros.map((item) => {
          const selected = selectedIds?.has(item.id)

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={`number-cell flex min-h-11 touch-manipulation items-center justify-center rounded-lg border font-display text-[13px] font-bold tabular-nums active:scale-95 sm:min-h-12 sm:rounded-xl sm:text-base ${
                selected
                  ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                  : 'border-ad-green/30 bg-ad-green-soft text-ad-green'
              }`}
              title={
                selected
                  ? `Selecionado ${formatNumero(item.numero)}`
                  : `Comprar número ${formatNumero(item.numero)}`
              }
              aria-pressed={selected}
              aria-label={`Número ${formatNumero(item.numero)}, disponível`}
            >
              {formatNumero(item.numero)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
