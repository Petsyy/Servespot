import { describe, it, expect } from 'vitest'
import { loginSchema } from '../login.schema'
import { volunteerAccountSchema, volunteerProfileSchema } from '../volunteerRegistration.schema'

describe('Frontend Security Schema & Injection Defenses', () => {
  describe('Login Input Sanitization & Attack Payloads', () => {
    it('rejects XSS script injection vectors in email field', () => {
      const maliciousInputs = [
        '<script>alert(1)</script>',
        '<img src=x onerror=alert(1)>',
        '"><svg/onload=alert(1)>@test.com',
        'javascript:alert(document.cookie)',
      ]

      for (const input of maliciousInputs) {
        const result = loginSchema.safeParse({ email: input, password: 'ValidPassword123!' })
        expect(result.success).toBe(false)
        if (!result.success) {
          const hasEmailError = result.error.issues.some((issue) => issue.path.includes('email'))
          expect(hasEmailError).toBe(true)
        }
      }
    })

    it('rejects SQL/NoSQL injection string patterns in email field', () => {
      const injectionInputs = [
        "' OR '1'='1",
        "admin' --",
        "\" or \"\"=\"",
        "[$ne]=null",
      ]

      for (const input of injectionInputs) {
        const result = loginSchema.safeParse({ email: input, password: 'ValidPassword123!' })
        expect(result.success).toBe(false)
        if (!result.success) {
          const hasEmailError = result.error.issues.some((issue) => issue.path.includes('email'))
          expect(hasEmailError).toBe(true)
        }
      }
    })

    it('rejects non-string object payloads injected into form fields', () => {
      const objectPayload = {
        email: { $gt: '' },
        password: { $gt: '' },
      }
      const result = loginSchema.safeParse(objectPayload)
      expect(result.success).toBe(false)
    })
  })

  describe('Registration Password Strength & Integrity Rules', () => {
    const baseAccount = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gmail.com',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    }

    it('rejects passwords without an uppercase leading letter', () => {
      const result = volunteerAccountSchema.safeParse({
        ...baseAccount,
        password: 'weakpassword123!',
        confirmPassword: 'weakpassword123!',
      })
      expect(result.success).toBe(false)
    })

    it('rejects passwords without special characters', () => {
      const result = volunteerAccountSchema.safeParse({
        ...baseAccount,
        password: 'UppercasePassword123',
        confirmPassword: 'UppercasePassword123',
      })
      expect(result.success).toBe(false)
    })

    it('rejects mismatched password and confirmPassword', () => {
      const result = volunteerAccountSchema.safeParse({
        ...baseAccount,
        password: 'StrongPassword123!',
        confirmPassword: 'DifferentPassword123!',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const hasMismatchError = result.error.issues.some((i) => i.message.includes('do not match'))
        expect(hasMismatchError).toBe(true)
      }
    })

    it('rejects placeholder domain @example.com to enforce legitimate email registration', () => {
      const result = volunteerAccountSchema.safeParse({
        ...baseAccount,
        email: 'test@example.com',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('Age & Underage Volunteer Safeguards', () => {
    const baseProfile = {
      gender: 'Male',
      contact: '09123456789',
      region: 'NCR',
      city: 'Manila',
      skills: ['Teaching'],
      interests: ['Education'],
      availability: ['Weekends'],
    }

    it('rejects registration if applicant is under 18 years old', () => {
      // 16 years old
      const today = new Date()
      const underAgeDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate())
      const formattedDate = underAgeDate.toISOString().split('T')[0]

      const result = volunteerProfileSchema.safeParse({
        ...baseProfile,
        birthdate: formattedDate,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const ageError = result.error.issues.some((i) => i.message.includes('at least 18'))
        expect(ageError).toBe(true)
      }
    })

    it('accepts registration if applicant is 18 years or older', () => {
      // 22 years old
      const today = new Date()
      const adultDate = new Date(today.getFullYear() - 22, today.getMonth(), today.getDate())
      const formattedDate = adultDate.toISOString().split('T')[0]

      const result = volunteerProfileSchema.safeParse({
        ...baseProfile,
        birthdate: formattedDate,
      })
      expect(result.success).toBe(true)
    })
  })
})
