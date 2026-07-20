export function getPlanLimits(plan) {
  if (plan === 'premium') {
    return { maxQueries: Infinity, badge: 'Premium access' }
  }

  return { maxQueries: 3, badge: 'Free tier' }
}

export function canUseAssistant({ plan = 'free', usageCount = 0 }) {
  const { maxQueries } = getPlanLimits(plan)
  if (maxQueries === Infinity) return true
  return usageCount <= maxQueries
}

export function getPlanLabel(plan) {
  return plan === 'premium' ? 'Premium' : 'Free'
}

export function getPlanPrice(plan) {
  return plan === 'premium' ? '$9/month' : 'Free'
}
