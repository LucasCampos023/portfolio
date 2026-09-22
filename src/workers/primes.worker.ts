/**
 * Web Worker: crivo de Eratóstenes em thread separada.
 * O ponto da demo é justamente este — a UI continua a 60fps enquanto
 * o worker tritura alguns milhões de números.
 */

export interface PrimeRequest {
  limit: number
}

export interface PrimeResponse {
  limit: number
  count: number
  largest: number
  ms: number
}

self.onmessage = (event: MessageEvent<PrimeRequest>) => {
  const { limit } = event.data
  const started = performance.now()

  const sieve = new Uint8Array(limit + 1)
  let count = 0
  let largest = 0

  for (let i = 2; i <= limit; i++) {
    if (sieve[i] === 0) {
      count++
      largest = i
      for (let j = i * i; j <= limit; j += i) sieve[j] = 1
    }
  }

  const response: PrimeResponse = {
    limit,
    count,
    largest,
    ms: Math.round(performance.now() - started),
  }

  self.postMessage(response)
}
