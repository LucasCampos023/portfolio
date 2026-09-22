/**
 * Dados do site. Nada aqui é inventado: o que não é verdade ainda,
 * está marcado como vago em vez de preenchido com número bonito.
 */

export const profile = {
  name: 'Lucas Campos',
  handle: 'LucasCampos023',
  role: 'Desenvolvedor',
  location: 'Brasil',
  /** Conta do GitHub criada em fevereiro de 2025 — ajuste se começou antes. */
  since: 2025,
}

export const socials = [
  {
    label: 'WhatsApp',
    // wa.me abre a conversa direto, no app ou no web, sem precisar salvar o contato.
    href: 'https://wa.me/5515996940984',
    handle: '+55 15 99694-0984',
    primary: true,
  },
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
  portfolio: {
    pt: 'Este site. Three.js com shader próprio, Web Worker, terminal interativo e conteúdo puxado da API do GitHub — nada de projeto inventado.',
    en: 'This site. Three.js with a custom shader, Web Worker, interactive terminal and content pulled from the GitHub API — no invented projects.',
    stack: ['React', 'TypeScript', 'Three.js', 'Vite'],
  },
  'template-construtora': {
    pt: 'Site institucional para construtora, com vídeo do hero controlado por scroll (scroll-scrubbing) e formulário que abre o WhatsApp. Versão white-label de um projeto de cliente real — nenhum nome, foto ou contato original ficou no código.',
    en: 'Institutional site for a construction company, with a scroll-scrubbed hero video and a WhatsApp-opening form. White-label version of a real client project — no original name, photo or contact remains in the code.',
    stack: ['HTML', 'CSS', 'JavaScript', 'PHP'],
  },
  'template-consultoria': {
    pt: 'Site institucional para consultoria, com animações de entrada por seção e formulário que monta a mensagem e abre o WhatsApp. Versão white-label de um projeto de cliente real, pelo mesmo motivo do anterior.',
    en: 'Institutional site for a consultancy, with per-section entrance animations and a form that assembles the message and opens WhatsApp. White-label version of a real client project, same reasoning as above.',
    stack: ['HTML', 'CSS', 'JavaScript'],
  },
}

/**
 * Repositórios privados. A API pública não os devolve, então ficam aqui —
 * listados sem link, e marcados como privados na interface. É melhor dizer
 * "existe e é fechado" do que deixar o trabalho invisível.
 */
export interface PrivateProject {
  name: string
  language: string
  pt: string
  en: string
  stack: string[]
}

export const privateProjects: PrivateProject[] = [
  {
    name: 'fullstack-crud',
    language: 'JavaScript',
    pt: 'API REST de produtos em Express com MySQL, separada em model e repository, mais um frontend em JavaScript puro. SQL parametrizado em todas as consultas.',
    en: 'Product REST API in Express with MySQL, split into model and repository, plus a vanilla JavaScript frontend. Parameterized SQL throughout.',
    stack: ['Node.js', 'Express', 'MySQL', 'JavaScript'],
  },
  {
    name: 'PentestAI',
    language: 'Python',
    pt: 'Estudos de segurança ofensiva em Python.',
    en: 'Offensive security studies in Python.',
    stack: ['Python'],
  },
  {
    name: 'Média Aritmética',
    language: 'JavaScript',
    pt: 'Sistema de back-end para cálculo de média escolar.',
    en: 'Back-end system for computing school grade averages.',
    stack: ['JavaScript'],
  },
]

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

/**
 * Cada item aqui tem lastro em repositório: JavaScript e HTML no Finan.AI,
 * Node/Express/MySQL no fullstack-crud, Python no PentestAI, TypeScript e
 * React neste site. TODO(Lucas): mova de status conforme for usando.
 */
export const tools: { name: string; status: ToolStatus }[] = [
  { name: 'HTML', status: 'diario' },
  { name: 'CSS', status: 'diario' },
  { name: 'JavaScript', status: 'diario' },
  { name: 'Git', status: 'diario' },
  { name: 'Node.js', status: 'diario' },
  { name: 'Express', status: 'diario' },
  { name: 'MySQL', status: 'diario' },
  { name: 'React', status: 'aprendendo' },
  { name: 'TypeScript', status: 'aprendendo' },
  { name: 'Python', status: 'aprendendo' },
  { name: 'Tailwind', status: 'aprendendo' },
  { name: 'Three.js', status: 'fila' },
  { name: 'Docker', status: 'fila' },
  { name: 'Testes automatizados', status: 'fila' },
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
