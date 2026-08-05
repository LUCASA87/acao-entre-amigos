import type { RifaNumero } from '@/types/rifa'
import { STATUS_COLORS } from '@/types/rifa'
import { formatNumero } from '@/lib/format'

interface NumberGridProps {
  numeros: RifaNumero[]
  onSelect: (numero: RifaNumero) => void
}

export function NumberGrid({ numeros, onSelect }: NumberGridProps) {
  if (numeros.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-200 bg-white/50 px-4 py-12 text-center sm:px-6 sm:py-16">
        <p className="font-display text-lg text-brand-800">
          Nenhum número encontrado
        </p>
        <p className="mt-1 text-sm text-muted">
          Ajuste a pesquisa ou o filtro de status.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 sm:gap-2 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-[repeat(16,minmax(0,1fr))]">
      {numeros.map((item) => {
        const colors = STATUS_COLORS[item.status]
        const available = item.status === 'Disponivel'

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className={`number-cell flex min-h-11 touch-manipulation items-center justify-center rounded-lg border px-0.5 py-2 font-display text-[13px] font-semibold tabular-nums active:scale-95 sm:min-h-12 sm:rounded-xl sm:text-base ${colors.bg} ${colors.text} ${colors.border} ${
              available ? 'cursor-pointer' : 'cursor-pointer opacity-95'
            }`}
            title={
              available
                ? `Comprar número ${formatNumero(item.numero)}`
                : `Ver detalhes — ${formatNumero(item.numero)}`
            }
            aria-label={`Número ${formatNumero(item.numero)}, ${item.status}`}
          >
            {formatNumero(item.numero)}
          </button>
        )
      })}
    </div>
  )
}
