import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { comprarNumero, fetchNumeros } from '@/services/rifaService'
import type { CompraFormData, RifaNumero } from '@/types/rifa'
import { VALOR_NUMERO } from '@/lib/supabase'

export const RIFA_QUERY_KEY = ['rifa-numeros'] as const

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
      queryClient.setQueryData<RifaNumero[]>(RIFA_QUERY_KEY, (old) =>
        old
          ? old.map((n) => (n.id === updated.id ? updated : n))
          : [updated],
      )
      toast.success(
        `Número ${String(updated.numero).padStart(3, '0')} registrado com sucesso!`,
      )
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao registrar venda')
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
