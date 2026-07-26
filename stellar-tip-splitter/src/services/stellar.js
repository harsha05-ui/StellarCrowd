// src/lib/stellar.js
//
// All wallet + network logic lives here, separate from UI components.
// Network: Stellar TESTNET only.

import {
  isConnected,
  setAllowed,
  getAddress,
  signTransaction,
} from '@stellar/freighter-api'
import {
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
  Memo,
} from '@stellar/stellar-sdk'

export const HORIZON_TESTNET_URL = 'https://horizon-testnet.stellar.org'
export const FRIENDBOT_URL = 'https://friendbot.stellar.org'

const server = new Horizon.Server(HORIZON_TESTNET_URL)

/**
 * Checks whether the Freighter browser extension is installed at all.
 */
export async function checkFreighterInstalled() {
  const result = await isConnected()
  return !result.error && result.isConnected !== undefined
}

/**
 * Connects to Freighter: requests permission if not already granted,
 * then returns the active public key (address).
 */
export async function connectWallet() {
  const installed = await checkFreighterInstalled()
  if (!installed) {
    throw new Error(
      'Freighter wallet not found. Install the Freighter browser extension and refresh the page.'
    )
  }

  const access = await setAllowed()
  if (access.error) throw new Error(access.error)
  if (!access.isAllowed) {
    throw new Error('Permission to connect was denied in Freighter.')
  }

  const addressResult = await getAddress()
  if (addressResult.error) throw new Error(addressResult.error)

  return addressResult.address
}

/**
 * "Disconnect" — Freighter has no app-side disconnect API (the user
 * controls site access from inside the extension), so we just clear
 * local app state.
 */
export function disconnectWallet() {
  return true
}

/**
 * Fetches the XLM balance for a given public key on testnet.
 * Returns "0" (as a string) for unfunded accounts instead of throwing.
 */
export async function fetchXlmBalance(publicKey) {
  try {
    const account = await server.loadAccount(publicKey)
    const native = account.balances.find((b) => b.asset_type === 'native')
    return native ? native.balance : '0'
  } catch (err) {
    if (err?.response?.status === 404) {
      return '0'
    }
    throw err
  }
}

/**
 * Funds a brand-new testnet account using Friendbot.
 */
export async function fundWithFriendbot(publicKey) {
  const res = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Friendbot funding failed: ${body || res.statusText}`)
  }
  return res.json()
}

/**
 * Builds, signs (via Freighter), and submits a transaction that simulates investing in a campaign.
 * Performs a self-payment with custom memo text indicating investment details.
 */
export async function sendCrowdfundInvestment(senderPublicKey, amount, campaignId) {
  const sourceAccount = await server.loadAccount(senderPublicKey)

  const txBuilder = new TransactionBuilder(sourceAccount, {
    fee: String(BASE_FEE),
    networkPassphrase: Networks.TESTNET,
  })

  txBuilder
    .addOperation(
      Operation.payment({
        destination: senderPublicKey,
        asset: Asset.native(),
        amount: String(amount),
      })
    )
    .addMemo(Memo.text(`CF_INVEST:${campaignId}`.slice(0, 28)))

  const transaction = txBuilder.setTimeout(60).build()
  const xdr = transaction.toXDR()

  const signResult = await signTransaction(xdr, {
    networkPassphrase: Networks.TESTNET,
  })
  if (signResult.error) throw new Error(signResult.error)

  const signedTx = TransactionBuilder.fromXDR(signResult.signedTxXdr, Networks.TESTNET)
  const submitResult = await server.submitTransaction(signedTx)

  return { hash: submitResult.hash, ledger: submitResult.ledger }
}

/**
 * Builds, signs (via Freighter), and submits a transaction that simulates a creator withdrawal.
 */
export async function sendCrowdfundWithdraw(creatorPublicKey, campaignId) {
  const sourceAccount = await server.loadAccount(creatorPublicKey)

  const txBuilder = new TransactionBuilder(sourceAccount, {
    fee: String(BASE_FEE),
    networkPassphrase: Networks.TESTNET,
  })

  txBuilder
    .addOperation(
      Operation.payment({
        destination: creatorPublicKey,
        asset: Asset.native(),
        amount: '0.0000100', // Nominal self-payment
      })
    )
    .addMemo(Memo.text(`CF_WITHDRAW:${campaignId}`.slice(0, 28)))

  const transaction = txBuilder.setTimeout(60).build()
  const xdr = transaction.toXDR()

  const signResult = await signTransaction(xdr, {
    networkPassphrase: Networks.TESTNET,
  })
  if (signResult.error) throw new Error(signResult.error)

  const signedTx = TransactionBuilder.fromXDR(signResult.signedTxXdr, Networks.TESTNET)
  const submitResult = await server.submitTransaction(signedTx)

  return { hash: submitResult.hash, ledger: submitResult.ledger }
}

/**
 * Builds, signs (via Freighter), and submits a transaction that simulates an investor refund.
 */
export async function sendCrowdfundRefund(investorPublicKey, campaignId) {
  const sourceAccount = await server.loadAccount(investorPublicKey)

  const txBuilder = new TransactionBuilder(sourceAccount, {
    fee: String(BASE_FEE),
    networkPassphrase: Networks.TESTNET,
  })

  txBuilder
    .addOperation(
      Operation.payment({
        destination: investorPublicKey,
        asset: Asset.native(),
        amount: '0.0000100', // Nominal self-payment
      })
    )
    .addMemo(Memo.text(`CF_REFUND:${campaignId}`.slice(0, 28)))

  const transaction = txBuilder.setTimeout(60).build()
  const xdr = transaction.toXDR()

  const signResult = await signTransaction(xdr, {
    networkPassphrase: Networks.TESTNET,
  })
  if (signResult.error) throw new Error(signResult.error)

  const signedTx = TransactionBuilder.fromXDR(signResult.signedTxXdr, Networks.TESTNET)
  const submitResult = await server.submitTransaction(signedTx)

  return { hash: submitResult.hash, ledger: submitResult.ledger }
}

/**
 * Quick validity check for a Stellar public key.
 */
export function isValidStellarAddress(address) {
  return typeof address === 'string' && /^G[A-Z0-9]{55}$/.test(address.trim())
}
