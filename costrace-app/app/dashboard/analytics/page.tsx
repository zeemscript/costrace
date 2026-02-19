import { BarChart3 } from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-6 backdrop-blur-sm">
        <SidebarTrigger className="-ml-2 md:hidden" />
        <h1 className="text-sm font-semibold">Analytics</h1>
      </header>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
            <BarChart3 className="size-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-sm font-semibold">Analytics coming soon</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Cost breakdowns, trend analysis, and provider comparisons.
          </p>
        </div>
      </div>
    </div>
  )
}
