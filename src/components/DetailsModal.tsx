import { MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/Modal'
import type { RifaNumero } from '@/types/rifa'
import { STATUS_LABELS, STATUS_COLORS } from '@/types/rifa'
import { formatCurrency, formatDate, formatNumero } from '@/lib/format'
import { VALOR_NUMERO } from '@/lib/supabase'

const IGREJA_NOME = 'AD Barreto'
const CAMPANHA_MSG = 'Ação Entre Amigos'

interface DetailsModalProps {
  numero: RifaNumero | null
  onClose: () => void
  title?: string
  /** Se true, a mensagem do WhatsApp avisa que a pessoa foi ganhadora */
  mensagemGanhador?: boolean
}

function toWhatsAppNumber(telefone: string | null | undefined): string | null {
  if (!telefone) return null
  let digits = telefone.replace(/\D/g, '')
  if (!digits) return null
  if (digits.length <= 11) digits = `55${digits}`
  return digits
}

function buildWhatsAppMessage(
  n: RifaNumero,
  mensagemGanhador: boolean,
): string {
  const nome = n.nome_comprador?.trim() || 'amigo(a)'
  const num = formatNumero(n.numero)
  const vendedor = n.vendedor?.trim()

  if (mensagemGanhador) {
    const linhas = [
      `Olá, ${nome}!`,
      '',
      `Você foi o ganhador do sorteio da ${CAMPANHA_MSG} da ${IGREJA_NOME}!`,
      `Número sorteado: *${num}*.`,
    ]

    if (vendedor) {
      linhas.push(`O seu vendedor foi o *${vendedor}*.`)
    }

    linhas.push(
      '',
      'Quando tiver um tempinho, vamos combinar a entrega do prêmio.',
    )
    return linhas.join('\n')
  }

  const linhas = [
    `Olá, ${nome}!`,
    '',
    `Referente à campanha *${CAMPANHA_MSG}* da ${IGREJA_NOME}.`,
    `Número: *${num}*`,
    `Status: *${STATUS_LABELS[n.status]}*`,
  ]

  if (vendedor) linhas.push(`Vendedor: ${vendedor}`)
  if (n.forma_pagamento) linhas.push(`Pagamento: ${n.forma_pagamento}`)
  if (n.status === 'Pago') {
    linhas.push(`Valor: ${formatCurrency(VALOR_NUMERO)}`)
  }

  linhas.push('', 'Qualquer dúvida, estamos à disposição!')
  return linhas.join('\n')
}

export function DetailsModal({
  numero,
  onClose,
  title,
  mensagemGanhador = true,
}: DetailsModalProps) {
  if (!numero) {
    return (
      <Modal open={false} onClose={onClose} title="Detalhes">
        {null}
      </Modal>
    )
  }

  const colors = STATUS_COLORS[numero.status]
  const waNumber = toWhatsAppNumber(numero.telefone)

  const handleWhatsApp = () => {
    if (!waNumber) {
      toast.error('Este comprador não tem telefone cadastrado')
      return
    }
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(
      buildWhatsAppMessage(numero, mensagemGanhador),
    )}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Modal
      open={!!numero}
      onClose={onClose}
      title={title ?? `Número ${formatNumero(numero.numero)}`}
      zClass="z-[70]"
    >
      <div className="space-y-4">
        <div
          className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${colors.bg} ${colors.text} ${colors.border}`}
        >
          {STATUS_LABELS[numero.status]}
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <Detail label="Número" value={formatNumero(numero.numero)} />
          <Detail label="Status" value={STATUS_LABELS[numero.status]} />
          <Detail label="Comprador" value={numero.nome_comprador} />
          <Detail label="Telefone" value={numero.telefone} />
          <Detail label="Vendedor" value={numero.vendedor} />
          <Detail label="Forma de pagamento" value={numero.forma_pagamento} />
          <Detail label="Data da venda" value={formatDate(numero.data_venda)} />
          <Detail
            label="Valor"
            value={
              numero.status === 'Pago' ? formatCurrency(VALOR_NUMERO) : '—'
            }
          />
        </dl>

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brand-200 px-5 py-2.5 text-sm font-semibold text-ink"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            disabled={!waNumber}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition active:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MessageCircle size={18} />
            Avisar ganhador no WhatsApp
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
    <div className="rounded-xl border border-brand-100 bg-brand-50/50 px-3 py-2.5 text-left">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold text-ink">{value || '—'}</dd>
    </div>
  )
}
