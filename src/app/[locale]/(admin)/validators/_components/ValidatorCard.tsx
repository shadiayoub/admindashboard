"use client";
import { memo } from "react";
import { ValidatorHealth } from "@/types";
import { BoxIconLine } from "@/icons";
import Badge from "@/components/ui/badge/Badge";
import { useLocale } from "@/hooks/useLocale";
import { dictionaries } from "@/lib/i18n/dictionaries";

interface ValidatorCardProps {
  validator: ValidatorHealth;
}

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
      {label}
    </p>
    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
      {value}
    </p>
  </div>
);

export const ValidatorCard = memo(
  ({ validator }: ValidatorCardProps) => {
    const locale = useLocale();
    const t = dictionaries[locale as keyof typeof dictionaries]?.Common?.validators || {
      proposed: "Proposed",
      sealed: "Sealed",
      uptime: "Uptime",
      active: "Active",
      inactive: "Inactive"
    };

    if (!validator) return null;

    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
        {/* Header - Updated colors */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <BoxIconLine className="size-5 text-blue-600 dark:text-blue-400" /> {/* Changed from primary */}
            <div>
              <h3
                className="max-w-[180px] truncate font-mono text-sm font-medium text-gray-800 dark:text-gray-100 md:max-w-[220px]"
                title={validator.address}
              >
                {validator.address}
              </h3>
              <Badge
                color={validator.isActive ? "success" : "error"}
                className="mt-1"
              >
                {validator.isActive ? t.active : t.inactive}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats - Updated label contrast */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <Stat label={t.proposed} value={validator.blocksProposed} />
          <Stat label={t.sealed} value={validator.blocksSealed} />
          <Stat label={t.uptime} value={`${validator.uptime.toFixed(2)}%`} />
        </div>
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.validator?.address === next.validator?.address &&
      prev.validator?.blocksProposed === next.validator?.blocksProposed &&
      prev.validator?.blocksSealed === next.validator?.blocksSealed &&
      Math.abs((prev.validator?.uptime || 0) - (next.validator?.uptime || 0)) < 0.1
    );
  }
);

ValidatorCard.displayName = "ValidatorCard";