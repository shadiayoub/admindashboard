// lib/WalletService.ts
export class WalletService {
  private static STORAGE_KEY = 'wallet_connection'

  static async connect(): Promise<string> {
    if (!this.isMetaMaskInstalled()) {
      window.open('https://metamask.io/download.html', '_blank')
      throw new Error('MetaMask not installed')
    }
    
    const accounts = await window.ethereum!.request({ 
      method: 'eth_requestAccounts' 
    })
    
    localStorage.setItem(this.STORAGE_KEY, accounts[0])
    return accounts[0]
  }

  static async checkExistingConnection(): Promise<string | null> {
    if (!this.isMetaMaskInstalled()) return null
    
    const savedAddress = localStorage.getItem(this.STORAGE_KEY)
    if (!savedAddress) return null

    try {
      const accounts = await window.ethereum!.request({ 
        method: 'eth_accounts' 
      })
      if (accounts.includes(savedAddress)) {
        return savedAddress
      }
    } catch (error) {
      console.error('Connection check failed:', error)
    }
    
    localStorage.removeItem(this.STORAGE_KEY)
    return null
  }

  static async disconnect(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY)
    // Optional: Reset MetaMask connection
    try {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {})
      }
    } catch (error) {
      console.error('Disconnection cleanup error:', error)
    }
  }

  static isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && !!window.ethereum?.isMetaMask
  }
}
