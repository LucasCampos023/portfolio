import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useReducedMotion } from '@/hooks/usePointer'
import { useAppStore } from '@/store/useAppStore'

/* ---------------------------------------------------------------
   Terreno em linhas de contorno — leitura de instrumento, não esfera
   brilhante. Toda a deformação acontece no vertex shader; a CPU só
   passa o tempo e a posição do ponteiro.
--------------------------------------------------------------- */

const ROWS = 56
const COLS = 120
const WIDTH = 26
const DEPTH = 17

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2  uPointer;

  varying float vHeight;
  varying float vDepth;

  // Relevo por soma de senos: três oitavas, direções cruzadas.
  float relief(vec2 p, float t) {
    float h  = sin(p.x * 0.42 + t * 0.55) * 0.85;
    h       += sin(p.y * 0.61 - t * 0.38) * 0.62;
    h       += sin((p.x + p.y) * 0.28 + t * 0.24) * 0.75;
    h       += sin(p.x * 1.27 - p.y * 0.83 - t * 0.7) * 0.22;
    return h;
  }

  void main() {
    vec3 pos = position;

    float h = relief(pos.xy, uTime);

    // O ponteiro abre uma depressão suave onde o mouse está.
    vec2 pointerWorld = uPointer * vec2(13.0, 8.0);
    float d = distance(pos.xy, pointerWorld);
    h -= exp(-d * d * 0.02) * 2.6;

    vHeight = h;
    vDepth = pos.y;

    // O plano é montado deitado: y vira profundidade, z vira altura.
    gl_Position = projectionMatrix * modelViewMatrix
                * vec4(pos.x, h, pos.y, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3  uColor;
  uniform float uFade;

  varying float vHeight;
  varying float vDepth;

  void main() {
    // Some no horizonte (profundidade) e realça os picos.
    float depthFade = smoothstep(9.0, -7.0, vDepth);
    float crest = smoothstep(-0.6, 1.9, vHeight);

    float alpha = depthFade * (0.10 + crest * 0.5) * uFade;
    gl_FragColor = vec4(uColor, alpha);
  }
`

function Terrain() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const reduced = useReducedMotion()
  const theme = useAppStore((s) => s.theme)

  // Linhas de contorno: apenas segmentos ao longo de X, sem as travessas.
  // É o que dá a leitura de "curva de nível" em vez de malha de triângulos.
  const geometry = useMemo(() => {
    const vertices: number[] = []

    for (let row = 0; row < ROWS; row++) {
      const y = (row / (ROWS - 1)) * DEPTH - DEPTH * 0.62

      for (let col = 0; col < COLS - 1; col++) {
        const x1 = (col / (COLS - 1)) * WIDTH - WIDTH / 2
        const x2 = ((col + 1) / (COLS - 1)) * WIDTH - WIDTH / 2
        vertices.push(x1, y, 0, x2, y, 0)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3),
    )
    return geo
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color('#00d9ff') },
      uFade: { value: 1 },
    }),
    [],
  )

  useFrame((state, delta) => {
    const material = materialRef.current
    if (!material) return

    material.uniforms.uTime.value += reduced ? delta * 0.08 : delta
    material.uniforms.uPointer.value.lerp(state.pointer, 0.05)

    // Voo de câmera guiado pelo scroll: no topo da página a vista é rasante
    // e distante; conforme a pessoa rola, a câmera desce e avança sobre o
    // relevo. É parallax dentro da cena 3D, não translateY no elemento.
    if (!reduced) {
      const progress = Math.min(window.scrollY / window.innerHeight, 1)
      const camera = state.camera

      const targetY = 3.1 - progress * 2.4
      const targetZ = 11 - progress * 5.2

      camera.position.y += (targetY - camera.position.y) * 0.08
      camera.position.z += (targetZ - camera.position.z) * 0.08
      camera.position.x += (state.pointer.x * 0.5 - camera.position.x) * 0.03
      camera.lookAt(0, -0.4 - progress * 0.6, -4)
    }

    // No papel claro o ciano elétrico some: escurece a linha e reforça o traço.
    const dark = theme === 'dark'
    const color = material.uniforms.uColor.value as THREE.Color
    color.lerp(new THREE.Color(dark ? '#00d9ff' : '#00596e'), 0.06)
    material.uniforms.uFade.value = THREE.MathUtils.lerp(
      material.uniforms.uFade.value as number,
      dark ? 1 : 1.9,
      0.06,
    )
  })

  return (
    <lineSegments geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </lineSegments>
  )
}

export function HeroCanvas() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 3.1, 11], fov: 42, rotation: [-0.16, 0, 0] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Terrain />
    </Canvas>
  )
}
