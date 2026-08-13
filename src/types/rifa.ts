export type StatusNumero = 'Disponivel' | 'Reservado' | 'Pago'
export type FormaPagamento = 'PIX' | 'Dinheiro'

export interface RifaNumero {
  id: string
  numero: number
  status: StatusNumero
  nome_comprador: string | null
  telefone: string | null
  vendedor: string | null
  forma_pagamento: FormaPagamento | null
  data_venda: string | null
  created_at: string
}

export interface CompraFormData {
  nome_comprador: string
  telefone: string
  vendedor: string
  forma_pagamento: FormaPagamento
  status: 'Reservado' | 'Pago'
}

export const TOTAL_NUMEROS = 500

export const STATUS_LABELS: Record<StatusNumero, string> = {
  Disponivel: 'Disponível',
  Reservado: 'Reservado',
  Pago: 'Pago',
}

export const STATUS_COLORS: Record<
  StatusNumero,
  { bg: string; text: string; border: string }
> = {
  Disponivel: {
    bg: 'bg-available-bg',
    text: 'text-available',
    border: 'border-available/35',
  },
  Reservado: {
    bg: 'bg-reserved-bg',
    text: 'text-reserved',
    border: 'border-reserved/35',
  },
  Pago: {
    bg: 'bg-paid-bg',
    text: 'text-paid',
    border: 'border-paid/35',
  },
}
