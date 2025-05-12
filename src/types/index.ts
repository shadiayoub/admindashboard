// src/types/index.ts
export interface ValidatorHealth {
    address: string;
    blocksProposed: number;
    blocksSealed: number;
    uptime: number;
    isActive: boolean;
  }
  