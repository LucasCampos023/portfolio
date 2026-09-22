/**
 * Dados do site. Nada aqui é inventado: o que não é verdade ainda,
 * está marcado como vago em vez de preenchido com número bonito.
 */

export const profile = {
  name: 'Lucas Campos',
  handle: 'LucasCampos023',
  role: 'Desenvolvedor',
  location: 'Brasil',
  /** Ano em que começou a programar — TODO(Lucas): ajuste se não for esse. */
  since: 2024,
}

export const socials = [
  {
    label: 'GitHub',
    href: 'https://github.com/LucasCampos023',
    handle: 'LucasCampos023',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/lucascampos023/',
    handle: '@lucascampos023',
  },
]

/**
 * Fichas dos projetos. O site puxa a lista real de repositórios do GitHub;
 * este mapa só acrescenta contexto que a API não tem (o que a coisa faz,
 * por que existe). Repo sem entrada aqui aparece com os dados da API.
 */
export const projectNotes: Record<
  string,
  { pt: string; en: string; stack: string[] }
> = {
  'Finan.AI': {
    pt: 'Interface web para organizar finanças pessoais. Primeiro projeto publicado — HTML, CSS e JavaScript na mão, sem framework.',
    en: 'Web interface for personal finance. First published project — handwritten HTML, CSS and JavaScript, no framework.',
    stack: ['HTML', 'CSS', 'JavaScript'],
  },
}

/** Este site. Entra na lista junto com os repositórios da API. */
export const thisSite = {
  name: 'Portfólio',
  pt: 'O site que você está lendo. Three.js com shader próprio, Web Worker, Web Audio e i18n — cada seção existe para exercitar uma tecnologia.',
  en: 'The site you are reading. Three.js with a custom shader, Web Worker, Web Audio and i18n — every section exists to exercise one technology.',
  stack: ['React', 'TypeScript', 'Three.js', 'Vite'],
  href: 'https://github.com/LucasCampos023',
}

/**
 * Ferramentas por status real de uso. Barrinha de "95% de React" é chute
 * disfarçado de dado — status é verificável.
 */
export type ToolStatus = 'diario' | 'aprendendo' | 'fila'

export const tools: { name: string; status: ToolStatus }[] = [
  { name: 'HTML', status: 'diario' },
  { name: 'CSS', status: 'diario' },
  { name: 'JavaScript', status: 'diario' },
  { name: 'Git', status: 'diario' },
  { name: 'React', status: 'aprendendo' },
  { name: 'TypeScript', status: 'aprendendo' },
  { name: 'Tailwind', status: 'aprendendo' },
  { name: 'Node.js', status: 'fila' },
  { name: 'SQL', status: 'fila' },
  { name: 'Three.js', status: 'fila' },
]

export const statusLabel: Record<ToolStatus, { pt: string; en: string }> = {
  diario: { pt: 'uso direto', en: 'daily use' },
  aprendendo: { pt: 'aprendendo agora', en: 'learning now' },
  fila: { pt: 'na fila', en: 'up next' },
}

/** Faixa rolante do rodapé: o que está montado NESTE site, e só isso. */
export const builtWith = [
  'React',
  'TypeScript',
  'Vite',
  'Tailwind CSS',
  'Three.js',
  'React Three Fiber',
  'GLSL',
  'Motion',
  'GSAP',
  'ScrollTrigger',
  'Zustand',
  'TanStack Query',
  'React Hook Form',
  'Zod',
  'Recharts',
  'i18next',
  'Web Worker',
  'Web Audio API',
  'Canvas 2D',
  'IntersectionObserver',
]
