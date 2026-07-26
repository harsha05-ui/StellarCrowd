// src/components/CreateCampaignModal.jsx
import React, { useState, useEffect } from 'react'

const CATEGORIES = ['Technology', 'Environment', 'Art', 'Community']

export default function CreateCampaignModal({ onClose, onCreate, publicKey }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [coverImage, setCoverImage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Set default deadline date (e.g., 7 days from now)
  useEffect(() => {
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 7)
    // Format to yyyy-MM-dd
    const year = defaultDate.getFullYear()
    const month = String(defaultDate.getMonth() + 1).padStart(2, '0')
    const day = String(defaultDate.getDate()).padStart(2, '0')
    setDeadline(`${year}-${month}-${day}`)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!publicKey) {
      setErrorMsg('Please connect your wallet first.')
      return
    }

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Title and description are required.')
      return
    }

    const target = parseFloat(targetAmount)
    if (isNaN(target) || target <= 0) {
      setErrorMsg('Please enter a valid target amount greater than zero.')
      return
    }

    const deadlineDate = new Date(deadline)
    if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
      setErrorMsg('Please select a valid future deadline.')
      return
    }

    try {
      // Create campaign in local state DB
      onCreate({
        title: title.trim(),
        description: description.trim(),
        targetAmount: target,
        deadline: deadlineDate.toISOString(),
        category,
        coverImage: coverImage.trim() || undefined, // undefined will fallback to default in crowdfunding.js
        creator: publicKey,
      })
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create campaign.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-space-600 bg-space-800 p-5 shadow-2xl overflow-hidden sm:p-6 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-space-600/50 pb-4">
          <h2 className="text-lg font-bold text-white">Create New Campaign</h2>
          <button
            onClick={onClose}
            className="text-mist hover:text-flare-400 focus:outline-none"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Creator Display */}
          <div>
            <label className="block text-xs font-semibold text-mist uppercase tracking-wider">Creator Address</label>
            <input
              type="text"
              readOnly
              value={publicKey || 'Wallet not connected'}
              className="mt-1.5 w-full rounded-lg border border-space-600 bg-space-900 px-3 py-2 font-mono text-[10px] text-mist focus:outline-none cursor-not-allowed"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-mist uppercase tracking-wider">Campaign Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Solar Energy Water Filter"
              maxLength={60}
              className="mt-1.5 w-full rounded-lg border border-space-600 bg-space-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-stellarblue-500/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-mist uppercase tracking-wider">Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed explanation of your fundraising campaign goals and execution plans..."
              className="mt-1.5 w-full rounded-lg border border-space-600 bg-space-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-stellarblue-500/50"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Target XLM */}
            <div>
              <label className="block text-xs font-semibold text-mist uppercase tracking-wider">Funding Target</label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="500"
                  className="w-full rounded-lg border border-space-600 bg-space-900 pl-3 pr-12 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-stellarblue-500/50 font-mono"
                />
                <span className="absolute right-3 top-2.5 text-xs font-mono font-bold text-mist">XLM</span>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-semibold text-mist uppercase tracking-wider">Deadline Date</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-space-600 bg-space-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-stellarblue-500/50 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-mist uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-space-600 bg-space-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-stellarblue-500/50 cursor-pointer"
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
              <label className="block text-xs font-semibold text-mist uppercase tracking-wider">Cover Image URL (Optional)</label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-1.5 w-full rounded-lg border border-space-600 bg-space-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-stellarblue-500/50"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="font-mono text-xs text-red-400 text-center bg-red-500/5 border border-red-500/10 rounded-lg py-2">
              {errorMsg}
            </p>
          )}

          {/* Submit */}
          <div className="flex gap-3 border-t border-space-600/50 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-space-600 py-2.5 text-xs font-bold text-mist hover:border-stellarblue-500 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!publicKey}
              className="flex-1 rounded-lg bg-flare-500 py-2.5 text-xs font-bold text-space-950 hover:bg-flare-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Launch Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
