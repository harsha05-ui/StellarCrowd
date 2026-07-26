// src/pages/CreatorDashboard.jsx
import React, { useMemo } from 'react'
import CampaignCard from '../components/CampaignCard'

export default function CreatorDashboard({
  campaigns,
  publicKey,
  onConnect,
  onCreateTrigger,
  onSelectCampaign
}) {

  // Filter campaigns created by connected address
  const myCampaigns = useMemo(() => {
    if (!publicKey) return []
    return campaigns.filter((c) => c.creator === publicKey)
  }, [campaigns, publicKey])

  // Creator Analytics
  const analytics = useMemo(() => {
    if (myCampaigns.length === 0) {
      return { totalRaised: 0, totalBackers: 0, successfulCount: 0, activeCount: 0 }
    }

    let totalRaised = 0
    let successfulCount = 0
    let activeCount = 0
    const backerAddresses = new Set()

    myCampaigns.forEach((camp) => {
      totalRaised += camp.raisedAmount
      if (camp.status === 'successful') {
        successfulCount++
      } else if (camp.status === 'active') {
        activeCount++
      }
      camp.investors.forEach((inv) => backerAddresses.add(inv.address))
    })

    return {
      totalRaised: Number(totalRaised.toFixed(2)),
      totalBackers: backerAddresses.size,
      successfulCount,
      activeCount
    }
  }, [myCampaigns])

  // Extract recent contributions log from creator's campaigns
  const recentActivities = useMemo(() => {
    if (myCampaigns.length === 0) return []
    const logs = []
    myCampaigns.forEach((camp) => {
      camp.investors.forEach((inv) => {
        logs.push({
          campaignTitle: camp.title,
          investor: inv.address,
          amount: inv.amount,
          timestamp: inv.timestamp,
          txHash: inv.txHash
        })
      })
    })
    // Sort by date (newest first)
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 4)
  }, [myCampaigns])

  if (!publicKey) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center animate-fade-in">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-space-850 text-mist text-2xl border border-space-600 shadow-md">
          🔑
        </div>
        <h2 className="mt-4 text-lg font-bold text-white uppercase tracking-wider">Connect Your Wallet</h2>
        <p className="mt-2 text-xs text-mist max-w-xs mx-auto leading-relaxed">
          Please connect your Freighter browser wallet extension set to Stellar Testnet to access your creator studio dashboard.
        </p>
        <button
          onClick={onConnect}
          className="mt-6 rounded-xl bg-stellarblue-500 px-5 py-3 text-xs font-bold text-space-950 shadow-glow hover:bg-stellarblue-400 transition"
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-10 animate-fade-in">
      
      {/* Title & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-space-600/30 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Creator Studio Dashboard</h2>
          <p className="text-xs text-mist font-mono mt-1 break-all select-all">Keys: {publicKey}</p>
        </div>
        <button
          onClick={onCreateTrigger}
          className="rounded-xl bg-stellarblue-500 px-5 py-3 text-xs font-bold text-space-950 hover:bg-stellarblue-400 transition shadow-glow sm:self-start"
        >
          + Create Campaign
        </button>
      </div>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-card rounded-2xl p-5 shadow-sm border border-space-600/30">
          <p className="text-[9px] uppercase tracking-widest text-mist font-bold">Campaigns Deployed</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{myCampaigns.length}</span>
            <span className="text-[10px] text-mist font-semibold uppercase">{analytics.activeCount} Active · {analytics.successfulCount} Success</span>
          </div>
        </div>
        
        <div className="glass-card rounded-2xl p-5 shadow-sm border border-space-600/30">
          <p className="text-[9px] uppercase tracking-widest text-mist font-bold">Total Funding Secured</p>
          <p className="mt-2 text-2xl font-black text-green-400 font-mono">
            {analytics.totalRaised.toLocaleString()} <span className="text-xs">XLM</span>
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 shadow-sm border border-space-600/30">
          <p className="text-[9px] uppercase tracking-widest text-mist font-bold">Backer Supporters</p>
          <p className="mt-2 text-2xl font-black text-stellarblue-400">
            {analytics.totalBackers}
          </p>
        </div>
      </section>

      {/* Analytics Chart & Activity Feed row */}
      {myCampaigns.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Custom SVG Line Chart */}
          <div className="glass-card rounded-2xl p-5 md:col-span-2 space-y-4 border border-space-600/30">
            <h4 className="text-[10px] uppercase tracking-widest text-mist font-bold">Funding Trends</h4>
            <div className="h-52 w-full flex items-center justify-center relative bg-space-900/50 rounded-xl overflow-hidden p-2 border border-space-600/20">
              <svg viewBox="0 0 500 200" className="w-full h-full text-stellarblue-500 overflow-visible">
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F9DFF" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4F9DFF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Gridlines */}
                <line x1="30" y1="20" x2="480" y2="20" stroke="#2A3650" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="30" y1="70" x2="480" y2="70" stroke="#2A3650" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="30" y1="120" x2="480" y2="120" stroke="#2A3650" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="30" y1="170" x2="480" y2="170" stroke="#2A3650" strokeWidth="0.5" />
                
                {/* Area under line */}
                <path
                  d="M 30 170 C 130 130, 230 110, 330 70 C 430 40, 480 30, 480 30 L 480 170 Z"
                  fill="url(#chartGlow)"
                />
                
                {/* Trend line */}
                <path
                  d="M 30 170 C 130 130, 230 110, 330 70 C 430 40, 480 30, 480 30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="animate-progress"
                />
                {/* Indicators */}
                <circle cx="330" cy="70" r="4" fill="#FFB100" />
                <circle cx="480" cy="30" r="4" fill="#FFB100" />
                
                {/* Labels */}
                <text x="35" y="190" fill="#9CA3AF" fontSize="9" fontFamily="monospace">LAUNCH</text>
                <text x="315" y="190" fill="#9CA3AF" fontSize="9" fontFamily="monospace">MID-WAY</text>
                <text x="445" y="190" fill="#9CA3AF" fontSize="9" fontFamily="monospace">CURRENT</text>
              </svg>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="glass-card rounded-2xl p-5 space-y-4 border border-space-600/30">
            <h4 className="text-[10px] uppercase tracking-widest text-mist font-bold font-sans">Recent Activity Logs</h4>
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {recentActivities.length === 0 ? (
                <p className="text-xs text-mist/60 italic">No backing activities logged yet.</p>
              ) : (
                recentActivities.map((act, idx) => (
                  <div key={idx} className="rounded-lg bg-space-900/50 p-2.5 text-xs space-y-1.5 border border-space-700/20">
                    <div className="flex justify-between text-[9px] font-bold text-mist">
                      <span className="truncate max-w-[120px] text-stellarblue-400">{act.campaignTitle}</span>
                      <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="text-white text-[11px] font-mono leading-none">
                      Backed {act.amount} XLM
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Campaigns list section */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-mist">My Campaigns</h3>

        {myCampaigns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-space-600 bg-space-850/40 py-20 text-center space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-space-800 text-mist text-2xl border border-space-600">
              🛰️
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white uppercase">No Campaigns Created</h4>
              <p className="text-xs text-mist max-w-xs mx-auto leading-relaxed">
                Launch a fundraising campaign on Stellar to collect backing and secure goals in smart contract escrows.
              </p>
            </div>
            <button
              onClick={onCreateTrigger}
              className="rounded-xl bg-flare-500 px-5 py-3 text-xs font-bold text-space-950 hover:bg-flare-400 transition shadow-flareglow"
            >
              Launch First Campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {myCampaigns.map((camp) => (
              <CampaignCard
                key={camp.id}
                campaign={camp}
                onClick={onSelectCampaign}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
