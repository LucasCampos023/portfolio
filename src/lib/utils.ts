import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Junta classes condicionais e resolve conflitos do Tailwind (p-2 + p-4 => p-4). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Interpolação linear — usada no cursor e no parallax. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v))

/** Promise que resolve depois de `ms` — simula latência de rede nas demos. */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
