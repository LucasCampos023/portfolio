import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import type { PrimeResponse } from '@/workers/primes.worker'
import { fetchRepos } from '@/lib/github'
import { useAppStore } from '@/store/useAppStore'
import { Section } from './Section'
import { cn } from '@/lib/utils'

function Panel({
  n,
  title,
  desc,
  children,
}: {
  n: string
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col panel">
      <div className="flex items-start justify-between gap-3 border-b p-5">
        <div>
          <h3 className="font-mono text-sm uppercase tracking-wider">
            {title}
          </h3>
          <p className="prose-serif mt-1.5 text-sm leading-snug dim">{desc}</p>
        </div>
        <span className="stamp shrink-0">{n}</span>
      </div>
      <div className="flex flex-1 flex-col justify-end p-5">{children}</div>
    </div>
  )
}

function Button({
  onClick,
  children,
  active,
  disabled,
}: {
  onClick: () => void
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full border px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest transition-colors disabled:opacity-50',
        active
          ? 'border-[var(--accent)] text-[var(--accent)]'
          : 'hover:border-[var(--accent)] hover:text-[var(--accent)]',
      )}
    >
      {children}
    </button>
  )
}

/* --------------------------- Web Worker --------------------------- */

function WorkerPanel() {
  const { t } = useTranslation()
  const [result, setResult] = useState<PrimeResponse | null>(null)
  const [running, setRunning] = useState(false)
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    // `new URL(..., import.meta.url)` é o que faz o Vite empacotar o worker.
    const worker = new Worker(
      new URL('../workers/primes.worker.ts', import.meta.url),
      { type: 'module' },
    )

    worker.onmessage = (event: MessageEvent<PrimeResponse>) => {
      setResult(event.data)
      setRunning(false)
    }

    workerRef.current = worker
    return () => worker.terminate()
  }, [])

  const run = () => {
    setRunning(true)
    workerRef.current?.postMessage({ limit: 8_000_000 })
  }

  return (
    <Panel n="4.1" title={t('lab.worker.title')} desc={t('lab.worker.desc')}>
      <p className="mb-3 min-h-[2.5rem] font-mono text-xs leading-relaxed text-[var(--accent)]">
        {result &&
          t('lab.worker.result', {
            total: result.count.toLocaleString(),
            limit: result.limit.toLocaleString(),
            ms: result.ms,
          })}
      </p>
      <Button onClick={run} disabled={running} active={running}>
        {running ? `${t('lab.worker.running')}…` : t('lab.worker.run')}
      </Button>
    </Panel>
  )
}

/* -------------------------- Web Audio API -------------------------- */

function AudioPanel() {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<{
    ctx: AudioContext
    analyser: AnalyserNode
    oscillators: OscillatorNode[]
    gain: GainNode
  } | null>(null)
  const frameRef = useRef(0)
  const [playing, setPlaying] = useState(false)

  const stop = () => {
    const audio = audioRef.current
    if (!audio) return

    // Rampa curta no gain: cortar o oscilador seco estala no alto-falante.
    audio.gain.gain.cancelScheduledValues(audio.ctx.currentTime)
    audio.gain.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.04)
    setTimeout(() => {
      audio.oscillators.forEach((osc) => osc.stop())
      void audio.ctx.close()
      audioRef.current = null
    }, 200)

    cancelAnimationFrame(frameRef.current)
    setPlaying(false)
  }

  const start = () => {
    const ctx = new AudioContext()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 128

    const gain = ctx.createGain()
    gain.gain.value = 0
    gain.gain.setTargetAtTime(0.08, ctx.currentTime, 0.08)

    const oscillators = [220, 261.63, 329.63, 392].map((freq, index) => {
      const osc = ctx.createOscillator()
      osc.type = index === 0 ? 'sine' : 'triangle'
      osc.frequency.value = freq
      osc.connect(gain)
      osc.start()
      return osc
    })

    gain.connect(analyser)
    analyser.connect(ctx.destination)
    audioRef.current = { ctx, analyser, oscillators, gain }
    setPlaying(true)

    const canvas = canvasRef.current
    const g = canvas?.getContext('2d')
    const bins = new Uint8Array(analyser.frequencyBinCount)

    const draw = () => {
      frameRef.current = requestAnimationFrame(draw)
      if (!canvas || !g) return

      analyser.getByteFrequencyData(bins)
      const { width, height } = canvas
      g.clearRect(0, 0, width, height)

      // Barras finas com folga de 1px: leitura de analisador, não equalizador.
      const step = width / bins.length
      g.fillStyle = '#00d9ff'
      bins.forEach((value, index) => {
        const barHeight = (value / 255) * height
        g.globalAlpha = 0.35 + (value / 255) * 0.65
        g.fillRect(index * step, height - barHeight, step - 1, barHeight)
      })
      g.globalAlpha = 1
    }

    draw()
  }

  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  return (
    <Panel n="4.2" title={t('lab.audio.title')} desc={t('lab.audio.desc')}>
      <canvas
        ref={canvasRef}
        width={320}
        height={60}
        className="mb-3 h-[60px] w-full border bg-[var(--bg-sunk)]"
      />
      <Button onClick={playing ? stop : start} active={playing}>
        {playing ? t('lab.audio.stop') : t('lab.audio.play')}
      </Button>
    </Panel>
  )
}

/* -------------------------- TanStack Query -------------------------- */

function QueryPanel() {
  const { t } = useTranslation()

  // Mesma queryKey da seção de repositórios: o cache é compartilhado,
  // então clicar aqui atualiza a lista lá em cima também.
  const { data, isFetching, refetch, isStale, dataUpdatedAt } = useQuery({
    queryKey: ['gh-repos'],
    queryFn: fetchRepos,
    staleTime: 5 * 60_000,
    retry: 1,
  })

  return (
    <Panel n="4.3" title={t('lab.query.title')} desc={t('lab.query.desc')}>
      <dl className="mb-3 space-y-1.5 font-mono text-xs">
        <div className="flex justify-between border-b pb-1.5">
          <dt className="faint">repos</dt>
          <dd className="text-[var(--accent)]">{data?.length ?? '—'}</dd>
        </div>
        <div className="flex justify-between border-b pb-1.5">
          <dt className="faint">{t('lab.query.requests')}</dt>
          <dd className="dim">
            {isStale ? t('lab.query.stale') : t('lab.query.fresh')}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="faint">updated</dt>
          <dd className="dim">
            {dataUpdatedAt
              ? new Date(dataUpdatedAt).toLocaleTimeString()
              : '—'}
          </dd>
        </div>
      </dl>
      <Button onClick={() => void refetch()} active={isFetching}>
        {isFetching ? '…' : t('lab.query.refetch')}
      </Button>
    </Panel>
  )
}

/* --------------------------- Persistência --------------------------- */

function StoragePanel() {
  const { t } = useTranslation()
  const { visited, theme, lang } = useAppStore()

  return (
    <Panel n="4.4" title={t('lab.storage.title')} desc={t('lab.storage.desc')}>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {visited.length === 0 && <span className="font-mono text-xs faint">—</span>}
        {visited.map((id) => (
          <span
            key={id}
            className="border border-[var(--accent)] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--accent)]"
          >
            {id}
          </span>
        ))}
      </div>

      <dl className="space-y-1.5 font-mono text-xs">
        <div className="flex justify-between border-b pb-1.5">
          <dt className="faint">theme</dt>
          <dd className="dim">{theme}</dd>
        </div>
        <div className="flex justify-between border-b pb-1.5">
          <dt className="faint">lang</dt>
          <dd className="dim">{lang}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="faint">{t('lab.storage.visited')}</dt>
          <dd className="text-[var(--accent)]">{visited.length}</dd>
        </div>
      </dl>
    </Panel>
  )
}

export function Lab() {
  const { t } = useTranslation()

  return (
    <Section id="lab" n="04" title={t('lab.title')} sub={t('lab.sub')}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <WorkerPanel />
        <AudioPanel />
        <QueryPanel />
        <StoragePanel />
      </div>
    </Section>
  )
}
