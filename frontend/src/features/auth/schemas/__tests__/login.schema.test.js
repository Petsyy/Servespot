import { describe, it, expect } from 'vitest'
import { loginSchema } from '../login.schema'

describe('loginSchema', () => {
  it('passes with valid email and password', () => {
    const validData = {
      email: 'user@example.com',
      password: 'password123',
    }
    const result = loginSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('user@example.com')
    }
  })

  it('fails when email format is invalid', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'password123',
    }
    const result = loginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      const emailError = result.error.issues.find((i) => i.path.includes('email'))
      expect(emailError).toBeDefined()
    }
  })

  it('fails when password is empty', () => {
    const invalidData = {
      email: 'user@example.com',
      password: '',
    }
    const result = loginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      const pwdError = result.error.issues.find((i) => i.path.includes('password'))
      expect(pwdError).toBeDefined()
    }
  })

  it('fails when both email and password are empty', () => {
    const invalidData = {
      email: '',
      password: '',
    }
    const result = loginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2)
    }
  })
})

