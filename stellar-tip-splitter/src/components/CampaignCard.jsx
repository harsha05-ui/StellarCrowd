// src/components/CampaignCard.jsx
import React from 'react'
import { getDaysRemaining, getCategoryStyles } from '../utils/helpers'

export default function CampaignCard({ campaign, onClick }) {
  const daysLeft = getDaysRemaining(campaign.deadline)
  const percent = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100))
  const categoryClass = getCategoryStyles(campaign.category)
  const hasEnded = new Date(campaign.deadline) <= new Date()

  // Dynamic status badges
  const statusLabels = {
    active: 'Active',
    successful: 'Success',
    failed: 'Failed'
  }

  const statusColors = {
    active: 'bg-stellarblue-500/10 text-stellarblue-400 border-stellarblue-500/20',
    successful: 'bg-green-500/10 text-green-400 border-green-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20'
  }

  // Initial letter for creator avatar
  const creatorInitial = campaign.creatorName ? campaign.creatorName.charAt(0).toUpperCase() : 'A'

  return (
    <div 
      onClick={() => onClick(campaign)}
      className="glass-card hover-card-glow rounded-2xl overflow-hidden flex flex-col cursor-pointer shadow-md select-none border border-space-600/30"
    >
      {/* Cover Image Header */}
      <div className="relative h-48 w-full bg-space-950">
        <img 
          src={campaign.coverImage} 
          alt={campaign.title} 
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80'
          }}
        />
        {/* Category & Status Badges */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${categoryClass}`}>
            {campaign.category}
          </span>
          <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${statusColors[campaign.status]}`}>
            {statusLabels[campaign.status]}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5 space-y-4">
        {/* Header Text & Creator info */}
        <div className="flex-1 space-y-2">
          <h4 className="text-base font-bold text-white line-clamp-1 hover:text-stellarblue-400 transition">
            {campaign.title}
          </h4>
          
          {/* Creator Profile line */}
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stellarblue-500/20 border border-stellarblue-500/30 text-[10px] font-bold text-stellarblue-400">
              {creatorInitial}
            </span>
            <span className="text-[10px] font-semibold text-mist hover:text-white transition">
              By {campaign.creatorName || 'Anonymous'}
            </span>
          </div>

          <p className="text-xs text-mist leading-relaxed line-clamp-2 pt-1.5">
            {campaign.shortDescription || campaign.description}
          </p>
        </div>

        {/* Progress metrics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold font-mono">
            <span className="text-white font-bold">{campaign.raisedAmount.toLocaleString()} XLM</span>
            <span className="text-mist">{percent}% raised</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-space-700 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 animate-progress ${
                campaign.status === 'successful' ? 'bg-green-500' : campaign.status === 'failed' ? 'bg-red-500' : 'bg-stellarblue-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center text-xs border-t border-space-600/30 pt-3">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-mist">Target</p>
            <p className="font-bold text-white font-mono">{campaign.targetAmount.toLocaleString()} XLM</p>
          </div>
          <div className="text-right">
            {hasEnded ? (
              <>
                <p className="text-[9px] uppercase tracking-wider text-mist">Status</p>
                <p className={`font-semibold ${campaign.status === 'successful' ? 'text-green-400' : 'text-red-400'}`}>
                  {campaign.status === 'successful' ? 'Completed' : 'Expired'}
                </p>
              </>
            ) : (
              <>
                <p className="text-[9px] uppercase tracking-wider text-mist">Remaining</p>
                <p className="font-bold text-flare-400">{daysLeft} {daysLeft === 1 ? 'Day' : 'Days'}</p>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
