import { describe, it, expect } from 'vitest'
import { validatePassword, hashSecretAnswer } from '../auth/authUtils'

describe('validatePassword', () => {
  it('acepta contraseña válida', () => {
    expect(validatePassword('Abc123!@')).toBeNull()
  })

  it('rechaza contraseña sin mayúscula', () => {
    expect(validatePassword('abc123!@')).toMatch(/mayúscula/)
  })

  it('rechaza contraseña sin número', () => {
    expect(validatePassword('Abcdefg!')).toMatch(/número/)
  })

  it('rechaza contraseña sin carácter especial', () => {
    expect(validatePassword('Abcd1234')).toMatch(/especial/)
  })

  it('rechaza contraseña menor a 8 caracteres', () => {
    expect(validatePassword('Ab1!')).toMatch(/8/)
  })

  it('rechaza contraseña mayor a 16 caracteres', () => {
    expect(validatePassword('Abc123!@Abc123!@X')).toMatch(/16/)
  })

  it('rechaza cadena vacía', () => {
    expect(validatePassword('')).not.toBeNull()
  })

  it('acepta contraseña con carácter especial variado', () => {
    expect(validatePassword('Segura99#')).toBeNull()
  })
})

describe('hashSecretAnswer', () => {
  it('genera un hash hexadecimal de 64 caracteres', async () => {
    const hash = await hashSecretAnswer('mi respuesta')
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[a-f0-9]+$/)
  })

  it('normaliza la entrada (trim + lowercase)', async () => {
    const h1 = await hashSecretAnswer('  Respuesta  ')
    const h2 = await hashSecretAnswer('respuesta')
    expect(h1).toBe(h2)
  })

  it('produce hashes distintos para respuestas distintas', async () => {
    const h1 = await hashSecretAnswer('uno')
    const h2 = await hashSecretAnswer('dos')
    expect(h1).not.toBe(h2)
  })
})
