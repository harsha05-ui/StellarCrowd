// src/components/CreateCampaignModal.jsx
import React, { useState, useEffect } from 'react'

const CATEGORIES = ['Technology', 'Environment', 'Art', 'Community']

export default function CreateCampaignModal({ onClose, onCreate, publicKey }) {
  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [fullDescription, setFullDescription] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [coverImage, setCoverImage] = useState('')
  const [creatorName, setCreatorName] = useState('')
  
  const [imageValid, setImageValid] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 7)
    const year = defaultDate.getFullYear()
    const month = String(defaultDate.getMonth() + 1).padStart(2, '0')
    const day = String(defaultDate.getDate()).padStart(2, '0')
    setDeadline(`${year}-${month}-${day}`)
  }, [])

  // Validate Cover Image URL live
  useEffect(() => {
    if (!coverImage) {
      setImageValid(false)
      return
    }
    const img = new Image()
    img.onload = () => setImageValid(true)
    img.onerror = () => setImageValid(false)
    img.src = coverImage
  }, [coverImage])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!publicKey) {
      setErrorMsg('Connect your Freighter wallet to continue.')
      return
    }

    if (!title.trim() || !shortDescription.trim() || !fullDescription.trim() || !creatorName.trim()) {
      setErrorMsg('All fields must be completed.')
      return
    }

    const target = parseFloat(targetAmount)
    if (isNaN(target) || target <= 0) {
      setErrorMsg('Goal must be a positive XLM amount.')
      return
    }

    const deadlineDate = new Date(deadline)
    if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
      setErrorMsg('Deadline must be set to a future date.')
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate transaction build delay
      await new Promise((resolve) => setTimeout(resolve, 800))
      
      onCreate({
        title: title.trim(),
        description: fullDescription.trim(),
        shortDescription: shortDescription.trim(),
        targetAmount: target,
        deadline: deadlineDate.toISOString(),
        category,
        coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
        creator: publicKey,
        creatorName: creatorName.trim(),
      })
    } catch (err) {
      setErrorMsg(err.message || 'Creation failed.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-space-600/50 bg-space-800 p-6 shadow-2xl overflow-hidden my-8 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-space-600/30 pb-4">
          <h2 className="text-base font-bold text-white uppercase tracking-widest">Deploy CrowdFundX Escrow</h2>
          <button
            onClick={onClose}
            className="text-mist hover:text-flare-400 focus:outline-none transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Live Cover Preview Panel */}
        <div className="mt-4 h-32 w-full rounded-xl bg-space-900 border border-space-600/30 overflow-hidden relative flex items-center justify-center">
          {imageValid ? (
            <img 
              src={coverImage} 
              alt="Campaign cover preview" 
              className="h-full w-full object-cover animate-fade-in"
            />
          ) : (
            <div className="text-center p-4 space-y-1">
              <p className="text-lg">🖼️</p>
              <p className="text-[10px] text-mist font-semibold uppercase tracking-wider">Live Cover Image Preview</p>
              <p className="text-[9px] text-mist/60">Enter a valid URL in the cover image field below to preview.</p>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Creator Name */}
            <div className="relative">
              <label className="block text-[10px] font-bold text-mist uppercase tracking-widest">Creator Name</label>
              <input
                type="text"
                required
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="e.g. Acme Tech Labs"
                className="mt-1.5 w-full rounded-lg border border-space-600 bg-space-900 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-stellarblue-500 font-semibold"
              />
            </div>

            {/* Public Wallet Key */}
            <div>
              <label className="block text-[10px] font-bold text-mist uppercase tracking-widest">Stellar Wallet</label>
              <input
                type="text"
                readOnly
                value={publicKey || 'Not connected'}
                className="mt-1.5 w-full rounded-lg border border-space-600 bg-space-900 px-3 py-2 font-mono text-[9px] text-stellarblue-400 focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[10px] font-bold text-mist uppercase tracking-widest">Campaign Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Orion Space Sensor Grid"
              maxLength={60}
              className="mt-1.5 w-full rounded-lg border border-space-600 bg-space-900 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-stellarblue-500 font-semibold"
            />
          </div>

          {/* Short description */}
          <div>
            <label className="block text-[10px] font-bold text-mist uppercase tracking-widest">Short Description</label>
            <input
              type="text"
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="1-sentence hook to display on explorer cards..."
              maxLength={120}
              className="mt-1.5 w-full rounded-lg border border-space-600 bg-space-900 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-stellarblue-500"
            />
          </div>

          {/* Full description */}
          <div>
            <label className="block text-[10px] font-bold text-mist uppercase tracking-widest">Full Road Map Details</label>
            <textarea
              required
              rows={4}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Roadmap, milestones, and details..."
              className="mt-1.5 w-full rounded-lg border border-space-600 bg-space-900 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-stellarblue-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Target goal */}
            <div>
              <label className="block text-[10px] font-bold text-mist uppercase tracking-widest">Target Goal</label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="300"
                  className="w-full rounded-lg border border-space-600 bg-space-900 pl-3 pr-12 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-stellarblue-500 font-mono font-bold"
                />
                <span className="absolute right-3 top-2 text-[10px] font-mono font-bold text-mist">XLM</span>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-[10px] font-bold text-mist uppercase tracking-widest">Deadline Date</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-space-600 bg-space-900 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-stellarblue-500 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Category */}
            <div>
              <label className="block text-[10px] font-bold text-mist uppercase tracking-widest">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-space-600 bg-space-900 px-3 py-2 text-xs text-white focus:outline-none cursor-pointer font-bold"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="block text-[10px] font-bold text-mist uppercase tracking-widest">Cover Image URL</label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="mt-1.5 w-full rounded-lg border border-space-600 bg-space-900 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-stellarblue-500 font-mono"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="font-mono text-[10px] text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2">
              {errorMsg}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 border-t border-space-600/30 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-space-600 py-2.5 text-xs font-bold text-mist hover:border-stellarblue-500 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !publicKey}
              className="flex-1 rounded-lg bg-flare-500 py-2.5 text-xs font-bold text-space-950 hover:bg-flare-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Deploying Ledger Escrow…' : 'Deploy Escrow Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
