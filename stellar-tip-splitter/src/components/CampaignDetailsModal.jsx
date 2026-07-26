// src/components/CampaignDetailsModal.jsx
import React, { useState, useMemo } from 'react'
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
  campaigns = [],
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

  // Backer properties
  const userInvestments = publicKey
    ? campaign.investors.filter(inv => inv.address === publicKey)
    : []
  const hasInvested = userInvestments.length > 0
  const isRefunded = hasInvested && userInvestments.every(inv => inv.refunded)
  const canRefund = hasEnded && campaign.status === 'failed' && hasInvested && !isRefunded
  const isFavorited = publicKey && campaign.favorites && campaign.favorites.includes(publicKey)

  // Filter Related Campaigns (other active campaigns in the same or other categories)
  const relatedCampaigns = useMemo(() => {
    return campaigns
      .filter((c) => c.id !== campaign.id && c.status === 'active')
      .slice(0, 2)
  }, [campaigns, campaign.id])

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
      if (addToast) addToast(`Successfully backed campaign with ${amount} XLM!`, 'success')
    } catch (err) {
      console.error(err)
      const errMsg = err.message || 'Transaction rejected or failed.'
      setTxResult({
        status: 'error',
        message: errMsg,
      })
      if (addToast) addToast(`Investment failed: ${errMsg}`, 'error')
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
      if (addToast) addToast('Campaign funds successfully withdrawn!', 'success')
    } catch (err) {
      console.error(err)
      const errMsg = err.message || 'Withdrawal failed.'
      setTxResult({
        status: 'error',
        message: errMsg,
      })
      if (addToast) addToast(`Withdrawal failed: ${errMsg}`, 'error')
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
      if (addToast) addToast('Refund successfully claimed!', 'success')
    } catch (err) {
      console.error(err)
      const errMsg = err.message || 'Refund transaction failed.'
      setTxResult({
        status: 'error',
        message: errMsg,
      })
      if (addToast) addToast(`Refund failed: ${errMsg}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    const mockUrl = `${window.location.origin}/?campaign=${campaign.id}`
    navigator.clipboard.writeText(mockUrl)
    if (addToast) {
      addToast('Share link copied to clipboard!', 'success')
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

  const creatorInitial = campaign.creatorName ? campaign.creatorName.charAt(0).toUpperCase() : 'A'
  const categoryStyles = getCategoryStyles(campaign.category)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-space-600 bg-space-800 shadow-2xl overflow-hidden my-8 animate-slide-up">
        
        {/* Parallax Header cover */}
        <div className="relative h-64 w-full bg-space-950 sm:h-80">
          <img
            src={campaign.coverImage}
            alt={campaign.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-space-800 via-space-800/40 to-transparent" />
          
          {/* Action Row */}
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Copy link"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-space-950/60 text-white hover:bg-space-950 hover:text-stellarblue-400 transition"
            >
              🔗
            </button>
            <button
              onClick={handleFavoriteToggle}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-space-950/60 text-white hover:bg-space-950 transition"
            >
              {isFavorited ? <span className="text-red-500 text-sm">❤️</span> : <span className="text-mist text-sm">🤍</span>}
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-space-950/60 text-white hover:bg-space-950 hover:text-flare-400 transition"
              aria-label="Close"
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
              Campaign ID: {campaign.id}
            </p>
          </div>
        </div>

        {/* Modal body */}
        <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 md:grid-cols-5 md:gap-8 max-h-[calc(80vh-220px)] overflow-y-auto">
          
          {/* Left Main Content */}
          <div className="md:col-span-3 space-y-6">
            
            {/* Short & Long Description */}
            <div className="space-y-2">
              <h3 className="text-[10px] uppercase tracking-widest text-stellarblue-400 font-bold">About Project</h3>
              {campaign.shortDescription && (
                <p className="text-sm font-semibold text-white leading-relaxed italic border-l-2 border-stellarblue-500 pl-3">
                  "{campaign.shortDescription}"
                </p>
              )}
              <p className="text-xs text-mist leading-relaxed whitespace-pre-line pt-2">
                {campaign.description}
              </p>
            </div>

            {/* Creator Profile Card */}
            <div className="rounded-xl border border-space-600 bg-space-900/60 p-4 space-y-3">
              <h4 className="text-[10px] uppercase tracking-widest text-mist font-bold">Project Creator</h4>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stellarblue-500/20 border border-stellarblue-500/30 text-base font-bold text-stellarblue-400">
                  {creatorInitial}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{campaign.creatorName || 'Anonymous Creator'}</p>
                  <p className="text-[10px] text-mist font-mono truncate break-all">{campaign.creator}</p>
                </div>
              </div>
              <p className="text-[10px] text-mist/70 leading-normal">
                This project leader has connected their Freighter wallet address to manage funds.
              </p>
            </div>

            {/* Funding Progress Timeline */}
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-widest text-stellarblue-400 font-bold">Funding Timeline</h3>
              <div className="relative border-l border-space-600 pl-4 ml-2.5 space-y-4 text-xs">
                
                {/* Deployed */}
                <div className="relative">
                  <span className="absolute -left-[21px] top-0.5 h-3.5 w-3.5 rounded-full bg-stellarblue-500 border-2 border-space-800" />
                  <p className="font-bold text-white uppercase text-[10px] tracking-wider">Escrow Initialized</p>
                  <p className="text-mist/70 text-[10px]">Campaign deployed on the local state rules.</p>
                </div>

                {/* Backers */}
                <div className="relative">
                  <span className={`absolute -left-[21px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-space-800 ${campaign.investors.length > 0 ? 'bg-stellarblue-400' : 'bg-space-600'}`} />
                  <p className="font-bold text-white uppercase text-[10px] tracking-wider">Backers Backing</p>
                  <p className="text-mist/70 text-[10px]">
                    {campaign.investors.length === 0 ? 'No contributions logged yet.' : `${campaign.investors.length} contributions received.`}
                  </p>
                </div>

                {/* Completed */}
                <div className="relative">
                  <span className={`absolute -left-[21px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-space-800 ${hasEnded ? 'bg-flare-400' : 'bg-space-600'}`} />
                  <p className="font-bold text-white uppercase text-[10px] tracking-wider">Campaign Settlement</p>
                  <p className="text-mist/70 text-[10px]">
                    {hasEnded 
                      ? `Ended on ${new Date(campaign.deadline).toLocaleDateString()}. Status: ${campaign.status.toUpperCase()}` 
                      : `Expires on ${new Date(campaign.deadline).toLocaleDateString()}.`}
                  </p>
                </div>

              </div>
            </div>

            {/* Comments Feed */}
            <div className="space-y-4 border-t border-space-600/30 pt-4">
              <h3 className="text-[10px] uppercase tracking-widest text-stellarblue-400 font-bold">Comments ({campaign.comments?.length || 0})</h3>
              
              {/* Form */}
              {publicKey ? (
                <form onSubmit={handlePostComment} className="space-y-2">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={commenterName}
                      onChange={(e) => setCommenterName(e.target.value)}
                      className="rounded-lg border border-space-600 bg-space-900 px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <div className="sm:col-span-2 flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Write a comment..."
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
                <p className="text-[10px] text-mist/60">Connect wallet to add reviews.</p>
              )}

              {/* List */}
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {!campaign.comments || campaign.comments.length === 0 ? (
                  <p className="text-xs text-mist/60 italic">No comments yet.</p>
                ) : (
                  campaign.comments.map((comm, idx) => (
                    <div key={idx} className="rounded-lg bg-space-900/40 border border-space-700/20 p-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between text-mist text-[9px] font-bold">
                        <span className="text-stellarblue-400">{comm.author}</span>
                        <span>{new Date(comm.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-white text-xs leading-normal">{comm.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Related Campaigns recommendation */}
            {relatedCampaigns.length > 0 && (
              <div className="border-t border-space-600/30 pt-4 space-y-3">
                <h3 className="text-[10px] uppercase tracking-widest text-stellarblue-400 font-bold">Back Other Projects</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {relatedCampaigns.map((rc) => (
                    <div 
                      key={rc.id}
                      onClick={() => onRefresh(rc)}
                      className="rounded-xl border border-space-600/40 bg-space-900/40 p-3 flex gap-3 cursor-pointer hover:border-stellarblue-500/50 transition duration-300"
                    >
                      <img src={rc.coverImage} alt={rc.title} className="h-12 w-12 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate">{rc.title}</h4>
                        <p className="text-[9px] text-flare-400 mt-0.5 font-bold font-mono">{rc.raisedAmount} / {rc.targetAmount} XLM</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Action Sidebar */}
          <div className="md:col-span-2 space-y-4">
            
            {/* Progress Card */}
            <div className="rounded-xl border border-space-600 bg-space-900 p-4 space-y-3">
              <h3 className="text-[10px] uppercase tracking-widest text-mist font-bold">Target Progress</h3>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xl font-bold text-white">{campaign.raisedAmount.toLocaleString()} XLM</span>
                <span className="text-xs text-mist">of {campaign.targetAmount.toLocaleString()} XLM</span>
              </div>
              <div className="h-2 w-full rounded-full bg-space-700 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    campaign.status === 'successful' ? 'bg-green-500' : campaign.status === 'failed' ? 'bg-red-500' : 'bg-stellarblue-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-mist">
                <span>{percent}% funded</span>
                <span>{campaign.investors.length} backers</span>
              </div>

              <div className="border-t border-space-600/30 pt-3 flex justify-between text-xs font-semibold">
                <div>
                  <span className="text-mist">Escrow:</span>
                  <span className={`ml-1.5 uppercase ${
                    campaign.status === 'successful' ? 'text-green-400' : campaign.status === 'failed' ? 'text-red-400' : 'text-stellarblue-400'
                  }`}>{campaign.status}</span>
                </div>
                <div>
                  {!hasEnded ? (
                    <span className="text-flare-400">{daysLeft} Days Left</span>
                  ) : (
                    <span className="text-mist">Completed</span>
                  )}
                </div>
              </div>
            </div>

            {/* Transaction Alert Box */}
            {txResult && (
              <div className="w-full">
                <TxResult result={txResult} />
              </div>
            )}

            {/* Action Interactions */}
            <div className="rounded-xl border border-space-600 bg-space-900 p-4">
              {campaign.status === 'active' ? (
                publicKey ? (
                  <form onSubmit={handleInvest} className="space-y-3">
                    <label className="block text-[10px] font-bold text-mist uppercase tracking-widest">Back Project</label>
                    <div className="flex items-center gap-2">
                      <input
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        placeholder="0.00"
                        inputMode="decimal"
                        disabled={loading}
                        className="w-full rounded-lg border border-space-600 bg-space-950 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-stellarblue-500 font-mono"
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
                  <div className="text-center py-2 space-y-3">
                    <p className="text-xs text-mist">Connect wallet to invest in this campaign.</p>
                    <button
                      onClick={onConnect}
                      className="w-full rounded-lg bg-stellarblue-500 py-2 text-xs font-bold text-space-950 hover:bg-stellarblue-400 transition"
                    >
                      Connect Wallet
                    </button>
                  </div>
                )
              ) : campaign.status === 'successful' ? (
                isCreator ? (
                  campaign.withdrawn ? (
                    <div className="text-center py-2 space-y-2">
                      <span className="inline-block rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-xs text-green-400 font-semibold">
                        ✓ Funds Claimed Successfully
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-mist">
                        Your campaign was successful! Claim the collected XLM now.
                      </p>
                      <button
                        onClick={handleWithdraw}
                        disabled={loading}
                        className="w-full rounded-lg bg-green-500 py-2.5 text-xs font-bold text-space-950 hover:bg-green-400 transition disabled:opacity-50"
                      >
                        {loading ? 'Processing…' : 'Claim Campaign Funds'}
                      </button>
                    </div>
                  )
                ) : (
                  <div className="text-center py-2">
                    <span className="inline-block rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-xs text-green-400 font-semibold">
                      ✓ Campaign Fully Funded!
                    </span>
                  </div>
                )
              ) : (
                /* FAILED */
                canRefund ? (
                  <div className="space-y-3">
                    <p className="text-xs text-mist">
                      This campaign ended without meeting its target. Claim your refund now.
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
