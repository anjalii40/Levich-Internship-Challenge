import { useEffect, useState } from 'react'
import AuctionItemCard from '../components/auction/AuctionItemCard.jsx'
import { useServerNow } from '../hooks/useServerNow.js'
import { getItems } from '../lib/itemsApi.js'
import { socket } from '../lib/socket.js'

export default function HomePage() {
  const [items, setItems] = useState([])
  const [serverTime, setServerTime] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bidError, setBidError] = useState(null)
  const [socketId, setSocketId] = useState(socket.id ?? null)
  const [lastOutbidItemId, setLastOutbidItemId] = useState(null)
  const [lastUpdatedItemId, setLastUpdatedItemId] = useState(null)

  const serverNow = useServerNow(serverTime)

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

  useEffect(() => {
    function handleConnect() {
      setSocketId(socket.id ?? null)
    }

    function handleDisconnect() {
      setSocketId(null)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    // In case we're already connected when this effect runs
    if (socket.connected && socket.id && !socketId) {
      setSocketId(socket.id)
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [socketId])

  useEffect(() => {
    function handleUpdateBid(payload) {
      if (!payload || typeof payload.itemId !== 'string') return

      // Keep server clock synced from server-sent events.
      if (typeof payload.serverTime === 'number') {
        setServerTime(payload.serverTime)
      }

      setItems((prev) =>
        prev.map((item) => {
          if (item?.id !== payload.itemId) return item
          return {
            ...item,
            currentBid: payload.currentBid ?? item.currentBid,
            highestBidder: payload.highestBidder ?? item.highestBidder,
            endTime: payload.endTime ?? item.endTime,
          }
        }),
      )
      setLastUpdatedItemId(payload.itemId)
      setTimeout(() => {
        setLastUpdatedItemId((current) => (current === payload.itemId ? null : current))
      }, 600)
    }

    socket.on('UPDATE_BID', handleUpdateBid)
    return () => {
      socket.off('UPDATE_BID', handleUpdateBid)
    }
  }, [])

  function handleBidPlus(item) {
    if (!item || !item.id) return
    const base =
      typeof item.currentBid === 'number'
        ? item.currentBid
        : typeof item.startingPrice === 'number'
          ? item.startingPrice
          : 0
    const amount = base + 10

    setBidError(null)
    socket.emit('BID_PLACED', { itemId: item.id, amount })
  }

  useEffect(() => {
    function handleBidError(payload) {
      if (typeof payload?.serverTime === 'number') {
        setServerTime(payload.serverTime)
      }
      setBidError(payload?.message ?? 'Bid error')
      setLastOutbidItemId(payload?.itemId ?? null)
      console.warn('BID_ERROR', payload)
    }

    function handleOutbid(payload) {
      if (typeof payload?.serverTime === 'number') {
        setServerTime(payload.serverTime)
      }
      setBidError(payload?.message ?? 'Your bid was too low.')
      setLastOutbidItemId(payload?.itemId ?? null)
      console.warn('OUTBID', payload)
    }

    socket.on('BID_ERROR', handleBidError)
    socket.on('OUTBID', handleOutbid)

    return () => {
      socket.off('BID_ERROR', handleBidError)
      socket.off('OUTBID', handleOutbid)
    }
  }, [])

  return (
    <section>
      <h1>Realtime app scaffold</h1>
      <p>This is a clean starter layout. Business logic and realtime events come next.</p>

      {loading ? <p>Loading items…</p> : null}
      {error ? <p style={{ color: '#b91c1c' }}>Error: {error}</p> : null}
      {bidError ? <p style={{ color: '#b45309' }}>Bid error: {bidError}</p> : null}

      {!loading && !error ? (
        <>
          <div style={{ marginTop: 16 }}>
            <strong>serverTime</strong>: {serverTime ?? '—'}
          </div>

          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            {items.map((item) => (
              <AuctionItemCard
                key={item.id}
                item={item}
                serverNow={serverNow}
                isWinning={socketId != null && item.highestBidder === socketId}
                isOutbid={lastOutbidItemId === item.id}
                isUpdated={lastUpdatedItemId === item.id}
                onBidPlus={() => handleBidPlus(item)}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}

