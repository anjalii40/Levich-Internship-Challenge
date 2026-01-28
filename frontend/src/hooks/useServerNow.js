import { useEffect, useMemo, useState } from 'react'

/**
 * Returns a "server now" timestamp (ms since epoch) derived from the last known
 * server time, advanced using `performance.now()` (monotonic) instead of relying
 * on the client's wall clock.
 */
export function useServerNow(serverTimeMs, { tickMs = 250 } = {}) {
  const sync = useMemo(() => {
    if (typeof serverTimeMs !== 'number') return null
    return {
      serverTimeAtSync: serverTimeMs,
      perfNowAtSync: performance.now(),
    }
  }, [serverTimeMs])

  const [serverNow, setServerNow] = useState(() => {
    if (!sync) return null
    return sync.serverTimeAtSync
  })

  useEffect(() => {
    if (!sync) return

    const compute = () =>
      sync.serverTimeAtSync + (performance.now() - sync.perfNowAtSync)

    // Set immediately on sync.
    setServerNow(compute())

    const id = setInterval(() => {
      setServerNow(compute())
    }, tickMs)

    return () => clearInterval(id)
  }, [sync, tickMs])

  return serverNow
}

