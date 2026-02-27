import { useUserStore } from "@/stores/user-store";
import type { Trace } from "@/types/trace";
import { useEffect, useRef, useState } from "react";

const SSE_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/v1/events`;
const MAX_RETRY_DELAY = 30_000;

export function useTraceStream(
  onTrace: (trace: Trace) => void,
  teamId?: number | null,
): {
  connected: boolean;
} {
  const [connected, setConnected] = useState(false);
  const token = useUserStore((s) => s.token);
  const onTraceRef = useRef(onTrace);
  onTraceRef.current = onTrace;

  useEffect(() => {
    if (!token) return;

    let es: EventSource | null = null;
    let retryDelay = 1000;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    function connect() {
      if (disposed) return;

      let url = `${SSE_BASE_URL}?token=${token}`;
      if (teamId) url += `&team_id=${teamId}`;
      es = new EventSource(url);

      es.addEventListener("connected", () => {
        setConnected(true);
        retryDelay = 1000;
      });

      es.addEventListener("trace", (event) => {
        try {
          const trace: Trace = JSON.parse(event.data);
          onTraceRef.current(trace);
        } catch {
          // ignore malformed events
        }
      });

      es.onerror = () => {
        setConnected(false);
        es?.close();
        if (!disposed) {
          retryTimeout = setTimeout(() => {
            retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
            connect();
          }, retryDelay);
        }
      };
    }

    connect();

    return () => {
      disposed = true;
      es?.close();
      if (retryTimeout) clearTimeout(retryTimeout);
      setConnected(false);
    };
  }, [token, teamId]);

  return { connected };
}
