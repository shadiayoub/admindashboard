// src/utils/rpc.ts
import { JsonRpcProvider } from "@ethersproject/providers";

/**
 * Get configured provider for private EVM chain
 */
export const getPrivateProvider = (): JsonRpcProvider => {
  if (!process.env.NEXT_PUBLIC_RPC_URL) {
    throw new Error("Missing NEXT_PUBLIC_RPC_URL in environment");
  }

  return new JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL,
    {
      name: "custom-chain",
      chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "1337"),
      ensAddress: undefined, // Disable ENS for private chains
    }
  );
};

/**
 * Direct RPC call wrapper
 */
export const callRpc = async (method: string, params: any[] = []) => {
  const provider = getPrivateProvider();
  return provider.send(method, params);
};
