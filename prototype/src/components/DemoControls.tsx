import { useState, type ReactNode } from 'react'
import type { ConsentMode, DataAction, SellerDemoMode } from '../context/PrototypeContext'
import { usePrototype } from '../context/PrototypeContext'
import type { DemoPurchaseOutcome } from '../store/prototypeStore'
import { computeMarketplaceActivity } from '../lib/marketplaceActivity'
import { getUserPublishedListings } from '../store/listingManageActions'
import { pendingSellerProposals } from '../store/tradeActions'
import { BottomSheet } from './BottomSheet'

function consentModeFromState(
  consent: boolean,
  browseOnly: boolean,
): ConsentMode {
  if (consent) return 'given'
  if (browseOnly) return 'browse-only'
  return 'not-given'
}

const selectClass =
  'w-full rounded-xl border border-cvs-gray-border bg-white px-3 py-3 text-base text-black'

export function DemoControls() {
  const [open, setOpen] = useState(false)
  const [tradeDemoKey, setTradeDemoKey] = useState(0)
  const {
    state,
    setConsentMode,
    setExtraCareMode,
    setOfflineMode,
    setDemoNextPurchaseOutcome,
    setSellerDemoMode,
    setDemoTradeConfirmTimeout,
    openTradeSellerReview,
    confirmTrade,
    runDataAction,
    setDemoEscrowOnListing,
  } = usePrototype()

  const sellerMode: SellerDemoMode = !state.demoPhoneVerified
    ? 'no-phone'
    : state.demoSellerListingCapReached
      ? 'listing-cap'
      : state.demoSellerAccountDays < 7
        ? 'new-account'
        : 'eligible'

  const activeListings = state.listings.filter((l) => l.status === 'active')
  const myActiveListings = getUserPublishedListings(state).filter((l) => l.status === 'active')
  const escrowListingId =
    state.transfers.find((t) => t.status === 'pending' && t.id.startsWith('ESC-'))?.listingId ??
    ''
  const sellerTradeInbox = pendingSellerProposals(state).length
  const activity = computeMarketplaceActivity(state)

  const handleDataAction = (value: string) => {
    if (!value) return
    const action = value as DataAction
    runDataAction(action)
    if (action === 'open-marketplace') setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-3 z-40 rounded-full border-2 border-dashed border-purple-600 bg-purple-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-purple-900 shadow-md"
        aria-label="Open prototype controls"
      >
        Prototype
      </button>

      <BottomSheet
        title="Prototype controls"
        open={open}
        onClose={() => setOpen(false)}
        ariaLabel="Prototype demo controls — not shopper UI"
        size="tall"
      >
        <p className="mb-4 text-xs text-purple-800">
          Dropdowns apply immediately. Not shopper UI.
        </p>

        <div className="space-y-4 text-sm">
          <DemoSelect
            label="Marketplace consent"
            value={consentModeFromState(
              state.marketplaceConsent,
              state.marketplaceBrowseOnly,
            )}
            onChange={(v) => setConsentMode(v as ConsentMode)}
          >
            <option value="not-given">Not given (first visit)</option>
            <option value="given">Given</option>
            <option value="browse-only">Declined — browse only</option>
          </DemoSelect>

          <DemoSelect
            label="ExtraCare"
            value={state.extraCareLinked ? 'linked' : 'unlinked'}
            onChange={(v) => setExtraCareMode(v === 'linked')}
          >
            <option value="linked">Linked</option>
            <option value="unlinked">Not linked</option>
          </DemoSelect>

          <DemoSelect
            label="Network"
            value={state.offline ? 'offline' : 'online'}
            onChange={(v) => setOfflineMode(v === 'offline')}
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </DemoSelect>

          <DemoSelect
            label="Next Pay tap (one try)"
            value={state.demoNextPurchaseOutcome}
            onChange={(v) => setDemoNextPurchaseOutcome(v as DemoPurchaseOutcome)}
          >
            <option value="none">Normal — success</option>
            <option value="payment-fail">Payment fails</option>
            <option value="sold-out">Sold out</option>
            <option value="wallet-timeout">Wallet timeout → refund</option>
          </DemoSelect>

          <DemoSelect
            key={tradeDemoKey}
            label="Trade demo"
            value=""
            onChange={(v) => {
              if (!v) return
              if (v === 'seller-inbox') {
                openTradeSellerReview()
                setOpen(false)
              }
              if (v === 'seller-confirm') {
                confirmTrade('seller')
                setOpen(false)
              }
              if (v === 'timeout-on') setDemoTradeConfirmTimeout(true)
              if (v === 'timeout-off') setDemoTradeConfirmTimeout(false)
              setTradeDemoKey((k) => k + 1)
            }}
          >
            <option value="">Choose trade action…</option>
            <option value="seller-inbox" disabled={sellerTradeInbox === 0}>
              Open seller review ({sellerTradeInbox} pending)
            </option>
            <option value="seller-confirm">Confirm as seller (Jordan)</option>
            <option value="timeout-on">Next seller confirm → timeout</option>
            <option value="timeout-off">Clear trade timeout flag</option>
          </DemoSelect>

          <DemoSelect
            label="Listing escrow lock (FLOW-05)"
            value={escrowListingId}
            onChange={(v) => setDemoEscrowOnListing(v || null)}
          >
            <option value="">No escrow lock</option>
            {myActiveListings.map((l) => (
              <option key={l.id} value={l.id}>
                Lock cancel/edit — {l.id.slice(-6)}
              </option>
            ))}
          </DemoSelect>

          <DemoSelect
            label="Seller eligibility (Jordan)"
            value={sellerMode}
            onChange={(v) => setSellerDemoMode(v as SellerDemoMode)}
          >
            <option value="eligible">Eligible (14-day account)</option>
            <option value="new-account">New account (3 days)</option>
            <option value="listing-cap">Listing cap reached</option>
            <option value="no-phone">Phone not verified</option>
          </DemoSelect>

          <DemoSelect
            label="Data action"
            value=""
            onChange={handleDataAction}
          >
            <option value="">Choose action…</option>
            <option value="undo-purchases">Undo purchases (restore sold listings)</option>
            <option value="reseed">Reseed listings + wallet (restores trade coupons)</option>
            <option value="factory-reset">Factory reset (FLOW-00 fresh)</option>
            <option value="open-marketplace">Go to Marketplace tab</option>
          </DemoSelect>

          <p className="text-xs text-cvs-gray-muted">
            {activeListings.length} marketplace listings · {activity.activeListings} yours active ·{' '}
            {activity.pendingTradeOffers} trade pending · {state.walletOffers.length} on wallet ·
            Next buy:{' '}
            <strong className="text-black">
              {state.demoNextPurchaseOutcome === 'none'
                ? 'success'
                : state.demoNextPurchaseOutcome}
            </strong>
          </p>
        </div>
      </BottomSheet>
    </>
  )
}

function DemoSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-semibold text-black">{label}</span>
      <select
        className={selectClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </label>
  )
}
