// src/App.jsx
import { useEffect, useState, useCallback } from 'react'
import useWallet from './hooks/useWallet'
import useCampaigns from './hooks/useCampaigns'
import MainLayout from './layouts/MainLayout'
import LandingPage from './pages/LandingPage'
import CreatorDashboard from './pages/CreatorDashboard'
import BackerDashboard from './pages/BackerDashboard'
import CampaignDetailsModal from './components/CampaignDetailsModal'
import CreateCampaignModal from './components/CreateCampaignModal'

export default function App() {
  const [activeTab, setActiveTab] = useState('explore')
  const [theme, setTheme] = useState('dark')

  // Search & Filter States (lifted for persistence between page transitions)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Modals
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Toasts Alert System
  const [toasts, setToasts] = useState([])
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  // Wallet and Campaigns custom hooks
  const wallet = useWallet(addToast)
  const cState = useCampaigns(addToast)

  // Sync Theme stylesheet class
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

  // Handle detailed campaign refreshing
  const handleCampaignUpdate = (updatedCampaign) => {
    cState.loadCampaigns()
    setSelectedCampaign(updatedCampaign)
  }

  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      theme={theme}
      toggleTheme={toggleTheme}
      wallet={wallet}
      toasts={toasts}
    >
      {/* Dynamic Page Views */}
      {activeTab === 'explore' && (
        <LandingPage
          campaigns={cState.campaigns}
          publicKey={wallet.publicKey}
          onConnect={wallet.connect}
          onCreateTrigger={() => setIsCreateOpen(true)}
          onSelectCampaign={setSelectedCampaign}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      )}

      {activeTab === 'creator' && (
        <CreatorDashboard
          campaigns={cState.campaigns}
          publicKey={wallet.publicKey}
          onConnect={wallet.connect}
          onCreateTrigger={() => setIsCreateOpen(true)}
          onSelectCampaign={setSelectedCampaign}
        />
      )}

      {activeTab === 'backer' && (
        <BackerDashboard
          campaigns={cState.campaigns}
          publicKey={wallet.publicKey}
          onConnect={wallet.connect}
          onSelectCampaign={setSelectedCampaign}
        />
      )}

      {/* Details overlay */}
      {selectedCampaign && (
        <CampaignDetailsModal
          campaign={selectedCampaign}
          campaigns={cState.campaigns}
          onClose={() => setSelectedCampaign(null)}
          onRefresh={handleCampaignUpdate}
          publicKey={wallet.publicKey}
          balance={wallet.balance}
          onConnect={wallet.connect}
          onAddComment={cState.addComment}
          onToggleFavorite={cState.toggleFavorite}
          addToast={addToast}
        />
      )}

      {/* Creation form */}
      {isCreateOpen && (
        <CreateCampaignModal
          onClose={() => setIsCreateOpen(false)}
          onCreate={(data) => {
            cState.create(data)
            setIsCreateOpen(false)
          }}
          publicKey={wallet.publicKey}
        />
      )}
    </MainLayout>
  )
}
