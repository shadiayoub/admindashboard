// app/api/validators/[address]/route.ts
import { NextResponse } from 'next/server'

const RPC_URL = process.env.RPC_URL || 'http://157.180.16.140:22000'

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    // Get both status and validators in parallel
    const [statusRes, validatorsRes] = await Promise.all([
      fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "istanbul_status",
          params: [],
          id: 1
        }),
        signal: AbortSignal.timeout(3000)
      }),
      fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "istanbul_getValidators",
          params: ["latest"],
          id: 2
        }),
        signal: AbortSignal.timeout(3000)
      })
    ])

    const [statusData, validatorsData] = await Promise.all([
      statusRes.json(),
      validatorsRes.json()
    ])

    // Verify validator exists
    const isValidator = validatorsData.result?.includes(params.address)
    if (!isValidator) {
      return NextResponse.json(
        { error: "Address is not a validator" },
        { status: 404 }
      )
    }

    const validatorActivity = statusData.result?.sealerActivity?.[params.address] || 0
    const totalBlocks = statusData.result?.numBlocks || 1

    return NextResponse.json({
      address: params.address,
      blocksSealed: validatorActivity,
      uptime: (validatorActivity / totalBlocks) * 100,
      status: validatorActivity > 0 ? 'active' : 'inactive',
      consecutiveMissed: totalBlocks - validatorActivity,
      lastSealedBlock: statusData.result?.lastBlock?.[params.address] || 'Not available',
      updatedAt: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: "Failed to fetch validator data",
        details: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
