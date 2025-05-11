// src/lib/web3/health.ts
export async function checkRPCHealth() {
    try {
      const block = await publicClient.getBlock()
      return block.number !== undefined
    } catch {
      return false
    }
  }
  