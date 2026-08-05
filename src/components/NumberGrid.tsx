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
      <div className="rounded-2xl border border-dashed border-brand-200 bg-white/50 px-6 py-16 text-center">
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
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-[repeat(16,minmax(0,1fr))]">
      {numeros.map((item, index) => {
        const colors = STATUS_COLORS[item.status]
        const available = item.status === 'Disponivel'

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className={`number-cell animate-fade-up rounded-xl border px-1 py-2.5 font-display text-sm font-semibold tabular-nums sm:text-base ${colors.bg} ${colors.text} ${colors.border} ${
              available
                ? 'cursor-pointer'
                : 'cursor-pointer opacity-95'
            }`}
            style={{ animationDelay: `${Math.min(index, 40) * 8}ms` }}
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
