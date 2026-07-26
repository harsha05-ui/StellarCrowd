// src/utils/helpers.js

/**
 * Truncates a Stellar public address to show only the start and end characters.
 */
export function truncateAddress(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}…${address.slice(-6)}`
}

/**
 * Calculates the number of days remaining until the deadline date.
 */
export function getDaysRemaining(deadlineStr) {
  const diffTime = new Date(deadlineStr) - new Date()
  if (diffTime <= 0) return 0
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Returns Tailwind CSS classes for category badges.
 */
export function getCategoryStyles(category) {
  switch (category?.toLowerCase()) {
    case 'technology':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    case 'environment':
      return 'bg-green-500/10 text-green-400 border-green-500/20'
    case 'art':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    case 'community':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
}
