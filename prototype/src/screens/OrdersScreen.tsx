import { MOCK_MEMBER_ID } from '../data/seed'
import { usePrototype } from '../context/PrototypeContext'
import { findWalletOfferForTransfer } from '../lib/escrowTimeline'

export function OrdersScreen() {
  const { state, openPurchaseStatus, openSheet } = usePrototype()

  const purchases = state.transfers
    .filter((t) => t.toMemberId === MOCK_MEMBER_ID && !t.tradeProposalId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))

  return (
    <div className="min-h-full bg-cvs-gray-bg pb-28">
      <header className="border-b border-cvs-gray-border bg-white px-4 py-4">
        <h1 className="text-xl font-bold text-black">Orders</h1>
        <p className="mt-1 text-sm text-cvs-gray-muted">
          Marketplace purchases and protected-buy status
        </p>
      </header>

      <div className="px-4 py-4">
        {purchases.length === 0 ? (
          <div className="rounded-xl border border-cvs-gray-border bg-white p-6 text-center">
            <p className="font-semibold text-black">No marketplace purchases yet</p>
            <p className="mt-2 text-sm text-cvs-gray-muted">
              Buy a listing from Savings → Marketplace. Your transfer ID and escrow timeline will
              show here.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {purchases.map((transfer) => {
              const snap = transfer.listingSnapshot
              const wallet = findWalletOfferForTransfer(state.walletOffers, transfer.id)
              const refunded = transfer.refundStatus === 'completed'
              const statusLabel = refunded
                ? 'Refunded'
                : wallet
                  ? 'Complete'
                  : 'Verifying wallet'

              return (
                <li key={transfer.id}>
                  <button
                    type="button"
                    onClick={() => openPurchaseStatus(transfer.id)}
                    className="w-full rounded-xl border border-cvs-gray-border bg-white p-4 text-left active:bg-cvs-gray-bg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-black truncate">
                          {snap?.title ?? 'Marketplace purchase'}
                        </p>
                        <p className="mt-1 text-xs text-cvs-gray-muted line-clamp-2">
                          {snap?.headline ?? 'Protected purchase'}
                        </p>
                        <p className="mt-2 font-mono text-[10px] text-cvs-gray-muted">
                          {transfer.id}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        {snap ? (
                          <p className="text-sm font-bold text-cvs-red">
                            ${snap.savingsAmount} off
                          </p>
                        ) : null}
                        <p
                          className={`mt-1 text-xs font-medium ${
                            refunded ? 'text-cvs-red' : 'text-cvs-blue'
                          }`}
                        >
                          {statusLabel}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <button
          type="button"
          onClick={() => openSheet('disputeProtection')}
          className="mt-6 w-full text-center text-sm font-medium text-cvs-blue underline"
        >
          How marketplace protection works
        </button>
      </div>
    </div>
  )
}
