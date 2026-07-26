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
      return { totalRaised: 0, totalBackers: 0, successfulCount: 0 }
    }

    let totalRaised = 0
    let successfulCount = 0
    const backerAddresses = new Set()

    myCampaigns.forEach((camp) => {
      totalRaised += camp.raisedAmount
      if (camp.status === 'successful') {
        successfulCount++
      }
      camp.investors.forEach((inv) => backerAddresses.add(inv.address))
    })

    return {
      totalRaised: Number(totalRaised.toFixed(7)),
      totalBackers: backerAddresses.size,
      successfulCount
    }
  }, [myCampaigns])

  if (!publicKey) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-space-800 text-mist text-2xl border border-space-600">
          🔑
        </div>
        <h2 className="mt-4 text-lg font-bold text-white">Connect Your Wallet</h2>
        <p className="mt-2 text-xs text-mist max-w-xs mx-auto">
          Please connect your Freighter browser wallet extension set to Stellar Testnet to access your creator console.
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
      
      {/* Dashboard Title & Trigger */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-space-600/30 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Creator Dashboard</h2>
          <p className="text-xs text-mist font-mono mt-1 break-all">Wallet: {publicKey}</p>
        </div>
        <button
          onClick={onCreateTrigger}
          className="rounded-lg bg-stellarblue-500 px-4 py-2.5 text-xs font-bold text-space-950 hover:bg-stellarblue-400 transition sm:self-start"
        >
          + Create Campaign
        </button>
      </div>

      {/* Analytics Grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-space-600 bg-space-800 p-5">
          <p className="text-[10px] uppercase tracking-wider text-mist font-semibold">Campaigns Launched</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{myCampaigns.length}</span>
            <span className="text-xs text-mist">{analytics.successfulCount} Successful</span>
          </div>
        </div>
        
        <div className="rounded-xl border border-space-600 bg-space-800 p-5">
          <p className="text-[10px] uppercase tracking-wider text-mist font-semibold">Total Funds Raised</p>
          <p className="mt-2 text-2xl font-black text-green-400 font-mono">
            {analytics.totalRaised.toLocaleString()} <span className="text-xs">XLM</span>
          </p>
        </div>

        <div className="rounded-xl border border-space-600 bg-space-800 p-5">
          <p className="text-[10px] uppercase tracking-wider text-mist font-semibold">Total Backers</p>
          <p className="mt-2 text-2xl font-black text-stellarblue-400">
            {analytics.totalBackers}
          </p>
        </div>
      </section>

      {/* Creator Campaigns List */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-mist">My Campaigns</h3>

        {myCampaigns.length === 0 ? (
          <div className="rounded-xl border border-space-600 bg-space-800/40 py-16 text-center">
            <span className="text-3xl">🚀</span>
            <h4 className="mt-4 text-sm font-bold text-white">No campaigns launched yet</h4>
            <p className="mt-1 text-xs text-mist mb-5">Launch your first crowdfunding campaign on Stellar to raise XLM.</p>
            <button
              onClick={onCreateTrigger}
              className="rounded-lg bg-flare-500 px-4 py-2 text-xs font-bold text-space-950 hover:bg-flare-400 transition"
            >
              Start A Campaign
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
