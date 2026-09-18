import { useEffect, useMemo, useRef, useState } from 'react'
import { usePrototype } from '../context/PrototypeContext'
import {
  MAX_TRADE_BUNDLE,
  sumOfferSavings,
  tradeFairnessHint,
  tradeBundleWalletCandidates,
  walletOfferEligibleForTradeBundle,
} from '../lib/tradeFairness'
import { getEligibleTradeWalletOffers } from '../store/tradeActions'
import { getOfferForListing, hasActiveListingForEntitlement } from '../store/prototypeStore'
import type { WalletOffer } from '../types/marketplace'
import { CouponOfferSection } from './CouponOfferSection'
import { BottomSheet, OutlineButton, PrimaryButton, SuccessBanner } from './BottomSheet'
import { LoadingSpinner } from './LoadingSpinner'
import { MobileCheckboxCard } from './MobileFormControls'

export function TradeFlowSheets() {
  const {
    state,
    activeSheet,
    selectedListingId,
    closeSheet,
    openSheet,
    submitTradeBundle,
    respondTradeAsSeller,
    goToWallet,
    runDataAction,
  } = usePrototype()

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bundleError, setBundleError] = useState<string | null>(null)
  const [acceptingTrade, setAcceptingTrade] = useState(false)
  const activeProposal = state.activeTradeProposalId
    ? state.tradeProposals.find((p) => p.id === state.activeTradeProposalId)
    : undefined
  const resolvedListingId = selectedListingId ?? activeProposal?.listingId ?? null
  const listing = resolvedListingId
    ? state.listings.find((l) => l.id === resolvedListingId)
    : undefined
  const listingOffer = listing ? getOfferForListing(state.offers, listing) : undefined

  const eligibleOffers = useMemo(() => getEligibleTradeWalletOffers(state), [state])
  const tradeCandidates = useMemo(() => tradeBundleWalletCandidates(state), [state])

  const selectedOffers = selectedIds
    .map((id) => state.walletOffers.find((w) => w.id === id))
    .filter((w): w is NonNullable<typeof w> => Boolean(w))

  const fairness =
    listingOffer && selectedOffers.length
      ? tradeFairnessHint(
          sumOfferSavings(selectedOffers),
          listingOffer.savingsAmount,
        )
      : null

  useEffect(() => {
    if (activeSheet !== 'tradeSellerReview') {
      setAcceptingTrade(false)
      return
    }
    if (activeProposal?.status === 'completed') {
      openSheet('tradeSuccess')
    }
  }, [activeSheet, activeProposal?.status, openSheet])

  const handleAcceptTrade = async () => {
    if (!activeProposal || acceptingTrade) return
    setAcceptingTrade(true)
    await new Promise((resolve) => window.setTimeout(resolve, 1200))
    respondTradeAsSeller('accept', activeProposal.id)
    setAcceptingTrade(false)
  }

  const tradePickResetKey = activeSheet === 'tradePickBundle'
    ? `${selectedListingId ?? ''}:${activeProposal?.id ?? ''}:${activeProposal?.status ?? ''}`
    : ''
  const lastTradePickResetKey = useRef('')

  useEffect(() => {
    if (activeSheet !== 'tradePickBundle') {
      lastTradePickResetKey.current = ''
      return
    }
    if (tradePickResetKey === lastTradePickResetKey.current) return
    lastTradePickResetKey.current = tradePickResetKey
    setSelectedIds([])
    setBundleError(null)
  }, [activeSheet, tradePickResetKey])

  const toggleOffer = (id: string, on: boolean) => {
    setBundleError(null)
    if (on) {
      setSelectedIds((prev) => {
        if (prev.includes(id)) return prev
        if (prev.length >= MAX_TRADE_BUNDLE) {
          setBundleError(`Choose up to ${MAX_TRADE_BUNDLE} offers.`)
          return prev
        }
        return [...prev, id]
      })
      return
    }
    setSelectedIds((prev) => prev.filter((x) => x !== id))
  }

  const handleSendProposal = () => {
    if (selectedIds.length < 1) {
      setBundleError('Select at least one offer from your wallet.')
      return
    }
    const result = submitTradeBundle(selectedIds)
    if (result === 'error') setBundleError('Couldn’t send proposal. Check your offers.')
  }

  const walletOffersForIds = (walletIds: string[]): WalletOffer[] =>
    walletIds
      .map((id) => state.walletOffers.find((w) => w.id === id))
      .filter((w): w is WalletOffer => Boolean(w))

  return (
    <>
      <BottomSheet
        title="Propose a trade"
        size="flow"
        open={activeSheet === 'tradePickBundle'}
        onClose={closeSheet}
        footer={
          <div className="space-y-3">
            <PrimaryButton onClick={handleSendProposal}>Send proposal</PrimaryButton>
            <OutlineButton onClick={closeSheet}>Cancel</OutlineButton>
          </div>
        }
      >
        <div className="space-y-4 text-sm">
          {listingOffer ? (
            <CouponOfferSection
              label="You want this coupon"
              tone="listing"
              offers={[listingOffer]}
            />
          ) : null}
          <p className="text-cvs-gray-muted">
            Pick 1–{MAX_TRADE_BUNDLE} coupons from your On card to offer in exchange. Listed offers
            can’t be added until you delist them.
          </p>
          {tradeCandidates.length === 0 ? (
            <div className="space-y-3 rounded-lg border border-cvs-gray-border p-3">
              <p className="text-cvs-gray-muted">
                Nothing on your On card to trade. Buy a listing or restore demo coupons below.
              </p>
              <OutlineButton
                onClick={() => {
                  runDataAction('reseed')
                  closeSheet()
                  goToWallet()
                }}
              >
                Restore demo wallet coupons
              </OutlineButton>
            </div>
          ) : (
            <div className="space-y-3">
              {tradeCandidates.map((offer) => {
                const listed = hasActiveListingForEntitlement(state.listings, offer.entitlementId)
                const elig = walletOfferEligibleForTradeBundle(offer, listed)
                const disabled = !elig.ok
                return (
                  <MobileCheckboxCard
                    key={offer.id}
                    disabled={disabled}
                    checked={selectedIds.includes(offer.id)}
                    onChange={(on) => toggleOffer(offer.id, on)}
                    label={`${offer.title} — $${offer.savingsAmount} off`}
                    hint={disabled ? elig.reason : offer.headline}
                  />
                )
              })}
              {eligibleOffers.length === 0 ? (
                <p className="text-sm text-cvs-gray-muted">
                  All of your tradeable coupons are held for a listing or trade. Use{' '}
                  <strong className="text-black">Prototype → Reseed listings + wallet</strong> to reset
                  the demo, or finish / cancel the other action first.
                </p>
              ) : null}
            </div>
          )}
          {fairness ? (
            <p
              className={
                fairness.tone === 'you-more'
                  ? 'rounded-lg bg-amber-50 p-3 text-amber-950'
                  : 'rounded-lg bg-blue-50 p-3 text-cvs-blue-dark'
              }
              role="status"
            >
              {fairness.message}
            </p>
          ) : null}
          {bundleError ? (
            <p className="text-sm font-medium text-cvs-red" role="alert">{bundleError}</p>
          ) : null}
        </div>
      </BottomSheet>

      <BottomSheet
        title="Proposal sent"
        size="flow"
        open={activeSheet === 'tradeProposalSent'}
        onClose={closeSheet}
        footer={
          <OutlineButton onClick={closeSheet}>Back to Marketplace</OutlineButton>
        }
      >
        <div className="space-y-4 text-sm">
          {listingOffer && activeProposal ? (
            <>
              <CouponOfferSection
                label="You're asking for"
                tone="listing"
                offers={[listingOffer]}
              />
              <CouponOfferSection
                label="You're offering"
                tone="bundle"
                offers={walletOffersForIds(activeProposal.buyerWalletOfferIds)}
              />
            </>
          ) : null}
          <p className="text-cvs-gray-muted">
            The seller will review your bundle. When they accept, the swap completes and both of you
            see the new offers on card.
          </p>
        </div>
      </BottomSheet>

      <BottomSheet
        title="Trade proposal"
        size="flow"
        open={activeSheet === 'tradeSellerReview'}
        onClose={() => {
          if (acceptingTrade) return
          closeSheet()
        }}
        footer={
          activeProposal?.status === 'pending_seller' ? (
            <div className="space-y-3">
              <PrimaryButton onClick={handleAcceptTrade} disabled={acceptingTrade}>
                {acceptingTrade ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <LoadingSpinner className="h-5 w-5 border-2" />
                    Completing trade…
                  </span>
                ) : (
                  'Accept trade'
                )}
              </PrimaryButton>
              {acceptingTrade ? null : (
                <OutlineButton
                  onClick={() => {
                    respondTradeAsSeller('decline', activeProposal.id)
                    closeSheet()
                  }}
                >
                  Decline
                </OutlineButton>
              )}
              {acceptingTrade ? (
                <p className="text-center text-xs text-cvs-gray-muted">
                  Keep this screen open while we swap offers on both ExtraCare cards.
                </p>
              ) : null}
            </div>
          ) : (
            <OutlineButton onClick={closeSheet}>Close</OutlineButton>
          )
        }
      >
        {activeProposal && listingOffer ? (
          acceptingTrade ? (
            <TradeAcceptProcessing />
          ) : (
          <div className="space-y-4 text-sm">
            <CouponOfferSection
              label="Your listing"
              tone="listing"
              offers={[listingOffer]}
            />
            <CouponOfferSection
              label="Buyer offers in exchange"
              tone="bundle"
              offers={walletOffersForIds(activeProposal.buyerWalletOfferIds)}
            />
            <p className="text-xs text-cvs-gray-muted">
              Accepting completes the trade and swaps offers on both cards. No payment — offer-only
              trade.
            </p>
          </div>
          )
        ) : (
          <p className="text-sm text-cvs-gray-muted">No pending proposal selected.</p>
        )}
      </BottomSheet>

      <BottomSheet
        title="Trade complete"
        size="flow"
        open={activeSheet === 'tradeSuccess'}
        onClose={closeSheet}
        footer={
          <div className="space-y-3">
            <PrimaryButton
              onClick={() => {
                closeSheet()
                goToWallet()
              }}
            >
              View on card
            </PrimaryButton>
            <OutlineButton onClick={closeSheet}>Close</OutlineButton>
          </div>
        }
      >
        <div className="space-y-4 text-sm text-cvs-gray-muted">
          <SuccessBanner title="Offers swapped" />
          <p>
            Both sides’ prior offers were voided and re-issued on each card with linked transfer
            IDs.
          </p>
          {state.lastTradeTransferIds ? (
            <p className="rounded-lg border border-cvs-gray-border bg-cvs-gray-bg p-3 font-mono text-xs text-black">
              Transfer IDs: {state.lastTradeTransferIds[0]} · {state.lastTradeTransferIds[1]}
            </p>
          ) : null}
        </div>
      </BottomSheet>

    </>
  )
}

function TradeAcceptProcessing() {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingSpinner />
      <p className="mt-6 text-lg font-semibold text-black">Completing trade</p>
      <p className="mt-2 text-sm text-cvs-gray-muted">
        Voiding prior offers and re-issuing them on each member&apos;s card.
      </p>
      <p className="mt-6 max-w-[280px] text-xs text-cvs-gray-muted">
        This usually takes a few seconds. Both sides get new transfer IDs when the swap finishes.
      </p>
    </div>
  )
}
