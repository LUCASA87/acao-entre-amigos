import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, X } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { compraSchema, type CompraSchema } from '@/schemas/compraSchema'
import { useComprarNumeros } from '@/hooks/useRifa'
import type { RifaNumero } from '@/types/rifa'
import { formatCurrency, formatNumero, formatPhone } from '@/lib/format'
import { VALOR_NUMERO } from '@/lib/supabase'

interface PurchaseModalProps {
  numeros: RifaNumero[]
  disponiveis: RifaNumero[]
  onChangeNumeros: (numeros: RifaNumero[]) => void
  onClose: () => void
}

export function PurchaseModal({
  numeros,
  disponiveis,
  onChangeNumeros,
  onClose,
}: PurchaseModalProps) {
  const comprar = useComprarNumeros()
  const [mostrarMais, setMostrarMais] = useState(false)
  const [buscaExtra, setBuscaExtra] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompraSchema>({
    resolver: zodResolver(compraSchema),
    defaultValues: {
      nome_comprador: '',
      telefone: '',
      vendedor: '',
      forma_pagamento: 'PIX',
      status: 'Pago',
    },
  })

  const telefone = watch('telefone')
  const open = numeros.length > 0
  const selectedIds = useMemo(
    () => new Set(numeros.map((n) => n.id)),
    [numeros],
  )

  const extras = useMemo(() => {
    const q = buscaExtra.trim()
    const list = disponiveis.filter((n) => !selectedIds.has(n.id))
    if (!q) return list.slice(0, 60)
    if (/^\d+$/.test(q)) {
      const num = Number.parseInt(q, 10)
      return list.filter((n) => n.numero === num)
    }
    return list.filter((n) =>
      String(n.numero).padStart(3, '0').includes(q),
    )
  }, [disponiveis, selectedIds, buscaExtra])

  useEffect(() => {
    if (open) {
      reset({
        nome_comprador: '',
        telefone: '',
        vendedor: '',
        forma_pagamento: 'PIX',
        status: 'Pago',
      })
      setMostrarMais(false)
      setBuscaExtra('')
    }
  }, [open, reset])

  useEffect(() => {
    if (!telefone) return
    const formatted = formatPhone(telefone)
    if (formatted !== telefone) {
      setValue('telefone', formatted, { shouldValidate: true })
    }
  }, [telefone, setValue])

  const removeNumero = (id: string) => {
    const next = numeros.filter((n) => n.id !== id)
    if (next.length === 0) {
      onClose()
      return
    }
    onChangeNumeros(next)
  }

  const toggleExtra = (item: RifaNumero) => {
    if (selectedIds.has(item.id)) {
      removeNumero(item.id)
      return
    }
    onChangeNumeros(
      [...numeros, item].sort((a, b) => a.numero - b.numero),
    )
  }

  const onSubmit = handleSubmit(async (data) => {
    if (numeros.length === 0) return
    await comprar.mutateAsync({
      ids: numeros.map((n) => n.id),
      form: data,
    })
    onClose()
  })

  const totalEstimado =
    watch('status') === 'Pago' ? numeros.length * VALOR_NUMERO : 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        numeros.length <= 1
          ? `Comprar número ${numeros[0] ? formatNumero(numeros[0].numero) : ''}`
          : `Comprar ${numeros.length} números`
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label className="block text-sm font-medium text-ink">
              Número{numeros.length > 1 ? 's' : ''} selecionado
              {numeros.length > 1 ? 's' : ''}
            </label>
            <button
              type="button"
              onClick={() => setMostrarMais((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg bg-ad-blue-soft px-2.5 py-1.5 text-xs font-semibold text-ad-blue"
            >
              <Plus size={14} />
              {mostrarMais ? 'Ocultar' : 'Selecionar mais'}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-2.5 py-2.5">
            {numeros.map((n) => (
              <span
                key={n.id}
                className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2 py-1 font-display text-sm font-semibold text-white"
              >
                {formatNumero(n.numero)}
                <button
                  type="button"
                  onClick={() => removeNumero(n.id)}
                  className="rounded p-0.5 hover:bg-brand-700"
                  aria-label={`Remover ${formatNumero(n.numero)}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          {mostrarMais && (
            <div className="mt-2 space-y-2 rounded-xl border border-ad-blue/25 bg-ad-blue-soft/40 p-2.5">
              <input
                type="search"
                value={buscaExtra}
                onChange={(e) => setBuscaExtra(e.target.value)}
                placeholder="Buscar número para adicionar"
                inputMode="numeric"
                className={inputClass(false)}
              />
              <div className="grid max-h-40 grid-cols-5 gap-1.5 overflow-y-auto sm:grid-cols-6">
                {extras.length === 0 ? (
                  <p className="col-span-full py-3 text-center text-xs text-muted">
                    Nenhum número disponível para adicionar
                  </p>
                ) : (
                  extras.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleExtra(item)}
                      className="rounded-lg border border-ad-green/30 bg-white py-2 font-display text-xs font-bold text-ad-green"
                    >
                      {formatNumero(item.numero)}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Field
          label="Nome do comprador"
          error={errors.nome_comprador?.message}
        >
          <input
            {...register('nome_comprador')}
            autoFocus
            placeholder="Nome completo"
            className={inputClass(!!errors.nome_comprador)}
          />
        </Field>

        <Field label="Telefone" error={errors.telefone?.message}>
          <input
            {...register('telefone')}
            inputMode="tel"
            placeholder="(00) 00000-0000"
            className={inputClass(!!errors.telefone)}
          />
        </Field>

        <Field label="Nome do vendedor" error={errors.vendedor?.message}>
          <input
            {...register('vendedor')}
            placeholder="Quem vendeu"
            className={inputClass(!!errors.vendedor)}
          />
        </Field>

        <Field
          label="Forma de pagamento"
          error={errors.forma_pagamento?.message}
        >
          <select
            {...register('forma_pagamento')}
            className={inputClass(!!errors.forma_pagamento)}
          >
            <option value="PIX">PIX</option>
            <option value="Dinheiro">Dinheiro</option>
          </select>
        </Field>

        <Field label="Status" error={errors.status?.message}>
          <select
            {...register('status')}
            className={inputClass(!!errors.status)}
          >
            <option value="Pago">Pago</option>
            <option value="Reservado">Reservado</option>
          </select>
        </Field>

        {totalEstimado > 0 && (
          <p className="rounded-xl bg-ad-blue-soft px-3 py-2 text-sm font-semibold text-ad-blue">
            Total estimado: {formatCurrency(totalEstimado)}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brand-200 px-4 py-2.5 text-sm font-medium text-muted transition hover:bg-brand-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={comprar.isPending || numeros.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {comprar.isPending && (
              <Loader2 size={16} className="animate-spin" />
            )}
            Confirmar {numeros.length > 1 ? `(${numeros.length})` : 'venda'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-paid">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border bg-white px-3 py-3 text-base outline-none transition focus:ring-2 focus:ring-brand-500/30 sm:py-2.5 sm:text-sm ${
    hasError
      ? 'border-paid focus:border-paid'
      : 'border-brand-200 focus:border-brand-500'
  }`
}
