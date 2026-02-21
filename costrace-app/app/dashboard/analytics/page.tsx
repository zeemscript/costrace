"use client"

import { useEffect, useState } from "react"
import { DollarSign, Hash, Zap, Clock } from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { PeriodSelector } from "@/components/charts/period-selector"
import { CostOverTimeChart } from "@/components/charts/cost-over-time-chart"
import { CostByModelChart } from "@/components/charts/cost-by-model-chart"
import {
  type Period,
  type AnalyticsSummary,
  type CostOverTimePoint,
  type CostByModelPoint,
  getAnalyticsSummary,
  getCostOverTime,
  getCostByModel,
} from "@/api/analytics"

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d")
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [costOverTime, setCostOverTime] = useState<CostOverTimePoint[]>([])
  const [costByModel, setCostByModel] = useState<CostByModelPoint[]>([])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getAnalyticsSummary(period),
      getCostOverTime(period),
      getCostByModel(period),
    ])
      .then(([summaryRes, overTimeRes, byModelRes]) => {
        setSummary(summaryRes.data)
        setCostOverTime(overTimeRes.data)
        setCostByModel(byModelRes.data)
      })
      .finally(() => setLoading(false))
  }, [period])

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b bg-background/80 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-2 md:hidden" />
          <h1 className="text-sm font-semibold">Analytics</h1>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </header>

      <div className="flex-1 space-y-3 p-3">
        {/* Stat cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Cost"
            value={summary ? `$${summary.total_cost.toFixed(2)}` : "--"}
            icon={<DollarSign className="size-4 text-emerald-400" />}
            iconBg="bg-emerald-500/10"
            loading={loading}
          />
          <StatCard
            label="API Calls"
            value={summary ? summary.total_calls.toLocaleString() : "--"}
            icon={<Zap className="size-4 text-blue-400" />}
            iconBg="bg-blue-500/10"
            loading={loading}
          />
          <StatCard
            label="Tokens Used"
            value={summary ? summary.total_tokens.toLocaleString() : "--"}
            icon={<Hash className="size-4 text-violet-400" />}
            iconBg="bg-violet-500/10"
            loading={loading}
          />
          <StatCard
            label="Avg Latency"
            value={
              summary ? `${Math.round(summary.avg_latency_ms)}ms` : "--"
            }
            icon={<Clock className="size-4 text-amber-400" />}
            iconBg="bg-amber-500/10"
            loading={loading}
          />
        </div>

        {/* Cost over time */}
        <div className="rounded-xs border bg-card p-5">
          <h2 className="text-sm font-semibold">Cost over time</h2>
          <div className="mt-4">
            {loading ? (
              <div className="h-[280px] animate-pulse rounded-sm bg-muted" />
            ) : (
              <CostOverTimeChart data={costOverTime} />
            )}
          </div>
        </div>

        {/* Cost by model */}
        <div className="rounded-xs border bg-card p-5">
          <h2 className="text-sm font-semibold">Cost by model</h2>
          <div className="mt-4">
            {loading ? (
              <div className="h-[200px] animate-pulse rounded-sm bg-muted" />
            ) : (
              <CostByModelChart data={costByModel} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  iconBg,
  loading,
}: {
  label: string
  value: string
  icon: React.ReactNode
  iconBg: string
  loading: boolean
}) {
  return (
    <div className="rounded-xs border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={`rounded-xs p-2 ${iconBg}`}>{icon}</div>
      </div>
      {loading ? (
        <div className="mt-3 h-8 w-24 animate-pulse rounded-sm bg-muted" />
      ) : (
        <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      )}
    </div>
  )
}
