// types.d.ts
export interface ValidatorHealth {
  address: `0x${string}`;
  blocksProposed: number;
  blocksSealed: number;
  uptime: number;
  lastSeen: Date;
  isActive?: boolean; // Optional for UI badges
}

export type RpcProvider = JsonRpcProvider | Web3Provider;
