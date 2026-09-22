# lucascampos023 — site pessoal

Portfólio de uma página. Estética de desenho técnico: preto, cinza e ciano,
tipografia display em caixa alta, réguas e cotas. O ciano é tinta de marcação —
entra em linhas de 1px e estados ativos, nunca em gradiente ou brilho difuso.

## Rodar

```bash
npm install
npm run dev
```

Abre em http://localhost:5173.

| Comando             | O que faz                                     |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | servidor de desenvolvimento com HMR           |
| `npm run build`     | typecheck + build de produção em `dist/`      |
| `npm run preview`   | serve o `dist/` para conferir antes do deploy |
| `npm run typecheck` | só o TypeScript                               |

## O conteúdo é real, e isso é proposital

Não há projeto inventado nem métrica de enfeite. A seção de repositórios e os
números do "Sobre" vêm da **API pública do GitHub**, buscados quando a página
abre:

- lista de repositórios → `GET /users/LucasCampos023/repos`
- contagens do perfil → `GET /users/LucasCampos023`
- o gráfico de linguagens conta os repositórios por linguagem principal

Publique um repositório novo e ele aparece no site sozinho, sem editar código.
O limite anônimo da API é 60 requisições por hora por IP; o cache do TanStack
Query segura cada resposta por 5 minutos. Se a API falhar, a seção mostra o erro
e um botão de tentar de novo — não finge que está tudo bem.

A lista de ferramentas usa **status de uso** (uso direto / aprendendo / na fila)
em vez de barra de porcentagem, porque "95% de React" é chute com aparência de
dado.

## O que tem montado

**Base** — Vite 6, React 18, TypeScript estrito, Tailwind CSS v4 (tokens em
`@theme`, sem `tailwind.config.js`), alias `@/` para `src/`.

**3D** — Three.js + React Three Fiber com shader GLSL autoral: um terreno de
linhas de contorno deformado por soma de senos, com uma depressão que segue o
ponteiro. Tudo no vertex shader; a CPU só passa tempo e posição do mouse.
A cor da linha acompanha o tema.

**Animação** — Motion (parallax de scroll, progresso da barra, transições da
paleta) e GSAP + ScrollTrigger + SplitText (o título do "Sobre" entra palavra a
palavra).

**Estado e dados** — Zustand + `persist` (tema, idioma, seções visitadas),
TanStack Query (mesma `queryKey` compartilhada entre três seções), React Hook
Form + Zod, i18next com PT e EN completos.

**APIs do navegador** — Web Worker (crivo de Eratóstenes até 8 milhões fora da
thread principal), Web Audio API (osciladores reais + FFT em canvas 2D),
IntersectionObserver (reveals e menu ativo), `matchMedia` para
`prefers-reduced-motion`.

**Detalhes** — paleta de comandos com ⌘K (e o mesmo componente vira o menu no
celular), cursor em forma de mira, tema claro/escuro com tokens redefinidos por
tema, JSON-LD e `<html lang>` acompanhando o idioma.

## Onde editar

- **`src/data/content.ts`** — seus dados: perfil, links, notas sobre cada repo,
  lista de ferramentas. É o arquivo que você mexe com mais frequência.
- **`src/i18n.ts`** — todos os textos, nas duas línguas.
- **`src/index.css`** — cores e tipografia no bloco `@theme`.

Para descrever um repositório com suas palavras em vez da descrição do GitHub,
adicione uma entrada em `projectNotes` usando o nome exato do repositório.

## Publicar

O build é estático — `dist/` sobe em qualquer lugar (Vercel, Netlify, Cloudflare
Pages, GitHub Pages, ou o `public_html` de uma hospedagem comum).

```bash
npm run build
```

## Pendências conscientes

- O formulário de contato valida com Zod mas **não envia**: não há servidor. O
  ponto de plugar o `fetch` está comentado em `src/components/Contact.tsx`. O
  texto da seção diz isso ao visitante em vez de fingir um envio.
- `profile.since` em `content.ts` está como 2024 — ajuste para o ano certo.
- Não há analytics nem cookie. Se adicionar, o rodapé precisa deixar de dizer
  que não tem.
