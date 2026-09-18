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
import { BottomSheet, OutlineButton, PrimaryButton } from './BottomSheet'
import { MobileCheckboxCard } from './MobileFormControls'

export function TradeFlowSheets() {
  const {
    state,
    activeSheet,
    selectedListingId,
    closeSheet,
    submitTradeBundle,
    openTradeSellerReview,
    respondTradeAsSeller,
    confirmTrade,
    goToWallet,
    runDataAction,
  } = usePrototype()

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [sellerNote, setSellerNote] = useState('')
  const [bundleError, setBundleError] = useState<string | null>(null)

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
    setMessage(
      activeProposal?.status === 'pending_buyer' && activeProposal.sellerNote
        ? activeProposal.sellerNote
        : '',
    )
  }, [activeSheet, tradePickResetKey, activeProposal?.status, activeProposal?.sellerNote])

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
    const result = submitTradeBundle(selectedIds, message)
    if (result === 'error') setBundleError('Couldn’t send proposal. Check your offers.')
  }

  const buyerBundleSummary = (walletIds: string[]) =>
    walletIds
      .map((id) => state.walletOffers.find((w) => w.id === id))
      .filter(Boolean)
      .map((w) => w!.title)
      .join(', ')

  return (
    <>
      <BottomSheet
        title="Propose a trade"
        size="flow"
        open={activeSheet === 'tradePickBundle'}
        onClose={closeSheet}
        footer={
          <div className="space-y-3">
            <PrimaryButton onClick={handleSendProposal}>
              {activeProposal?.status === 'pending_buyer' ? 'Resend proposal' : 'Send proposal'}
            </PrimaryButton>
            <OutlineButton onClick={closeSheet}>Cancel</OutlineButton>
          </div>
        }
      >
        <div className="space-y-4 text-sm">
          {listingOffer ? (
            <p className="font-semibold text-black">
              You want: {listingOffer.title}{' '}
              <span className="text-cvs-red">(${listingOffer.savingsAmount} off)</span>
            </p>
          ) : null}
          {activeProposal?.status === 'pending_buyer' && activeProposal.sellerNote ? (
            <p className="rounded-lg bg-amber-50 p-3 text-amber-950" role="status">
              Seller asked for different offers: {activeProposal.sellerNote}
            </p>
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
          <label className="block">
            <span className="mb-1 block font-semibold text-black">Optional message</span>
            <textarea
              className="w-full rounded-xl border border-cvs-gray-border px-3 py-2 text-base text-black"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Happy to swap if terms match"
            />
          </label>
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
          <div className="space-y-3">
            <PrimaryButton onClick={() => openTradeSellerReview()}>Review as seller (demo)</PrimaryButton>
            <OutlineButton onClick={closeSheet}>Back to Marketplace</OutlineButton>
          </div>
        }
      >
        <p className="text-sm text-cvs-gray-muted">
          The seller will review your bundle. In the live app they’d get a notification. For this
          prototype, use <strong className="text-black">Prototype → Trade inbox (seller)</strong> or
          the button below to continue the demo as Jordan (seller).
        </p>
      </BottomSheet>

      <BottomSheet
        title="Trade proposal"
        size="flow"
        open={activeSheet === 'tradeSellerReview'}
        onClose={closeSheet}
        footer={
          activeProposal ? (
            <div className="space-y-3">
              <PrimaryButton onClick={() => respondTradeAsSeller('accept')}>Accept trade</PrimaryButton>
              <OutlineButton onClick={() => respondTradeAsSeller('counter', sellerNote || 'Different coupons please')}>
                Counter — ask for different offers
              </OutlineButton>
              <OutlineButton onClick={() => respondTradeAsSeller('decline', sellerNote)}>
                Decline
              </OutlineButton>
            </div>
          ) : undefined
        }
      >
        {activeProposal && listingOffer ? (
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-semibold text-black">Your listing:</span> {listingOffer.title} (
              ${listingOffer.savingsAmount} off)
            </p>
            <p>
              <span className="font-semibold text-black">They offer:</span>{' '}
              {buyerBundleSummary(activeProposal.buyerWalletOfferIds)}
            </p>
            {activeProposal.message ? (
              <p className="rounded-lg bg-cvs-gray-bg p-3 text-cvs-gray-muted">
                Buyer message: {activeProposal.message}
              </p>
            ) : null}
            <label className="block">
              <span className="mb-1 block font-semibold text-black">Note to buyer (optional)</span>
              <textarea
                className="w-full rounded-xl border border-cvs-gray-border px-3 py-2 text-base"
                rows={2}
                value={sellerNote}
                onChange={(e) => setSellerNote(e.target.value)}
              />
            </label>
            <p className="text-xs text-cvs-gray-muted">
              Accepting locks both sides’ offers until each person confirms the swap.
            </p>
          </div>
        ) : (
          <p className="text-sm text-cvs-gray-muted">No pending proposal selected.</p>
        )}
      </BottomSheet>

      <BottomSheet
        title="Confirm your trade"
        size="flow"
        open={activeSheet === 'tradeBuyerConfirm'}
        onClose={closeSheet}
        footer={
          <PrimaryButton onClick={() => confirmTrade('buyer')}>Confirm trade</PrimaryButton>
        }
      >
        <TradeLockSummary state={state} proposal={activeProposal} listingOffer={listingOffer} />
        <p className="mt-3 text-xs text-cvs-gray-muted">
          The seller must also confirm before offers swap. No payment — offer-only trade.
        </p>
      </BottomSheet>

      <BottomSheet
        title="Seller confirm (demo)"
        size="flow"
        open={activeSheet === 'tradeSellerConfirm'}
        onClose={closeSheet}
        footer={
          <PrimaryButton onClick={() => confirmTrade('seller')}>Confirm as seller</PrimaryButton>
        }
      >
        <p className="mb-3 text-sm text-cvs-gray-muted">
          Buyer confirmed. Jordan (seller) must confirm to complete the atomic swap.
        </p>
        <TradeLockSummary state={state} proposal={activeProposal} listingOffer={listingOffer} />
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
            <OutlineButton onClick={closeSheet}>Continue</OutlineButton>
          </div>
        }
      >
        <div className="space-y-3 text-sm text-cvs-gray-muted">
          <p className="text-base font-semibold text-black">Offers swapped</p>
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

      <BottomSheet
        title="Proposal declined"
        size="flow"
        open={activeSheet === 'tradeDeclined'}
        onClose={closeSheet}
        footer={<PrimaryButton onClick={closeSheet}>OK</PrimaryButton>}
      >
        <p className="text-sm text-cvs-gray-muted">
          The seller declined this trade. Your offers were not locked or transferred.
        </p>
      </BottomSheet>

      <BottomSheet
        title="Trade expired"
        size="flow"
        open={activeSheet === 'tradeExpired'}
        onClose={closeSheet}
        footer={<PrimaryButton onClick={closeSheet}>OK</PrimaryButton>}
      >
        <p className="text-sm text-cvs-gray-muted">
          The confirmation window ended before both sides confirmed. Locked offers were released and
          no transfer occurred.
        </p>
      </BottomSheet>
    </>
  )
}

function TradeLockSummary({
  state,
  proposal,
  listingOffer,
}: {
  state: ReturnType<typeof usePrototype>['state']
  proposal: ReturnType<typeof usePrototype>['state']['tradeProposals'][number] | undefined
  listingOffer: { title: string; savingsAmount: number } | undefined
}) {
  if (!proposal || !listingOffer) return null
  const giving = proposal.buyerWalletOfferIds
    .map((id) => state.walletOffers.find((w) => w.id === id))
    .filter(Boolean)
  return (
    <div className="space-y-2 text-sm">
      <p className="font-semibold text-black">Pending lock</p>
      <p>
        You give:{' '}
        {giving.map((o) => `${o!.title} ($${o!.savingsAmount})`).join(', ') || '—'}
      </p>
      <p>You receive: {listingOffer.title} (${listingOffer.savingsAmount} off)</p>
    </div>
  )
}
