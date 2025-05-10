// src/components/auth/WalletConnectButton.tsx
'use client'
import { useState, useEffect } from 'react'
import { WalletService } from '@/lib/WalletService'

export function WalletConnectButton() {
  const [address, setAddress] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const savedAddress = await WalletService.checkExistingConnection()
        if (savedAddress) setAddress(savedAddress)
      } catch (error) {
        console.error('Connection check error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkConnection()

    // Add account change listener
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // Disconnected from MetaMask
        handleDisconnect()
      } else if (address && !accounts.includes(address)) {
        // Account changed
        setAddress(accounts[0])
        localStorage.setItem('wallet_connection', accounts[0])
      }
    }

    if (window.ethereum?.on) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [address])

  const handleConnect = async () => {
    setError('')
    try {
      const accounts = await WalletService.connect()
      setAddress(accounts)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDisconnect = async () => {
    try {
      await WalletService.disconnect()
      setAddress(null)
    } catch (err: any) {
      setError('Disconnect failed')
    }
  }

  if (loading) {
    return (
      <button className="px-4 py-2 bg-gray-200 rounded-lg text-gray-600">
        Loading...
      </button>
    )
  }

  return (
    <div className="relative">
      <button 
        onClick={address ? handleDisconnect : handleConnect}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2"
      >
        {address ? (
          <>
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </>
        ) : (
          'Connect Wallet'
        )}
      </button>
      
      {error && (
        <div className="absolute top-full mt-2 left-0 bg-red-100 text-red-700 px-3 py-1 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
