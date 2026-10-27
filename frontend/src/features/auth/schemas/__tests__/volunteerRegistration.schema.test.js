import { describe, it, expect } from 'vitest'
import { volunteerAccountSchema, volunteerProfileSchema } from '../volunteerRegistration.schema'

describe('volunteerAccountSchema', () => {
  it('passes with valid account details matching all password rules', () => {
    const valid = {
      firstName: 'Maria',
      lastName: 'Santos',
      email: 'maria.santos@gmail.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }
    const result = volunteerAccountSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('fails when password does not start with capital letter', () => {
    const invalid = {
      firstName: 'Maria',
      lastName: 'Santos',
      email: 'maria.santos@gmail.com',
      password: 'password123!',
      confirmPassword: 'password123!',
    }
    const result = volunteerAccountSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('capital letter')
    }
  })

  it('fails when password lacks special character', () => {
    const invalid = {
      firstName: 'Maria',
      lastName: 'Santos',
      email: 'maria.santos@gmail.com',
      password: 'Password1234',
      confirmPassword: 'Password1234',
    }
    const result = volunteerAccountSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('special character')
    }
  })

  it('fails when confirmPassword does not match password', () => {
    const invalid = {
      firstName: 'Maria',
      lastName: 'Santos',
      email: 'maria.santos@gmail.com',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword!',
    }
    const result = volunteerAccountSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      const matchErr = result.error.issues.find((i) => i.path.includes('confirmPassword'))
      expect(matchErr?.message).toBe('Passwords do not match')
    }
  })

  it('rejects dummy example.com email domain', () => {
    const invalid = {
      firstName: 'Maria',
      lastName: 'Santos',
      email: 'maria@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }
    const result = volunteerAccountSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})

describe('volunteerProfileSchema', () => {
  it('rejects users under 18 years old', () => {
    const today = new Date()
    const underAgeDate = `${today.getFullYear() - 15}-01-01`
    const invalid = {
      birthdate: underAgeDate,
      gender: 'Female',
      contactNumber: '09123456789',
      region: 'NCR',
      province: 'Metro Manila',
      city: 'Manila',
      barangay: 'Barangay 1',
    }
    const result = volunteerProfileSchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 18 years old')
    }
  })
})

