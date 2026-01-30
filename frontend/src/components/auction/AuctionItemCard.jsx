import { formatCountdown } from '../../lib/time.js'

export default function AuctionItemCard({
  item,
  serverNow,
  isWinning,
  isOutbid,
  isUpdated,
  onBidPlus,
  bidderName,
}) {
  const remainingMs =
    typeof item?.endTime === 'number' && typeof serverNow === 'number'
      ? item.endTime - serverNow
      : null

  const isEnded = remainingMs !== null && remainingMs <= 0
  const isEndingSoon = remainingMs !== null && remainingMs > 0 && remainingMs <= 30000
  const isCritical = remainingMs !== null && remainingMs > 0 && remainingMs <= 10000

  const highlight = isUpdated || isWinning || isOutbid

  return (
    <article
      className={`auction-card${highlight ? ' auction-card--highlight' : ''}${isUpdated ? ' auction-card--updated' : ''}${isOutbid ? ' auction-card--outbid' : ''}${isEndingSoon && !isEnded ? ' auction-card--ending-soon' : ''}`}
    >
      <div className="auction-card__header">
        <div className="auction-card__title">{item?.title ?? 'Untitled'}</div>
        {isWinning && !isEnded ? (
          <span className="badge badge-winning">{bidderName} — You're Winning</span>
        ) : null}
        {!isWinning && isOutbid && !isEnded ? (
          <span className="badge badge-outbid">{bidderName} — Outbid</span>
        ) : null}
      </div>

      {isEnded ? (
        <div className="winner-banner">
          <div className="winner-banner__title">
            {item.highestBidder ? 'Winner' : 'Auction Ended'}
          </div>
          <div className="winner-banner__name">
            {item.highestBidder ? item.highestBidder : 'No Bids Placed'}
          </div>
          <div className="winner-banner__amount">
            {item.highestBidder ? `Winning Bid: ₹${item.currentBid}` : '—'}
          </div>
          <div style={{ marginTop: 12, fontSize: '0.875rem', color: '#6b7280' }}>
            {item.breakStartTime && serverNow ? (
              <>
                Restarting In{' '}
                <span style={{ fontWeight: 600, color: '#4b5563' }}>
                  {Math.max(
                    0,
                    Math.ceil((item.breakStartTime + 60000 - serverNow) / 1000),
                  )}
                  s
                </span>
              </>
            ) : (
              'Waiting for break...'
            )}
          </div>
        </div>
      ) : null}

      <div className="auction-card__status">
        <div className="auction-card__row">
          <span className="auction-card__label">Current Bid</span>
          <span className="auction-card__value price">₹{item?.currentBid ?? 0}</span>
        </div>
        <div className="auction-card__row">
          <span className="auction-card__label">Time Left</span>
          <span className={`auction-card__value${isCritical ? ' timer-critical' : ''}`}>
            {formatCountdown(remainingMs)}
          </span>
        </div>
      </div>

      <div className="auction-card__actions">
        {item.highestBidder || item.currentBid > item.startingPrice ? (
          null // Logic check for "No bids yet"?
          // Actually, let's just show text below button if no bids?
          // The prompt asked for "No bids yet — be the first to bid" edge state messaging.
          // Let's add it right above the button or as specific text when empty.
        ) : null}

        <button
          type="button"
          className="btn-bid"
          onClick={onBidPlus}
          disabled={!onBidPlus || isEnded}
        >
          Bid +10
        </button>
        {!item.highestBidder && !isEnded && (
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.75rem', color: '#6b7280' }}>
            Be the first to bid!
          </div>
        )}
      </div>
    </article>
  )
}

