// src/layouts/MainLayout.jsx
import React, { useState, useEffect, useRef } from 'react'
import WalletPanel from '../components/WalletPanel'
import { truncateAddress } from '../utils/helpers'

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="w-4 h-4 text-amber-400">
    <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5M0 8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 0 8m13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5M1.993 1.993a.5.5 0 0 1 .707 0l1.414 1.414a.5.5 0 0 1-.707.707L1.993 2.7a.5.5 0 0 1 0-.707m10.606 10.606a.5.5 0 0 1 .707 0l1.414 1.414a.5.5 0 0 1-.707.707l-1.414-1.414a.5.5 0 0 1 0-.707m-9.193 9.193a.5.5 0 0 1 0-.707l1.414-1.414a.5.5 0 0 1 .707.707l-1.414 1.414a.5.5 0 0 1-.707 0m9.193-9.193a.5.5 0 0 1 0-.707l1.414-1.414a.5.5 0 0 1 .707.707l-1.414 1.414a.5.5 0 0 1-.707 0"/>
  </svg>
)

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="w-4 h-4 text-indigo-400">
    <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.306 7.277.586 0 1.153-.068 1.696-.197a.75.75 0 0 1 .8.921A6.98 6.98 0 0 1 8.01 16C3.58 16 0 12.38 0 7.994c0-4.306 3.51-7.863 8.01-7.863q.32 0 .637.025a.77.77 0 0 1 .634.385z"/>
  </svg>
)

export default function MainLayout({
  children,
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  wallet,
  toasts
}) {
  const {
    publicKey,
    balance,
    balanceLoading,
    connect,
    disconnect,
    fund,
    funding,
    connecting
  } = wallet

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef(null)

  // Copy address helper
  const handleCopyAddress = async () => {
    if (!publicKey) return
    await navigator.clipboard.writeText(publicKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-space-900 text-white font-sans transition-colors duration-300 flex flex-col justify-between">
      
      {/* Sticky Blur Navbar */}
      <header className="sticky top-0 z-40 border-b border-space-600/60 bg-space-900/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:py-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab('explore'); setMobileMenuOpen(false); }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-stellarblue-600 to-stellarblue-400 font-bold shadow-glow text-white text-base">
              🚀
            </span>
            <div>
              <h1 className="text-base font-black uppercase tracking-widest text-white leading-tight">
                CrowdFund<span className="text-flare-400">X</span>
              </h1>
              <p className="text-[9px] font-semibold font-mono text-stellarblue-400 uppercase tracking-widest leading-none mt-0.5">
                Stellar Protocol Launchpad
              </p>
            </div>
          </div>

          {/* Desktop Navigation Link Highlights */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-mist">
            <button
              onClick={() => setActiveTab('explore')}
              className={`transition hover:text-white border-b-2 py-1 ${activeTab === 'explore' ? 'border-stellarblue-500 text-white font-bold' : 'border-transparent'}`}
            >
              Explore
            </button>
            <button
              onClick={() => setActiveTab('creator')}
              className={`transition hover:text-white border-b-2 py-1 ${activeTab === 'creator' ? 'border-stellarblue-500 text-white font-bold' : 'border-transparent'}`}
            >
              Creator Studio
            </button>
            <button
              onClick={() => setActiveTab('backer')}
              className={`transition hover:text-white border-b-2 py-1 ${activeTab === 'backer' ? 'border-stellarblue-500 text-white font-bold' : 'border-transparent'}`}
            >
              Investor Hub
            </button>
          </nav>

          {/* Action Row */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme switcher */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-space-600 bg-space-850 hover:border-stellarblue-500 hover:bg-space-800 transition shadow-sm"
              title="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Wallet Panel / Profile dropdown triggers */}
            {publicKey ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-stellarblue-500/30 bg-stellarblue-500/10 px-3.5 py-1.5 text-xs font-bold text-stellarblue-400 shadow-glow transition hover:bg-stellarblue-500/20"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-pulseSlow" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                  </span>
                  <span>{truncateAddress(publicKey)}</span>
                  <span className="text-[9px]">▼</span>
                </button>

                {/* Web3 Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-space-600 bg-space-800 p-4 shadow-xl animate-slide-up z-50">
                    <div className="border-b border-space-600/50 pb-3">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-mist">Stellar Key</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-mono text-xs text-white truncate max-w-[160px]">{publicKey}</span>
                        <button
                          onClick={handleCopyAddress}
                          className="rounded bg-space-700 px-2 py-0.5 text-[9px] text-stellarblue-400 hover:bg-space-600 transition"
                        >
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <div className="py-3 border-b border-space-600/50">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-mist">XLM Balance</p>
                      <p className="mt-0.5 font-mono text-base font-black text-flare-400">
                        {balanceLoading ? 'fetching…' : `${Number(balance).toLocaleString()} XLM`}
                      </p>
                      {Number(balance) === 0 && (
                        <button
                          onClick={fund}
                          disabled={funding}
                          className="mt-2 w-full rounded-lg border border-flare-500 py-1.5 text-[10px] font-bold text-flare-400 hover:bg-flare-500 hover:text-space-950 transition"
                        >
                          {funding ? 'Funding…' : 'Get Free Testnet XLM'}
                        </button>
                      )}
                    </div>
                    <div className="pt-3 flex flex-col gap-2 text-xs">
                      <button
                        onClick={() => { setActiveTab('creator'); setProfileDropdownOpen(false); }}
                        className="text-left py-1 text-mist hover:text-white transition"
                      >
                        💼 Creator Dashboard
                      </button>
                      <button
                        onClick={() => { setActiveTab('backer'); setProfileDropdownOpenOpen(false); }}
                        className="text-left py-1 text-mist hover:text-white transition"
                      >
                         Backer Dashboard
                      </button>
                      <button
                        onClick={() => { disconnect(); setProfileDropdownOpen(false); }}
                        className="text-left py-1.5 border-t border-space-600/30 text-red-400 hover:text-red-300 font-bold transition mt-1"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={connecting}
                className="rounded-xl bg-stellarblue-500 px-4 py-2 text-xs font-bold text-space-950 shadow-glow transition hover:bg-stellarblue-400 disabled:opacity-60"
              >
                {connecting ? 'Connecting…' : 'Connect Wallet'}
              </button>
            )}

            {/* Mobile hamburger menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-space-600 text-mist hover:border-stellarblue-500 hover:text-white transition md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Hamburger menu Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-space-600/40 bg-space-900 px-4 py-3 md:hidden space-y-3 font-semibold text-sm">
            <button
              onClick={() => { setActiveTab('explore'); setMobileMenuOpen(false); }}
              className={`block w-full text-left py-2 border-l-2 pl-3 ${activeTab === 'explore' ? 'border-stellarblue-500 text-stellarblue-400 font-bold' : 'border-transparent text-mist'}`}
            >
              Explore Projects
            </button>
            <button
              onClick={() => { { setActiveTab('creator'); setMobileMenuOpen(false); } }}
              className={`block w-full text-left py-2 border-l-2 pl-3 ${activeTab === 'creator' ? 'border-stellarblue-500 text-stellarblue-400 font-bold' : 'border-transparent text-mist'}`}
            >
              Creator Studio
            </button>
            <button
              onClick={() => { { setActiveTab('backer'); setMobileMenuOpen(false); } }}
              className={`block w-full text-left py-2 border-l-2 pl-3 ${activeTab === 'backer' ? 'border-stellarblue-500 text-stellarblue-400 font-bold' : 'border-transparent text-mist'}`}
            >
              Investor Hub
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Modern corporate Footer */}
      <footer className="border-t border-space-600/40 bg-space-950/80 pt-16 pb-8 text-xs text-mist">
        <div className="mx-auto max-w-6xl px-4 grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Logo Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stellarblue-500 font-bold text-white text-xs">🚀</span>
              <span className="text-sm font-black uppercase tracking-wider text-white">CrowdFundX</span>
            </div>
            <p className="max-w-xs text-[11px] leading-relaxed text-mist">
              A premium fundraising launchpad integrated with the Stellar testnet. Supporting developers, community initiatives, and environmental preservation efforts on-ledger.
            </p>
          </div>
          
          {/* Sitemap columns */}
          <div>
            <h4 className="text-[10px] uppercase font-bold text-white tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2.5 text-[11px] font-semibold">
              <li><a href="#explore" onClick={() => setActiveTab('explore')} className="hover:text-stellarblue-400 transition">Explore campaigns</a></li>
              <li><a href="#creator" onClick={() => setActiveTab('creator')} className="hover:text-stellarblue-400 transition">Creator Studio</a></li>
              <li><a href="#backer" onClick={() => setActiveTab('backer')} className="hover:text-stellarblue-400 transition">Investor Hub</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase font-bold text-white tracking-widest mb-4">Resources</h4>
            <ul className="space-y-2.5 text-[11px] font-semibold">
              <li><a href="https://developers.stellar.org/" target="_blank" rel="noreferrer" className="hover:text-stellarblue-400 transition">Soroban docs</a></li>
              <li><a href="https://laboratory.stellar.org" target="_blank" rel="noreferrer" className="hover:text-stellarblue-400 transition">Stellar Lab</a></li>
              <li><a href="https://stellar.expert" target="_blank" rel="noreferrer" className="hover:text-stellarblue-400 transition">Stellar Explorer</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-white tracking-widest mb-3">Newsletter</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-lg border border-space-600 bg-space-900 px-3 py-1.5 text-[10px] text-white focus:outline-none"
              />
              <button className="rounded-lg bg-stellarblue-500 px-3 py-1.5 text-[10px] font-bold text-space-950 hover:bg-stellarblue-400 transition">Go</button>
            </div>
          </div>
        </div>

        {/* Corporate baseline */}
        <div className="mx-auto max-w-6xl px-4 mt-12 pt-6 border-t border-space-600/30 text-center text-[10px]">
          <p>CrowdFundX © 2026. Made with dedication for the Stellar Journey to Mastery.</p>
        </div>
      </footer>

      {/* Toast alert popups */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg px-4 py-3 text-xs font-semibold shadow-lg border animate-slide-up flex items-center gap-2 text-white ${
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
