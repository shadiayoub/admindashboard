// src/types/rpc.d.ts
import { JsonRpcProvider } from "@ethersproject/providers";

declare module "@/utils/rpc" {
  export const getPrivateProvider: () => JsonRpcProvider;
  export const callRpc: (method: string, params?: any[]) => Promise<any>;
}
