// src/types/db-types.ts
export type Block = {
    _id?: string;
    number: number;
    hash: string;
    timestamp: Date;
    transactions: string[]; // Array of transaction hashes
    miner: string;
    gasUsed: number;
    gasLimit: number;
  };
  