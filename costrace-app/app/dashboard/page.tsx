"use client";

import { Check, Copy, DollarSign, ExternalLink, Hash, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  type AnalyticsSummary,
  type CostByCountryPoint,
  type CostOverTimePoint,
  getAnalyticsSummary,
  getCostByCountry,
  getCostOverTime,
} from "@/api/analytics";
import { CostOverTimeChart } from "@/components/charts/cost-over-time-chart";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { GeographicWidget } from "@/components/widgets/geographic-widget";
import { useWorkspaceStore } from "@/stores/workspace-store";

const SDK_TABS = ["Python", "Node.js"] as const;
type SdkTab = (typeof SDK_TABS)[number];

const installCommands: Record<SdkTab, string> = {
  Python: "pip install costrace",
  "Node.js": "npm install costrace",
};

const initSnippets: Record<SdkTab, string> = {
  Python: `import costrace

costrace.init(api_key="your_api_key")`,
  "Node.js": `import * as costrace from "costrace";

costrace.init("your_api_key");`,
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [chartData, setChartData] = useState<CostOverTimePoint[]>([]);
  const [geoData, setGeoData] = useState<CostByCountryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [sdkTab, setSdkTab] = useState<SdkTab>("Python");
  const [copied, setCopied] = useState<string | null>(null);
  const { activeTeamId } = useWorkspaceStore();

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAnalyticsSummary("30d", activeTeamId),
      getCostOverTime("7d", activeTeamId),
      getCostByCountry("30d", activeTeamId),
    ])
      .then(([summaryRes, chartRes, geoRes]) => {
        setSummary(summaryRes.data);
        setChartData(chartRes.data);
        setGeoData(geoRes.data);
      })
      .catch(() => {
        toast.error("Failed to load dashboard data", { id: "load-dashboard" });
      })
      .finally(() => setLoading(false));
  }, [activeTeamId]);

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-6 backdrop-blur-sm">
        <SidebarTrigger className="-ml-2 md:hidden" />
        <h1 className="text-sm font-semibold">Dashboard</h1>
      </header>

      <div className="flex-1 space-y-3 p-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xs border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Total Cost
              </p>
              <div className="rounded-xs bg-emerald-500/10 p-2">
                <DollarSign className="size-4 text-emerald-400" />
              </div>
            </div>
            {loading ? (
              <div className="mt-3 h-8 w-24 animate-pulse rounded-sm bg-muted" />
            ) : (
              <>
                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  ${summary?.total_cost.toFixed(2) ?? "0.00"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </>
            )}
          </div>

          <div className="rounded-xs border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                API Calls
              </p>
              <div className="rounded-sm bg-blue-500/10 p-2">
                <Zap className="size-4 text-blue-400" />
              </div>
            </div>
            {loading ? (
              <div className="mt-3 h-8 w-24 animate-pulse rounded-sm bg-muted" />
            ) : (
              <>
                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  {summary?.total_calls.toLocaleString() ?? "0"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </>
            )}
          </div>

          <div className="rounded-xs border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Tokens Used
              </p>
              <div className="rounded-sm bg-violet-500/10 p-2">
                <Hash className="size-4 text-violet-400" />
              </div>
            </div>
            {loading ? (
              <div className="mt-3 h-8 w-24 animate-pulse rounded-sm bg-muted" />
            ) : (
              <>
                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  {summary?.total_tokens.toLocaleString() ?? "0"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <GeographicWidget data={geoData} loading={loading} />

          <div className="rounded-xs border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Quick start</h2>
              <a
                href="https://docs.costrace.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                View docs
                <ExternalLink className="size-3" />
              </a>
            </div>

            <div className="mt-4 flex gap-1 rounded-sm border p-0.5 w-fit">
              {SDK_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSdkTab(tab)}
                  className={`rounded-xs px-3 py-1 text-xs font-medium transition-colors ${
                    sdkTab === tab
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Install
                </p>
                <div className="group relative rounded-sm border bg-black/30 px-4 py-3">
                  <code className="font-mono text-[13px] text-emerald-400">
                    {installCommands[sdkTab]}
                  </code>
                  <button
                    onClick={() =>
                      copyToClipboard(installCommands[sdkTab], "install")
                    }
                    className="absolute right-2.5 top-2.5 rounded-sm p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                  >
                    {copied === "install" ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Initialize
                </p>
                <div className="group relative rounded-sm border bg-black/30 px-4 py-3">
                  <pre className="font-mono text-[13px] leading-relaxed text-zinc-300">
                    {initSnippets[sdkTab]}
                  </pre>
                  <button
                    onClick={() =>
                      copyToClipboard(initSnippets[sdkTab], "init")
                    }
                    className="absolute right-2.5 top-2.5 rounded-sm p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                  >
                    {copied === "init" ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Traces appear automatically as you call OpenAI, Anthropic, or
                Gemini.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xs border bg-card p-5">
          <h2 className="text-sm font-semibold">Cost overview (last 7 days)</h2>
          <div className="mt-4">
            {loading ? (
              <div className="h-[280px] animate-pulse rounded-sm bg-muted" />
            ) : (
              <CostOverTimeChart data={chartData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
