// src/utils/validators.ts
import { JsonRpcProvider } from "@ethersproject/providers";

//const ISTANBUL_SEAL_TOPIC = "0x1d2ca6af5f0d3a9c5a5f0d3a9c5a5f0d3a9c5a5f0d3a9c5a5f0d3a9c5a5f0d3a9c5a5"; // Verify this!

export const getSealCount = async (
  provider: JsonRpcProvider, 
  validator: string,
  sampleBlocks = 1000 // Increased from 100 for better stats
): Promise<number> => {
  try {
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - sampleBlocks);
    
    const logs = await provider.getLogs({
      fromBlock,
      toBlock: 'latest',
      address: validator,
      //topics: [ISTANBUL_SEAL_TOPIC]
    });
    return logs.length;
  } catch (error) {
    console.error(`Seal count error for ${validator}:`, error);
    return 0;
  }
};

export const calculateUptime = async (
  provider: JsonRpcProvider,
  validator: string,
  sampleBlocks = 1000
): Promise<number> => {
  const [totalBlocks, sealedBlocks] = await Promise.all([
    Math.min(sampleBlocks, await provider.getBlockNumber()),
    getSealCount(provider, validator, sampleBlocks)
  ]);
  return (sealedBlocks / Math.max(1, totalBlocks)) * 100;
};
