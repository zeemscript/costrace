import { DollarSign, Hash, Zap } from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"

export default function DashboardPage() {
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
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              $0.00
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              No spending recorded yet
            </p>
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
            <p className="mt-3 text-2xl font-semibold tracking-tight">0</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No calls tracked yet
            </p>
          </div>

          <div className="rounded-xs  border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Tokens Used
              </p>
              <div className="rounded-sm bg-violet-500/10 p-2">
                <Hash className="size-4 text-violet-400" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">0</p>
            <p className="mt-1 text-xs text-muted-foreground">
              No usage recorded yet
            </p>
          </div>
        </div>

        <div className="rounded-xs border bg-card p-6">
          <h2 className="text-base font-semibold">
            Get started with costrace
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Start tracking your LLM API costs in under 2 minutes.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-400">
                  1
                </span>
                <span className="text-sm font-medium">
                  Install the Python SDK
                </span>
              </div>
              <div className="ml-8 mt-2.5 rounded-sm border bg-black/30 px-4 py-3">
                <code className="font-mono text-sm text-emerald-400">
                  pip install costrace
                </code>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-400">
                  2
                </span>
                <span className="text-sm font-medium">
                  Initialize in your application
                </span>
              </div>
              <div className="ml-8 mt-2.5 rounded-sm border bg-black/30 px-4 py-3">
                <pre className="font-mono text-sm text-zinc-300">
                  {`import costrace

costrace.init(api_key="")`}
                </pre>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-400">
                  3
                </span>
                <span className="text-sm font-medium">View your costs</span>
              </div>
              <p className="ml-8 mt-1.5 text-sm text-muted-foreground">
                Traces will appear automatically as you make API calls to
                OpenAI, Anthropic, or Google Gemini.
              </p>
            </div>
          </div>
        </div>

        <div className="flex min-h-[280px] items-center justify-center rounded-xs border bg-card">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Cost overview chart
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Will appear when you start tracking
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
