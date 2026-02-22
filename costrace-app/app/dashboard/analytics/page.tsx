"use client";

import { Clock, DollarSign, Hash, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  type AnalyticsSummary,
  type CostByModelPoint,
  type CostOverTimePoint,
  getAnalyticsSummary,
  getCostByModel,
  getCostOverTime,
  type Period,
} from "@/api/analytics";
import { CostByModelChart } from "@/components/charts/cost-by-model-chart";
import { CostOverTimeChart } from "@/components/charts/cost-over-time-chart";
import { PeriodSelector } from "@/components/charts/period-selector";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useWorkspaceStore } from "@/stores/workspace-store";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [costOverTime, setCostOverTime] = useState<CostOverTimePoint[]>([]);
  const [costByModel, setCostByModel] = useState<CostByModelPoint[]>([]);
  const { activeTeamId } = useWorkspaceStore();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAnalyticsSummary(period, activeTeamId),
      getCostOverTime(period, activeTeamId),
      getCostByModel(period, activeTeamId),
    ])
      .then(([summaryRes, overTimeRes, byModelRes]) => {
        setSummary(summaryRes.data);
        setCostOverTime(overTimeRes.data);
        setCostByModel(byModelRes.data);
      })
      .catch(() => {
        toast.error("Failed to load analytics");
      })
      .finally(() => setLoading(false));
  }, [period, activeTeamId]);

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
            value={summary ? `${Math.round(summary.avg_latency_ms)}ms` : "--"}
            icon={<Clock className="size-4 text-amber-400" />}
            iconBg="bg-amber-500/10"
            loading={loading}
          />
        </div>

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
  );
}

function StatCard({
  label,
  value,
  icon,
  iconBg,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  loading: boolean;
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
  );
}
