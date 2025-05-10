'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { Web3Modal } from '@web3modal/standalone'

type WalletProvider = {
  request: (args: { method: string }) => Promise<string[]>
  disconnect?: () => void
  on?: (event: string, callback: (accounts: string[]) => void) => void
  removeListener?: (event: string, callback: (accounts: string[]) => void) => void
}

type WalletContextType = {
  address: string | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {}
})

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<WalletProvider | null>(null)

  const connect = async () => {
    try {
      // Handle MetaMask
      if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        setAddress(accounts[0])
        setProvider(window.ethereum)
        return
      }

      // Handle WalletConnect
      const web3Modal = new Web3Modal({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
        walletConnectVersion: 2
      })
      
      // Correct way to get provider with Web3Modal v2
      const web3ModalProvider = await web3Modal.openModal()
      if (!web3ModalProvider) return
      
      // Initialize provider properly
      const accounts = await web3ModalProvider.enable()
      setAddress(accounts[0])
      setProvider(web3ModalProvider)

    } catch (error) {
      console.error("Connection failed:", error)
    }
  }

  const disconnect = () => {
    provider?.disconnect?.()
    setAddress(null)
    setProvider(null)
  }

  useEffect(() => {
    if (!provider?.on) return
    
    const handleAccountsChanged = (accounts: string[]) => {
      accounts.length === 0 ? disconnect() : setAddress(accounts[0])
    }
    
    provider.on('accountsChanged', handleAccountsChanged)
    return () => {
      provider.removeListener?.('accountsChanged', handleAccountsChanged)
    }
  }, [provider])

  return (
    <WalletContext.Provider value={{ address, isConnected: !!address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
