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
  const highlight = isUpdated || isWinning || isOutbid

  return (
    <article
      className={`auction-card${highlight ? ' auction-card--highlight' : ''}${isUpdated ? ' auction-card--updated' : ''}${isOutbid ? ' auction-card--outbid' : ''}`}
    >
      <div className="auction-card__header">
        <div className="auction-card__title">{item?.title ?? 'Untitled'}</div>
        {isWinning && !isEnded ? (
          <span className="badge badge-winning">{bidderName} — You're Winning</span>
        ) : null}
        {!isWinning && isOutbid && !isEnded ? (
          <span className="badge badge-outbid">{bidderName} — Outbid</span>
        ) : null}
        {isEnded ? (
          <span className="badge" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>
            {item.highestBidder ? `Winner: ${item.highestBidder}` : 'Ended'}
          </span>
        ) : null}
      </div>

      <div className="auction-card__status">
        <div className="auction-card__row">
          <span className="auction-card__label">Current Bid</span>
          <span className="auction-card__value price">${item?.currentBid ?? 0}</span>
        </div>
        <div className="auction-card__row">
          <span className="auction-card__label">Time Left</span>
          <span className="auction-card__value">{formatCountdown(remainingMs)}</span>
        </div>
      </div>

      <div className="auction-card__actions">
        <button
          type="button"
          className="btn-bid"
          onClick={onBidPlus}
          disabled={!onBidPlus || isEnded}
        >
          Bid +10
        </button>
      </div>
    </article>
  )
}

