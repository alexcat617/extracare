import { useState, type ReactNode } from 'react'

import type { ConsentMode, SellerDemoMode } from '../context/PrototypeContext'

import { usePrototype } from '../context/PrototypeContext'

import type { DemoPreset } from '../lib/demoPresets'

import type { DemoPurchaseOutcome } from '../store/prototypeStore'

import { computeMarketplaceActivity } from '../lib/marketplaceActivity'

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



const presetButtonClass =

  'w-full rounded-xl border-2 border-purple-700 bg-purple-50 px-4 py-3 text-left text-sm font-semibold text-purple-950 active:bg-purple-100'



const PRESETS: { id: DemoPreset; label: string; hint: string }[] = [

  { id: 'fresh-start', label: 'Fresh start', hint: 'FLOW-00 — consent not given' },

  { id: 'sam-buy', label: 'Sam: Browse & buy', hint: 'Consent on · Marketplace browse' },

  { id: 'jordan-listings', label: 'Jordan: Listings', hint: 'My listings + trade inbox' },
]



export function DemoControls() {

  const [open, setOpen] = useState(false)

  const {

    state,

    setConsentMode,

    setExtraCareMode,

    setOfflineMode,

    setDemoNextPurchaseOutcome,

    setSellerDemoMode,

    runDataAction,

    runDemoPreset,

  } = usePrototype()



  const sellerMode: SellerDemoMode = !state.demoPhoneVerified

    ? 'no-phone'

    : state.demoSellerListingCapReached

      ? 'listing-cap'

      : state.demoSellerAccountDays < 7

        ? 'new-account'

        : 'eligible'



  const activeListings = state.listings.filter((l) => l.status === 'active')

  const sellerTradeInbox = pendingSellerProposals(state).length

  const activity = computeMarketplaceActivity(state)

  const tradePending = state.tradeProposals.filter(

    (p) => p.status === 'pending_seller',

  ).length



  const runPreset = (preset: DemoPreset) => {

    runDemoPreset(preset)

    setOpen(false)

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

          Demo presets reset state and jump to the right screen. Not shopper UI.

        </p>



        <div className="space-y-4 text-sm">

          <section>

            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-purple-900">

              Run a demo

            </h3>

            <ul className="space-y-2">

              {PRESETS.map((p) => (

                <li key={p.id}>

                  <button

                    type="button"

                    className={presetButtonClass}

                    onClick={() => runPreset(p.id)}

                  >

                    <span className="block">{p.label}</span>

                    <span className="mt-0.5 block text-xs font-normal text-purple-800">

                      {p.hint}

                    </span>

                  </button>

                </li>

              ))}

            </ul>

          </section>



          <details className="rounded-xl border border-purple-200 bg-purple-50/50 p-3">

            <summary className="cursor-pointer font-semibold text-purple-950">

              Advanced

            </summary>

            <div className="mt-4 space-y-4">

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

                label="Seller eligibility (Jordan)"

                value={sellerMode}

                onChange={(v) => setSellerDemoMode(v as SellerDemoMode)}

              >

                <option value="eligible">Eligible (14-day account)</option>

                <option value="new-account">New account (3 days)</option>

                <option value="listing-cap">Listing cap reached</option>

                <option value="no-phone">Phone not verified</option>

              </DemoSelect>



              <button

                type="button"

                className={presetButtonClass}

                onClick={() => runDataAction('undo-purchases')}

              >

                Undo purchases (restore sold listings)

              </button>



              <button

                type="button"

                className={presetButtonClass}

                onClick={() => runDataAction('reseed')}

              >

                Reseed listings + wallet

              </button>

            </div>

          </details>



          <p className="text-xs text-cvs-gray-muted">

            {activeListings.length} marketplace listings · {activity.activeListings} yours active ·{' '}

            {sellerTradeInbox} seller inbox · {tradePending} trade pending ·{' '}

            {state.walletOffers.length} on wallet · Next buy:{' '}

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


