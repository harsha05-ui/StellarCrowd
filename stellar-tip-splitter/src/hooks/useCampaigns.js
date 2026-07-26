// src/hooks/useCampaigns.js
import { useState, useEffect, useCallback } from 'react'
import {
  getCampaigns,
  createCampaign,
  investInCampaign,
  withdrawCampaignFunds,
  claimInvestorRefund,
  addCampaignComment,
  toggleFavoriteCampaign,
} from '../services/crowdfunding'

export default function useCampaigns(addToast) {
  const [campaigns, setCampaigns] = useState([])

  const loadCampaigns = useCallback(() => {
    try {
      const data = getCampaigns()
      setCampaigns(data)
    } catch (err) {
      console.error('Failed to load campaigns:', err)
    }
  }, [])

  useEffect(() => {
    loadCampaigns()
  }, [loadCampaigns])

  const create = useCallback((campaignData) => {
    try {
      const created = createCampaign(campaignData)
      loadCampaigns()
      if (addToast) addToast(`Campaign "${created.title}" launched successfully!`, 'success')
      return created
    } catch (err) {
      const errMsg = err.message || 'Failed to create campaign.'
      if (addToast) addToast(errMsg, 'error')
      throw err
    }
  }, [loadCampaigns, addToast])

  const invest = useCallback((campaignId, investorAddress, amount, txHash) => {
    try {
      const updated = investInCampaign(campaignId, investorAddress, amount, txHash)
      loadCampaigns()
      return updated
    } catch (err) {
      const errMsg = err.message || 'Investment failed.'
      if (addToast) addToast(errMsg, 'error')
      throw err
    }
  }, [loadCampaigns, addToast])

  const withdraw = useCallback((campaignId, creatorAddress) => {
    try {
      const updated = withdrawCampaignFunds(campaignId, creatorAddress)
      loadCampaigns()
      if (addToast) addToast(`Successfully claimed campaign funds!`, 'success')
      return updated
    } catch (err) {
      const errMsg = err.message || 'Withdrawal failed.'
      if (addToast) addToast(errMsg, 'error')
      throw err
    }
  }, [loadCampaigns, addToast])

  const refund = useCallback((campaignId, investorAddress) => {
    try {
      const updated = claimInvestorRefund(campaignId, investorAddress)
      loadCampaigns()
      if (addToast) addToast('Refund successfully claimed!', 'success')
      return updated
    } catch (err) {
      const errMsg = err.message || 'Refund claim failed.'
      if (addToast) addToast(errMsg, 'error')
      throw err
    }
  }, [loadCampaigns, addToast])

  const addComment = useCallback((campaignId, authorName, text) => {
    try {
      const updated = addCampaignComment(campaignId, authorName, text)
      loadCampaigns()
      if (addToast) addToast('Comment posted.', 'success')
      return updated
    } catch (err) {
      const errMsg = err.message || 'Failed to add comment.'
      if (addToast) addToast(errMsg, 'error')
      throw err
    }
  }, [loadCampaigns, addToast])

  const toggleFavorite = useCallback((campaignId, userAddress) => {
    try {
      const updated = toggleFavoriteCampaign(campaignId, userAddress)
      loadCampaigns()
      const isFav = updated.favorites.includes(userAddress)
      if (addToast) {
        addToast(isFav ? 'Added to favorites.' : 'Removed from favorites.', 'success')
      }
      return updated
    } catch (err) {
      const errMsg = err.message || 'Failed to update favorites.'
      if (addToast) addToast(errMsg, 'error')
      throw err
    }
  }, [loadCampaigns, addToast])

  return {
    campaigns,
    loadCampaigns,
    create,
    invest,
    withdraw,
    refund,
    addComment,
    toggleFavorite,
  }
}
