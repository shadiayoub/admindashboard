// lib/web3/config.ts
export const CHAIN_CONFIG = {
    id: Number(process.env.CHAINID || 336699),
    name: 'Chayn Private Chain',
    rpcUrls: {
      default: { 
        http: [process.env.RPC_URL!],
        webSocket: [process.env.WS_RPC_URL!] 
      },
      public: {
        http: [process.env.NEXT_PUBLIC_RPC_URL!],
        webSocket: [] // Don't expose WS publicly
      }
    },
    nativeCurrency: {
      name: 'Theta',
      symbol: 'THETA',
      decimals: 18
    }
  } as const;
  