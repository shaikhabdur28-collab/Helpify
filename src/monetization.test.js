import { describe, expect, it } from 'vitest'
import { canUseAssistant, getPlanLimits, getPlanLabel, getPlanPrice } from './monetization'

describe('monetization helpers', () => {
  it('limits free users to a small number of assistant queries', () => {
    const limits = getPlanLimits('free')
    expect(limits.maxQueries).toBe(3)
    expect(canUseAssistant({ plan: 'free', usageCount: 3 })).toBe(true)
    expect(canUseAssistant({ plan: 'free', usageCount: 4 })).toBe(false)
  })

  it('gives premium users unlimited assistant access', () => {
    expect(getPlanLabel('premium')).toBe('Premium')
    expect(getPlanPrice('premium')).toBe('$9/month')
    expect(canUseAssistant({ plan: 'premium', usageCount: 50 })).toBe(true)
  })
})
