// src/layouts/MainLayout.jsx
import React from 'react'
import WalletPanel from '../components/WalletPanel'

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="w-4 h-4">
    <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5M0 8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 0 8m13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5M1.993 1.993a.5.5 0 0 1 .707 0l1.414 1.414a.5.5 0 0 1-.707.707L1.993 2.7a.5.5 0 0 1 0-.707m10.606 10.606a.5.5 0 0 1 .707 0l1.414 1.414a.5.5 0 0 1-.707.707l-1.414-1.414a.5.5 0 0 1 0-.707m-9.193 9.193a.5.5 0 0 1 0-.707l1.414-1.414a.5.5 0 0 1 .707.707l-1.414 1.414a.5.5 0 0 1-.707 0m9.193-9.193a.5.5 0 0 1 0-.707l1.414-1.414a.5.5 0 0 1 .707.707l-1.414 1.414a.5.5 0 0 1-.707 0"/>
  </svg>
)

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="w-4 h-4">
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

  return (
    <div className="min-h-screen bg-space-900 text-white font-sans transition-colors duration-300 flex flex-col justify-between">
      
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-space-600 bg-space-900/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:py-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('explore')}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-stellarblue-600 to-stellarblue-400 font-bold shadow-glow text-white text-base">
              🚀
            </span>
            <div>
              <h1 className="text-base font-black uppercase tracking-widest text-white">
                CrowdFund<span className="text-flare-400">X</span>
              </h1>
              <p className="text-[9px] font-semibold font-mono text-stellarblue-400 uppercase tracking-widest leading-none mt-0.5">
                Stellar Launchpad
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme switcher */}
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-space-600 text-mist hover:border-stellarblue-500 hover:text-white transition"
              title="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Wallet Panel */}
            <WalletPanel
              publicKey={publicKey}
              balance={balance}
              balanceLoading={balanceLoading}
              onConnect={connect}
              onDisconnect={disconnect}
              onFund={fund}
              funding={funding}
              connecting={connecting}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex gap-6 border-t border-space-600/30 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('explore')}
              className={`py-3 transition border-b-2 hover:text-white ${
                activeTab === 'explore'
                  ? 'border-stellarblue-500 text-white'
                  : 'border-transparent text-mist'
              }`}
            >
              Explore campaigns
            </button>
            <button
              onClick={() => setActiveTab('creator')}
              className={`py-3 transition border-b-2 hover:text-white ${
                activeTab === 'creator'
                  ? 'border-stellarblue-500 text-white'
                  : 'border-transparent text-mist'
              }`}
            >
              Creator dashboard
            </button>
            <button
              onClick={() => setActiveTab('backer')}
              className={`py-3 transition border-b-2 hover:text-white ${
                activeTab === 'backer'
                  ? 'border-stellarblue-500 text-white'
                  : 'border-transparent text-mist'
              }`}
            >
              Investor dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-space-600/40 bg-space-950 py-8 text-center font-mono text-[10px] text-mist/60">
        <div className="mx-auto max-w-6xl px-4">
          <p>CrowdFundX © 2026 · Built on Stellar Testnet for the Journey to Mastery</p>
          <p className="mt-1.5">Leverages Freighter browser wallet and Horizon SDK operations</p>
        </div>
      </footer>

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
