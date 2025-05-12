// src/components/ecommerce/EcommerceMetrics.tsx
"use client";
import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine } from "@/icons";
import { useLocale } from '@/hooks/useLocale'
import { dictionaries } from '@/lib/i18n/dictionaries'

export const EcommerceMetrics = () => {
  const locale = useLocale()
  const t = dictionaries[locale as keyof typeof dictionaries]
  const [block, setBlock] = useState<{
    number: number;
    timestamp: Date;
    txCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Track mounted state
    
    const fetchData = async () => {
      try {
        const res = await fetch('/en/api/latest-block');
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Invalid content type');
        }
  
        const data = await res.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
  
        if (isMounted) { // Only update state if component is mounted
          setBlock({
            number: data.number,
            timestamp: new Date(data.timestamp),
            txCount: data.txCount || 0
          });
          setError(null);
        }
        
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
  
    // Initial fetch
    fetchData();
  
    // Set up interval (10 seconds)
    const intervalId = setInterval(fetchData, 10000);
  
    // Cleanup function
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array means this runs once on mount
  
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Latest Block Metric */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t.Common['Latest Block']}
            </span>
            {loading ? (
              <div className="h-8 mt-2 w-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
            ) : error ? (
              <p className="mt-2 text-sm text-error-500">{error}</p>
            ) : block ? (
              <>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {block.number.toLocaleString()}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {block.txCount.toLocaleString()} txs
                </p>
              </>
            ) : null}
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            Live
          </Badge>
        </div>
      </div>

      {/* Original Orders Metric (unchanged) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t.Common.Orders}   
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              5,359
            </h4>
          </div>
          <Badge color="error">
            <ArrowDownIcon className="text-error-500" />
            9.05%
          </Badge>
        </div>
      </div>
    </div>
  );
};
