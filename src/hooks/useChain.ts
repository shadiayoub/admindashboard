// src/hooks/useChain.ts
'use client'
import { CHAIN_CONFIG } from '@/lib/web3/config'

export function useChain() {
  const isCorrectChain = (chainId?: number) => 
    chainId === CHAIN_CONFIG.id

  const switchChain = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${CHAIN_CONFIG.id.toString(16)}` }],
      })
    } catch (error) {
      // Handle chain switch error
    }
  }

  return { isCorrectChain, switchChain }
}
