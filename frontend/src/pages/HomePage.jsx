import { useEffect, useState } from 'react'
import AuctionItemCard from '../components/auction/AuctionItemCard.jsx'
import { useServerNow } from '../hooks/useServerNow.js'
import { getItems } from '../lib/itemsApi.js'
import { socket } from '../lib/socket.js'

export default function HomePage() {
  const [items, setItems] = useState([])
  const [serverTime, setServerTime] = useState(null)
  const [breakStatus, setBreakStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bidError, setBidError] = useState(null)

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
        setBreakStatus(data?.breakStatus ?? null)
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
    function handleUpdateBid(payload) {
      if (!payload || typeof payload.itemId !== 'string') return

      // Keep server clock synced from server-sent events.
      if (typeof payload.serverTime === 'number') {
        setServerTime(payload.serverTime)
      }

      if (payload.breakStatus !== undefined) {
        console.log('[HomePage] Received breakStatus from socket:', payload.breakStatus)
        setBreakStatus(payload.breakStatus)
      }

      setItems((prev) =>
        prev.map((item) => {
          if (item?.id !== payload.itemId) return item
          return {
            ...item,
            currentBid: payload.currentBid ?? item.currentBid,
            highestBidder: payload.highestBidder ?? item.highestBidder,
            endTime: payload.endTime ?? item.endTime,
            breakStartTime:
              payload.breakStartTime !== undefined
                ? payload.breakStartTime
                : item.breakStartTime,
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

  // Identity state
  const [name, setName] = useState(() => sessionStorage.getItem('bidderName') || '')

  useEffect(() => {
    if (!name) {
      const raw = prompt('Enter your name to bid:')
      const clean = raw?.trim() || `User${Math.floor(Math.random() * 1000)}`
      sessionStorage.setItem('bidderName', clean)
      setName(clean)
    }
  }, [name])

  function handleChangeIdentity() {
    if (confirm('Change your name? This will reload the page.')) {
      sessionStorage.removeItem('bidderName')
      window.location.reload()
    }
  }

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
    // Use the name as the stable bidderId rather than socket.id
    // This allows identity distinctness across reloads if sessionStorage persists
    socket.emit('BID_PLACED', { itemId: item.id, amount, bidderId: name })
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

  const liveCount = items.filter((i) => i.endTime > serverNow).length
  const endingSoonCount = items.filter((i) => {
    const timeLeft = i.endTime - serverNow
    return timeLeft > 0 && timeLeft <= 30000
  }).length

  return (
    <section>
      <div className="page-header">
        {name ? (
          <div className="identity-chip">
            {name}
            <button className="btn-change-identity" onClick={handleChangeIdentity}>
              (Change)
            </button>
          </div>
        ) : null}

        <h1>Live Auction Dashboard</h1>
        <p>Place your bids in real-time. Highest bidder wins when time runs out.</p>

        {!loading && !error ? (
          <div className="auction-status-bar">
            <div className="status-indicator">
              <span className="status-dot"></span>
              {liveCount} Auctions Live
            </div>
            <div className="status-separator">·</div>
            <div className={`status-indicator${endingSoonCount > 0 ? ' status-urgent' : ''}`}>
              {endingSoonCount} Ending Soon
            </div>
          </div>
        ) : null}
      </div>

      {loading ? <p>Loading items…</p> : null}
      {!loading && !error && items.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280', marginTop: 40 }}>
          Waiting for next round...
        </p>
      ) : null}
      {error ? <p style={{ color: '#b91c1c' }}>Error: {error}</p> : null}
      {bidError ? (
        <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 8 }}>
          {bidError}
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <div style={{ marginBottom: 24, fontSize: '0.875rem', color: '#6b7280' }}>
            Server Time: <span style={{ fontFamily: 'monospace' }}>{new Date(serverTime).toLocaleTimeString()}</span>
          </div>

          <div className="auction-grid">
            {items.map((item) => (
              <AuctionItemCard
                key={item.id}
                item={item}
                serverNow={serverNow}
                isWinning={name && item.highestBidder === name}
                isOutbid={lastOutbidItemId === item.id}
                isUpdated={lastUpdatedItemId === item.id}
                onBidPlus={() => handleBidPlus(item)}
                bidderName={name}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}

