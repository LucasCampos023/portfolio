import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Nav } from '@/components/Nav'
import { SmoothScroll } from '@/components/SmoothScroll'
import { Statement } from '@/components/Statement'
import { Cursor } from '@/components/Cursor'
import { CommandPalette } from '@/components/CommandPalette'
import { Hero } from '@/components/Hero'
import { About } from '@/components/About'
import { Work } from '@/components/Work'
import { Tools } from '@/components/Tools'
import { Lab } from '@/components/Lab'
import { Pipeline } from '@/components/Pipeline'
import { Terminal } from '@/components/Terminal'
import { Contact } from '@/components/Contact'
import { Footer } from '@/components/Footer'
import { Xray } from '@/components/Xray'
import { useAppStore } from '@/store/useAppStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
})

export default function App() {
  const { theme, lang } = useAppStore()
  const { i18n } = useTranslation()

  // Reidrata o que veio do localStorage: tema no <html> e idioma no i18next.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (i18n.language !== lang) void i18n.changeLanguage(lang)
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
  }, [lang, i18n])

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative min-h-screen">
        <SmoothScroll />
        <Cursor />
        <Nav />
        <CommandPalette />
        <Xray />

        <main className="pt-[57px]">
          <Hero />
          <About />
          <Work />
          <Statement />
          <Tools />
          <Lab />
          <Pipeline />
          <Terminal />
          <Contact />
        </main>

        <Footer />
      </div>
    </QueryClientProvider>
  )
}
