// src/hooks/useWallet.js
import { useState, useEffect, useCallback } from 'react'
import {
  connectWallet,
  disconnectWallet,
  fetchXlmBalance,
  fundWithFriendbot,
} from '../services/stellar'

export default function useWallet(addToast) {
  const [publicKey, setPublicKey] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')
  const [balance, setBalance] = useState('0')
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [funding, setFunding] = useState(false)

  const refreshBalance = useCallback(async (key) => {
    if (!key) return
    if (key.startsWith('GBSANDBOX')) {
      const savedBal = localStorage.getItem('sandbox_xlm_balance') || '10000'
      setBalance(savedBal)
      return
    }
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

  // Auto refresh balance when wallet connects
  useEffect(() => {
    if (publicKey) {
      refreshBalance(publicKey)
    }
  }, [publicKey, refreshBalance])

  const connect = async () => {
    setConnecting(true)
    setConnectError('')
    try {
      const address = await connectWallet()
      setPublicKey(address)
      if (addToast) addToast('Freighter wallet connected successfully!', 'success')
      return address
    } catch (err) {
      console.warn('Freighter connect failed, falling back to local sandbox account:', err.message)
      const sandboxKey = 'GBSANDBOXWALLET1234567890123456789012345678901234567890'
      setPublicKey(sandboxKey)
      setBalance('10000')
      if (addToast) addToast('Freighter wallet not detected. Connecting to a Sandbox Simulation Account!', 'info')
      return sandboxKey
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = () => {
    disconnectWallet()
    setPublicKey(null)
    setBalance('0')
    if (addToast) addToast('Wallet disconnected.', 'info')
  }

  const fund = async () => {
    if (!publicKey) return
    setFunding(true)
    try {
      if (publicKey.startsWith('GBSANDBOX')) {
        await new Promise(r => setTimeout(r, 600))
        const current = parseFloat(localStorage.getItem('sandbox_xlm_balance') || '10000')
        const updated = (current + 10000).toString()
        localStorage.setItem('sandbox_xlm_balance', updated)
        setBalance(updated)
        if (addToast) addToast('Successfully funded account with 10,000 Mock XLM!', 'success')
        return
      }
      await fundWithFriendbot(publicKey)
      await refreshBalance(publicKey)
      if (addToast) addToast('Successfully funded account with 10,000 Testnet XLM!', 'success')
    } catch (err) {
      const errMsg = err.message || 'Friendbot funding failed.'
      setConnectError(errMsg)
      if (addToast) addToast(errMsg, 'error')
    } finally {
      setFunding(false)
    }
  }

  return {
    publicKey,
    connecting,
    connectError,
    balance,
    balanceLoading,
    funding,
    connect,
    disconnect,
    fund,
    refreshBalance,
  }
}
