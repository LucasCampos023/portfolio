import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'motion/react'
import { socials } from '@/data/content'
import { sleep, cn } from '@/lib/utils'
import { Section } from './Section'
import { Parallax } from './Parallax'

/** Schema Zod — mesma fonte de verdade para a validação e para o tipo. */
const schema = z.object({
  name: z.string().min(2, 'Mínimo de 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  message: z.string().min(12, 'Conte um pouco mais (12+ caracteres)'),
})

type FormValues = z.infer<typeof schema>

export function Contact() {
  const { t } = useTranslation()
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onBlur' })

  const onSubmit = async (values: FormValues) => {
    // Sem backend: a validação roda, o envio não. Quando houver endpoint,
    // troque esta linha por fetch('/api/contact', { method: 'POST', ... }).
    console.info('[demo] mensagem validada:', values)
    await sleep(700)
    setSent(true)
    reset()
  }

  const field = (name: keyof FormValues) =>
    cn(
      'w-full border bg-[var(--bg-sunk)] px-4 py-3 font-mono text-sm outline-none transition-colors focus:border-[var(--accent)]',
      errors[name] && 'border-red-500/70',
    )

  return (
    <Section id="contact" n="06" title={t('contact.title')} sub={t('contact.sub')}>
      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="panel p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-start gap-5 py-12"
              >
                <span className="stamp text-[var(--accent)]">OK</span>
                <p className="prose-serif max-w-sm text-lg leading-relaxed">
                  {t('contact.sent')}
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="border px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {t('contact.another')}
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
                noValidate
              >
                {(['name', 'email'] as const).map((name) => (
                  <div key={name}>
                    <label htmlFor={name} className="stamp mb-2 block">
                      {t(`contact.${name}`)}
                    </label>
                    <input
                      id={name}
                      type={name === 'email' ? 'email' : 'text'}
                      autoComplete={name === 'email' ? 'email' : 'name'}
                      aria-invalid={Boolean(errors[name])}
                      {...register(name)}
                      className={field(name)}
                    />
                    {errors[name] && (
                      <p className="mt-2 font-mono text-[11px] text-red-400">
                        {errors[name]?.message}
                      </p>
                    )}
                  </div>
                ))}

                <div>
                  <label htmlFor="message" className="stamp mb-2 block">
                    {t('contact.message')}
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    aria-invalid={Boolean(errors.message)}
                    {...register('message')}
                    className={cn(field('message'), 'resize-none')}
                  />
                  {errors.message && (
                    <p className="mt-2 font-mono text-[11px] text-red-400">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[var(--accent)] py-3 font-mono text-[11px] uppercase tracking-widest text-[var(--on-accent)] transition-opacity hover:opacity-85 disabled:opacity-60"
                >
                  {isSubmitting ? `${t('contact.sending')}…` : t('contact.send')}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <Parallax speed={44}>
          <p className="stamp mb-5">{t('contact.direct')}</p>

          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer noopener"
              className={cn(
                'group flex items-baseline justify-between gap-4 border-t py-6 transition-colors hover:text-[var(--accent)]',
                // O canal que realmente responde fica em destaque; os outros
                // são perfis, não caixa de entrada.
                social.primary && 'border-t-[var(--accent)] text-[var(--accent)]',
              )}
            >
              <span className="display text-2xl sm:text-3xl">
                {social.label}
              </span>
              <span
                className={cn(
                  'font-mono text-xs transition-colors group-hover:text-[var(--accent)]',
                  social.primary ? 'text-[var(--accent)]' : 'dim',
                )}
              >
                {social.handle} ↗
              </span>
            </a>
          ))}

          <div className="border-t" />
        </Parallax>
      </div>
    </Section>
  )
}
