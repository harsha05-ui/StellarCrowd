// src/pages/BackerDashboard.jsx
import React, { useMemo, useState } from 'react'
import CampaignCard from '../components/CampaignCard'

export default function BackerDashboard({
  campaigns,
  publicKey,
  onConnect,
  onSelectCampaign
}) {
  const [subTab, setSubTab] = useState('backed')

  // Filter campaigns user invested in
  const backedCampaigns = useMemo(() => {
    if (!publicKey) return []
    return campaigns.filter((c) => c.investors.some((inv) => inv.address === publicKey))
  }, [campaigns, publicKey])

  // Filter campaigns user favorited
  const favoriteCampaigns = useMemo(() => {
    if (!publicKey) return []
    return campaigns.filter((c) => c.favorites && c.favorites.includes(publicKey))
  }, [campaigns, publicKey])

  // Investor analytics
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
      totalBacked: Number(totalBacked.toFixed(2))
    }
  }, [backedCampaigns, publicKey])

  // Flat log of backing events
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
    return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }, [campaigns, publicKey])

  // Campaigns eligible for refund (failed and connect address backed)
  const refundCampaigns = useMemo(() => {
    if (!publicKey) return []
    return campaigns.filter((c) => {
      if (c.status !== 'failed') return false
      return c.investors.some((inv) => inv.address === publicKey)
    })
  }, [campaigns, publicKey])

  if (!publicKey) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center animate-fade-in">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-space-850 text-mist text-2xl border border-space-600 shadow-md">
          🔑
        </div>
        <h2 className="mt-4 text-lg font-bold text-white uppercase tracking-wider">Connect Your Wallet</h2>
        <p className="mt-2 text-xs text-mist max-w-xs mx-auto leading-relaxed">
          Please connect your Freighter browser wallet extension set to Stellar Testnet to access your investor dashboards.
        </p>
        <button
          onClick={onConnect}
          className="mt-6 rounded-xl bg-stellarblue-500 px-5 py-3 text-xs font-bold text-space-950 hover:bg-stellarblue-400 transition shadow-glow"
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-10 animate-fade-in">
      
      {/* Title */}
      <div className="border-b border-space-600/30 pb-5">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Investor Hub Console</h2>
        <p className="text-xs text-mist font-mono mt-1 break-all select-all">Backer: {publicKey}</p>
      </div>

      {/* Analytics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="glass-card rounded-2xl p-5 border border-space-600/30">
          <p className="text-[9px] uppercase tracking-widest text-mist font-bold">Campaigns Backed</p>
          <p className="mt-2 text-2xl font-black text-white">{backedCampaigns.length}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-space-600/30">
          <p className="text-[9px] uppercase tracking-widest text-mist font-bold">Total XLM Backed</p>
          <p className="mt-2 text-2xl font-black text-flare-400 font-mono">
            {analytics.totalBacked.toLocaleString()} <span className="text-sm font-sans font-normal text-mist">XLM</span>
          </p>
        </div>
      </section>

      {/* Navigation Subtabs */}
      <section className="space-y-6">
        <div className="flex flex-wrap gap-1 border-b border-space-600/20 pb-3 text-xs font-bold uppercase">
          {[
            { id: 'backed', label: 'Backed Campaigns', count: backedCampaigns.length },
            { id: 'favorites', label: 'Favorites', count: favoriteCampaigns.length },
            { id: 'history', label: 'Backing Logs', count: investmentHistory.length },
            { id: 'refunds', label: 'Refund Console', count: refundCampaigns.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`rounded-lg px-4 py-2 transition ${
                subTab === tab.id
                  ? 'bg-space-800 text-white font-bold'
                  : 'text-mist hover:text-white'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Tab contents */}
        <div className="animate-fade-in">
          {/* BACKED CAMPAIGNS TAB */}
          {subTab === 'backed' && (
            backedCampaigns.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-space-600 bg-space-850/40 py-16 text-center space-y-3">
                <p className="text-2xl">🏜️</p>
                <h4 className="text-xs font-bold text-white uppercase">No Campaigns Backed</h4>
                <p className="text-xs text-mist max-w-xs mx-auto leading-normal">
                  Explore active campaigns on the launchpad and back your first project.
                </p>
              </div>
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
              <div className="rounded-2xl border border-dashed border-space-600 bg-space-850/40 py-16 text-center space-y-3">
                <p className="text-2xl">🤍</p>
                <h4 className="text-xs font-bold text-white uppercase">No Favorites Stored</h4>
                <p className="text-xs text-mist max-w-xs mx-auto leading-normal">
                  Click the heart icon on any campaign details overlay to favorite them.
                </p>
              </div>
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

          {/* BACKING LOGS HISTORY TAB */}
          {subTab === 'history' && (
            investmentHistory.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-space-600 bg-space-850/40 py-16 text-center space-y-3">
                <p className="text-2xl">📊</p>
                <h4 className="text-xs font-bold text-white uppercase">No Transaction Logs</h4>
                <p className="text-xs text-mist">No contributions have been signed yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-space-600/50 bg-space-850 shadow-sm">
                <table className="min-w-full text-left text-xs text-mist">
                  <thead className="bg-space-800 text-[10px] uppercase font-bold text-white border-b border-space-600/30">
                    <tr>
                      <th className="px-4 py-3">Campaign</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3">Stellar Ledger TX</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-space-600/20">
                    {investmentHistory.map((log, idx) => (
                      <tr key={idx} className="hover:bg-space-800/40 transition">
                        <td className="px-4 py-3 font-semibold text-white max-w-[200px] truncate">{log.campaignTitle}</td>
                        <td className="px-4 py-3">{new Date(log.timestamp).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-flare-400">
                          {log.amount} XLM
                        </td>
                        <td className="px-4 py-3 font-mono text-[10px]">
                          {log.refunded ? (
                            <span className="text-red-400 font-sans font-bold uppercase text-[9px] border border-red-500/10 bg-red-500/5 rounded px-1.5 py-0.5">Refunded</span>
                          ) : (
                            <a
                              href={`https://stellar.expert/explorer/testnet/tx/${log.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-stellarblue-400 hover:text-stellarblue-300 font-semibold"
                            >
                              {log.txHash.slice(0, 12)}… ↗
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
              <div className="rounded-2xl border border-dashed border-space-600 bg-space-850/40 py-16 text-center space-y-3">
                <p className="text-2xl">💸</p>
                <h4 className="text-xs font-bold text-white uppercase">No Refunds Available</h4>
                <p className="text-xs text-mist max-w-xs mx-auto leading-normal">
                  If a campaign you backed fails its goal before deadline, it will list here for refund claims.
                </p>
              </div>
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
