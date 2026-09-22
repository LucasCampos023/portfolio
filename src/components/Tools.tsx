import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { fetchRepos, languageBreakdown } from '@/lib/github'
import { statusLabel, tools, type ToolStatus } from '@/data/content'
import { useAppStore } from '@/store/useAppStore'
import { Section } from './Section'
import { Parallax } from './Parallax'

const LanguageChart = lazy(() => import('./LanguageChart'))

const order: ToolStatus[] = ['diario', 'aprendendo', 'fila']

export function Tools() {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.lang)

  const { data: repos } = useQuery({
    queryKey: ['gh-repos'],
    queryFn: fetchRepos,
    staleTime: 5 * 60_000,
    retry: 1,
  })

  const languages = repos ? languageBreakdown(repos) : []

  return (
    <Section id="tools" n="03" title={t('tools.title')} sub={t('tools.sub')}>
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div>
          {order.map((status) => {
            const group = tools.filter((tool) => tool.status === status)
            if (group.length === 0) return null

            return (
              <div key={status} className="border-t py-6">
                <div className="mb-4 flex items-baseline gap-4">
                  {/*
                    Cada status tem sua tinta: ciano para o que já está em
                    uso, âmbar para o que está em aprendizado, neutro para a
                    fila. A cor carrega a informação, então a lista se lê de
                    relance sem precisar do rótulo.
                  */}
                  <span
                    className={
                      status === 'diario'
                        ? 'stamp text-[var(--accent)]'
                        : status === 'aprendendo'
                          ? 'stamp text-[var(--accent-2)]'
                          : 'stamp'
                    }
                  >
                    {statusLabel[status][lang]}
                  </span>
                  <span className="h-px flex-1 bg-[var(--rule-soft)]" />
                  <span className="stamp">{group.length}</span>
                </div>

                <ul className="flex flex-wrap gap-x-7 gap-y-2.5">
                  {group.map((tool, index) => (
                    <motion.li
                      key={tool.name}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.04 }}
                      className={
                        status === 'fila'
                          ? 'display text-xl faint sm:text-2xl'
                          : 'display text-xl sm:text-2xl'
                      }
                    >
                      {tool.name}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <Parallax speed={40} className="self-start">
          <div className="panel p-6">
          <div className="mb-5 flex items-baseline justify-between gap-4 border-b pb-4">
            <span className="stamp">{t('tools.chart')}</span>
            <span className="stamp text-[var(--accent)]">GitHub API</span>
          </div>

          {/* Altura acompanha a quantidade de barras: com uma linguagem só,
              um painel de 240px deixaria a barra boiando no vazio. */}
          <div
            className="w-full"
            style={{ height: Math.max(96, languages.length * 44 + 24) }}
          >
            {languages.length === 0 ? (
              <p className="py-10 text-center font-mono text-xs faint">
                {t('tools.chartEmpty')}
              </p>
            ) : (
              <Suspense
                fallback={
                  <p className="py-10 text-center font-mono text-xs faint">
                    …
                  </p>
                }
              >
                <LanguageChart data={languages} />
              </Suspense>
            )}
            </div>
          </div>
        </Parallax>
      </div>
    </Section>
  )
}
