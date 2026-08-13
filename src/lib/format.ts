export function formatNumero(n: number): string {
  return String(n).padStart(3, '0')
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

/** Remove acentos e normaliza para comparação (lucas === Lúcas). */
export function normalizeNome(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

export function samePerson(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const na = normalizeNome(a)
  const nb = normalizeNome(b)
  if (!na || !nb) return false
  return na === nb
}

/** Agrupa variantes do mesmo nome e escolhe um rótulo para exibir. */
export function uniquePeople(
  values: Array<string | null | undefined>,
): string[] {
  const groups = new Map<string, Map<string, number>>()

  for (const raw of values) {
    const trimmed = raw?.trim()
    if (!trimmed) continue
    const key = normalizeNome(trimmed)
    if (!key) continue

    const variants = groups.get(key) ?? new Map<string, number>()
    variants.set(trimmed, (variants.get(trimmed) ?? 0) + 1)
    groups.set(key, variants)
  }

  const labels: string[] = []
  for (const variants of groups.values()) {
    let best = ''
    let bestScore = -1
    for (const [label, count] of variants) {
      const accentBonus = /[áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ]/.test(
        label,
      )
        ? 2
        : 0
      const caseBonus = /[A-ZÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ]/.test(label) ? 1 : 0
      const score = count * 10 + accentBonus + caseBonus
      if (score > bestScore) {
        bestScore = score
        best = label
      }
    }
    labels.push(best)
  }

  return labels.sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

