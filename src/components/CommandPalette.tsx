import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { profile } from '@/data/content'
import { cn } from '@/lib/utils'

interface Item {
  id: string
  label: string
  group: 'nav' | 'actions'
  hint: string
  run: () => void
}

/** Busca de comandos: ⌘K/Ctrl+K, filtro por substring, setas e Enter. */
export function CommandPalette() {
  const { t, i18n } = useTranslation()
  const { paletteOpen, setPaletteOpen, toggleTheme, lang, setLang } =
    useAppStore()
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const items = useMemo<Item[]>(() => {
    const go = (hash: string) => () => {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
      setPaletteOpen(false)
    }

    const sections = [
      'about',
      'work',
      'tools',
      'lab',
      'terminal',
      'contact',
    ] as const

    return [
      ...sections.map((id, index) => ({
        id,
        label: t(`nav.${id}`),
        group: 'nav' as const,
        hint: String(index + 1).padStart(2, '0'),
        run: go(`#${id}`),
      })),
      {
        id: 'theme',
        label: t('palette.theme'),
        group: 'actions',
        hint: 'T',
        run: () => {
          toggleTheme()
          setPaletteOpen(false)
        },
      },
      {
        id: 'lang',
        label: t('palette.lang'),
        group: 'actions',
        hint: lang === 'pt' ? 'EN' : 'PT',
        run: () => {
          const next = lang === 'pt' ? 'en' : 'pt'
          setLang(next)
          void i18n.changeLanguage(next)
          setPaletteOpen(false)
        },
      },
      {
        id: 'whatsapp',
        label: t('palette.whatsapp'),
        group: 'actions',
        hint: '↗',
        run: () => {
          window.open('https://wa.me/5515996940984', '_blank', 'noopener')
          setPaletteOpen(false)
        },
      },
      {
        id: 'github',
        label: t('palette.github'),
        group: 'actions',
        hint: '↗',
        run: () => {
          window.open(
            `https://github.com/${profile.handle}`,
            '_blank',
            'noopener',
          )
          setPaletteOpen(false)
        },
      },
    ]
  }, [t, lang, i18n, setLang, setPaletteOpen, toggleTheme])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => item.label.toLowerCase().includes(q))
  }, [items, query])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen(!useAppStore.getState().paletteOpen)
      }
      if (event.key === 'Escape') setPaletteOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setPaletteOpen])

  useEffect(() => {
    if (!paletteOpen) return
    setQuery('')
    setCursor(0)
    // O foco espera o elemento existir depois da animação de entrada.
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [paletteOpen])

  const onKeyDown = (event: React.KeyboardEvent) => {
    const total = Math.max(filtered.length, 1)
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setCursor((c) => (c + 1) % total)
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setCursor((c) => (c - 1 + total) % total)
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      filtered[cursor]?.run()
    }
  }

  return (
    <AnimatePresence>
      {paletteOpen && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-start justify-center px-4 pt-[16vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setPaletteOpen(false)}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: -8 }}
            animate={{ y: 0 }}
            exit={{ y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md border border-[var(--accent)] bg-[var(--bg)]"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <span className="font-mono text-xs text-[var(--accent)]">›</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setCursor(0)
                }}
                placeholder={t('palette.placeholder')}
                className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-[var(--fg-faint)]"
              />
              <kbd className="stamp">ESC</kbd>
            </div>

            <div className="max-h-72 overflow-y-auto py-1">
              {filtered.length === 0 && (
                <p className="px-4 py-6 text-center font-mono text-xs faint">
                  {t('palette.empty')}
                </p>
              )}

              {(['nav', 'actions'] as const).map((group) => {
                const groupItems = filtered.filter((i) => i.group === group)
                if (groupItems.length === 0) return null

                return (
                  <div key={group}>
                    <p className="stamp px-4 py-2">{t(`palette.${group}`)}</p>
                    {groupItems.map((item) => {
                      const index = filtered.indexOf(item)
                      return (
                        <button
                          key={item.id}
                          onMouseEnter={() => setCursor(index)}
                          onClick={item.run}
                          className={cn(
                            'flex w-full items-center justify-between gap-3 px-4 py-2 text-left font-mono text-sm transition-colors',
                            index === cursor
                              ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                              : 'dim',
                          )}
                        >
                          <span>{item.label}</span>
                          <span className="text-[10px] opacity-70">
                            {item.hint}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-4 border-t px-4 py-2">
              <span className="stamp">↑↓</span>
              <span className="stamp">↵ {t('palette.hint')}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
