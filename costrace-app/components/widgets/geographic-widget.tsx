"use client";

import type { CostByCountryPoint } from "@/api/analytics";
import { getCountryFlag } from "@/lib/country-flags";
import { ArrowRight, Globe } from "lucide-react";
import Link from "next/link";

interface GeographicWidgetProps {
  data: CostByCountryPoint[];
  loading?: boolean;
}

export function GeographicWidget({ data, loading }: GeographicWidgetProps) {
  // Get top 5 countries by cost
  const topCountries = data.slice(0, 5);
  const totalCost = data.reduce((sum, d) => sum + d.cost, 0);

  return (
    <div className="rounded-xs border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/*<div className="rounded-xs bg-amber-500/10 p-2">
            <Globe className="size-4 text-amber-400" />
          </div>*/}
          <h2 className="text-sm font-semibold">Geographic usage</h2>
        </div>
        <Link
          href="/dashboard/analytics"
          className="flex items-center gap-1 rounded-xs px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          View map
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-sm bg-muted" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-muted p-3">
            <Globe className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            No geographic data yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Make some API calls to see usage by country
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {topCountries.map((country, idx) => {
            const percentage =
              totalCost > 0 ? (country.cost / totalCost) * 100 : 0;

            return (
              <div
                key={country.country}
                className="group relative overflow-hidden rounded-xs border bg-muted/30 transition-colors hover:bg-muted/50"
              >
                {/* Background bar */}
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-500/5 transition-all"
                  style={{ width: `${percentage}%` }}
                />

                {/* Content */}
                <div className="relative flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none">
                      {getCountryFlag(country.country)}
                    </span>
                    <div>
                      <p className="text-xs font-medium">{country.country}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {country.calls.toLocaleString()} calls
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-emerald-400">
                      ${country.cost.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {data.length > 5 && (
            <Link
              href="/dashboard/analytics"
              className="block rounded-sm py-2 text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              +{data.length - 5} more countries
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
