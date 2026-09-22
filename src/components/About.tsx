import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { fetchProfile, fetchRepos } from '@/lib/github'
import { useAppStore } from '@/store/useAppStore'
import { Parallax } from './Parallax'

gsap.registerPlugin(ScrollTrigger, SplitText)

/** Um dado da ficha: rótulo em cima, valor grande embaixo. */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t px-1 pt-4 first:border-t-0 sm:border-l sm:border-t-0 sm:px-5 sm:first:border-l-0 sm:first:pl-0">
      <span className="stamp block">{label}</span>
      <span className="mt-2 block font-mono text-2xl sm:text-3xl">{value}</span>
    </div>
  )
}

export function About() {
  const { t, i18n } = useTranslation()
  const lang = useAppStore((s) => s.lang)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const { data: ghProfile } = useQuery({
    queryKey: ['gh-profile'],
    queryFn: fetchProfile,
    staleTime: 5 * 60_000,
    retry: 1,
  })

  const { data: repos } = useQuery({
    queryKey: ['gh-repos'],
    queryFn: fetchRepos,
    staleTime: 5 * 60_000,
    retry: 1,
  })

  // GSAP SplitText + ScrollTrigger: o título entra palavra a palavra.
  useEffect(() => {
    const heading = headingRef.current
    if (!heading) return

    const split = new SplitText(heading, { type: 'words' })
    const tween = gsap.from(split.words, {
      yPercent: 110,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.05,
      scrollTrigger: { trigger: heading, start: 'top 88%' },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      split.revert()
    }
  }, [i18n.language])

  const locale = lang === 'pt' ? 'pt-BR' : 'en-US'

  const lastPush = repos?.length
    ? new Date(
        Math.max(...repos.map((r) => new Date(r.updated_at).getTime())),
      ).toLocaleDateString(locale, { day: '2-digit', month: 'short' })
    : '—'

  return (
    <section id="about" className="border-b px-4 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex items-center gap-6 border-b pb-8">
          <span className="stamp text-[var(--accent)]">[ 01 ]</span>
          <span className="h-px flex-1 bg-[var(--rule)]" />
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div>
            <h2
              ref={headingRef}
              className="display overflow-hidden text-4xl sm:text-6xl"
            >
              {t('about.title')}
            </h2>

            <p className="prose-serif mt-8 text-lg leading-relaxed sm:text-xl">
              {t('about.p1')}
            </p>
            <p className="prose-serif mt-5 text-base leading-relaxed dim sm:text-lg">
              {t('about.p2')}
            </p>
          </div>

          <Parallax speed={48} className="self-start">
            <div className="panel p-6 sm:p-8">
            <p className="prose-serif mb-7 border-b pb-5 text-sm italic leading-relaxed faint">
              {t('about.note')}
            </p>

            <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-3">
              <Field
                label={t('about.repos')}
                value={
                  ghProfile ? String(ghProfile.public_repos) : '—'
                }
              />
              <Field
                label={t('about.followers')}
                value={ghProfile ? String(ghProfile.followers) : '—'}
              />
              <Field label={t('about.updated')} value={lastPush} />
            </div>

            <div className="mt-7 border-t pt-4">
              <span className="stamp">{t('about.since')}</span>
              <span className="mt-1.5 block font-mono text-sm dim">
                {ghProfile
                  ? new Date(ghProfile.created_at).toLocaleDateString(locale, {
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              </span>
            </div>
            </div>
          </Parallax>
        </div>
      </div>
    </section>
  )
}
