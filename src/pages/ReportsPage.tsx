import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  CircleDollarSign,
  Dices,
  Eraser,
  FileSpreadsheet,
  FileText,
  Hash,
  Loader2,
  Ticket,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Logo } from '@/components/Logo'
import { StatCard } from '@/components/StatCard'
import { SorteioModal } from '@/components/SorteioModal'
import { DetailsModal } from '@/components/DetailsModal'
import {
  useLimparNumero,
  useMarcarComoPago,
  useRifaNumeros,
  useRifaStats,
} from '@/hooks/useRifa'
import { exportToExcel, exportToPdf } from '@/lib/export'
import { formatCurrency, formatDate, formatNumero, samePerson, uniquePeople } from '@/lib/format'
import { CAMPANHA_NOME, VALOR_NUMERO } from '@/lib/supabase'
import type { RifaNumero } from '@/types/rifa'
import { STATUS_LABELS } from '@/types/rifa'

export function ReportsPage() {
  const { data, isLoading } = useRifaNumeros()
  const stats = useRifaStats(data)
  const marcarPago = useMarcarComoPago()
  const limpar = useLimparNumero()

  const [filtroVendedor, setFiltroVendedor] = useState('')
  const [filtroComprador, setFiltroComprador] = useState('')
  const [sorteioAberto, setSorteioAberto] = useState(false)
  const [detalhe, setDetalhe] = useState<RifaNumero | null>(null)

  const vendidos = useMemo(
    () =>
      (data ?? [])
        .filter((n) => n.status !== 'Disponivel')
        .sort((a, b) => a.numero - b.numero),
    [data],
  )

  const vendedores = useMemo(
    () => uniquePeople(vendidos.map((n) => n.vendedor)),
    [vendidos],
  )
  const compradores = useMemo(
    () => uniquePeople(vendidos.map((n) => n.nome_comprador)),
    [vendidos],
  )

  const filtrados = useMemo(() => {
    return vendidos.filter((n) => {
      if (filtroVendedor && !samePerson(n.vendedor, filtroVendedor)) return false
      if (filtroComprador && !samePerson(n.nome_comprador, filtroComprador)) {
        return false
      }
      return true
    })
  }, [vendidos, filtroVendedor, filtroComprador])

  const busyId =
    marcarPago.isPending && marcarPago.variables
      ? marcarPago.variables
      : limpar.isPending && limpar.variables
        ? limpar.variables
        : null

  const handlePdf = () => {
    if (!data?.length) return toast.error('Nenhum dado para exportar')
    exportToPdf(data)
    toast.success('PDF gerado com sucesso')
  }

  const handleExcel = () => {
    if (!data?.length) return toast.error('Nenhum dado para exportar')
    exportToExcel(data)
    toast.success('Excel gerado com sucesso')
  }

  const handleMarcarPago = (n: RifaNumero) => {
    if (n.status !== 'Reservado') return
    marcarPago.mutate(n.id)
  }

  const handleLimpar = (n: RifaNumero) => {
    const ok = window.confirm(
      `Limpar o número ${formatNumero(n.numero)}?\nEle voltará a ficar disponível na grade.`,
    )
    if (!ok) return
    limpar.mutate(n.id)
  }

  return (
    <div className="mx-auto min-h-dvh max-w-6xl px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-8">
      <div className="mb-5 overflow-hidden rounded-2xl border border-brand-200/70 bg-white/90 shadow-sm sm:mb-6 sm:rounded-3xl">
        <div className="brand-stripe h-1.5" />
        <div className="flex flex-col gap-4 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="min-w-0">
            <Link
              to="/"
              className="mb-3 inline-flex touch-manipulation items-center gap-1.5 text-sm font-semibold text-brand-600"
            >
              <ArrowLeft size={16} />
              Voltar à grade
            </Link>
            <Logo />
            <p className="mt-2 text-xs text-muted sm:text-sm">
              Relatórios da campanha {CAMPANHA_NOME}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={() => setSorteioAberto(true)}
              className="col-span-2 inline-flex touch-manipulation items-center justify-center gap-2 rounded-xl border border-ad-green/40 bg-ad-green px-4 py-2.5 text-sm font-semibold text-white shadow-sm active:opacity-90 sm:col-span-1"
            >
              <Dices size={16} />
              Sortear
            </button>
            <button
              type="button"
              onClick={handlePdf}
              className="inline-flex touch-manipulation items-center justify-center gap-2 rounded-xl border border-ad-gold/50 bg-ad-gold-soft px-4 py-2.5 text-sm font-semibold shadow-sm active:opacity-90"
            >
              <FileText size={16} className="text-brand-600" />
              PDF
            </button>
            <button
              type="button"
              onClick={handleExcel}
              className="inline-flex touch-manipulation items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white active:bg-brand-700"
            >
              <FileSpreadsheet size={16} />
              Excel
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        <StatCard
          label="Disponíveis"
          value={stats.disponiveis}
          icon={Ticket}
          tone="green"
        />
        <StatCard
          label="Reservados"
          value={stats.reservados}
          icon={Hash}
          tone="gold"
        />
        <StatCard label="Pagos" value={stats.pagos} icon={Hash} tone="red" />
        <StatCard
          label="Arrecadado"
          value={formatCurrency(stats.totalArrecadado)}
          icon={CircleDollarSign}
          tone="blue"
        />
      </div>

      <section className="mb-5 overflow-hidden rounded-2xl border border-ad-blue/20 bg-white/90 p-3 shadow-sm sm:p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ad-blue">
          <Users size={16} />
          Filtrar por pessoa
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
              Vendedor
            </span>
            <select
              value={filtroVendedor}
              onChange={(e) => setFiltroVendedor(e.target.value)}
              className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Todos os vendedores</option>
              {vendedores.map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
              Comprador
            </span>
            <select
              value={filtroComprador}
              onChange={(e) => setFiltroComprador(e.target.value)}
              className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Todos os compradores</option>
              {compradores.map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
          </label>
        </div>
        {(filtroVendedor || filtroComprador) && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>
              Mostrando {filtrados.length} de {vendidos.length}
            </span>
            <button
              type="button"
              onClick={() => {
                setFiltroVendedor('')
                setFiltroComprador('')
              }}
              className="font-semibold text-brand-600"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </section>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-600" size={28} />
        </div>
      ) : vendidos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-300 bg-white/70 px-4 py-12 text-center text-muted">
          Nenhuma venda registrada ainda.
        </div>
      ) : filtrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-300 bg-white/70 px-4 py-12 text-center text-muted">
          Nenhum registro com esses filtros.
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filtrados.map((n) => (
              <article
                key={n.id}
                className="overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-sm"
              >
                <div className="brand-stripe h-1" />
                <div className="p-3.5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="font-display text-lg font-semibold text-brand-600">
                      {formatNumero(n.numero)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        n.status === 'Pago'
                          ? 'bg-brand-50 text-brand-700'
                          : 'bg-ad-gold-soft text-reserved'
                      }`}
                    >
                      {STATUS_LABELS[n.status]}
                    </span>
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-[11px] uppercase text-muted">
                        Comprador
                      </dt>
                      <dd>
                        <button
                          type="button"
                          onClick={() => setDetalhe(n)}
                          className="font-medium text-brand-600 underline-offset-2 hover:underline"
                        >
                          {n.nome_comprador || '—'}
                        </button>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase text-muted">
                        Telefone
                      </dt>
                      <dd className="font-medium">{n.telefone || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase text-muted">
                        Vendedor
                      </dt>
                      <dd className="font-medium">{n.vendedor || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase text-muted">
                        Pagamento
                      </dt>
                      <dd className="font-medium">
                        {n.forma_pagamento || '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase text-muted">Data</dt>
                      <dd className="font-medium">
                        {formatDate(n.data_venda)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase text-muted">Valor</dt>
                      <dd className="font-medium text-ad-blue">
                        {n.status === 'Pago'
                          ? formatCurrency(VALOR_NUMERO)
                          : '—'}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {n.status === 'Reservado' && (
                      <button
                        type="button"
                        disabled={busyId === n.id}
                        onClick={() => handleMarcarPago(n)}
                        className="inline-flex touch-manipulation items-center justify-center gap-1.5 rounded-xl bg-ad-green px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {busyId === n.id && marcarPago.isPending ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        Marcar pago
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busyId === n.id}
                      onClick={() => handleLimpar(n)}
                      className={`inline-flex touch-manipulation items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-xs font-semibold text-brand-700 disabled:opacity-60 ${
                        n.status === 'Pago' ? 'col-span-2' : ''
                      }`}
                    >
                      {busyId === n.id && limpar.isPending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Eraser size={14} />
                      )}
                      Limpar número
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-sm md:block">
            <div className="brand-stripe h-1" />
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-700">
                  <tr>
                    <th className="px-4 py-3">Nº</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Comprador</th>
                    <th className="px-4 py-3">Telefone</th>
                    <th className="px-4 py-3">Vendedor</th>
                    <th className="px-4 py-3">Pagamento</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((n) => (
                    <tr
                      key={n.id}
                      className="border-t border-brand-100 hover:bg-brand-50/40"
                    >
                      <td className="px-4 py-3 font-display font-semibold text-brand-600">
                        {formatNumero(n.numero)}
                      </td>
                      <td className="px-4 py-3">{STATUS_LABELS[n.status]}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setDetalhe(n)}
                          className="font-medium text-brand-600 underline-offset-2 hover:underline"
                        >
                          {n.nome_comprador}
                        </button>
                      </td>
                      <td className="px-4 py-3">{n.telefone}</td>
                      <td className="px-4 py-3">{n.vendedor}</td>
                      <td className="px-4 py-3">{n.forma_pagamento}</td>
                      <td className="px-4 py-3">{formatDate(n.data_venda)}</td>
                      <td className="px-4 py-3 font-medium text-ad-blue">
                        {n.status === 'Pago'
                          ? formatCurrency(VALOR_NUMERO)
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {n.status === 'Reservado' && (
                            <button
                              type="button"
                              disabled={busyId === n.id}
                              onClick={() => handleMarcarPago(n)}
                              className="inline-flex items-center gap-1 rounded-lg bg-ad-green px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                            >
                              {busyId === n.id && marcarPago.isPending ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={12} />
                              )}
                              Pago
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={busyId === n.id}
                            onClick={() => handleLimpar(n)}
                            className="inline-flex items-center gap-1 rounded-lg border border-brand-200 px-2.5 py-1.5 text-xs font-semibold text-brand-700 disabled:opacity-60"
                          >
                            {busyId === n.id && limpar.isPending ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Eraser size={12} />
                            )}
                            Limpar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <SorteioModal
        open={sorteioAberto}
        onClose={() => setSorteioAberto(false)}
        numeros={data ?? []}
      />
      <DetailsModal
        numero={detalhe}
        onClose={() => setDetalhe(null)}
        title={
          detalhe
            ? `Dados — ${detalhe.nome_comprador ?? formatNumero(detalhe.numero)}`
            : 'Detalhes'
        }
      />
    </div>
  )
}
