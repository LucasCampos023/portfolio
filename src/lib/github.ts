import { profile } from '@/data/content'

/** Só os campos que o site realmente usa da resposta da API. */
export interface Repo {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  updated_at: string
  topics?: string[]
  fork: boolean
}

const API = 'https://api.github.com'

/**
 * Repositórios públicos, direto da API do GitHub — sem token, sem servidor.
 * O limite anônimo é 60 req/h por IP; o TanStack Query segura o resultado
 * em cache por 5 minutos para não chegar perto disso.
 */
export async function fetchRepos(): Promise<Repo[]> {
  const response = await fetch(
    `${API}/users/${profile.handle}/repos?sort=updated&per_page=20`,
    { headers: { Accept: 'application/vnd.github+json' } },
  )

  if (!response.ok) {
    throw new Error(`GitHub respondeu ${response.status}`)
  }

  const repos = (await response.json()) as Repo[]
  return repos.filter((repo) => !repo.fork)
}

export interface Profile {
  public_repos: number
  followers: number
  created_at: string
  avatar_url: string
  bio: string | null
}

export async function fetchProfile(): Promise<Profile> {
  const response = await fetch(`${API}/users/${profile.handle}`, {
    headers: { Accept: 'application/vnd.github+json' },
  })

  if (!response.ok) {
    throw new Error(`GitHub respondeu ${response.status}`)
  }

  return (await response.json()) as Profile
}

/** Conta repositórios por linguagem principal — alimenta o gráfico. */
export function languageBreakdown(repos: Repo[]) {
  const counts = new Map<string, number>()

  repos.forEach((repo) => {
    if (!repo.language) return
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1)
  })

  return [...counts.entries()]
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count)
}
