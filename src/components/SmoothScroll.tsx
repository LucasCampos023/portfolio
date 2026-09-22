import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/usePointer'

gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll com inércia (Lenis). É a diferença entre a página "pular" a cada
 * clique da roda e ela deslizar até parar — o que muda a sensação do site
 * inteiro, não só de uma seção.
 *
 * Três amarrações importantes:
 *
 * 1. O ScrollTrigger precisa ser atualizado a cada passo do Lenis, senão as
 *    animações de scroll ficam um frame atrás e "tremem".
 * 2. O raf do Lenis roda no ticker do GSAP, para existir um relógio só. Dois
 *    requestAnimationFrame independentes brigam e engasgam.
 * 3. `lagSmoothing(0)` desliga a compensação de lag do GSAP, que em quedas de
 *    frame daria um salto no scroll.
 *
 * O Lenis rola a janela de verdade (não usa transform), então `window.scrollY`
 * continua valendo e o `useScroll` do Motion segue funcionando sem adaptador.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion()

  useEffect(() => {
    // Quem pediu menos movimento fica com o scroll nativo do navegador.
    if (reduced) return

    const lenis = new Lenis({
      duration: 1.05,
      // easeOutExpo: sai rápido do lugar e assenta suave, sem parecer arrastado.
      easing: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // No touch o scroll nativo já tem inércia do sistema; duplicar atrapalha.
      syncTouch: false,
      anchors: { offset: -57 },
    })

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // O smooth do CSS brigaria com o Lenis em cada clique de âncora.
    const previousBehavior = document.documentElement.style.scrollBehavior
    document.documentElement.style.scrollBehavior = 'auto'

    return () => {
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(raf)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
      document.documentElement.style.scrollBehavior = previousBehavior
    }
  }, [reduced])

  return null
}
