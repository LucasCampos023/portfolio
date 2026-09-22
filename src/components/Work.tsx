import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { fetchRepos, type Repo } from '@/lib/github'
import { projectNotes, thisSite } from '@/data/content'
import { useAppStore } from '@/store/useAppStore'
import { Section } from './Section'

/** Linha de ficha: número, nome, descrição, stack e meta. */
function Row({
  index,
  title,
  description,
  stack,
  meta,
  href,
  tag,
}: {
  index: string
  title: string
  description: string
  stack: string[]
  meta: string
  href: string
  tag?: string
}) {
  const { t } = useTranslation()

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group grid gap-4 border-t px-1 py-7 transition-colors hover:bg-[var(--bg-raised)] sm:grid-cols-[auto_1fr_auto] sm:gap-8 sm:px-3"
    >
      <span className="stamp pt-1.5 sm:w-10">{index}</span>

      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          <h3 className="display text-2xl sm:text-3xl">{title}</h3>
          {tag && (
            <span className="border border-[var(--accent)] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">
              {tag}
            </span>
          )}
        </div>

        <p className="prose-serif mt-2.5 max-w-xl text-base leading-relaxed dim">
          {description}
        </p>

        {stack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
            {stack.map((item) => (
              <span
                key={item}
                className="font-mono text-[11px] uppercase tracking-wider faint"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
        <span className="stamp whitespace-nowrap">{meta}</span>
        <span className="font-mono text-xs text-[var(--fg-dim)] transition-colors group-hover:text-[var(--accent)]">
          {t('work.open')} ↗
        </span>
      </div>
    </motion.a>
  )
}

export function Work() {
  const { t } = useTranslation()
  const lang = useAppStore((s) => s.lang)

  const { data, isPending, isError, refetch, isFetching } = useQuery({
    queryKey: ['gh-repos'],
    queryFn: fetchRepos,
    staleTime: 5 * 60_000,
    retry: 1,
  })

  const locale = lang === 'pt' ? 'pt-BR' : 'en-US'

  const describe = (repo: Repo) => {
    const note = projectNotes[repo.name]
    if (note) return note[lang]
    return repo.description ?? '—'
  }

  const stackOf = (repo: Repo) => {
    const note = projectNotes[repo.name]
    if (note) return note.stack
    return repo.language ? [repo.language] : []
  }

  return (
    <Section id="work" n="02" title={t('work.title')} sub={t('work.sub')}>
      {isPending && (
        <p className="border-t py-10 font-mono text-xs uppercase tracking-widest faint">
          {t('work.loading')}
        </p>
      )}

      {isError && (
        <div className="flex flex-wrap items-center gap-4 border-t py-10">
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--fg-dim)]">
            {t('work.error')}
          </p>
          <button
            onClick={() => void refetch()}
            className="border px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {t('work.retry')}
          </button>
        </div>
      )}

      {data && (
        <div className={isFetching ? 'opacity-60 transition-opacity' : ''}>
          {data.map((repo, index) => (
            <Row
              key={repo.id}
              index={String(index + 1).padStart(2, '0')}
              title={repo.name}
              description={describe(repo)}
              stack={stackOf(repo)}
              meta={`${t('work.updated')} ${new Date(
                repo.updated_at,
              ).toLocaleDateString(locale, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}`}
              href={repo.html_url}
            />
          ))}

          {/* Este site também é um projeto — e está aqui porque é verdade. */}
          <Row
            index={String(data.length + 1).padStart(2, '0')}
            title={thisSite.name}
            description={thisSite[lang]}
            stack={thisSite.stack}
            meta={t('work.thisSite')}
            href={thisSite.href}
            tag={t('work.thisSite')}
          />

          {/* Slot vago: honesto e, de quebra, é um convite. */}
          <div className="grid gap-4 border-t border-dashed px-1 py-7 sm:grid-cols-[auto_1fr] sm:gap-8 sm:px-3">
            <span className="stamp pt-1.5 sm:w-10">
              {String(data.length + 2).padStart(2, '0')}
            </span>
            <div>
              <h3 className="display text-2xl faint sm:text-3xl">
                {t('work.slot')}
              </h3>
              <p className="prose-serif mt-2.5 text-base faint">
                {t('work.slotNote')}
              </p>
            </div>
          </div>
        </div>
      )}
    </Section>
  )
}
