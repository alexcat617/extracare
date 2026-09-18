import { useMemo, useState } from 'react'
import { OutlineButton, PrimaryButton } from '../components/BottomSheet'
import { MobileRadioCard } from '../components/MobileFormControls'
import { usePrototype } from '../context/PrototypeContext'
import { computeMarketplaceActivity } from '../lib/marketplaceActivity'
import { pendingSellerProposals } from '../store/tradeActions'

export function MarketplaceActivityScreen() {
  const {
    state,
    closeMarketplaceActivity,
    openTradeSellerReview,
    goToWallet,
    openSheet,
  } = usePrototype()
  const [valueMode, setValueMode] = useState<'saved' | 'earned'>('saved')

  const activity = useMemo(() => computeMarketplaceActivity(state), [state])
  const sellerPending = pendingSellerProposals(state).length

  return (
    <div className="pb-28">
      <header className="sticky top-0 z-20 border-b border-cvs-gray-border bg-cvs-gray-bg px-4 pb-3 pt-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={closeMarketplaceActivity}
            className="min-h-[44px] min-w-[44px] text-2xl leading-none"
            aria-label="Back to Marketplace browse"
          >
            ‹
          </button>
          <h1 className="text-xl font-bold text-black">Marketplace activity</h1>
        </div>
      </header>

      <div className="space-y-4 px-4 pt-4">
        <div className="rounded-2xl bg-cvs-blue p-4 text-white shadow-sm">
          <p className="text-sm opacity-90">Available balance</p>
          <p className="text-3xl font-bold">${activity.availableBalance.toFixed(2)}</p>
          <p className="mt-3 text-sm">
            Pending in escrow{' '}
            <span className="font-semibold">${activity.pendingEscrow.toFixed(2)}</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <StatChip label="Active listings" value={activity.activeListings} />
          <StatChip
            label="Expiring soon"
            value={activity.expiringSoon}
            warn={activity.expiringSoon > 0}
          />
          <StatChip label="Trade offers" value={activity.pendingTradeOffers} />
        </div>

        <div className="rounded-2xl border border-cvs-gray-border bg-white p-4">
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-semibold text-black">Your marketplace value</legend>
            <MobileRadioCard
              name="value-mode"
              value="saved"
              checked={valueMode === 'saved'}
              onSelect={() => setValueMode('saved')}
              label="Total saved"
              hint="From coupons you bought or received"
            />
            <MobileRadioCard
              name="value-mode"
              value="earned"
              checked={valueMode === 'earned'}
              onSelect={() => setValueMode('earned')}
              label="Total earned"
              hint="From your sold listings (after fees)"
            />
          </fieldset>
          <p className="mt-4 text-center text-3xl font-bold text-cvs-red">
            $
            {valueMode === 'saved'
              ? activity.totalSaved.toFixed(2)
              : activity.totalEarned.toFixed(2)}
          </p>
        </div>

        <p
          className="rounded-xl border border-cvs-gray-border bg-white px-4 py-3 text-center text-sm text-black"
          role="status"
        >
          {activity.fulfillmentRatePercent}% success rate · {activity.ratingStars.toFixed(1)}★
          seller trust
        </p>

        <div className="space-y-3">
          <PrimaryButton onClick={closeMarketplaceActivity}>Browse Marketplace</PrimaryButton>
          {sellerPending > 0 ? (
            <OutlineButton onClick={() => openTradeSellerReview()}>Review trade offers</OutlineButton>
          ) : null}
          <OutlineButton onClick={goToWallet}>View On card</OutlineButton>
        </div>

        <section className="rounded-2xl border border-cvs-gray-border bg-white p-4">
          <h2 className="mb-3 text-base font-bold text-black">My listings</h2>
          {activity.userActiveListings.length === 0 ? (
            <p className="text-sm text-cvs-gray-muted">
              No active listings yet. List a coupon from Savings → On card → Not for me.
            </p>
          ) : (
            <ul className="space-y-3">
              {activity.userActiveListings.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between border-b border-cvs-gray-border/60 pb-2 last:border-0 last:pb-0"
                >
                  <span className="text-sm font-medium text-black">{row.title}</span>
                  <button
                    type="button"
                    onClick={() => openSheet('listingDetail', row.id)}
                    className="text-sm font-semibold text-cvs-blue"
                  >
                    ${row.price.toFixed(2)} · View
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-cvs-gray-muted">
            Edit price, cancel, and history — full My listings hub ships in FEAT-04.
          </p>
        </section>
      </div>
    </div>
  )
}

function StatChip({
  label,
  value,
  warn,
}: {
  label: string
  value: number
  warn?: boolean
}) {
  return (
    <div className="rounded-xl border border-cvs-gray-border bg-white px-2 py-3">
      <p className={`text-xl font-bold ${warn ? 'text-amber-800' : 'text-black'}`}>{value}</p>
      <p className="mt-1 text-[10px] font-medium leading-tight text-cvs-gray-muted">{label}</p>
    </div>
  )
}
