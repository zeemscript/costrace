"use client";

import type { CostByCountryPoint } from "@/api/analytics";
import { getCountryFlag } from "@/lib/country-flags";
import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

// Using 50m resolution to include smaller countries like Singapore, Luxembourg, etc.
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

interface WorldMapChartProps {
  data: CostByCountryPoint[];
  metric?: "cost" | "calls" | "latency";
}

// Map full country names to ISO codes for matching
const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  "United States": "USA",
  "United Kingdom": "GBR",
  Canada: "CAN",
  Australia: "AUS",
  Germany: "DEU",
  France: "FRA",
  Japan: "JPN",
  China: "CHN",
  India: "IND",
  Brazil: "BRA",
  Mexico: "MEX",
  Spain: "ESP",
  Italy: "ITA",
  Netherlands: "NLD",
  Sweden: "SWE",
  Norway: "NOR",
  Denmark: "DNK",
  Finland: "FIN",
  Poland: "POL",
  Belgium: "BEL",
  Switzerland: "CHE",
  Austria: "AUT",
  Ireland: "IRL",
  Portugal: "PRT",
  Greece: "GRC",
  "Czech Republic": "CZE",
  Romania: "ROU",
  Hungary: "HUN",
  Singapore: "SGP",
  "South Korea": "KOR",
  Russia: "RUS",
  Turkey: "TUR",
  "South Africa": "ZAF",
  Argentina: "ARG",
  Chile: "CHL",
  Colombia: "COL",
  Peru: "PER",
  Venezuela: "VEN",
  Egypt: "EGY",
  Nigeria: "NGA",
  Kenya: "KEN",
  Thailand: "THA",
  Vietnam: "VNM",
  Philippines: "PHL",
  Indonesia: "IDN",
  Malaysia: "MYS",
  "New Zealand": "NZL",
  Israel: "ISR",
  "Saudi Arabia": "SAU",
  UAE: "ARE",
  Pakistan: "PAK",
  Bangladesh: "BGD",
  Ukraine: "UKR",
  Local: "LOCAL",
};

export function WorldMapChart({ data, metric = "cost" }: WorldMapChartProps) {
  const [tooltipContent, setTooltipContent] = useState<{
    country: string;
    value: string;
    x: number;
    y: number;
  } | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          No geographic data for this period
        </p>
      </div>
    );
  }

  // Normalize country names to match map topology
  const normalizeCountryName = (name: string): string => {
    const mapping: Record<string, string> = {
      "United States": "United States of America",
      UK: "United Kingdom",
      UAE: "United Arab Emirates",
      "South Korea": "Republic of Korea",
      "North Korea": "Democratic People's Republic of Korea",
      Russia: "Russian Federation",
      "Czech Republic": "Czechia",
      Bosnia: "Bosnia and Herzegovina",
      "Republic of the Congo": "Congo",
      "Democratic Republic of the Congo": "Democratic Republic of the Congo",
      "Ivory Coast": "Côte d'Ivoire",
      Macedonia: "North Macedonia",
      "East Timor": "Timor-Leste",
      Burma: "Myanmar",
    };
    return mapping[name] || name;
  };

  // Create a map of country data keyed by normalized country name
  const countryDataMap = new Map(
    data.map((d) => [normalizeCountryName(d.country), d]),
  );

  // Get max value for color scaling
  const maxValue = Math.max(
    ...data.map((d) => {
      if (metric === "cost") return d.cost;
      if (metric === "calls") return d.calls;
      return d.avg_latency_ms;
    }),
  );

  // Color scale based on value intensity
  const getColor = (countryName: string) => {
    const countryData = countryDataMap.get(countryName);
    if (!countryData) return "#27272a"; // Zinc-800 for no data (visible on dark background)

    let value = 0;
    if (metric === "cost") value = countryData.cost;
    else if (metric === "calls") value = countryData.calls;
    else value = countryData.avg_latency_ms;

    const intensity = maxValue > 0 ? value / maxValue : 0;

    // Green gradient for cost/calls, amber for latency
    if (metric === "latency") {
      const r = Math.round(251 * intensity + 39 * (1 - intensity));
      const g = Math.round(191 * intensity + 39 * (1 - intensity));
      const b = Math.round(36 * intensity + 42 * (1 - intensity));
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      const r = Math.round(16 * intensity + 39 * (1 - intensity));
      const g = Math.round(185 * intensity + 39 * (1 - intensity));
      const b = Math.round(129 * intensity + 42 * (1 - intensity));
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const formatValue = (countryData: CostByCountryPoint) => {
    if (metric === "cost") return `$${countryData.cost.toFixed(2)}`;
    if (metric === "calls")
      return `${countryData.calls.toLocaleString()} calls`;
    return `${Math.round(countryData.avg_latency_ms)}ms avg`;
  };

  // Sort data by metric for the legend
  const sortedData = [...data].sort((a, b) => {
    if (metric === "cost") return b.cost - a.cost;
    if (metric === "calls") return b.calls - a.calls;
    return b.avg_latency_ms - a.avg_latency_ms;
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,280px]">
      <div className="relative">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 147,
          }}
          className="h-[400px] w-full"
        >
          <ZoomableGroup center={[20, 10]} zoom={1}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryName = geo.properties.name;
                  const countryData = countryDataMap.get(countryName);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getColor(countryName)}
                      stroke={
                        selectedCountry === countryName
                          ? "#fbbf24"
                          : countryData
                            ? "#10b981"
                            : "#18181b"
                      }
                      strokeWidth={
                        selectedCountry === countryName
                          ? 2.5
                          : countryData
                            ? 1.5
                            : 0.75
                      }
                      style={{
                        default: { outline: "none" },
                        hover: {
                          fill: countryData ? "#22c55e" : "#3f3f46",
                          stroke: countryData ? "#34d399" : "#3f3f46",
                          strokeWidth: 2,
                          outline: "none",
                          cursor: countryData ? "pointer" : "default",
                        },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={(e) => {
                        if (countryData) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipContent({
                            country: countryName,
                            value: formatValue(countryData),
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }
                      }}
                      onMouseLeave={() => {
                        setTooltipContent(null);
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {tooltipContent && (
          <div
            className="pointer-events-none fixed z-50 rounded-sm border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm"
            style={{
              left: `${tooltipContent.x}px`,
              top: `${tooltipContent.y - 60}px`,
              transform: "translateX(-50%)",
            }}
          >
            <p className="font-medium text-foreground">
              {tooltipContent.country}
            </p>
            <p className="mt-1 text-muted-foreground">{tooltipContent.value}</p>
          </div>
        )}

        {/* Gradient Legend */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Low</span>
          <div className="flex h-3 w-48 rounded-xs overflow-hidden border border-border">
            {Array.from({ length: 20 }).map((_, i) => {
              const intensity = i / 19;
              let color;
              if (metric === "latency") {
                const r = Math.round(251 * intensity + 39 * (1 - intensity));
                const g = Math.round(191 * intensity + 39 * (1 - intensity));
                const b = Math.round(36 * intensity + 42 * (1 - intensity));
                color = `rgb(${r}, ${g}, ${b})`;
              } else {
                const r = Math.round(16 * intensity + 39 * (1 - intensity));
                const g = Math.round(185 * intensity + 39 * (1 - intensity));
                const b = Math.round(129 * intensity + 42 * (1 - intensity));
                color = `rgb(${r}, ${g}, ${b})`;
              }
              return (
                <div
                  key={i}
                  className="flex-1"
                  style={{ backgroundColor: color }}
                />
              );
            })}
          </div>
          <span>High</span>
        </div>
      </div>

      {/* Country List Legend */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-muted-foreground">
          Countries with data
        </h3>
        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
          {sortedData.map((country) => (
            <>
              {country.country !== "Local" && (
                <button
                  key={country.country}
                  onClick={() =>
                    setSelectedCountry(
                      selectedCountry === country.country
                        ? null
                        : country.country,
                    )
                  }
                  className={`w-full rounded-xs border p-2 text-left transition-all ${
                    selectedCountry === country.country
                      ? "border-green-900 bg-green-500/10"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium truncate">
                      {getCountryFlag(country.country)} {country.country}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 whitespace-nowrap">
                      {formatValue(country)}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    {country.calls} calls • {Math.round(country.avg_latency_ms)}
                    ms
                  </div>
                </button>
              )}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
