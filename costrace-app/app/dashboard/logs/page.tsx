import { ScrollText } from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"

export default function LogsPage() {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-6 backdrop-blur-sm">
        <SidebarTrigger className="-ml-2 md:hidden" />
        <h1 className="text-sm font-semibold">Logs</h1>
      </header>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
            <ScrollText className="size-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-sm font-semibold">No logs yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            API call logs will appear here once you start sending traces.
          </p>
        </div>
      </div>
    </div>
  )
}
