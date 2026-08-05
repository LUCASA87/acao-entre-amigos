import { Modal } from '@/components/Modal'
import type { RifaNumero } from '@/types/rifa'
import { STATUS_LABELS, STATUS_COLORS } from '@/types/rifa'
import { formatCurrency, formatDate, formatNumero } from '@/lib/format'
import { VALOR_NUMERO } from '@/lib/supabase'

interface DetailsModalProps {
  numero: RifaNumero | null
  onClose: () => void
}

export function DetailsModal({ numero, onClose }: DetailsModalProps) {
  if (!numero) {
    return <Modal open={false} onClose={onClose} title="Detalhes">{null}</Modal>
  }

  const colors = STATUS_COLORS[numero.status]

  return (
    <Modal
      open={!!numero}
      onClose={onClose}
      title={`Número ${formatNumero(numero.numero)}`}
    >
      <div className="space-y-4">
        <div
          className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${colors.bg} ${colors.text} ${colors.border}`}
        >
          {STATUS_LABELS[numero.status]}
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <Detail label="Comprador" value={numero.nome_comprador} />
          <Detail label="Telefone" value={numero.telefone} />
          <Detail label="Vendedor" value={numero.vendedor} />
          <Detail label="Pagamento" value={numero.forma_pagamento} />
          <Detail label="Data da venda" value={formatDate(numero.data_venda)} />
          <Detail
            label="Valor"
            value={
              numero.status === 'Pago' ? formatCurrency(VALOR_NUMERO) : '—'
            }
          />
        </dl>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  )
}

function Detail({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50/50 px-3 py-2.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-ink">{value || '—'}</dd>
    </div>
  )
}
