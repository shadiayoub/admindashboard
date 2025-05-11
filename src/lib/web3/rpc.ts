// lib/web3/rpc.ts
import { createPublicClient, createWalletClient, http, webSocket } from 'viem'
import { CHAIN_CONFIG } from './config'

export const publicClient = createPublicClient({
  chain: CHAIN_CONFIG,
  transport: http(CHAIN_CONFIG.rpcUrls.default.http[0])
})

export const wsClient = createPublicClient({
  chain: CHAIN_CONFIG,
  transport: webSocket(CHAIN_CONFIG.rpcUrls.default.webSocket[0])
})

export const walletClient = createWalletClient({
  chain: CHAIN_CONFIG,
  transport: http(CHAIN_CONFIG.rpcUrls.default.http[0])
})
