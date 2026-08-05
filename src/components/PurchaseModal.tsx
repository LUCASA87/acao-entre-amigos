import { useEffect, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { compraSchema, type CompraSchema } from '@/schemas/compraSchema'
import { useComprarNumero } from '@/hooks/useRifa'
import type { RifaNumero } from '@/types/rifa'
import { formatNumero, formatPhone } from '@/lib/format'

interface PurchaseModalProps {
  numero: RifaNumero | null
  onClose: () => void
}

export function PurchaseModal({ numero, onClose }: PurchaseModalProps) {
  const comprar = useComprarNumero()

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

  useEffect(() => {
    if (numero) {
      reset({
        nome_comprador: '',
        telefone: '',
        vendedor: '',
        forma_pagamento: 'PIX',
        status: 'Pago',
      })
    }
  }, [numero, reset])

  useEffect(() => {
    if (!telefone) return
    const formatted = formatPhone(telefone)
    if (formatted !== telefone) {
      setValue('telefone', formatted, { shouldValidate: true })
    }
  }, [telefone, setValue])

  const onSubmit = handleSubmit(async (data) => {
    if (!numero) return
    await comprar.mutateAsync({ id: numero.id, form: data })
    onClose()
  })

  return (
    <Modal
      open={!!numero}
      onClose={onClose}
      title={
        numero
          ? `Comprar número ${formatNumero(numero.numero)}`
          : 'Comprar número'
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Número
          </label>
          <input
            type="text"
            readOnly
            value={numero ? formatNumero(numero.numero) : ''}
            className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 font-display text-lg font-semibold text-brand-800 outline-none"
          />
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
            disabled={comprar.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {comprar.isPending && (
              <Loader2 size={16} className="animate-spin" />
            )}
            Confirmar venda
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
  return `w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-brand-500/30 ${
    hasError
      ? 'border-paid focus:border-paid'
      : 'border-brand-200 focus:border-brand-500'
  }`
}
