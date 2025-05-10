// types/ethereum.d.ts
import { Ethereum } from '@web3modal/standalone'

declare global {
  interface Window {
    ethereum?: Ethereum & {
      isMetaMask?: boolean
      request: (args: { method: string }) => Promise<string[]>
      on: (event: string, callback: (accounts: string[]) => void) => void
      removeListener: (event: string, callback: (accounts: string[]) => void) => void
      disconnect?: () => void
    }
  }
}
