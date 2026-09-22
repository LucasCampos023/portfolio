import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useKonami } from '@/hooks/useKonami'

/**
 * Easter egg: o Konami Code liga o "modo raio-X", que contorna cada caixa
 * da página. É a piada coerente com o resto — um site desenhado como planta
 * técnica que, no comando certo, mostra as próprias linhas de construção.
 *
 * O HUD também expõe contadores reais do DOM, porque o número medido é mais
 * interessante do que um número escrito.
 */
export function Xray() {
  const { t } = useTranslation()
  const [active, setActive] = useKonami()
  const [stats, setStats] = useState({ nodes: 0, depth: 0 })

  useEffect(() => {
    document.documentElement.dataset.xray = active ? 'on' : 'off'

    if (!active) return

    // Conta os nós e mede a profundidade máxima da árvore, uma vez por ativação.
    const all = document.querySelectorAll('*')
    let depth = 0
    all.forEach((el) => {
      let d = 0
      let node: Element | null = el
      while (node) {
        node = node.parentElement
        d++
      }
      if (d > depth) depth = d
    })

    setStats({ nodes: all.length, depth })
  }, [active])

  // Esc desliga, para quem ativou sem querer saber como desativar.
  useEffect(() => {
    if (!active) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, setActive])

  return (
    <AnimatePresence>
      {active && (
        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 left-4 z-[180] border border-[var(--accent)] bg-[var(--bg)] px-4 py-3"
        >
          <p className="stamp mb-2 text-[var(--accent)]">
            {t('xray.title')}
          </p>
          <dl className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between gap-6">
              <dt className="faint">{t('xray.nodes')}</dt>
              <dd>{stats.nodes}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="faint">{t('xray.depth')}</dt>
              <dd>{stats.depth}</dd>
            </div>
          </dl>
          <button
            onClick={() => setActive(false)}
            className="mt-3 w-full border border-[var(--rule)] px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            ESC · {t('xray.off')}
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
