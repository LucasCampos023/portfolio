import { useEffect, useState } from 'react'

/** ↑ ↑ ↓ ↓ ← → ← → B A — Konami, 1986, Gradius no NES. */
const SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

/**
 * Escuta a sequência do Konami Code e alterna um estado.
 *
 * Guarda só a posição atual na sequência: cada tecla certa avança, qualquer
 * tecla errada volta para o começo — mas se a tecla errada for o início da
 * sequência (um ↑ depois de outro ↑), ela conta como primeiro passo.
 */
export function useKonami() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    let position = 0

    const onKey = (event: KeyboardEvent) => {
      // Não dispara enquanto a pessoa digita num campo (o terminal usa setas).
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key

      if (key === SEQUENCE[position]) {
        position++
        if (position === SEQUENCE.length) {
          position = 0
          setActive((v) => !v)
        }
        return
      }

      position = key === SEQUENCE[0] ? 1 : 0
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return [active, setActive] as const
}
