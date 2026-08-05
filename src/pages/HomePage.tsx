import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CircleDollarSign,
  FileSpreadsheet,
  FileText,
  Hash,
  Loader2,
  RefreshCw,
  Search,
  Ticket,
} from 'lucide-react'
import { toast } from 'sonner'
import { Logo } from '@/components/Logo'
import { StatCard } from '@/components/StatCard'
import { NumberGrid } from '@/components/NumberGrid'
import { PurchaseModal } from '@/components/PurchaseModal'
import { DetailsModal } from '@/components/DetailsModal'
import { useRifaNumeros, useRifaStats } from '@/hooks/useRifa'
import { exportToExcel, exportToPdf } from '@/lib/export'
import { formatCurrency } from '@/lib/format'
import { CAMPANHA_NOME } from '@/lib/supabase'
import type { FiltroStatus, RifaNumero } from '@/types/rifa'

export function HomePage() {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useRifaNumeros()
  const stats = useRifaStats(data)

  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState<FiltroStatus>('todos')
  const [compra, setCompra] = useState<RifaNumero | null>(null)
  const [detalhe, setDetalhe] = useState<RifaNumero | null>(null)
  const [showReports, setShowReports] = useState(false)

  const filtered = useMemo(() => {
    if (!data) return []

    const q = search.trim().toLowerCase()

    return data.filter((item) => {
      if (filtro !== 'todos' && item.status !== filtro) return false
      if (!q) return true

      // Busca por número: exata (zeros à esquerda ignorados)
      // "1", "01" e "001" → só o número 1
      if (/^\d+$/.test(q)) {
        const numeroBuscado = Number.parseInt(q, 10)
        return item.numero === numeroBuscado
      }

      const nomeMatch = item.nome_comprador?.toLowerCase().includes(q)
      const digits = q.replace(/\D/g, '')
      const telMatch =
        digits.length > 0 &&
        item.telefone?.replace(/\D/g, '').includes(digits)
      const vendMatch = item.vendedor?.toLowerCase().includes(q)

      return !!nomeMatch || !!telMatch || !!vendMatch
    })
  }, [data, search, filtro])

  const handleSelect = (numero: RifaNumero) => {
    if (numero.status === 'Disponivel') {
      setCompra(numero)
    } else {
      setDetalhe(numero)
    }
  }

  const handleExportPdf = () => {
    if (!data?.length) {
      toast.error('Nenhum dado para exportar')
      return
    }
    exportToPdf(data)
    toast.success('PDF gerado com sucesso')
    setShowReports(false)
  }

  const handleExportExcel = () => {
    if (!data?.length) {
      toast.error('Nenhum dado para exportar')
      return
    }
    exportToExcel(data)
    toast.success('Excel gerado com sucesso')
    setShowReports(false)
  }

  return (
    <div className="mx-auto min-h-dvh max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      <header className="animate-fade-up mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-xl text-sm text-muted sm:text-base">
            Campanha <span className="font-semibold text-brand-700">{CAMPANHA_NOME}</span>
            {' — '}escolha um número disponível e registre a venda.
          </p>
        </div>

        <div className="relative flex flex-wrap gap-2">
          <Link
            to="/relatorios"
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-sm transition hover:bg-brand-50"
          >
            <FileText size={16} />
            Relatórios
          </Link>
          <button
            type="button"
            onClick={() => setShowReports((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-sm transition hover:bg-brand-50"
          >
            <FileSpreadsheet size={16} />
            Exportar
          </button>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-70"
          >
            <RefreshCw
              size={16}
              className={isFetching ? 'animate-spin' : undefined}
            />
            Atualizar
          </button>

          {showReports && (
            <div className="animate-pop-in absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-xl">
              <button
                type="button"
                onClick={handleExportPdf}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition hover:bg-brand-50"
              >
                <FileText size={16} className="text-paid" />
                Exportar PDF
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                className="flex w-full items-center gap-2 border-t border-brand-100 px-4 py-3 text-left text-sm transition hover:bg-brand-50"
              >
                <FileSpreadsheet size={16} className="text-available" />
                Exportar Excel
              </button>
            </div>
          )}
        </div>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Disponíveis"
          value={stats.disponiveis}
          icon={Ticket}
          accent="text-available"
        />
        <StatCard
          label="Vendidos"
          value={stats.vendidos}
          icon={Hash}
          accent="text-reserved"
        />
        <StatCard
          label="Pagos"
          value={stats.pagos}
          icon={Hash}
          accent="text-paid"
        />
        <StatCard
          label="Arrecadado"
          value={formatCurrency(stats.totalArrecadado)}
          icon={CircleDollarSign}
          accent="text-brand-600"
        />
      </section>

      <section className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar número, nome, telefone ou vendedor..."
            className="w-full rounded-xl border border-brand-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ['todos', 'Todos'],
              ['Disponivel', 'Livres'],
              ['Reservado', 'Reservados'],
              ['Pago', 'Pagos'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFiltro(value)}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                filtro === value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'border border-brand-200 bg-white text-muted hover:bg-brand-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted sm:text-sm">
        <Legend color="bg-available" label="Disponível" />
        <Legend color="bg-reserved" label="Reservado" />
        <Legend color="bg-paid" label="Pago" />
        <span className="ml-auto tabular-nums">
          Exibindo {filtered.length} de {data?.length ?? 0}
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted">
          <Loader2 size={32} className="animate-spin text-brand-600" />
          <p>Carregando números...</p>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-paid/30 bg-paid-bg px-6 py-10 text-center">
          <p className="font-display text-lg text-paid">
            Erro ao carregar números
          </p>
          <p className="mt-1 text-sm text-muted">
            {(error as Error)?.message || 'Tente novamente'}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Tentar de novo
          </button>
        </div>
      ) : (
        <NumberGrid numeros={filtered} onSelect={handleSelect} />
      )}

      <PurchaseModal numero={compra} onClose={() => setCompra(null)} />
      <DetailsModal numero={detalhe} onClose={() => setDetalhe(null)} />
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  )
}
