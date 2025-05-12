import { JsonRpcProvider } from "@ethersproject/providers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ValidatorHealth } from "@/types";

export const useValidatorHealth = () => {
  const [state, setState] = useState<{
    validators: ValidatorHealth[];
    loading: boolean;
  }>({
    validators: [],
    loading: true
  });

  const provider = useMemo(() => new JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL,
    parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "361")
  ), []);

  const fetchValidators = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const addresses = await provider.send("istanbul_getValidators", ["latest"]);
      
      setState({
        validators: addresses.map((address: string) => ({
          address,
          blocksProposed: 0, // Will implement later> blocksProposed: await countProposals(address),
          blocksSealed: 0,   // Will implement later> blocksSealed: await countSeals(address),
          uptime: 100,       // Default to 100% for now> uptime: await calculateRealUptime(address)
          isActive: true     // Assume active by default
        })),
        loading: false
      });
    } catch (error) {
      console.error("Validator fetch failed:", error);
      setState({
        validators: [],
        loading: false
      });
    }
  }, [provider]);

  useEffect(() => {
    fetchValidators();
    const interval = setInterval(fetchValidators, 30000);
    return () => clearInterval(interval);
  }, [fetchValidators]);

  return state;
};
