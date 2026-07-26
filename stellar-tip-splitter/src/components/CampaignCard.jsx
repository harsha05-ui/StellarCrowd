// src/components/CampaignCard.jsx
import React from 'react'
import { getDaysRemaining, getCategoryStyles } from '../utils/helpers'

export default function CampaignCard({ campaign, onClick }) {
  const daysLeft = getDaysRemaining(campaign.deadline)
  const percent = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100))
  const categoryClass = getCategoryStyles(campaign.category)
  const hasEnded = new Date(campaign.deadline) <= new Date()

  const statusLabels = {
    active: 'Active',
    successful: 'Success',
    failed: 'Failed'
  }

  const statusColors = {
    active: 'bg-stellarblue-500/20 text-stellarblue-400 border-stellarblue-500/30',
    successful: 'bg-green-500/20 text-green-400 border-green-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  return (
    <div 
      onClick={() => onClick(campaign)}
      className="hover-card-glow flex flex-col overflow-hidden rounded-xl border border-space-600 bg-space-800 cursor-pointer"
    >
      {/* Cover Image */}
      <div className="relative h-44 w-full bg-space-950">
        <img 
          src={campaign.coverImage} 
          alt={campaign.title} 
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80'
          }}
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${categoryClass}`}>
            {campaign.category}
          </span>
          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColors[campaign.status]}`}>
            {statusLabels[campaign.status]}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex-1">
          <h3 className="text-base font-bold text-white line-clamp-1 hover:text-stellarblue-400">
            {campaign.title}
          </h3>
          <p className="mt-1 text-[10px] text-stellarblue-400 font-semibold font-mono uppercase">
            By {campaign.creatorName || 'Anonymous'}
          </p>
          <p className="mt-2 text-xs text-mist line-clamp-2 leading-relaxed">
            {campaign.description}
          </p>
        </div>

        {/* Progress Metrics */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-white font-mono">{campaign.raisedAmount.toLocaleString()} XLM</span>
            <span className="text-mist font-mono">{percent}% raised</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-space-700 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                campaign.status === 'successful' ? 'bg-green-500' : campaign.status === 'failed' ? 'bg-red-500' : 'bg-stellarblue-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="mt-4 flex items-center justify-between border-t border-space-600/50 pt-3 text-xs">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-mist">Target</p>
            <p className="mt-0.5 font-bold font-mono text-white">{campaign.targetAmount.toLocaleString()} XLM</p>
          </div>
          <div className="text-right">
            {hasEnded ? (
              <>
                <p className="text-[10px] uppercase tracking-wider text-mist">Ended</p>
                <p className="mt-0.5 font-semibold text-flare-400">
                  {campaign.status === 'successful' ? 'Fully Funded' : 'Expired'}
                </p>
              </>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-wider text-mist">Remaining</p>
                <p className="mt-0.5 font-bold text-flare-400">{daysLeft} {daysLeft === 1 ? 'day' : 'days'}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
