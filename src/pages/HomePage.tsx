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
    <div className="mx-auto min-h-dvh max-w-7xl px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-8">
      <header className="animate-fade-up mb-4 sm:mb-8">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Logo />
            <p className="mt-2 max-w-xl text-xs text-muted sm:mt-3 sm:text-base">
              Campanha{' '}
              <span className="font-semibold text-brand-700">
                {CAMPANHA_NOME}
              </span>
              <span className="hidden sm:inline">
                {' — '}escolha um número disponível e registre a venda.
              </span>
            </p>
          </div>
        </div>

        <div className="relative mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:flex sm:flex-wrap">
          <Link
            to="/relatorios"
            className="inline-flex touch-manipulation items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-white px-2 py-2.5 text-xs font-medium text-ink shadow-sm transition active:bg-brand-50 sm:gap-2 sm:px-4 sm:text-sm"
          >
            <FileText size={15} className="shrink-0" />
            <span className="truncate">Relatórios</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowReports((v) => !v)}
            className="inline-flex touch-manipulation items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-white px-2 py-2.5 text-xs font-medium text-ink shadow-sm transition active:bg-brand-50 sm:gap-2 sm:px-4 sm:text-sm"
          >
            <FileSpreadsheet size={15} className="shrink-0" />
            <span className="truncate">Exportar</span>
          </button>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex touch-manipulation items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-2 py-2.5 text-xs font-semibold text-white shadow-sm transition active:bg-brand-700 disabled:opacity-70 sm:gap-2 sm:px-4 sm:text-sm"
          >
            <RefreshCw
              size={15}
              className={`shrink-0 ${isFetching ? 'animate-spin' : ''}`}
            />
            <span className="truncate">Atualizar</span>
          </button>

          {showReports && (
            <div className="animate-pop-in absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-xl sm:left-auto sm:right-0 sm:w-56">
              <button
                type="button"
                onClick={handleExportPdf}
                className="flex w-full touch-manipulation items-center gap-2 px-4 py-3.5 text-left text-sm transition active:bg-brand-50"
              >
                <FileText size={16} className="text-paid" />
                Exportar PDF
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                className="flex w-full touch-manipulation items-center gap-2 border-t border-brand-100 px-4 py-3.5 text-left text-sm transition active:bg-brand-50"
              >
                <FileSpreadsheet size={16} className="text-available" />
                Exportar Excel
              </button>
            </div>
          )}
        </div>
      </header>

      <section className="mb-4 grid grid-cols-2 gap-2 sm:mb-6 sm:gap-3 lg:grid-cols-4">
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

      <section className="sticky top-0 z-10 -mx-3 mb-4 space-y-2.5 border-b border-brand-100/80 bg-surface/95 px-3 py-2.5 backdrop-blur-md sm:static sm:mx-0 sm:mb-5 sm:space-y-3 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nº, nome, telefone ou vendedor"
            inputMode="search"
            enterKeyHint="search"
            className="w-full rounded-xl border border-brand-200 bg-white py-3 pl-10 pr-3 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 sm:py-2.5 sm:text-sm"
          />
        </div>

        <div className="-mx-0.5 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
              className={`shrink-0 touch-manipulation rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                filtro === value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'border border-brand-200 bg-white text-muted active:bg-brand-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-muted sm:mb-4 sm:gap-4 sm:text-sm">
        <Legend color="bg-available" label="Disponível" />
        <Legend color="bg-reserved" label="Reservado" />
        <Legend color="bg-paid" label="Pago" />
        <span className="w-full tabular-nums sm:ml-auto sm:w-auto">
          Exibindo {filtered.length} de {data?.length ?? 0}
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted">
          <Loader2 size={32} className="animate-spin text-brand-600" />
          <p>Carregando números...</p>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-paid/30 bg-paid-bg px-4 py-10 text-center sm:px-6">
          <p className="font-display text-lg text-paid">
            Erro ao carregar números
          </p>
          <p className="mt-1 text-sm text-muted">
            {(error as Error)?.message || 'Tente novamente'}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 touch-manipulation rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
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
