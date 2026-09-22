import { useTranslation } from 'react-i18next'
import { builtWith, profile, socials } from '@/data/content'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  const row = [...builtWith, ...builtWith]

  return (
    <footer className="relative">
      {/* Faixa rolante: só o que está realmente montado neste site. */}
      <div className="overflow-hidden border-b py-3">
        <div className="flex w-max animate-ticker gap-8">
          {row.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="whitespace-nowrap font-mono text-[11px] uppercase tracking-widest faint"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="stamp mb-3">{t('footer.colophon')}</p>
            <p className="prose-serif max-w-md text-sm leading-relaxed dim">
              {t('footer.typeface')} {t('footer.source')}
            </p>
          </div>

          <ul className="flex gap-6 sm:flex-col sm:gap-2 sm:text-right">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-mono text-xs uppercase tracking-widest dim transition-colors hover:text-[var(--accent)]"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t pt-5 sm:flex-row sm:items-center">
          <span className="stamp">
            © {year} {profile.name}
          </span>
          <span className="stamp">{profile.handle}</span>
        </div>
      </div>
    </footer>
  )
}
