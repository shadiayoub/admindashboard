// src/app/[locale]/(admin)/validators/page.tsx
"use client";
import { use, useEffect, useState } from 'react';
import { ValidatorCard } from "./_components/ValidatorCard";
import { useValidatorHealth } from "@/hooks/useValidatorHealth";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { Loader } from "@/components/common/Loader";
import { useLocale } from '@/hooks/useLocale';
import { dictionaries } from '@/lib/i18n/dictionaries';

type PageProps = {
  params: {
    locale: string;
  };
};

export default function ValidatorDashboard() {
  const locale = useLocale();
  const t = dictionaries[locale as keyof typeof dictionaries].Common.validators;
  const [provider, setProvider] = useState<Web3Provider | null>(null);
  const { validators = [], loading } = useValidatorHealth(provider); // Default empty array

  useEffect(() => {
    const testConnection = async () => {
      const testProvider = new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
      const validators = await testProvider.send("istanbul_getValidators", ["latest"]);
      console.log("Retrieved validators:", validators);
    };
    testConnection();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
  {t.validatorHealth}
</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{validators.map((validator) => (
  <ValidatorCard 
    key={validator.address} 
    validator={validator} 
  />
))}
      </div>
    </div>
  );
}
