import { describe, it, expect, beforeAll } from 'vitest'
import { whatsappInviteUrl } from '../lib/share'

beforeAll(() => {
  // jsdom no define window.location.origin — lo simulamos
  Object.defineProperty(globalThis, 'window', {
    value: { location: { origin: 'https://worldcapp.vercel.app' } },
    writable: true,
  })
})

describe('whatsappInviteUrl', () => {
  it('genera una URL que comienza con https://wa.me/', () => {
    const url = whatsappInviteUrl()
    expect(url).toMatch(/^https:\/\/wa\.me\/\?text=/)
  })

  it('incluye la origin de la aplicación en el texto', () => {
    const url = whatsappInviteUrl()
    expect(decodeURIComponent(url)).toContain('worldcapp.vercel.app')
  })

  it('no contiene emojis en el mensaje', () => {
    const url = whatsappInviteUrl()
    const text = decodeURIComponent(url.split('?text=')[1])
    // Rango básico de emojis (U+1F300–U+1FAFF)
    expect(text).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u)
  })

  it('el texto está codificado en la URL', () => {
    const url = whatsappInviteUrl()
    expect(url).toContain('%')
  })
})
