import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Logo } from '@/components/Logo'
import { useRifaNumeros, useRifaStats } from '@/hooks/useRifa'
import { exportToExcel, exportToPdf } from '@/lib/export'
import { formatCurrency, formatDate, formatNumero } from '@/lib/format'
import { CAMPANHA_NOME, VALOR_NUMERO } from '@/lib/supabase'
import { STATUS_LABELS } from '@/types/rifa'

export function ReportsPage() {
  const { data, isLoading } = useRifaNumeros()
  const stats = useRifaStats(data)

  const vendidos = (data ?? [])
    .filter((n) => n.status !== 'Disponivel')
    .sort((a, b) => a.numero - b.numero)

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

  return (
    <div className="mx-auto min-h-dvh max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
          >
            <ArrowLeft size={16} />
            Voltar à grade
          </Link>
          <Logo />
          <p className="mt-2 text-sm text-muted">
            Relatórios da campanha {CAMPANHA_NOME}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePdf}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-brand-50"
          >
            <FileText size={16} />
            PDF
          </button>
          <button
            type="button"
            onClick={handleExcel}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <FileSpreadsheet size={16} />
            Excel
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Summary label="Disponíveis" value={stats.disponiveis} />
        <Summary label="Reservados" value={stats.reservados} />
        <Summary label="Pagos" value={stats.pagos} />
        <Summary
          label="Arrecadado"
          value={formatCurrency(stats.totalArrecadado)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-600" size={28} />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-brand-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Nº</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Comprador</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Vendedor</th>
                <th className="px-4 py-3">Pagamento</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Valor</th>
              </tr>
            </thead>
            <tbody>
              {vendidos.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-muted"
                  >
                    Nenhuma venda registrada ainda.
                  </td>
                </tr>
              ) : (
                vendidos.map((n) => (
                  <tr
                    key={n.id}
                    className="border-t border-brand-100 hover:bg-brand-50/40"
                  >
                    <td className="px-4 py-3 font-display font-semibold">
                      {formatNumero(n.numero)}
                    </td>
                    <td className="px-4 py-3">{STATUS_LABELS[n.status]}</td>
                    <td className="px-4 py-3">{n.nome_comprador}</td>
                    <td className="px-4 py-3">{n.telefone}</td>
                    <td className="px-4 py-3">{n.vendedor}</td>
                    <td className="px-4 py-3">{n.forma_pagamento}</td>
                    <td className="px-4 py-3">{formatDate(n.data_venda)}</td>
                    <td className="px-4 py-3">
                      {n.status === 'Pago'
                        ? formatCurrency(VALOR_NUMERO)
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-brand-200/60 bg-white/80 px-4 py-3 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="font-display text-xl font-semibold">{value}</p>
    </div>
  )
}
