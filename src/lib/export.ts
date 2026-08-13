import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import type { RifaNumero } from '@/types/rifa'
import { STATUS_LABELS } from '@/types/rifa'
import { formatCurrency, formatDate, formatNumero } from '@/lib/format'
import { CAMPANHA_NOME, VALOR_NUMERO } from '@/lib/supabase'

function soldRows(numeros: RifaNumero[]) {
  return numeros
    .filter((n) => n.status !== 'Disponivel')
    .sort((a, b) => a.numero - b.numero)
}

export function exportToExcel(numeros: RifaNumero[]) {
  const rows = soldRows(numeros).map((n) => ({
    Número: formatNumero(n.numero),
    Status: STATUS_LABELS[n.status],
    Comprador: n.nome_comprador ?? '',
    Telefone: n.telefone ?? '',
    Vendedor: n.vendedor ?? '',
    'Forma de pagamento': n.forma_pagamento ?? '',
    'Data da venda': formatDate(n.data_venda),
    Valor: n.status === 'Pago' ? VALOR_NUMERO : 0,
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas')
  XLSX.writeFile(
    workbook,
    `relatorio-${CAMPANHA_NOME.toLowerCase().replace(/\s+/g, '-')}.xlsx`,
  )
}

export function exportToPdf(numeros: RifaNumero[]) {
  const vendidos = soldRows(numeros)
  const pagos = vendidos.filter((n) => n.status === 'Pago').length
  const reservados = vendidos.filter((n) => n.status === 'Reservado').length
  const total = pagos * VALOR_NUMERO

  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(16)
  doc.text(CAMPANHA_NOME, 14, 18)
  doc.setFontSize(10)
  doc.text(
    `Relatório de vendas — ${new Date().toLocaleString('pt-BR')}`,
    14,
    26,
  )
  doc.text(
    `Pagos: ${pagos}  |  Reservados: ${reservados}  |  Arrecadado: ${formatCurrency(total)}`,
    14,
    32,
  )

  autoTable(doc, {
    startY: 38,
    head: [
      [
        'Nº',
        'Status',
        'Comprador',
        'Telefone',
        'Vendedor',
        'Pagamento',
        'Data',
        'Valor',
      ],
    ],
    body: vendidos.map((n) => [
      formatNumero(n.numero),
      STATUS_LABELS[n.status],
      n.nome_comprador ?? '',
      n.telefone ?? '',
      n.vendedor ?? '',
      n.forma_pagamento ?? '',
      formatDate(n.data_venda),
      n.status === 'Pago' ? formatCurrency(VALOR_NUMERO) : '—',
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [196, 22, 28] },
  })

  doc.save(
    `relatorio-${CAMPANHA_NOME.toLowerCase().replace(/\s+/g, '-')}.pdf`,
  )
}
