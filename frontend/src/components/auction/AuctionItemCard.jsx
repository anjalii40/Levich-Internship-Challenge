import { formatCountdown } from '../../lib/time.js'

export default function AuctionItemCard({
  item,
  serverNow,
  isWinning,
  isOutbid,
  isUpdated,
  onBidPlus,
}) {
  const remainingMs =
    typeof item?.endTime === 'number' && typeof serverNow === 'number'
      ? item.endTime - serverNow
      : null

  const highlight = isUpdated || isWinning || isOutbid

  return (
    <article
      className={`auction-card${highlight ? ' auction-card--highlight' : ''}`}
      style={{ border: '1px solid #e5e7eb', padding: 12 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 600 }}>{item?.title ?? 'Untitled'}</div>
        {isWinning ? (
          <span style={{ color: '#166534', fontSize: 12 }}>You&apos;re winning</span>
        ) : null}
        {!isWinning && isOutbid ? (
          <span style={{ color: '#b91c1c', fontSize: 12 }}>Outbid</span>
        ) : null}
      </div>
      <div style={{ marginTop: 6 }}>
        Current bid: <strong>{item?.currentBid ?? '—'}</strong>
      </div>
      <div style={{ marginTop: 6 }}>
        Time left: <strong>{formatCountdown(remainingMs)}</strong>
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="button" onClick={onBidPlus} disabled={!onBidPlus}>
          Bid +10
        </button>
      </div>
    </article>
  )
}

