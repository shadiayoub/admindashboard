'use client'
import SignInForm from "@/components/auth/SignInForm";
import { useLocale } from '@/hooks/useLocale'
import { dictionaries } from '@/lib/i18n/dictionaries'
import React from "react";

export default function SignIn() {
  const locale = useLocale()
  const t = dictionaries[locale as keyof typeof dictionaries]
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          {t.Common.signIn}
        </h3>
        <div className="space-y-6">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
