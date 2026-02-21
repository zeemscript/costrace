"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { CostOverTimePoint } from "@/api/analytics"

interface CostOverTimeChartProps {
  data: CostOverTimePoint[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as CostOverTimePoint
  return (
    <div className="rounded-sm border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
      <p className="font-medium text-foreground">{label}</p>
      <div className="mt-1.5 space-y-0.5 text-muted-foreground">
        <p>
          Cost: <span className="text-emerald-400">${d.cost.toFixed(4)}</span>
        </p>
        <p>Calls: {d.calls}</p>
        <p>Tokens: {(d.tokens_in + d.tokens_out).toLocaleString()}</p>
      </div>
    </div>
  )
}

export function CostOverTimeChart({ data }: CostOverTimeChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center">
        <p className="text-sm text-muted-foreground">No data for this period</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={true}
          vertical={false}
          stroke="hsl(240 4% 16%)"
        />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "hsl(240 5% 65%)" }}
          tickFormatter={(v) => {
            const d = new Date(v)
            return `${d.getMonth() + 1}/${d.getDate()}`
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "hsl(240 5% 65%)" }}
          tickFormatter={(v) => `$${v}`}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="cost"
          stroke="hsl(160 84% 39%)"
          strokeWidth={2}
          fill="url(#costGradient)"
          filter="url(#glow)"
          animationDuration={1200}
          animationEasing="ease-out"
          activeDot={{
            r: 5,
            fill: "hsl(160 84% 39%)",
            stroke: "hsl(160 84% 55%)",
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
