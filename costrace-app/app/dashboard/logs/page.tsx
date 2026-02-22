"use client";

import { ChevronLeft, ChevronRight, ScrollText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { getApiKeys, type APIKey } from "@/api/api-keys";
import { getTraces, type Trace, type TraceFilters } from "@/api/traces";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWorkspaceStore } from "@/stores/workspace-store";

const PROVIDERS = ["openai", "anthropic", "gemini"];
const PER_PAGE = 20;

const TIME_RANGES: { label: string; value: string }[] = [
  { label: "All time", value: "all" },
  { label: "Last 24h", value: "24h" },
  { label: "Last 7d", value: "7d" },
  { label: "Last 30d", value: "30d" },
];

function timeRangeToUnix(value: string): string | undefined {
  if (value === "all") return undefined;
  const now = Math.floor(Date.now() / 1000);
  const offsets: Record<string, number> = {
    "24h": 86400,
    "7d": 604800,
    "30d": 2592000,
  };
  return String(now - (offsets[value] ?? 0));
}

export default function LogsPage() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const { activeTeamId } = useWorkspaceStore();

  // Filter state
  const [apiKey, setApiKey] = useState("all");
  const [provider, setProvider] = useState("all");
  const [status, setStatus] = useState("all");
  const [timeRange, setTimeRange] = useState("all");

  useEffect(() => {
    getApiKeys(activeTeamId)
      .then(({ data }) => setKeys(data))
      .catch(() => {});
  }, [activeTeamId]);

  // Reset to page 1 when filters or workspace change
  useEffect(() => {
    setPage(1);
  }, [apiKey, provider, status, timeRange, activeTeamId]);

  const fetchTraces = useCallback(async () => {
    setLoading(true);
    try {
      const params: TraceFilters = { page, per_page: PER_PAGE };
      if (activeTeamId) params.team_id = activeTeamId;
      if (apiKey !== "all") params.api_key = apiKey;
      if (provider !== "all") params.provider = provider;
      if (status !== "all") params.status = status;
      const from = timeRangeToUnix(timeRange);
      if (from) params.from = from;

      const { data } = await getTraces(params);
      setTraces(data.data);
      setTotal(data.total);
    } catch {
      toast.error("Failed to fetch traces");
    } finally {
      setLoading(false);
    }
  }, [apiKey, provider, status, timeRange, page, activeTeamId]);

  useEffect(() => {
    fetchTraces();
  }, [fetchTraces]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const from = (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur-sm">
        <SidebarTrigger className="-ml-2 md:hidden" />
        <h1 className="text-sm font-semibold">Logs</h1>
      </header>

      <div className="flex-1 p-3">
        <div className="mx-auto max-w-9xl">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={apiKey} onValueChange={setApiKey}>
              <SelectTrigger className="w-[180px] rounded-xs">
                <SelectValue placeholder="All keys" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All keys</SelectItem>
                {keys.map((k) => (
                  <SelectItem key={k.id} value={k.key}>
                    {k.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="w-[150px] rounded-xs">
                <SelectValue placeholder="All providers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All providers</SelectItem>
                {PROVIDERS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[130px] rounded-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px] rounded-xs">
                <SelectValue placeholder="All time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table or empty state */}
          {!loading && traces?.length === 0 ? (
            <div className="mt-16 flex flex-col items-center justify-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <ScrollText className="size-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">No logs yet</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                API call logs will appear here once you start sending traces.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-4 rounded-xs border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">
                        Tokens (in/out)
                      </TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Latency</TableHead>
                      <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading
                      ? Array.from({ length: 8 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 7 }).map((_, j) => (
                              <TableCell key={j}>
                                <div className="h-4 w-16 animate-pulse rounded-sm bg-muted" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      : traces?.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="rounded-xs font-normal"
                              >
                                {t.provider}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {t.model}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  t.status === "success"
                                    ? "default"
                                    : "destructive"
                                }
                                className="rounded-xs font-normal"
                              >
                                {t.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {t.tokens_in} / {t.tokens_out}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              ${t.cost_usd.toFixed(6)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {t.latency_ms}ms
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">
                              {new Date(t.created_at).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {total > 0 && (
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {from}–{to} of {total.toLocaleString()} traces
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="inline-flex size-8 items-center justify-center rounded-xs border bg-card transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="px-2 tabular-nums">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages}
                      className="inline-flex size-8 items-center justify-center rounded-xs border bg-card transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
