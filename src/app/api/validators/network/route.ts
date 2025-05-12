// app/api/validators/network/route.ts
import { NextResponse } from 'next/server'

const RPC_URL = process.env.RPC_URL || ''

export async function GET() {
  try {
    // Parallelize all RPC calls with proper timeouts
    const [validatorsRes, statusRes, peersRes, blockRes] = await Promise.all([
      fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "istanbul_getValidators",
          params: ["latest"],
          id: 1
        }),
        signal: AbortSignal.timeout(3000)
      }),
      fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "istanbul_status",
          params: [],
          id: 2
        }),
        signal: AbortSignal.timeout(3000)
      }),
      fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "net_peerCount",
          params: [],
          id: 3
        }),
        signal: AbortSignal.timeout(3000)
      }),
      fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 4
        }),
        signal: AbortSignal.timeout(3000)
      })
    ]);

    // Process all responses
    const [validatorsData, statusData, peersData, blockData] = await Promise.all([
      validatorsRes.json(),
      statusRes.json(),
      peersRes.json(),
      blockRes.json()
    ]);

    // Calculate validator participation
    const totalValidators = validatorsData.result?.length || 5;
    const activeValidators = statusData.result 
      ? Object.keys(statusData.result.sealerActivity).length 
      : totalValidators;

    // Get accurate block number from chain head
    const lastBlockNumber = blockData.result 
      ? parseInt(blockData.result, 16) 
      : statusData.result?.numBlocks || 0; // Fallback to consensus numBlocks if needed

    return NextResponse.json({
      peerCount: peersData.result 
        ? parseInt(peersData.result, 16) 
        : 4, // Fallback to your constant
      participationRate: `${activeValidators}/${totalValidators}`,
      lastBlockNumber, // Now using accurate chain head block number
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      peerCount: 4,
      participationRate: "5/5",
      lastBlockNumber: 0, // More appropriate fallback
      updatedAt: new Date().toISOString()
    }, { status: 500 });
  }
}
