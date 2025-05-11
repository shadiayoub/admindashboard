// lib/web3/error-handler.ts
export function handleRPCError(error: unknown) {
    if (error instanceof Error && error.message.includes('chain')) {
      console.error('Chain mismatch error')
      // Trigger chain switch prompt
    }
    // Other error handling
  }
  