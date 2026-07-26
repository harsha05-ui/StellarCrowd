// src/pages/BackerDashboard.jsx
import React, { useMemo, useState } from 'react'
import CampaignCard from '../components/CampaignCard'

export default function BackerDashboard({
  campaigns,
  publicKey,
  onConnect,
  onSelectCampaign
}) {
  const [subTab, setSubTab] = useState('backed') // 'backed' | 'favorites' | 'history' | 'refunds'

  // Filter campaigns user has invested in
  const backedCampaigns = useMemo(() => {
    if (!publicKey) return []
    return campaigns.filter((c) => c.investors.some((inv) => inv.address === publicKey))
  }, [campaigns, publicKey])

  // Filter campaigns user has favorited
  const favoriteCampaigns = useMemo(() => {
    if (!publicKey) return []
    return campaigns.filter((c) => c.favorites && c.favorites.includes(publicKey))
  }, [campaigns, publicKey])

  // Investor Analytics
  const analytics = useMemo(() => {
    if (backedCampaigns.length === 0) return { totalBacked: 0 }

    let totalBacked = 0
    backedCampaigns.forEach((camp) => {
      camp.investors.forEach((inv) => {
        if (inv.address === publicKey) {
          totalBacked += inv.amount
        }
      })
    })

    return {
      totalBacked: Number(totalBacked.toFixed(7))
    }
  }, [backedCampaigns, publicKey])

  // Flatten investments history list
  const investmentHistory = useMemo(() => {
    if (!publicKey) return []
    const history = []
    campaigns.forEach((camp) => {
      camp.investors.forEach((inv) => {
        if (inv.address === publicKey) {
          history.push({
            campaignId: camp.id,
            campaignTitle: camp.title,
            amount: inv.amount,
            txHash: inv.txHash,
            timestamp: inv.timestamp,
            refunded: inv.refunded
          })
        }
      })
    })
    // Sort newest first
    return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }, [campaigns, publicKey])

  // Failed campaigns eligible for refund
  const refundCampaigns = useMemo(() => {
    if (!publicKey) return []
    return campaigns.filter((c) => {
      if (c.status !== 'failed') return false
      return c.investors.some((inv) => inv.address === publicKey)
    })
  }, [campaigns, publicKey])

  if (!publicKey) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-space-800 text-mist text-2xl border border-space-600">
          🔑
        </div>
        <h2 className="mt-4 text-lg font-bold text-white">Connect Your Wallet</h2>
        <p className="mt-2 text-xs text-mist max-w-xs mx-auto">
          Please connect your Freighter browser wallet extension set to Stellar Testnet to access your backer console.
        </p>
        <button
          onClick={onConnect}
          className="mt-5 rounded-lg bg-stellarblue-500 px-4 py-2.5 text-xs font-bold text-space-950 hover:bg-stellarblue-400 transition"
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 space-y-8">
      
      {/* Title */}
      <div className="border-b border-space-600/30 pb-4">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Investor Console</h2>
        <p className="text-xs text-mist font-mono mt-1 break-all">Backer: {publicKey}</p>
      </div>

      {/* Analytics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-space-600 bg-space-800 p-5">
          <p className="text-[10px] uppercase tracking-wider text-mist font-semibold">Campaigns Backed</p>
          <p className="mt-2 text-2xl font-black text-white">{backedCampaigns.length}</p>
        </div>
        <div className="rounded-xl border border-space-600 bg-space-800 p-5">
          <p className="text-[10px] uppercase tracking-wider text-mist font-semibold">Total XLM Invested</p>
          <p className="mt-2 text-2xl font-black text-flare-400 font-mono">
            {analytics.totalBacked.toLocaleString()} <span className="text-sm font-sans font-normal text-mist">XLM</span>
          </p>
        </div>
      </section>

      {/* Sub Tabs */}
      <section className="space-y-6">
        <div className="flex flex-wrap gap-2 border-b border-space-600/20 pb-3 text-xs font-bold uppercase">
          <button
            onClick={() => setSubTab('backed')}
            className={`rounded-lg px-3 py-1.5 transition ${
              subTab === 'backed'
                ? 'bg-space-700 text-white'
                : 'text-mist hover:text-white'
            }`}
          >
            Backed Campaigns ({backedCampaigns.length})
          </button>
          <button
            onClick={() => setSubTab('favorites')}
            className={`rounded-lg px-3 py-1.5 transition ${
              subTab === 'favorites'
                ? 'bg-space-700 text-white'
                : 'text-mist hover:text-white'
            }`}
          >
            Favorites ({favoriteCampaigns.length})
          </button>
          <button
            onClick={() => setSubTab('history')}
            className={`rounded-lg px-3 py-1.5 transition ${
              subTab === 'history'
                ? 'bg-space-700 text-white'
                : 'text-mist hover:text-white'
            }`}
          >
            Investment History ({investmentHistory.length})
          </button>
          <button
            onClick={() => setSubTab('refunds')}
            className={`rounded-lg px-3 py-1.5 transition ${
              subTab === 'refunds'
                ? 'bg-space-700 text-white'
                : 'text-mist hover:text-white'
            }`}
          >
            Refund Console ({refundCampaigns.length})
          </button>
        </div>

        {/* Tab content */}
        <div>
          {/* BACKED CAMPAIGNS TAB */}
          {subTab === 'backed' && (
            backedCampaigns.length === 0 ? (
              <p className="text-xs text-mist/60 italic py-6">You have not backed any campaigns yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {backedCampaigns.map((camp) => (
                  <CampaignCard
                    key={camp.id}
                    campaign={camp}
                    onClick={onSelectCampaign}
                  />
                ))}
              </div>
            )
          )}

          {/* FAVORITE CAMPAIGNS TAB */}
          {subTab === 'favorites' && (
            favoriteCampaigns.length === 0 ? (
              <p className="text-xs text-mist/60 italic py-6">You have not favorited any campaigns yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favoriteCampaigns.map((camp) => (
                  <CampaignCard
                    key={camp.id}
                    campaign={camp}
                    onClick={onSelectCampaign}
                  />
                ))}
              </div>
            )
          )}

          {/* INVESTMENT HISTORY TAB */}
          {subTab === 'history' && (
            investmentHistory.length === 0 ? (
              <p className="text-xs text-mist/60 italic py-6">No contributions logged.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-space-600 bg-space-850">
                <table className="min-w-full text-left text-xs text-mist">
                  <thead className="bg-space-800 text-[10px] uppercase font-bold text-white border-b border-space-600/30">
                    <tr>
                      <th className="px-4 py-3">Campaign</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3">Explorer Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-space-600/30">
                    {investmentHistory.map((log, idx) => (
                      <tr key={idx} className="hover:bg-space-800/40">
                        <td className="px-4 py-3 font-semibold text-white max-w-[200px] truncate">{log.campaignTitle}</td>
                        <td className="px-4 py-3">{new Date(log.timestamp).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-flare-400">
                          {log.amount} XLM
                        </td>
                        <td className="px-4 py-3 font-mono text-[10px]">
                          {log.refunded ? (
                            <span className="text-red-400 font-sans font-bold uppercase">Refunded</span>
                          ) : (
                            <a
                              href={`https://stellar.expert/explorer/testnet/tx/${log.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-stellarblue-400 hover:text-stellarblue-300 font-semibold"
                            >
                              {log.txHash.slice(0, 10)}… ↗
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* REFUNDS TAB */}
          {subTab === 'refunds' && (
            refundCampaigns.length === 0 ? (
              <p className="text-xs text-mist/60 italic py-6">You have no active or completed refunds.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {refundCampaigns.map((camp) => (
                  <CampaignCard
                    key={camp.id}
                    campaign={camp}
                    onClick={onSelectCampaign}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </section>

    </div>
  )
}
