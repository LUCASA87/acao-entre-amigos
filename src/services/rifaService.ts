import { supabase } from '@/lib/supabase'
import type { CompraFormData, RifaNumero } from '@/types/rifa'
import { TOTAL_NUMEROS } from '@/types/rifa'

export async function ensureNumerosSeeded(): Promise<void> {
  const { count, error: countError } = await supabase
    .from('rifa_numeros')
    .select('*', { count: 'exact', head: true })

  if (countError) throw countError
  if (count && count > 0) return

  const rows = Array.from({ length: TOTAL_NUMEROS }, (_, i) => ({
    numero: i + 1,
    status: 'Disponivel' as const,
  }))

  const chunkSize = 100
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await supabase.from('rifa_numeros').insert(chunk)
    if (error) {
      // Race condition: another client already seeded
      if (error.code === '23505') return
      throw error
    }
  }
}

export async function fetchNumeros(): Promise<RifaNumero[]> {
  await ensureNumerosSeeded()

  const { data, error } = await supabase
    .from('rifa_numeros')
    .select('*')
    .order('numero', { ascending: true })

  if (error) throw error
  return (data ?? []) as RifaNumero[]
}

export async function comprarNumero(
  id: string,
  form: CompraFormData,
): Promise<RifaNumero> {
  const { data: current, error: fetchError } = await supabase
    .from('rifa_numeros')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError
  if (!current) throw new Error('Número não encontrado')

  const row = current as RifaNumero
  if (row.status !== 'Disponivel') {
    throw new Error('Este número já foi vendido ou reservado')
  }

  const { data, error } = await supabase
    .from('rifa_numeros')
    .update({
      status: form.status,
      nome_comprador: form.nome_comprador.trim(),
      telefone: form.telefone.trim(),
      vendedor: form.vendedor.trim(),
      forma_pagamento: form.forma_pagamento,
      data_venda: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'Disponivel')
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) {
    throw new Error('Este número já foi vendido ou reservado')
  }

  return data as RifaNumero
}

export async function marcarComoPago(id: string): Promise<RifaNumero> {
  const { data: current, error: fetchError } = await supabase
    .from('rifa_numeros')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError
  if (!current) throw new Error('Número não encontrado')

  const row = current as RifaNumero
  if (row.status !== 'Reservado') {
    throw new Error('Só é possível marcar como pago um número reservado')
  }

  const { data, error } = await supabase
    .from('rifa_numeros')
    .update({
      status: 'Pago',
      data_venda: row.data_venda ?? new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'Reservado')
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) {
    throw new Error('Não foi possível atualizar este número')
  }

  return data as RifaNumero
}

export async function limparNumero(id: string): Promise<RifaNumero> {
  const { data: current, error: fetchError } = await supabase
    .from('rifa_numeros')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError
  if (!current) throw new Error('Número não encontrado')

  const row = current as RifaNumero
  if (row.status === 'Disponivel') {
    throw new Error('Este número já está disponível')
  }

  const { data, error } = await supabase
    .from('rifa_numeros')
    .update({
      status: 'Disponivel',
      nome_comprador: null,
      telefone: null,
      vendedor: null,
      forma_pagamento: null,
      data_venda: null,
    })
    .eq('id', id)
    .neq('status', 'Disponivel')
    .select()
    .maybeSingle()

  if (error) throw error
  if (!data) {
    throw new Error('Não foi possível limpar este número')
  }

  return data as RifaNumero
}
