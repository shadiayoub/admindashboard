// src/types/global.d.ts
interface EthereumProvider {
  isMetaMask?: boolean
  request: (args: { method: string }) => Promise<string[]>
  on: (event: string, callback: (accounts: string[]) => void) => void
  removeListener: (event: string, callback: (accounts: string[]) => void) => void
  disconnect?: () => void
  enable?: () => Promise<string[]>
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}
