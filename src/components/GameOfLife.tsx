import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/usePointer'

/**
 * Jogo da Vida do Conway (1970) rodando como plano de fundo.
 *
 * Regras, na íntegra: uma célula viva com 2 ou 3 vizinhas sobrevive;
 * uma célula morta com exatamente 3 vizinhas nasce; todo o resto morre.
 * Três linhas de lógica que produzem comportamento indefinidamente complexo —
 * é por isso que ele virou o cartão de visitas de autômatos celulares.
 *
 * Interativo: passe o mouse (ou o dedo) e você semeia células vivas.
 */

const CELL = 14
const TICK_MS = 130

export function GameOfLife({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cols = 0
    let rows = 0
    let grid = new Uint8Array(0)
    let next = new Uint8Array(0)
    let timer = 0
    let frame = 0
    let running = false

    const index = (x: number, y: number) => y * cols + x

    const seed = () => {
      for (let i = 0; i < grid.length; i++) {
        grid[i] = Math.random() < 0.12 ? 1 : 0
      }

      // Um planador no canto superior esquerdo: a figura mais reconhecível
      // do Jogo da Vida, que atravessa o tabuleiro na diagonal para sempre.
      const glider: [number, number][] = [
        [1, 0],
        [2, 1],
        [0, 2],
        [1, 2],
        [2, 2],
      ]
      glider.forEach(([x, y]) => {
        if (x < cols && y < rows) grid[index(x + 2, y + 2)] = 1
      })
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      cols = Math.max(1, Math.ceil(rect.width / CELL))
      rows = Math.max(1, Math.ceil(rect.height / CELL))
      grid = new Uint8Array(cols * rows)
      next = new Uint8Array(cols * rows)
      seed()
    }

    const step = () => {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let alive = 0

          // Vizinhança de Moore, com as bordas se ligando (toro):
          // sem isso os planadores morreriam ao encostar na parede.
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue
              const nx = (x + dx + cols) % cols
              const ny = (y + dy + rows) % rows
              alive += grid[index(nx, ny)]
            }
          }

          const current = grid[index(x, y)]
          next[index(x, y)] =
            current === 1 ? (alive === 2 || alive === 3 ? 1 : 0) : alive === 3 ? 1 : 0
        }
      }

      const swap = grid
      grid = next
      next = swap
    }

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      const accent = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent')
        .trim()

      ctx.fillStyle = accent || '#00d9ff'

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (grid[index(x, y)] === 0) continue
          // Quadrado menor que a célula: fica a grade respirando entre eles.
          ctx.globalAlpha = 0.22
          ctx.fillRect(x * CELL + 3, y * CELL + 3, CELL - 6, CELL - 6)
        }
      }

      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop)
      if (now - timer < TICK_MS) return
      timer = now
      step()
      draw()
    }

    const paint = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = Math.floor((event.clientX - rect.left) / CELL)
      const y = Math.floor((event.clientY - rect.top) / CELL)

      // Pincel 3x3 para o traço ser visível a essa escala.
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = (x + dx + cols) % cols
          const ny = (y + dy + rows) % rows
          if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) {
            grid[index(nx, ny)] = 1
          }
        }
      }
      draw()
    }

    resize()
    draw()

    // Só simula enquanto está na tela: fora dela seria CPU queimada à toa.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !reduced) {
          if (!running) {
            running = true
            frame = requestAnimationFrame(loop)
          }
        } else {
          running = false
          cancelAnimationFrame(frame)
        }
      },
      { threshold: 0 },
    )

    observer.observe(canvas)
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', paint)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', paint)
    }
  }, [reduced])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`h-full w-full ${className}`}
    />
  )
}
