import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  comprarNumero,
  comprarNumeros,
  fetchNumeros,
  limparNumero,
  marcarComoPago,
} from '@/services/rifaService'
import type { CompraFormData, RifaNumero } from '@/types/rifa'
import { VALOR_NUMERO } from '@/lib/supabase'
import { formatNumero } from '@/lib/format'

export const RIFA_QUERY_KEY = ['rifa-numeros'] as const

function updateCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updated: RifaNumero,
) {
  queryClient.setQueryData<RifaNumero[]>(RIFA_QUERY_KEY, (old) =>
    old ? old.map((n) => (n.id === updated.id ? updated : n)) : [updated],
  )
}

export function useRifaNumeros() {
  return useQuery({
    queryKey: RIFA_QUERY_KEY,
    queryFn: fetchNumeros,
    staleTime: 30_000,
  })
}

export function useComprarNumero() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: CompraFormData }) =>
      comprarNumero(id, form),
    onSuccess: (updated) => {
      updateCache(queryClient, updated)
      toast.success(
        `Número ${formatNumero(updated.numero)} registrado com sucesso!`,
      )
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao registrar venda')
      void queryClient.invalidateQueries({ queryKey: RIFA_QUERY_KEY })
    },
  })
}

export function useComprarNumeros() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ids, form }: { ids: string[]; form: CompraFormData }) =>
      comprarNumeros(ids, form),
    onSuccess: (updatedList, variables) => {
      for (const updated of updatedList) {
        updateCache(queryClient, updated)
      }
      const nums = updatedList.map((n) => formatNumero(n.numero)).join(', ')
      toast.success(
        updatedList.length === 1
          ? `Número ${nums} registrado com sucesso!`
          : `${updatedList.length} números registrados: ${nums}`,
      )
      if (updatedList.length < variables.ids.length) {
        toast.warning(
          'Alguns números já estavam ocupados e não foram alterados',
        )
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao registrar venda')
      void queryClient.invalidateQueries({ queryKey: RIFA_QUERY_KEY })
    },
  })
}

export function useMarcarComoPago() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => marcarComoPago(id),
    onSuccess: (updated) => {
      updateCache(queryClient, updated)
      toast.success(`Número ${formatNumero(updated.numero)} marcado como pago`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao marcar como pago')
      void queryClient.invalidateQueries({ queryKey: RIFA_QUERY_KEY })
    },
  })
}

export function useLimparNumero() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => limparNumero(id),
    onSuccess: (updated) => {
      updateCache(queryClient, updated)
      toast.success(
        `Número ${formatNumero(updated.numero)} limpo e disponível novamente`,
      )
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao limpar número')
      void queryClient.invalidateQueries({ queryKey: RIFA_QUERY_KEY })
    },
  })
}

export function useRifaStats(numeros: RifaNumero[] | undefined) {
  const list = numeros ?? []
  const disponiveis = list.filter((n) => n.status === 'Disponivel').length
  const reservados = list.filter((n) => n.status === 'Reservado').length
  const pagos = list.filter((n) => n.status === 'Pago').length
  const vendidos = reservados + pagos
  const totalArrecadado = pagos * VALOR_NUMERO

  return { disponiveis, reservados, pagos, vendidos, totalArrecadado }
}
