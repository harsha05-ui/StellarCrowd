// src/App.jsx
import { useEffect, useState, useCallback, useMemo } from 'react'
import WalletPanel from './components/WalletPanel'
import TxResult from './components/TxResult'
import CampaignCard from './components/CampaignCard'
import CampaignDetailsModal from './components/CampaignDetailsModal'
import CreateCampaignModal from './components/CreateCampaignModal'
import {
  connectWallet,
  disconnectWallet,
  fetchXlmBalance,
  fundWithFriendbot,
} from './lib/stellar'
import {
  getCampaigns,
  createCampaign,
} from './lib/crowdfunding'

// Sun & Moon Icons for Dark/Light switch
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5M0 8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 0 8m13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5M1.993 1.993a.5.5 0 0 1 .707 0l1.414 1.414a.5.5 0 0 1-.707.707L1.993 2.7a.5.5 0 0 1 0-.707m10.606 10.606a.5.5 0 0 1 .707 0l1.414 1.414a.5.5 0 0 1-.707.707l-1.414-1.414a.5.5 0 0 1 0-.707m-9.193 9.193a.5.5 0 0 1 0-.707l1.414-1.414a.5.5 0 0 1 .707.707l-1.414 1.414a.5.5 0 0 1-.707 0m9.193-9.193a.5.5 0 0 1 0-.707l1.414-1.414a.5.5 0 0 1 .707.707l-1.414 1.414a.5.5 0 0 1-.707 0"/>
  </svg>
)

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.306 7.277.586 0 1.153-.068 1.696-.197a.75.75 0 0 1 .8.921A6.98 6.98 0 0 1 8.01 16C3.58 16 0 12.38 0 7.994c0-4.306 3.51-7.863 8.01-7.863q.32 0 .637.025a.77.77 0 0 1 .634.385z"/>
  </svg>
)

export default function App() {
  const [publicKey, setPublicKey] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')

  const [balance, setBalance] = useState('0')
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [funding, setFunding] = useState(false)

  // Crowdfunding States
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('explore') // 'explore' | 'creator' | 'investor'
  const [theme, setTheme] = useState('dark')

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'successful' | 'failed'
  const [sortBy, setSortBy] = useState('newest') // 'newest' | 'endingSoon' | 'highestFunded'

  // Toast Notifications
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  // Sync Campaigns from LocalStorage
  const loadLatestCampaigns = useCallback(() => {
    setCampaigns(getCampaigns())
  }, [])

  useEffect(() => {
    loadLatestCampaigns()
  }, [loadLatestCampaigns])

  // Sync Theme
  useEffect(() => {
    const el = document.documentElement
    if (theme === 'light') {
      el.classList.add('light')
    } else {
      el.classList.remove('light')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const refreshBalance = useCallback(async (key) => {
    if (!key) return
    setBalanceLoading(true)
    try {
      const bal = await fetchXlmBalance(key)
      setBalance(bal)
    } catch (err) {
      console.error('Balance fetch failed:', err)
    } finally {
      setBalanceLoading(false)
    }
  }, [])

  useEffect(() => {
    if (publicKey) {
      refreshBalance(publicKey)
    }
  }, [publicKey, refreshBalance])

  const handleConnect = async () => {
    setConnecting(true)
    setConnectError('')
    try {
      const address = await connectWallet()
      setPublicKey(address)
      addToast('Freighter wallet connected successfully!', 'success')
    } catch (err) {
      setConnectError(err.message || 'Failed to connect wallet.')
      addToast('Wallet connection failed.', 'error')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    setPublicKey(null)
    setBalance('0')
    addToast('Wallet disconnected.', 'info')
  }

  const handleFund = async () => {
    setFunding(true)
    try {
      await fundWithFriendbot(publicKey)
      await refreshBalance(publicKey)
      addToast('Successfully funded account with 10,000 Testnet XLM!', 'success')
    } catch (err) {
      setConnectError(err.message || 'Friendbot funding failed.')
      addToast('Friendbot funding failed.', 'error')
    } finally {
      setFunding(false)
    }
  }

  const handleCreateCampaign = (campaignData) => {
    try {
      const created = createCampaign(campaignData)
      loadLatestCampaigns()
      setIsCreateOpen(false)
      addToast(`Campaign "${created.title}" successfully created!`, 'success')
    } catch (err) {
      addToast(err.message || 'Failed to create campaign.', 'error')
    }
  }

  // Handle updates from Details Modal (e.g. investment, withdraw, refund)
  const handleCampaignUpdate = (updatedCampaign) => {
    loadLatestCampaigns()
    setSelectedCampaign(updatedCampaign)
    
    // Check if the user's action completed a goal
    if (updatedCampaign.status === 'successful' && updatedCampaign.raisedAmount >= updatedCampaign.targetAmount) {
      addToast(`Goal achieved for "${updatedCampaign.title}"! 🎉`, 'success')
    } else {
      addToast('Transaction recorded successfully!', 'success')
    }

    if (publicKey) {
      refreshBalance(publicKey)
    }
  }

  // Filtered & Sorted campaigns for Explore
  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter((camp) => {
        // Search text match
        const matchesSearch =
          camp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          camp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          camp.creator.toLowerCase().includes(searchQuery.toLowerCase())

        // Category filter
        const matchesCategory =
          selectedCategory === 'All' || camp.category === selectedCategory

        // Status filter
        const matchesStatus =
          statusFilter === 'all' || camp.status === statusFilter

        return matchesSearch && matchesCategory && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.id.split('_')[1] || b.deadline) - new Date(a.id.split('_')[1] || a.deadline)
        }
        if (sortBy === 'endingSoon') {
          // Put ended ones at the end
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

  // Creator Analytics
  const creatorCampaigns = useMemo(() => {
    if (!publicKey) return []
    return campaigns.filter((c) => c.creator === publicKey)
  }, [campaigns, publicKey])

  const creatorAnalytics = useMemo(() => {
    if (creatorCampaigns.length === 0) return { totalRaised: 0, totalInvestors: 0 }
    
    let totalRaised = 0
    const investorAddresses = new Set()
    
    creatorCampaigns.forEach((camp) => {
      totalRaised += camp.raisedAmount
      camp.investors.forEach((inv) => investorAddresses.add(inv.address))
    })

    return {
      totalRaised: Number(totalRaised.toFixed(7)),
      totalInvestors: investorAddresses.size,
    }
  }, [creatorCampaigns])

  // Investor Backed Campaigns
  const investorCampaigns = useMemo(() => {
    if (!publicKey) return []
    return campaigns.filter((c) => c.investors.some((inv) => inv.address === publicKey))
  }, [campaigns, publicKey])

  const investorAnalytics = useMemo(() => {
    if (investorCampaigns.length === 0) return { totalInvested: 0 }
    
    let totalInvested = 0
    investorCampaigns.forEach((camp) => {
      camp.investors.forEach((inv) => {
        if (inv.address === publicKey) {
          totalInvested += inv.amount
        }
      })
    })

    return {
      totalInvested: Number(totalInvested.toFixed(7)),
    }
  }, [investorCampaigns, publicKey])

  return (
    <div className="min-h-screen bg-space-900 text-white font-sans transition-colors duration-300">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-space-600 bg-space-900/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-stellarblue-600 to-stellarblue-400 font-bold shadow-glow text-white text-base">
              🚀
            </span>
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest text-white sm:text-base">
                Stellar Launch
              </h1>
              <p className="text-[9px] font-semibold font-mono text-stellarblue-400 uppercase tracking-widest leading-none mt-0.5">
                Stellar Crowdfunding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark/Light mode switch */}
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-space-600 text-mist hover:border-stellarblue-500 hover:text-white transition"
              title="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Wallet Panel integration */}
            <WalletPanel
              publicKey={publicKey}
              balance={balance}
              balanceLoading={balanceLoading}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onFund={handleFund}
              funding={funding}
              connecting={connecting}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex gap-4 border-t border-space-600/30 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('explore')}
              className={`py-3 transition border-b-2 hover:text-white ${
                activeTab === 'explore'
                  ? 'border-stellarblue-500 text-white'
                  : 'border-transparent text-mist'
              }`}
            >
              Explore Campaigns
            </button>
            <button
              onClick={() => setActiveTab('creator')}
              className={`py-3 transition border-b-2 hover:text-white ${
                activeTab === 'creator'
                  ? 'border-stellarblue-500 text-white'
                  : 'border-transparent text-mist'
              }`}
            >
              Creator Dashboard
            </button>
            <button
              onClick={() => setActiveTab('investor')}
              className={`py-3 transition border-b-2 hover:text-white ${
                activeTab === 'investor'
                  ? 'border-stellarblue-500 text-white'
                  : 'border-transparent text-mist'
              }`}
            >
              Backer Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        
        {/* Explore Tab View */}
        {activeTab === 'explore' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-2xl border border-space-600 bg-space-800 p-6 sm:p-8">
              <div className="absolute inset-0 bg-gradient-to-r from-stellarblue-600/10 to-transparent" />
              <div className="relative z-10 max-w-lg">
                <p className="font-mono text-[10px] uppercase tracking-widest text-stellarblue-400 font-bold">
                  Stellar Horizon Network
                </p>
                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl leading-tight">
                  Fund the next orbit of decentralized tech.
                </h2>
                <p className="mt-3 text-xs text-mist leading-relaxed">
                  Support builders launching open-source applications, environmental bots, and community park benches. Settle contributions in one click via your Freighter wallet.
                </p>
                <button
                  onClick={() => {
                    if (publicKey) {
                      setIsCreateOpen(true)
                    } else {
                      handleConnect()
                    }
                  }}
                  className="mt-5 rounded-lg bg-flare-500 px-4 py-2.5 text-xs font-bold text-space-950 shadow-flareglow hover:bg-flare-400 transition"
                >
                  Create Your Campaign
                </button>
              </div>
            </section>

            {/* Filter Console */}
            <section className="flex flex-col gap-4 rounded-xl border border-space-600 bg-space-800 p-4 sm:flex-row sm:items-center sm:justify-between">
              
              {/* Search & Category tabs */}
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                
                {/* Search */}
                <div className="relative min-w-[200px] flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search campaigns..."
                    className="w-full rounded-lg border border-space-600 bg-space-900 px-3 py-2 pl-9 text-xs text-white focus:outline-none focus:ring-1 focus:ring-stellarblue-500"
                  />
                  <span className="absolute left-3 top-2.5 text-mist text-xs">🔍</span>
                </div>

                {/* Category selectors */}
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

              {/* Sorting and Status filters */}
              <div className="flex items-center gap-3">
                
                {/* Status select */}
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

                {/* Sort select */}
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

            {/* Campaign Grid */}
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
                      onClick={setSelectedCampaign}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Creator Dashboard Tab View */}
        {activeTab === 'creator' && (
          <div className="space-y-6">
            {!publicKey ? (
              <div className="rounded-xl border border-space-600 bg-space-800 py-16 text-center">
                <span className="text-3xl">🔑</span>
                <h3 className="mt-4 text-base font-bold text-white">Connect wallet</h3>
                <p className="mt-1 text-xs text-mist mb-5">Please connect your Freighter wallet to view your created campaigns.</p>
                <button
                  onClick={handleConnect}
                  className="rounded-lg bg-stellarblue-500 px-4 py-2 text-xs font-bold text-space-950 hover:bg-stellarblue-400 transition"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <>
                {/* Creator Analytics Panel */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-space-600 bg-space-800 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-mist">My Campaigns</p>
                    <p className="mt-1 text-2xl font-black text-white">{creatorCampaigns.length}</p>
                  </div>
                  <div className="rounded-xl border border-space-600 bg-space-800 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-mist">Total XLM Raised</p>
                    <p className="mt-1 text-2xl font-black text-green-400 font-mono">
                      {creatorAnalytics.totalRaised.toLocaleString()} <span className="text-xs">XLM</span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-space-600 bg-space-800 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-mist">Unique Supporters</p>
                    <p className="mt-1 text-2xl font-black text-stellarblue-400">
                      {creatorAnalytics.totalInvestors}
                    </p>
                  </div>
                </section>

                {/* Creator's Campaign List */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-mist">My Campaigns</h3>
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="rounded-lg bg-stellarblue-500 px-3 py-1.5 text-xs font-bold text-space-950 hover:bg-stellarblue-400 transition"
                    >
                      + Create Campaign
                    </button>
                  </div>

                  {creatorCampaigns.length === 0 ? (
                    <div className="rounded-xl border border-space-600 bg-space-800/60 py-16 text-center">
                      <span className="text-3xl">🚀</span>
                      <h3 className="mt-4 text-base font-bold text-white">No campaigns launched yet</h3>
                      <p className="mt-1 text-xs text-mist mb-4">Launch your first crowdfunding campaign on Stellar!</p>
                      <button
                        onClick={() => setIsCreateOpen(true)}
                        className="rounded-lg bg-flare-500 px-4 py-2 text-xs font-bold text-space-950 hover:bg-flare-400 transition"
                      >
                        Create Campaign
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {creatorCampaigns.map((camp) => (
                        <CampaignCard
                          key={camp.id}
                          campaign={camp}
                          onClick={setSelectedCampaign}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        )}

        {/* Backer Dashboard Tab View */}
        {activeTab === 'investor' && (
          <div className="space-y-6">
            {!publicKey ? (
              <div className="rounded-xl border border-space-600 bg-space-800 py-16 text-center">
                <span className="text-3xl">🔑</span>
                <h3 className="mt-4 text-base font-bold text-white">Connect wallet</h3>
                <p className="mt-1 text-xs text-mist mb-5">Please connect your Freighter wallet to view campaigns you have backed.</p>
                <button
                  onClick={handleConnect}
                  className="rounded-lg bg-stellarblue-500 px-4 py-2 text-xs font-bold text-space-950 hover:bg-stellarblue-400 transition"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <>
                {/* Backer Analytics Panel */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-space-600 bg-space-800 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-mist">Campaigns Backed</p>
                    <p className="mt-1 text-2xl font-black text-white">{investorCampaigns.length}</p>
                  </div>
                  <div className="rounded-xl border border-space-600 bg-space-800 p-4">
                    <p className="text-[10px] uppercase tracking-wider text-mist">Total XLM Backed</p>
                    <p className="mt-1 text-2xl font-black text-flare-400 font-mono">
                      {investorAnalytics.totalInvested.toLocaleString()} <span className="text-xs">XLM</span>
                    </p>
                  </div>
                </section>

                {/* Backed Campaigns List */}
                <section className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-mist">Backed Campaigns</h3>

                  {investorCampaigns.length === 0 ? (
                    <div className="rounded-xl border border-space-600 bg-space-800/60 py-16 text-center">
                      <span className="text-3xl">🛰️</span>
                      <h3 className="mt-4 text-base font-bold text-white">No campaigns backed yet</h3>
                      <p className="mt-1 text-xs text-mist">Explore active campaigns and back your first project!</p>
                      <button
                        onClick={() => setActiveTab('explore')}
                        className="mt-4 rounded-lg bg-stellarblue-500 px-4 py-2 text-xs font-bold text-space-950 hover:bg-stellarblue-400 transition"
                      >
                        Explore Campaigns
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {investorCampaigns.map((camp) => (
                        <CampaignCard
                          key={camp.id}
                          campaign={camp}
                          onClick={setSelectedCampaign}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-space-600/40 bg-space-950 py-8 text-center font-mono text-[10px] text-mist/60">
        <p>Stellar Launchpad · Powered by Horizon Horizon API & Freighter Wallet</p>
        <p className="mt-1.5">Running exclusively on Stellar Testnet for Journey to Mastery</p>
      </footer>

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <CampaignDetailsModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onRefresh={handleCampaignUpdate}
          publicKey={publicKey}
          balance={balance}
          onConnect={handleConnect}
        />
      )}

      {/* Create Campaign Modal */}
      {isCreateOpen && (
        <CreateCampaignModal
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreateCampaign}
          publicKey={publicKey}
        />
      )}

      {/* Toast Alert popups */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg px-4 py-3 text-xs font-semibold shadow-lg border animate-pulseSlow flex items-center gap-2 text-white ${
              toast.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : toast.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-stellarblue-500/10 border-stellarblue-500/30 text-stellarblue-400'
            }`}
          >
            <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
