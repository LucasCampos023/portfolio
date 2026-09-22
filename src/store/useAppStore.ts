import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light'
export type Lang = 'pt' | 'en'

interface AppState {
  theme: Theme
  lang: Lang
  paletteOpen: boolean
  soundOn: boolean
  visited: string[]
  toggleTheme: () => void
  setLang: (lang: Lang) => void
  setPaletteOpen: (open: boolean) => void
  toggleSound: () => void
  markVisited: (id: string) => void
}

/**
 * Estado global com Zustand + middleware `persist`.
 * Tema, idioma e preferência de som sobrevivem ao reload (localStorage).
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      lang: 'pt',
      paletteOpen: false,
      soundOn: false,
      visited: [],

      toggleTheme: () =>
        set((s) => {
          const theme: Theme = s.theme === 'dark' ? 'light' : 'dark'
          document.documentElement.dataset.theme = theme
          return { theme }
        }),

      setLang: (lang) => set({ lang }),
      setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),

      markVisited: (id) =>
        set((s) =>
          s.visited.includes(id) ? s : { visited: [...s.visited, id] },
        ),
    }),
    {
      name: 'lucas-portfolio',
      // `paletteOpen` é efêmero: não faz sentido persistir.
      partialize: ({ theme, lang, soundOn, visited }) => ({
        theme,
        lang,
        soundOn,
        visited,
      }),
    },
  ),
)
