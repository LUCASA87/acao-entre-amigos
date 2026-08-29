import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Dices, Loader2, PartyPopper, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/Modal'
import { DetailsModal } from '@/components/DetailsModal'
import type { RifaNumero } from '@/types/rifa'
import { formatNumero } from '@/lib/format'

const SENHA_SORTEIO = '54321'
const DURACAO_MS = 5000
const INTERVALO_MS = 60

type Etapa = 'senha' | 'quantidade' | 'animando' | 'resultado'

interface SorteioModalProps {
  open: boolean
  onClose: () => void
  numeros: RifaNumero[]
}

function shuffle<T>(list: T[]): T[] {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.4}s`,
        duration: `${2.2 + Math.random() * 1.8}s`,
        color: ['#c4161c', '#f0b429', '#2f7a3a', '#1a4f9c', '#ffffff', '#ff6b6b'][
          i % 6
        ],
        rotate: `${Math.random() * 360}deg`,
        size: `${6 + Math.random() * 8}px`,
      })),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-0"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotate})`,
          }}
        />
      ))}
    </div>
  )
}

export function SorteioModal({ open, onClose, numeros }: SorteioModalProps) {
  const [etapa, setEtapa] = useState<Etapa>('senha')
  const [senha, setSenha] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [nomeFlash, setNomeFlash] = useState('')
  const [numeroFlash, setNumeroFlash] = useState('')
  const [ganhadores, setGanhadores] = useState<RifaNumero[]>([])
  const [progresso, setProgresso] = useState(0)
  const [detalhe, setDetalhe] = useState<RifaNumero | null>(null)
  const timers = useRef<number[]>([])

  const pagos = useMemo(
    () =>
      numeros.filter(
        (n) => n.status === 'Pago' && (n.nome_comprador?.trim() ?? '').length > 0,
      ),
    [numeros],
  )

  const limparTimers = () => {
    for (const id of timers.current) window.clearInterval(id)
    timers.current = []
  }

  useEffect(() => {
    if (!open) {
      limparTimers()
      setEtapa('senha')
      setSenha('')
      setQuantidade(1)
      setNomeFlash('')
      setNumeroFlash('')
      setGanhadores([])
      setProgresso(0)
      setDetalhe(null)
    }
  }, [open])

  useEffect(() => () => limparTimers(), [])

  const handleSenha = (e: FormEvent) => {
    e.preventDefault()
    if (senha !== SENHA_SORTEIO) {
      toast.error('Senha incorreta')
      return
    }
    if (pagos.length === 0) {
      toast.error('Não há números pagos para sortear')
      return
    }
    setEtapa('quantidade')
  }

  const iniciarSorteio = () => {
    if (quantidade < 1 || quantidade > pagos.length) {
      toast.error(`Escolha entre 1 e ${pagos.length} número(s)`)
      return
    }

    const escolhidos = shuffle(pagos).slice(0, quantidade)
    setGanhadores(escolhidos)
    setEtapa('animando')
    setProgresso(0)

    const inicio = Date.now()
    const tick = window.setInterval(() => {
      const elapsed = Date.now() - inicio
      setProgresso(Math.min(100, (elapsed / DURACAO_MS) * 100))

      const aleatorio = pagos[Math.floor(Math.random() * pagos.length)]
      setNomeFlash(aleatorio.nome_comprador?.trim() || '—')
      setNumeroFlash(formatNumero(aleatorio.numero))

      if (elapsed >= DURACAO_MS) {
        limparTimers()
        setProgresso(100)
        setEtapa('resultado')
      }
    }, INTERVALO_MS)

    timers.current.push(tick)
  }

  const titulo =
    etapa === 'senha'
      ? 'Sorteio'
      : etapa === 'quantidade'
        ? 'Quantos números?'
        : etapa === 'animando'
          ? 'Sorteando...'
          : 'Ganhadores!'

  return (
    <Modal open={open} onClose={onClose} title={titulo}>
      {etapa === 'senha' && (
        <form onSubmit={handleSenha} className="space-y-4">
          <p className="text-sm text-muted">
            Digite a senha para liberar o sorteio. Somente números com status{' '}
            <strong className="text-brand-600">Pago</strong> participam.
          </p>
          <p className="rounded-xl bg-ad-green-soft px-3 py-2 text-sm font-medium text-ad-green">
            {pagos.length} número(s) pagos elegíveis
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoFocus
              inputMode="numeric"
              className="w-full rounded-xl border border-brand-200 bg-white px-3 py-3 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 sm:py-2.5 sm:text-sm"
              placeholder="•••••"
            />
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white"
          >
            <Dices size={16} />
            Continuar
          </button>
        </form>
      )}

      {etapa === 'quantidade' && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Escolha quantos números serão sorteados entre os {pagos.length} pagos.
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Quantidade de ganhadores
            </label>
            <input
              type="number"
              min={1}
              max={pagos.length}
              value={quantidade}
              onChange={(e) =>
                setQuantidade(
                  Math.max(1, Math.min(pagos.length, Number(e.target.value) || 1)),
                )
              }
              className="w-full rounded-xl border border-brand-200 bg-white px-3 py-3 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 sm:py-2.5 sm:text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 5].filter((n) => n <= pagos.length).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setQuantidade(n)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                  quantidade === n
                    ? 'bg-brand-600 text-white'
                    : 'border border-brand-200 bg-white text-ink'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={iniciarSorteio}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white"
          >
            <Dices size={16} />
            Iniciar sorteio
          </button>
        </div>
      )}

      {etapa === 'animando' && (
        <div className="space-y-4 py-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ad-gold-soft text-reserved">
            <Loader2 className="animate-spin" size={28} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Roletando nomes...
          </p>
          <div className="sorteio-flash overflow-hidden rounded-2xl border border-ad-gold/40 bg-gradient-to-b from-ad-gold-soft to-white px-4 py-8 shadow-inner">
            <p className="font-display text-sm font-semibold text-reserved">
              Nº {numeroFlash || '---'}
            </p>
            <p
              key={`${nomeFlash}-${numeroFlash}`}
              className="sorteio-name-pop mt-1 font-display text-3xl font-bold text-brand-600 sm:text-4xl"
            >
              {nomeFlash || '...'}
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-brand-100">
            <div
              className="h-full rounded-full bg-brand-600 transition-[width] duration-75"
              style={{ width: `${progresso}%` }}
            />
          </div>
          <p className="text-xs text-muted">Aguarde 5 segundos...</p>
        </div>
      )}

      {etapa === 'resultado' && (
        <div className="relative space-y-4 overflow-hidden py-1 text-center">
          <ConfettiBurst />
          <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ad-gold text-ink shadow-lg animate-bounce">
            <Trophy size={32} />
          </div>
          <div className="relative z-10">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              <PartyPopper size={14} />
              Festa! Temos ganhador{ganhadores.length > 1 ? 'es' : ''}!
            </p>
            <h3 className="mt-3 font-display text-2xl font-bold text-brand-600">
              Parabéns!
            </h3>
          </div>

          <ul className="relative z-10 space-y-2">
            {ganhadores.map((g, index) => (
              <li key={g.id} style={{ animationDelay: `${index * 120}ms` }}>
                <button
                  type="button"
                  onClick={() => setDetalhe(g)}
                  className="animate-pop-in w-full overflow-hidden rounded-2xl border border-ad-gold/50 bg-white text-left shadow-md transition active:scale-[0.99]"
                >
                  <div className="brand-stripe h-1" />
                  <div className="px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-reserved">
                      {ganhadores.length > 1
                        ? `${index + 1}º prêmio`
                        : 'Ganhador'}{' '}
                      — Nº {formatNumero(g.numero)}
                    </p>
                    <p className="font-display text-xl font-bold text-brand-600">
                      {g.nome_comprador}
                    </p>
                    {g.telefone && (
                      <p className="mt-0.5 text-sm text-muted">{g.telefone}</p>
                    )}
                    <p className="mt-2 text-xs font-semibold text-ad-blue">
                      Toque para ver todos os dados →
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <div className="relative z-10 flex flex-col gap-2 pt-1 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                setEtapa('quantidade')
                setGanhadores([])
                setProgresso(0)
                setDetalhe(null)
              }}
              className="rounded-xl border border-brand-200 px-4 py-2.5 text-sm font-semibold text-ink"
            >
              Sortear de novo
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <DetailsModal
        numero={detalhe}
        onClose={() => setDetalhe(null)}
        mensagemGanhador
        title={
          detalhe
            ? `Dados — ${detalhe.nome_comprador ?? formatNumero(detalhe.numero)}`
            : 'Detalhes'
        }
      />
    </Modal>
  )
}
