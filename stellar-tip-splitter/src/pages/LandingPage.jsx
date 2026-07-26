// src/pages/LandingPage.jsx
import React, { useMemo } from 'react'
import CampaignCard from '../components/CampaignCard'

export default function LandingPage({
  campaigns,
  publicKey,
  onConnect,
  onCreateTrigger,
  onSelectCampaign,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy
}) {
  
  // Dynamic Platform Stats
  const platformStats = useMemo(() => {
    let totalRaised = 0
    let activeCount = 0
    const backers = new Set()

    campaigns.forEach((camp) => {
      totalRaised += camp.raisedAmount
      if (camp.status === 'active') activeCount++
      camp.investors.forEach((inv) => backers.add(inv.address))
    })

    return {
      totalRaised: Number(totalRaised.toFixed(2)),
      activeCount,
      backersCount: backers.size
    }
  }, [campaigns])

  // Filtered & Sorted campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter((camp) => {
        const matchesSearch =
          camp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          camp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          camp.creator.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCategory =
          selectedCategory === 'All' || camp.category === selectedCategory

        const matchesStatus =
          statusFilter === 'all' || camp.status === statusFilter

        return matchesSearch && matchesCategory && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.deadline) - new Date(a.deadline)
        }
        if (sortBy === 'endingSoon') {
          const aDiff = new Date(a.deadline) - new Date()
          const bDiff = new Date(b.deadline) - new Date()
          if (aDiff < 0) return 1
          if (bDiff < 0) return -1
          return aDiff - bDiff
        }
        if (sortBy === 'highestFunded') {
          return b.raisedAmount - a.raisedAmount
        }
        return 0
      })
  }, [campaigns, searchQuery, selectedCategory, statusFilter, sortBy])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 space-y-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-space-600 bg-space-800 p-6 sm:p-10 shadow-glow">
        <div className="absolute inset-0 bg-gradient-to-r from-stellarblue-600/10 to-transparent" />
        <div className="relative z-10 max-w-xl">
          <span className="font-mono text-xs uppercase tracking-widest text-stellarblue-400 font-bold">
            Stellar Horizon Network
          </span>
          <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl leading-tight">
            Empower Innovation on Stellar.
          </h2>
          <p className="mt-3 text-sm text-mist leading-relaxed">
            Deploy and support decentralized fundraising campaigns on the Stellar Testnet. Fund projects securely with on-chain signatures, automated escrow rules, and programmatic refunds.
          </p>
          
          <button
            onClick={publicKey ? onCreateTrigger : onConnect}
            className="mt-6 rounded-lg bg-flare-500 px-5 py-3 text-xs font-bold text-space-950 shadow-flareglow hover:bg-flare-400 transition"
          >
            {publicKey ? 'Launch New Campaign' : 'Connect Wallet to Start'}
          </button>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-space-600 bg-space-850 p-5 text-center">
          <p className="text-xs uppercase tracking-wider text-mist font-semibold">Total Funds Raised</p>
          <p className="mt-2 text-3xl font-black text-green-400 font-mono">
            {platformStats.totalRaised.toLocaleString()} <span className="text-sm font-sans font-normal text-mist">XLM</span>
          </p>
        </div>
        <div className="rounded-xl border border-space-600 bg-space-850 p-5 text-center">
          <p className="text-xs uppercase tracking-wider text-mist font-semibold">Active Campaigns</p>
          <p className="mt-2 text-3xl font-black text-white">
            {platformStats.activeCount}
          </p>
        </div>
        <div className="rounded-xl border border-space-600 bg-space-850 p-5 text-center">
          <p className="text-xs uppercase tracking-wider text-mist font-semibold">Total Platform Backers</p>
          <p className="mt-2 text-3xl font-black text-stellarblue-400">
            {platformStats.backersCount}
          </p>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="rounded-2xl border border-space-600 bg-space-800 p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-md mx-auto">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">How CrowdFundX Works</h3>
          <p className="mt-1 text-xs text-mist leading-relaxed">Secure decentralized crowdfunding settled directly on the Stellar testnet ledger.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 text-center">
          <div className="space-y-2 p-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-stellarblue-500/10 border border-stellarblue-500/20 text-stellarblue-400 font-black">
              1
            </div>
            <h4 className="text-xs font-bold text-white uppercase">Connect Freighter</h4>
            <p className="text-[11px] text-mist leading-normal">
              Link your Freighter browser wallet set to the Stellar Testnet. Fund with Friendbot to start.
            </p>
          </div>
          
          <div className="space-y-2 p-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-flare-500/10 border border-flare-500/20 text-flare-400 font-black">
              2
            </div>
            <h4 className="text-xs font-bold text-white uppercase">Deploy or Back</h4>
            <p className="text-[11px] text-mist leading-normal">
              Launch fundraising goals with custom dates or back active ideas on the network with immediate signature.
            </p>
          </div>

          <div className="space-y-2 p-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-black">
              3
            </div>
            <h4 className="text-xs font-bold text-white uppercase">On-chain Escrow</h4>
            <p className="text-[11px] text-mist leading-normal">
              If target is reached, creators claim XLM. If campaign fails, backer refunds are unlocked on-ledger.
            </p>
          </div>
        </div>
      </section>

      {/* Explorer Search & Filters */}
      <section className="flex flex-col gap-4 rounded-xl border border-space-600 bg-space-800 p-4 sm:flex-row sm:items-center sm:justify-between">
        
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search bar */}
          <div className="relative min-w-[180px] flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, creator, key..."
              className="w-full rounded-lg border border-space-600 bg-space-900 px-3 py-2 pl-9 text-xs text-white focus:outline-none focus:ring-1 focus:ring-stellarblue-500"
            />
            <span className="absolute left-3 top-2.5 text-mist text-xs">🔍</span>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Technology', 'Environment', 'Art', 'Community'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
                  selectedCategory === cat
                    ? 'bg-stellarblue-500 border-stellarblue-500 text-space-950 font-bold'
                    : 'border-space-600 text-mist hover:border-stellarblue-500 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sorting and Filters dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-space-600 bg-space-900 px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="all">All States</option>
            <option value="active">Active</option>
            <option value="successful">Successful</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-space-600 bg-space-900 px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="endingSoon">Ending Soon</option>
            <option value="highestFunded">Highest Funded</option>
          </select>
        </div>

      </section>

      {/* Campaigns Listing */}
      <section>
        {filteredCampaigns.length === 0 ? (
          <div className="rounded-xl border border-space-600/40 bg-space-800/40 py-16 text-center">
            <span className="text-3xl">🏜️</span>
            <h3 className="mt-4 text-base font-bold text-white">No campaigns found</h3>
            <p className="mt-1 text-xs text-mist">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((camp) => (
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
