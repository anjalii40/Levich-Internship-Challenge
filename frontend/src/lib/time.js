export function formatCountdown(msRemaining) {
  if (typeof msRemaining !== 'number' || Number.isNaN(msRemaining)) return '—'
  if (msRemaining <= 0) return 'Ended'

  const totalSeconds = Math.ceil(msRemaining / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

