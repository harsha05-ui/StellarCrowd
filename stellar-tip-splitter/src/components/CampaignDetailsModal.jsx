// src/components/CampaignDetailsModal.jsx
import React, { useState } from 'react'
import TxResult from './TxResult'
import { getDaysRemaining, getCategoryStyles, truncateAddress } from '../utils/helpers'
import {
  sendCrowdfundInvestment,
  sendCrowdfundWithdraw,
  sendCrowdfundRefund,
} from '../services/stellar'
import {
  investInCampaign,
  withdrawCampaignFunds,
  claimInvestorRefund,
} from '../services/crowdfunding'

export default function CampaignDetailsModal({
  campaign,
  onClose,
  onRefresh,
  publicKey,
  balance,
  onConnect,
  onAddComment,
  onToggleFavorite,
  addToast
}) {
  const [investAmount, setInvestAmount] = useState('')
  const [commentText, setCommentText] = useState('')
  const [commenterName, setCommenterName] = useState('')
  const [loading, setLoading] = useState(false)
  const [txResult, setTxResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const daysLeft = getDaysRemaining(campaign.deadline)
  const percent = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100))
  const isCreator = publicKey && campaign.creator === publicKey
  const hasEnded = new Date(campaign.deadline) <= new Date()

  // Find if user backed
  const userInvestments = publicKey
    ? campaign.investors.filter(inv => inv.address === publicKey)
    : []
  const hasInvested = userInvestments.length > 0
  const isRefunded = hasInvested && userInvestments.every(inv => inv.refunded)
  const canRefund = hasEnded && campaign.status === 'failed' && hasInvested && !isRefunded

  const isFavorited = publicKey && campaign.favorites && campaign.favorites.includes(publicKey)

  const handleInvest = async (e) => {
    e.preventDefault()
    if (!publicKey) return
    setErrorMsg('')
    setTxResult({ status: 'pending' })
    setLoading(true)

    const amount = parseFloat(investAmount)
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Please enter a valid amount.')
      setTxResult(null)
      setLoading(false)
      return
    }

    if (amount > parseFloat(balance)) {
      setErrorMsg(`Insufficient balance. You have ${balance} XLM.`)
      setTxResult(null)
      setLoading(false)
      return
    }

    try {
      const { hash } = await sendCrowdfundInvestment(publicKey, amount, campaign.id)
      const updatedCampaign = investInCampaign(campaign.id, publicKey, amount, hash)
      setTxResult({ status: 'success', hash })
      setInvestAmount('')
      onRefresh(updatedCampaign)
    } catch (err) {
      console.error(err)
      setTxResult({
        status: 'error',
        message: err.message || 'Transaction rejected or failed.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!publicKey || !isCreator) return
    setErrorMsg('')
    setTxResult({ status: 'pending' })
    setLoading(true)

    try {
      const { hash } = await sendCrowdfundWithdraw(publicKey, campaign.id)
      const updatedCampaign = withdrawCampaignFunds(campaign.id, publicKey)
      setTxResult({ status: 'success', hash })
      onRefresh(updatedCampaign)
    } catch (err) {
      console.error(err)
      setTxResult({
        status: 'error',
        message: err.message || 'Withdrawal transaction failed.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefund = async () => {
    if (!publicKey || !hasInvested) return
    setErrorMsg('')
    setTxResult({ status: 'pending' })
    setLoading(true)

    try {
      const { hash } = await sendCrowdfundRefund(publicKey, campaign.id)
      const updatedCampaign = claimInvestorRefund(campaign.id, publicKey)
      setTxResult({ status: 'success', hash })
      onRefresh(updatedCampaign)
    } catch (err) {
      console.error(err)
      setTxResult({
        status: 'error',
        message: err.message || 'Refund transaction failed.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    const mockUrl = `${window.location.origin}/?campaign=${campaign.id}`
    navigator.clipboard.writeText(mockUrl)
    if (addToast) {
      addToast('Campaign link copied to clipboard!', 'success')
    }
  }

  const handleFavoriteToggle = () => {
    if (!publicKey) {
      if (addToast) addToast('Connect wallet to favorite campaigns.', 'info')
      return
    }
    const updated = onToggleFavorite(campaign.id, publicKey)
    onRefresh(updated)
  }

  const handlePostComment = (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    const author = commenterName.trim() || truncateAddress(publicKey)
    const updated = onAddComment(campaign.id, author, commentText)
    setCommentText('')
    onRefresh(updated)
  }

  const categoryStyles = getCategoryStyles(campaign.category)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-space-600 bg-space-800 shadow-2xl overflow-hidden my-8">
        
        {/* Cover Header */}
        <div className="relative h-60 w-full bg-space-950 sm:h-72">
          <img
            src={campaign.coverImage}
            alt={campaign.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-space-800 to-transparent" />
          
          {/* Top right buttons */}
          <div className="absolute right-4 top-4 flex items-center gap-2">
            {/* Share */}
            <button
              onClick={handleShare}
              title="Copy share link"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-space-950/60 text-white hover:bg-space-950 hover:text-stellarblue-400"
            >
              🔗
            </button>
            {/* Favorite */}
            <button
              onClick={handleFavoriteToggle}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-space-950/60 text-white hover:bg-space-950"
            >
              {isFavorited ? (
                <span className="text-red-500 text-sm">❤️</span>
              ) : (
                <span className="text-mist text-sm">🤍</span>
              )}
            </button>
            {/* Close */}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-space-950/60 text-white hover:bg-space-950 hover:text-flare-400"
              aria-label="Close details"
            >
              ✕
            </button>
          </div>
          
          <div className="absolute bottom-4 left-5 right-5">
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${categoryStyles}`}>
              {campaign.category}
            </span>
            <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl line-clamp-2">
              {campaign.title}
            </h2>
            <p className="mt-1 text-xs text-stellarblue-400 font-mono">
              Launched by {campaign.creatorName || 'Anonymous'}
            </p>
          </div>
        </div>

        {/* Modal body */}
        <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 md:grid-cols-5 md:gap-8 max-h-[calc(80vh-200px)] overflow-y-auto">
          
          {/* Main Info */}
          <div className="md:col-span-3 space-y-5">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-mist font-semibold">About Campaign</h3>
              <p className="mt-2 text-sm text-mist leading-relaxed whitespace-pre-line">
                {campaign.description}
              </p>
            </div>

            <div className="border-t border-space-600/50 pt-4">
              <h3 className="text-xs uppercase tracking-wider text-mist font-semibold">Creator Wallet Address</h3>
              <p className="mt-1 font-mono text-xs text-white break-all">{campaign.creator}</p>
            </div>

            {/* Backers / Investment History */}
            <div className="border-t border-space-600/50 pt-4">
              <h3 className="text-xs uppercase tracking-wider text-mist font-semibold">
                Platform Backers ({campaign.investors.length})
              </h3>
              
              <div className="mt-3 space-y-2 max-h-36 overflow-y-auto pr-1">
                {campaign.investors.length === 0 ? (
                  <p className="text-xs text-mist/60 italic">No investments yet.</p>
                ) : (
                  campaign.investors.map((inv, idx) => (
                    <div key={idx} className="flex flex-col justify-between gap-1 rounded-lg bg-space-900/60 p-2 text-xs border border-space-700/30 sm:flex-row sm:items-center">
                      <div className="flex flex-col">
                        <span className="font-mono text-white text-[11px]">
                          {truncateAddress(inv.address)} {inv.address === publicKey && <span className="text-stellarblue-400 font-sans font-semibold">(You)</span>}
                        </span>
                        <span className="text-[10px] text-mist/70">
                          {new Date(inv.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-flare-400">{inv.amount} XLM</span>
                        {inv.refunded ? (
                          <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] border border-red-500/20 text-red-400 font-semibold uppercase">Refunded</span>
                        ) : (
                          <a
                            href={`https://stellar.expert/explorer/testnet/tx/${inv.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-stellarblue-400 hover:text-stellarblue-300 font-semibold"
                          >
                            TX ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t border-space-600/50 pt-4 space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-mist font-semibold">Comments ({campaign.comments?.length || 0})</h3>
              
              {/* Add Comment form */}
              {publicKey ? (
                <form onSubmit={handlePostComment} className="space-y-2">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <input
                      type="text"
                      placeholder="Your Name (Optional)"
                      value={commenterName}
                      onChange={(e) => setCommenterName(e.target.value)}
                      className="rounded-lg border border-space-600 bg-space-900 px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <div className="sm:col-span-2 flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Write a public comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 rounded-lg border border-space-600 bg-space-900 px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-stellarblue-500 px-3 py-1 text-xs font-bold text-space-950 hover:bg-stellarblue-400 transition"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-mist/60">Connect wallet to write comments.</p>
              )}

              {/* Comments list */}
              <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                {!campaign.comments || campaign.comments.length === 0 ? (
                  <p className="text-xs text-mist/60 italic">No comments yet. Write the first one!</p>
                ) : (
                  campaign.comments.map((comm, idx) => (
                    <div key={idx} className="rounded-lg bg-space-900/40 border border-space-700/20 p-2 text-xs">
                      <div className="flex items-center justify-between text-mist text-[10px] font-semibold">
                        <span className="text-stellarblue-400">{comm.author}</span>
                        <span>{new Date(comm.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-1 text-white text-xs leading-normal">{comm.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Action sidebar */}
          <div className="md:col-span-2 space-y-4">
            
            {/* Goal Progress Panel */}
            <div className="rounded-xl border border-space-600 bg-space-900 p-4">
              <h3 className="text-xs uppercase tracking-wider text-mist">Target Progress</h3>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-mono text-xl font-bold text-white">{campaign.raisedAmount.toLocaleString()} XLM</span>
                <span className="text-xs text-mist">of {campaign.targetAmount.toLocaleString()} XLM</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-space-700 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    campaign.status === 'successful' ? 'bg-green-500' : campaign.status === 'failed' ? 'bg-red-500' : 'bg-stellarblue-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs font-semibold text-mist">
                <span>{percent}% funded</span>
                <span>{campaign.investors.length} {campaign.investors.length === 1 ? 'investor' : 'investors'}</span>
              </div>

              <div className="mt-4 border-t border-space-600/50 pt-3 flex justify-between text-xs">
                <div>
                  <span className="text-mist">Status:</span>
                  <span className={`ml-1.5 font-bold uppercase tracking-wider ${
                    campaign.status === 'successful' ? 'text-green-400' : campaign.status === 'failed' ? 'text-red-400' : 'text-stellarblue-400'
                  }`}>{campaign.status}</span>
                </div>
                <div>
                  {!hasEnded ? (
                    <span className="font-semibold text-flare-400">{daysLeft} days left</span>
                  ) : (
                    <span className="text-mist">Ended</span>
                  )}
                </div>
              </div>
            </div>

            {/* Transaction Feedback */}
            {txResult && (
              <div className="w-full">
                <TxResult result={txResult} />
              </div>
            )}

            {/* Actions Panel */}
            <div className="rounded-xl border border-space-600 bg-space-900 p-4">
              {campaign.status === 'active' ? (
                publicKey ? (
                  <form onSubmit={handleInvest} className="space-y-3">
                    <label className="block text-xs font-semibold text-mist">Invest in this campaign</label>
                    <div className="flex items-center gap-2">
                      <input
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        placeholder="0.00"
                        inputMode="decimal"
                        disabled={loading}
                        className="w-full rounded-lg border border-space-600 bg-space-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-stellarblue-500/50"
                      />
                      <span className="text-xs font-mono text-mist font-bold">XLM</span>
                    </div>
                    {errorMsg && <p className="text-[10px] text-red-400 font-mono">{errorMsg}</p>}
                    
                    <button
                      type="submit"
                      disabled={loading || !investAmount || parseFloat(investAmount) <= 0}
                      className="w-full rounded-lg bg-flare-500 py-2.5 text-xs font-bold text-space-950 hover:bg-flare-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing…' : 'Invest via Freighter'}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-xs text-mist mb-3">Connect your Stellar wallet to invest in this campaign.</p>
                    <button
                      onClick={onConnect}
                      className="w-full rounded-lg bg-stellarblue-500 py-2 text-xs font-semibold text-space-950 hover:bg-stellarblue-400 transition"
                    >
                      Connect Wallet
                    </button>
                  </div>
                )
              ) : campaign.status === 'successful' ? (
                isCreator ? (
                  campaign.withdrawn ? (
                    <div className="text-center py-2">
                      <span className="inline-block rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-xs text-green-400 font-semibold">
                        ✓ Funds Claimed
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-mist">
                        Your campaign was successful! Withdraw the collected XLM now.
                      </p>
                      <button
                        onClick={handleWithdraw}
                        disabled={loading}
                        className="w-full rounded-lg bg-green-500 py-2.5 text-xs font-bold text-space-950 hover:bg-green-400 transition disabled:opacity-50"
                      >
                        {loading ? 'Processing…' : 'Withdraw Funds'}
                      </button>
                    </div>
                  )
                ) : (
                  <div className="text-center py-2">
                    <span className="inline-block rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-xs text-green-400 font-semibold">
                      ✓ Fully Funded!
                    </span>
                  </div>
                )
              ) : (
                /* FAILED */
                canRefund ? (
                  <div className="space-y-3">
                    <p className="text-xs text-mist">
                      Goal was not met. Claim a full refund of your backed contribution.
                    </p>
                    <button
                      onClick={handleRefund}
                      disabled={loading}
                      className="w-full rounded-lg bg-flare-500 py-2.5 text-xs font-bold text-space-950 hover:bg-flare-400 transition disabled:opacity-50"
                    >
                      {loading ? 'Claiming…' : 'Claim Refund'}
                    </button>
                  </div>
                ) : isRefunded ? (
                  <div className="text-center py-2">
                    <span className="inline-block rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400 font-semibold">
                      ✓ Refund Claimed
                    </span>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <span className="inline-block rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400 font-semibold">
                      ✕ Campaign Ended
                    </span>
                  </div>
                )
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
