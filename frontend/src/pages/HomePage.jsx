import { useEffect, useState } from 'react'
import { getItems } from '../lib/itemsApi.js'

export default function HomePage() {
  const [items, setItems] = useState([])
  const [serverTime, setServerTime] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await getItems()
        if (cancelled) return
        setItems(Array.isArray(data?.items) ? data.items : [])
        setServerTime(typeof data?.serverTime === 'number' ? data.serverTime : null)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load items')
      } finally {
        if (cancelled) return
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section>
      <h1>Realtime app scaffold</h1>
      <p>This is a clean starter layout. Business logic and realtime events come next.</p>

      {loading ? <p>Loading items…</p> : null}
      {error ? <p style={{ color: '#b91c1c' }}>Error: {error}</p> : null}

      {!loading && !error ? (
        <div style={{ marginTop: 16 }}>
          <div>
            <strong>serverTime</strong>: {serverTime ?? '—'}
          </div>
          <div style={{ marginTop: 8 }}>
            <strong>items</strong>: {items.length}
          </div>
        </div>
      ) : null}
    </section>
  )
}

