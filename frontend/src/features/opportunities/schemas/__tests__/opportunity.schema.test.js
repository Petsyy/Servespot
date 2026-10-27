import { describe, it, expect } from 'vitest'
import { opportunitySchema, opportunityDefaultValues } from '../opportunity.schema'

describe('opportunitySchema', () => {
  it('passes with valid opportunity details', () => {
    const valid = {
      title: 'Beach Cleanup Drive',
      description: 'Help us clean the coastal area of plastic waste.',
      date: '2026-11-01',
      location: 'Manila Bay Coastal Area',
      volunteersNeeded: 15,
      skills: ['Environment', 'Logistics'],
    }
    const result = opportunitySchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('fails when title is shorter than 3 characters', () => {
    const invalid = {
      title: 'No',
      description: 'Help us clean the coastal area of plastic waste.',
      date: '2026-11-01',
      location: 'Manila Bay',
      volunteersNeeded: 5,
    }
    const result = opportunitySchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 3 characters')
    }
  })

  it('fails when volunteersNeeded is less than 1', () => {
    const invalid = {
      title: 'Tree Planting',
      description: 'Planting native trees in the watershed.',
      date: '2026-11-05',
      location: 'Antipolo Watershed',
      volunteersNeeded: 0,
    }
    const result = opportunitySchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('At least 1 volunteer')
    }
  })

  it('coerces string number to integer for volunteersNeeded', () => {
    const validWithCoerce = {
      title: 'Community Pantry Help',
      description: 'Sorting food donations and packing goods for local residents.',
      date: '2026-11-10',
      location: 'Quezon City',
      volunteersNeeded: '10',
    }
    const result = opportunitySchema.safeParse(validWithCoerce)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.volunteersNeeded).toBe(10)
    }
  })
})

