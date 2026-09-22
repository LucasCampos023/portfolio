import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { profile, tools } from '@/data/content'
import type { Repo } from '@/lib/github'
import { Section } from './Section'

/* ---------------------------------------------------------------
   Um shell de verdade: histórico com as setas, Tab completa o
   comando, e os dados vêm do mesmo cache TanStack Query que
   alimenta o resto da página — `repos` não é resposta decorada.
--------------------------------------------------------------- */

interface Line {
  id: number
  kind: 'input' | 'output' | 'error' | 'ascii'
  text: string
}

const ASCII = String.raw`
   __
  / /  __ ______ ___ ____ _
 / /__/ // / __// _ \/ __//
/____/\_,_/\__/ \_,_/____/
`

export function Terminal() {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.lang)
  const { toggleTheme, setLang, theme } = useAppStore()
  const queryClient = useQueryClient()

  const [lines, setLines] = useState<Line[]>([])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [focused, setFocused] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const counter = useRef(0)
  const mounted = useRef(Date.now())

  const pt = lang === 'pt'

  const push = (kind: Line['kind'], text: string) =>
    setLines((prev) => [...prev, { id: counter.current++, kind, text }])

  const pushMany = (kind: Line['kind'], texts: string[]) =>
    setLines((prev) => [
      ...prev,
      ...texts.map((text) => ({ id: counter.current++, kind, text })),
    ])

  const commands = useMemo(() => {
    const sections = ['about', 'work', 'tools', 'lab', 'terminal', 'contact']

    const go = (target: string) => {
      const el = document.getElementById(target)
      if (!el) {
        push('error', pt ? `seção não encontrada: ${target}` : `no such section: ${target}`)
        return
      }
      el.scrollIntoView({ behavior: 'smooth' })
      push('output', pt ? `indo para #${target}` : `navigating to #${target}`)
    }

    return {
      help: () =>
        pushMany('output', [
          pt ? 'comandos disponíveis:' : 'available commands:',
          '',
          '  help        ' + (pt ? 'esta lista' : 'this list'),
          '  whoami      ' + (pt ? 'quem escreveu isto' : 'who wrote this'),
          '  ls          ' + (pt ? 'lista as seções' : 'list sections'),
          '  cd <seção>  ' + (pt ? 'rola até a seção' : 'scroll to section'),
          '  repos       ' + (pt ? 'repositórios (API do GitHub)' : 'repositories (GitHub API)'),
          '  stack       ' + (pt ? 'ferramentas por status' : 'tools by status'),
          '  neofetch    ' + (pt ? 'ficha do sistema' : 'system sheet'),
          '  theme       ' + (pt ? 'alterna claro/escuro' : 'toggle light/dark'),
          '  lang        ' + (pt ? 'alterna PT/EN' : 'toggle PT/EN'),
          '  date        ' + (pt ? 'data e hora' : 'date and time'),
          '  uptime      ' + (pt ? 'tempo nesta página' : 'time on this page'),
          '  clear       ' + (pt ? 'limpa a tela' : 'clear the screen'),
          '',
          pt ? 'dica: ↑ ↓ navegam o histórico, Tab completa.' : 'tip: ↑ ↓ walk history, Tab completes.',
        ]),

      whoami: () =>
        pushMany('output', [
          profile.name,
          pt
            ? `${profile.role} · ${profile.location} · programando desde ${profile.since}`
            : `${profile.role} · ${profile.location} · writing code since ${profile.since}`,
          `github.com/${profile.handle}`,
        ]),

      ls: () =>
        pushMany('output', [
          sections.map((s) => s.padEnd(12)).join(''),
        ]),

      cd: (arg?: string) => {
        if (!arg) {
          push('error', pt ? 'uso: cd <seção>' : 'usage: cd <section>')
          return
        }
        go(arg.replace(/^#/, ''))
      },

      open: (arg?: string) => {
        if (!arg) {
          push('error', pt ? 'uso: open <seção>' : 'usage: open <section>')
          return
        }
        go(arg.replace(/^#/, ''))
      },

      repos: () => {
        // Lê o cache já preenchido pela seção de repositórios.
        const repos = queryClient.getQueryData<Repo[]>(['gh-repos'])

        if (!repos) {
          push('error', pt ? 'cache vazio — role até #work primeiro' : 'empty cache — scroll to #work first')
          return
        }

        pushMany('output', [
          pt ? `${repos.length} repositório(s) público(s):` : `${repos.length} public repo(s):`,
          '',
          ...repos.map(
            (r) =>
              `  ${r.name.padEnd(18)} ${(r.language ?? '—').padEnd(12)} ★ ${r.stargazers_count}`,
          ),
        ])
      },

      stack: () =>
        pushMany('output', [
          ...tools.map((tool) => `  ${tool.name.padEnd(14)} ${tool.status}`),
        ]),

      neofetch: () => {
        push('ascii', ASCII)
        pushMany('output', [
          `${profile.handle}@web`,
          '─'.repeat(28),
          `${(pt ? 'SO' : 'OS').padEnd(10)} ${navigator.platform || 'web'}`,
          `${(pt ? 'Navegador' : 'Browser').padEnd(10)} ${navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Edg') ? 'Edge' : 'Chromium'}`,
          `${'Shell'.padEnd(10)} lucas-sh 1.0`,
          `${(pt ? 'Resolução' : 'Resolution').padEnd(10)} ${window.innerWidth}x${window.innerHeight}`,
          `${'Tema'.padEnd(10)} ${theme}`,
          `${(pt ? 'Núcleos' : 'Cores').padEnd(10)} ${navigator.hardwareConcurrency ?? '?'}`,
          `${(pt ? 'Feito com' : 'Built with').padEnd(10)} React · TypeScript · Three.js`,
        ])
      },

      theme: () => {
        toggleTheme()
        push('output', pt ? 'tema invertido' : 'theme inverted')
      },

      lang: () => {
        setLang(pt ? 'en' : 'pt')
        push('output', pt ? 'switching to english' : 'mudando para português')
      },

      date: () =>
        push('output', new Date().toLocaleString(pt ? 'pt-BR' : 'en-US')),

      uptime: () => {
        const s = Math.floor((Date.now() - mounted.current) / 1000)
        const m = Math.floor(s / 60)
        push(
          'output',
          pt
            ? `${m}m ${s % 60}s nesta página`
            : `${m}m ${s % 60}s on this page`,
        )
      },

      clear: () => setLines([]),

      sudo: () =>
        push(
          'error',
          pt
            ? 'lucas não está no arquivo sudoers. Este incidente será reportado.'
            : 'lucas is not in the sudoers file. This incident will be reported.',
        ),

      exit: () =>
        push('output', pt ? 'boa tentativa. :)' : 'nice try. :)'),
    } as Record<string, (arg?: string) => void>
  }, [pt, queryClient, theme, toggleTheme, setLang])

  const names = useMemo(() => Object.keys(commands), [commands])

  // Banner de boas-vindas. O ref segura a segunda execução que o StrictMode
  // dispara em desenvolvimento — sem ele a linha aparece duplicada.
  const greeted = useRef(false)
  useEffect(() => {
    if (greeted.current) return
    greeted.current = true

    pushMany('output', [
      pt
        ? "shell do site · digite 'help' para ver os comandos"
        : "site shell · type 'help' to list commands",
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mantém a rolagem colada no fim quando chega linha nova.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const run = (raw: string) => {
    const input = raw.trim()
    push('input', input)

    if (!input) return

    setHistory((h) => [input, ...h])
    setHistoryIndex(-1)

    const [name, ...rest] = input.split(/\s+/)
    const command = commands[name.toLowerCase()]

    if (!command) {
      push(
        'error',
        pt
          ? `comando não encontrado: ${name} — tente 'help'`
          : `command not found: ${name} — try 'help'`,
      )
      return
    }

    command(rest.join(' '))
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      run(value)
      setValue('')
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const next = Math.min(historyIndex + 1, history.length - 1)
      if (next >= 0 && history[next]) {
        setHistoryIndex(next)
        setValue(history[next])
      }
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const next = historyIndex - 1
      setHistoryIndex(next)
      setValue(next >= 0 ? (history[next] ?? '') : '')
      return
    }

    if (event.key === 'Tab') {
      event.preventDefault()
      const partial = value.trim().toLowerCase()
      if (!partial) return
      const match = names.find((n) => n.startsWith(partial))
      if (match) setValue(match)
      return
    }

    // Ctrl+L limpa, como num shell de verdade.
    if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault()
      setLines([])
    }
  }

  return (
    <Section
      id="terminal"
      n="05"
      title={t('terminal.title')}
      sub={t('terminal.sub')}
    >
      <div
        onClick={() => inputRef.current?.focus()}
        className="cursor-text border bg-[var(--bg-sunk)]"
      >
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full border border-[var(--rule)]" />
            <span className="h-2.5 w-2.5 rounded-full border border-[var(--rule)]" />
            <span className="h-2.5 w-2.5 rounded-full border border-[var(--accent)]" />
          </div>
          <span className="stamp">{profile.handle}@web — bash</span>
          <span className="stamp">{focused ? 'ON' : 'OFF'}</span>
        </div>

        <div
          ref={scrollRef}
          className="h-[340px] overflow-y-auto p-4 font-mono text-[13px] leading-relaxed"
        >
          {lines.map((line) => {
            if (line.kind === 'ascii') {
              return (
                <pre
                  key={line.id}
                  className="mb-1 whitespace-pre text-[10px] leading-tight text-[var(--accent)]"
                >
                  {line.text}
                </pre>
              )
            }

            if (line.kind === 'input') {
              return (
                <p key={line.id} className="text-[var(--fg)]">
                  <span className="text-[var(--accent)]">$ </span>
                  {line.text}
                </p>
              )
            }

            return (
              <p
                key={line.id}
                className={
                  line.kind === 'error'
                    ? 'whitespace-pre-wrap text-red-400'
                    : 'whitespace-pre-wrap dim'
                }
              >
                {line.text}
              </p>
            )
          })}

          <div className="flex items-center">
            <span className="text-[var(--accent)]">$&nbsp;</span>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              spellCheck={false}
              autoComplete="off"
              aria-label={t('terminal.title')}
              className="flex-1 bg-transparent font-mono text-[13px] outline-none"
            />
            <span
              className={
                focused
                  ? 'ml-px inline-block h-4 w-2 animate-pulse bg-[var(--accent)]'
                  : 'ml-px inline-block h-4 w-2 bg-[var(--rule)]'
              }
            />
          </div>
        </div>
      </div>
    </Section>
  )
}
