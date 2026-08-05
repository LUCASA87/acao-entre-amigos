import { z } from 'zod'

export const compraSchema = z.object({
  nome_comprador: z
    .string()
    .trim()
    .min(2, 'Informe o nome do comprador')
    .max(120, 'Nome muito longo'),
  telefone: z
    .string()
    .trim()
    .min(10, 'Informe um telefone válido')
    .max(20, 'Telefone inválido')
    .regex(/^[\d\s()-]+$/, 'Use apenas números e símbolos de telefone'),
  vendedor: z
    .string()
    .trim()
    .min(2, 'Informe o nome do vendedor')
    .max(120, 'Nome muito longo'),
  forma_pagamento: z.enum(['PIX', 'Dinheiro'], {
    required_error: 'Selecione a forma de pagamento',
  }),
  status: z.enum(['Reservado', 'Pago'], {
    required_error: 'Selecione o status',
  }),
})

export type CompraSchema = z.infer<typeof compraSchema>
