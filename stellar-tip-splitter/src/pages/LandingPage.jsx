// src/pages/LandingPage.jsx
import React, { useMemo, useState } from 'react'
import CampaignCard from '../components/CampaignCard'
import { getCategoryStyles, getDaysRemaining } from '../utils/helpers'

// SVG Category Icons
const TechIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5 text-blue-400">
    <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zm1 12h2V2h-2zM5 5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zm1 9h2V5H6zM0 9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm1 5h2V9H1z"/>
  </svg>
)

const EnvIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5 text-green-400">
    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M4.882 1.431a7 7 0 0 1 3.25-.788v5.82L3.5 4.675zM11.118 1.43l-4.636 4.637v5.82l4.636-4.637zm-7.618 6.138 4.637 4.636v2.961a7 7 0 0 1-3.25-.788zM8.5 15.212V9.392l4.637-4.637 1.431 1.431a7 7 0 0 1-6.068 8.389"/>
  </svg>
)

const ArtIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5 text-purple-400">
    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M3.5 9.002a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5zm0-2.5a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5zm0 5a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5z"/>
  </svg>
)

const CommIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="w-5 h-5 text-amber-400">
    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"/>
  </svg>
)

const ChevronIcon = ({ open }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/>
  </svg>
)

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
  const [faqOpenIndex, setFaqOpenIndex] = useState(null)

  // Platforms stats calculation
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

  // Featured Project Spotlight (highest funded active or successful campaign)
  const featuredCampaign = useMemo(() => {
    if (campaigns.length === 0) return null
    return campaigns.reduce((prev, curr) => (curr.raisedAmount > prev.raisedAmount ? curr : prev), campaigns[0])
  }, [campaigns])

  const featuredPercent = useMemo(() => {
    if (!featuredCampaign) return 0
    return Math.min(100, Math.round((featuredCampaign.raisedAmount / featuredCampaign.targetAmount) * 100))
  }, [featuredCampaign])

  // Filtered campaigns list
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

  // Collapsible FAQ toggler
  const toggleFaq = (index) => {
    setFaqOpenIndex(faqOpenIndex === index ? null : index)
  }

  const faqs = [
    {
      q: 'How do on-chain refunds work?',
      a: 'If a campaign does not meet its funding target by the deadline, the contract marks it as failed. Backers can access their Investor dashboard and claim a full refund. The transaction is verified and processed on-ledger.'
    },
    {
      q: 'Can I invest using testnet XLM?',
      a: 'Yes, this platform runs exclusively on the Stellar Testnet. You can fund your connected Freighter wallet with free XLM tokens by clicking the Friendbot button in your wallet panel.'
    },
    {
      q: 'Are there any platform fees?',
      a: 'CrowdFundX charges 0% fees. Contributions go directly to the campaign creator (or are returned to backers) minus the standard tiny network ledger fees on Stellar.'
    },
    {
      q: 'How is the campaign deadline determined?',
      a: 'When launching a campaign, the creator specifies a future date. Once that block timestamp is surpassed on the Stellar ledger, the campaign closes to investments, unlocking either withdrawals or refunds.'
    }
  ]

  const testimonials = [
    {
      quote: 'CrowdFundX allowed us to fund our local smart benches securely. Backers knew their funds were protected by escrow.',
      author: 'Sarah Jenkins',
      role: 'Smart Park Initiator',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80'
    },
    {
      quote: 'The Freighter wallet signature makes backing projects seamless. Programmatic refund rules give me absolute confidence.',
      author: 'Marcus Vance',
      role: 'Active Investor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
    }
  ]

  return (
    <div className="mesh-gradient-bg animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-16 space-y-16">
        
        {/* Stunning Web3 Hero Section */}
        <section className="relative flex flex-col items-center text-center py-6 sm:py-12 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-stellarblue-500/30 bg-stellarblue-500/5 px-3 py-1 text-[10px] font-bold text-stellarblue-400 uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping" />
            Now Active on Stellar Testnet
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl max-w-3xl leading-tight">
            Fund the Future of <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-stellarblue-400 to-flare-400 bg-clip-text text-transparent">Decentralized Ideas</span>
          </h2>
          <p className="max-w-xl text-sm sm:text-base text-mist leading-relaxed">
            Create campaigns, collect backers, and manage milestones trustlessly. CrowdFundX secures your investments in escrow via programmatic rules.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('explorer-anchor')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="rounded-xl bg-stellarblue-500 px-6 py-3.5 text-xs font-bold text-space-950 shadow-glow hover:bg-stellarblue-400 transition"
            >
              Explore Campaigns
            </button>
            <button
              onClick={publicKey ? onCreateTrigger : onConnect}
              className="rounded-xl border border-space-600 bg-space-850 px-6 py-3.5 text-xs font-bold text-white hover:border-stellarblue-500 hover:bg-space-800 transition"
            >
              Start Funding
            </button>
          </div>
        </section>

        {/* Platforms Animated Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="glass-card rounded-2xl p-6 text-center shadow-md">
            <p className="text-[10px] uppercase tracking-widest text-mist font-bold">Total Raised</p>
            <p className="mt-2 text-3xl font-black text-green-400 font-mono">
              {platformStats.totalRaised.toLocaleString()} <span className="text-sm font-sans font-normal text-mist">XLM</span>
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center shadow-md">
            <p className="text-[10px] uppercase tracking-widest text-mist font-bold">Active Projects</p>
            <p className="mt-2 text-3xl font-black text-white">
              {platformStats.activeCount}
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center shadow-md">
            <p className="text-[10px] uppercase tracking-widest text-mist font-bold">Total Supporters</p>
            <p className="mt-2 text-3xl font-black text-stellarblue-400">
              {platformStats.backersCount}
            </p>
          </div>
        </section>

        {/* Featured Campaigns Section */}
        {featuredCampaign && (
          <section className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-black text-stellarblue-400">Spotlight Campaign</h3>
            <div 
              onClick={() => onSelectCampaign(featuredCampaign)}
              className="glass-panel hover-card-glow rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 cursor-pointer shadow-lg"
            >
              <div className="h-56 md:h-full bg-space-950 relative">
                <img 
                  src={featuredCampaign.coverImage} 
                  alt={featuredCampaign.title} 
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-4 top-4 rounded-full bg-flare-500 px-3 py-1 text-[10px] font-bold text-space-950 uppercase tracking-wider">
                  Featured
                </span>
              </div>
              <div className="p-6 sm:p-10 flex flex-col justify-between space-y-6">
                <div>
                  <span className={`text-[10px] border rounded-full px-2.5 py-0.5 font-bold uppercase tracking-wider ${getCategoryStyles(featuredCampaign.category)}`}>
                    {featuredCampaign.category}
                  </span>
                  <h4 className="mt-3 text-xl font-bold text-white hover:text-stellarblue-400">
                    {featuredCampaign.title}
                  </h4>
                  <p className="mt-2 text-xs text-mist leading-relaxed line-clamp-3">
                    {featuredCampaign.description}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-white font-mono">{featuredCampaign.raisedAmount} XLM</span>
                      <span className="text-mist font-mono">{featuredPercent}% raised</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-space-700 overflow-hidden">
                      <div className="h-full rounded-full bg-stellarblue-500" style={{ width: `${featuredPercent}%` }} />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-space-600/30 pt-3">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-mist">Target Goal</p>
                      <p className="font-bold text-white font-mono">{featuredCampaign.targetAmount} XLM</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-wider text-mist">Remaining</p>
                      <p className="font-bold text-flare-400">
                        {getDaysRemaining(featuredCampaign.deadline)} Days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Categories Section */}
        <section className="space-y-6">
          <div className="text-center max-w-md mx-auto">
            <h3 className="text-xs uppercase tracking-widest font-black text-stellarblue-400">Categories</h3>
            <p className="mt-1.5 text-xs text-mist">Filter and discover backing opportunities across dynamic classifications.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { name: 'Technology', desc: 'Hardware & software innovations', icon: <TechIcon /> },
              { name: 'Environment', desc: 'Solar, eco, and cleanup efforts', icon: <EnvIcon /> },
              { name: 'Art', desc: 'Creative design cabinets & panels', icon: <ArtIcon /> },
              { name: 'Community', desc: 'Public space infrastructure', icon: <CommIcon /> }
            ].map((cat) => (
              <div
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name)
                  const el = document.getElementById('explorer-anchor')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`glass-card rounded-2xl p-5 text-center cursor-pointer transition-all duration-300 border hover:border-stellarblue-500 ${
                  selectedCategory === cat.name ? 'border-stellarblue-500 bg-space-800' : 'border-transparent'
                }`}
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-space-900 border border-space-600 shadow-inner">
                  {cat.icon}
                </div>
                <h4 className="mt-3 text-xs font-bold text-white uppercase tracking-wider">{cat.name}</h4>
                <p className="mt-1 text-[10px] text-mist">{cat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* "How It Works" Section */}
        <section className="space-y-8">
          <div className="text-center max-w-md mx-auto">
            <h3 className="text-xs uppercase tracking-widest font-black text-stellarblue-400">Protocol Rules</h3>
            <h4 className="mt-2 text-xl font-bold text-white uppercase">How CrowdFundX Settles</h4>
          </div>
          
          <div className="relative border-l-2 border-dashed border-space-600/50 pl-6 sm:pl-8 ml-4 sm:ml-8 space-y-10">
            {[
              { step: '1', title: 'Connect Freighter Wallet', desc: 'Switch your extension to the Stellar Testnet. Fund your new public address with Friendbot to claim free backing tokens.' },
              { step: '2', title: 'Fund Campaigns on Ledger', desc: 'Submit investments. Transactions are securely signed in Freighter and logged directly on the Stellar ledger.' },
              { step: '3', title: 'Escrow Settlements', desc: 'If the goal is achieved before the deadline, creators withdraw funds. If the campaign expires below target, backers claim complete refunds.' }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[41px] sm:-left-[49px] top-0 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-space-900 border-2 border-stellarblue-500 font-mono text-xs font-black text-stellarblue-400">
                  {step.step}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">{step.title}</h4>
                  <p className="mt-1 text-xs text-mist max-w-lg leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="space-y-6">
          <div className="text-center max-w-md mx-auto">
            <h3 className="text-xs uppercase tracking-widest font-black text-stellarblue-400">Success Stories</h3>
            <p className="mt-1 text-xs text-mist">Feedback from backers and project creators launching on-ledger.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {testimonials.map((test, idx) => (
              <div key={idx} className="glass-card rounded-2xl p-6 space-y-4 shadow-sm border border-space-600/30">
                <p className="text-xs italic text-mist leading-relaxed">"{test.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={test.avatar} alt={test.author} className="h-9 w-9 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{test.author}</h4>
                    <p className="text-[10px] text-mist">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Explorer Search, Filters, & Results (Anchored) */}
        <section id="explorer-anchor" className="space-y-6 pt-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-space-600 bg-space-800 p-4 sm:flex-row sm:items-center sm:justify-between shadow-md">
            
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search bar */}
              <div className="relative min-w-[200px] flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search project name, creators, category..."
                  className="w-full rounded-lg border border-space-600 bg-space-900 px-3 py-2 pl-9 text-xs text-white focus:outline-none focus:ring-1 focus:ring-stellarblue-500"
                />
                <span className="absolute left-3 top-2.5 text-mist text-xs">🔍</span>
              </div>

              {/* Category tabs */}
              <div className="flex flex-wrap gap-1">
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

            {/* Sort options */}
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

          </div>

          {/* Campaigns Listing */}
          <div>
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
          </div>
        </section>

        {/* Collapsible FAQ Section */}
        <section className="space-y-6">
          <div className="text-center max-w-md mx-auto">
            <h3 className="text-xs uppercase tracking-widest font-black text-stellarblue-400">Frequently Asked Questions</h3>
            <p className="mt-1.5 text-xs text-mist">Answers to core questions about platform logic and Freighter wallet settings.</p>
          </div>

          <div className="mx-auto max-w-2xl divide-y divide-space-600/30 border border-space-600 bg-space-850 rounded-2xl overflow-hidden shadow-sm">
            {faqs.map((faq, idx) => {
              const open = faqOpenIndex === idx
              return (
                <div key={idx} className="transition-all duration-300">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="flex w-full items-center justify-between p-4 sm:p-5 text-left text-xs font-bold text-white uppercase tracking-wider hover:bg-space-800 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronIcon open={open} />
                  </button>
                  {open && (
                    <div className="p-4 sm:p-5 pt-0 text-xs text-mist leading-relaxed animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

      </div>
    </div>
  )
}
