"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { CostByModelPoint } from "@/api/analytics"

const COLORS = [
  "hsl(160 84% 39%)",
  "hsl(199 89% 48%)",
  "hsl(262 83% 58%)",
  "hsl(47 96% 53%)",
  "hsl(349 89% 60%)",
]

interface CostByModelChartProps {
  data: CostByModelPoint[]
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as CostByModelPoint
  return (
    <div className="rounded-sm border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
      <p className="font-medium text-foreground">{d.model}</p>
      <div className="mt-1.5 space-y-0.5 text-muted-foreground">
        <p>Provider: {d.provider}</p>
        <p>
          Cost: <span className="text-emerald-400">${d.cost.toFixed(4)}</span>
        </p>
        <p>Calls: {d.calls}</p>
        <p>Tokens: {(d.tokens_in + d.tokens_out).toLocaleString()}</p>
      </div>
    </div>
  )
}

export function CostByModelChart({ data }: CostByModelChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-sm text-muted-foreground">No data for this period</p>
      </div>
    )
  }

  const height = Math.max(200, data.length * 48)

  const colored = data.map((d, i) => ({
    ...d,
    fill: COLORS[i % COLORS.length],
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={colored}   
        layout="vertical"
        margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={false}
          vertical={true}
          stroke="hsl(240 4% 16%)"
        />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "hsl(240 5% 65%)" }}
          tickFormatter={(v) => `$${v}`}
        />
        <YAxis
          type="category"
          dataKey="model"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "hsl(240 5% 65%)" }}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="cost"
          radius={[0, 4, 4, 0]}
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
