"use client";

import { Bell, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getApiKeys, type APIKey } from "@/api/api-keys";
import {
  createBudgetAlert,
  deleteBudgetAlert,
  getBudgetAlerts,
  updateBudgetAlert,
  type BudgetAlert,
} from "@/api/budget-alerts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useWorkspaceStore } from "@/stores/workspace-store";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const { activeTeamId } = useWorkspaceStore();

  // Form state
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"general" | "api_key" | "model">(
    "general",
  );
  const [scopeValue, setScopeValue] = useState("");
  const [threshold, setThreshold] = useState("");
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">(
    "monthly",
  );

  useEffect(() => {
    getBudgetAlerts(activeTeamId)
      .then(({ data }) => setAlerts(data))
      .catch(() => toast.error("Failed to fetch budget alerts"));
    getApiKeys(activeTeamId)
      .then(({ data }) => setApiKeys(data))
      .catch(() => {});
  }, [activeTeamId]);

  function resetForm() {
    setName("");
    setScope("general");
    setScopeValue("");
    setThreshold("");
    setPeriod("monthly");
  }

  async function handleCreate() {
    const thresholdNum = parseFloat(threshold);
    if (!name.trim() || isNaN(thresholdNum) || thresholdNum <= 0) return;

    setCreating(true);
    try {
      const { data } = await createBudgetAlert(
        {
          name: name.trim(),
          scope,
          scope_value: scope === "general" ? "" : scopeValue,
          threshold_usd: thresholdNum,
          period,
        },
        activeTeamId,
      );
      setAlerts((prev) => [data, ...prev]);
      resetForm();
      setShowCreate(false);
      toast.success("Budget alert created", { id: "budget-created" });
    } catch {
      toast.error("Failed to create budget alert");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(alert: BudgetAlert) {
    try {
      const { data } = await updateBudgetAlert(
        alert.id,
        { enabled: !alert.enabled },
        activeTeamId,
      );
      setAlerts((prev) => prev.map((a) => (a.id === data.id ? data : a)));
    } catch {
      toast.error("Failed to update alert");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteBudgetAlert(id, activeTeamId);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      toast.success("Budget alert deleted");
    } catch {
      toast.error("Failed to delete alert");
    }
  }

  const scopeBadgeVariant = (s: string) => {
    switch (s) {
      case "general":
        return "default";
      case "api_key":
        return "secondary";
      case "model":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b bg-background/80 px-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-2 md:hidden" />
          <h1 className="text-sm font-semibold">Budget Alerts</h1>
        </div>
        <Button
          size="sm"
          className="gap-1.5 rounded-xs"
          onClick={() => setShowCreate(!showCreate)}
        >
          <Plus className="size-3.5" />
          New Alert
        </Button>
      </header>

      <div className="flex-1 p-3">
        <div className="mx-auto max-w-9xl">
          <p className="text-sm text-muted-foreground">
            Set spending thresholds and get email alerts when they are breached.
          </p>

          {showCreate && (
            <div className="mt-6 rounded-xs border bg-card p-5">
              <h3 className="text-sm font-semibold">
                Create a new budget alert
              </h3>
              <div className="mt-4 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="alert-name">Alert name</Label>
                  <Input
                    id="alert-name"
                    className="rounded-xs"
                    placeholder="e.g. Monthly spend limit"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Scope</Label>
                    <Select
                      value={scope}
                      onValueChange={(v) => {
                        setScope(v as typeof scope);
                        setScopeValue("");
                      }}
                    >
                      <SelectTrigger className="w-full rounded-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">
                          General (all keys)
                        </SelectItem>
                        <SelectItem value="api_key">
                          Specific API Key
                        </SelectItem>
                        <SelectItem value="model">Specific Model</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {scope === "api_key" && (
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <Select value={scopeValue} onValueChange={setScopeValue}>
                        <SelectTrigger className="w-full rounded-xs">
                          <SelectValue placeholder="Select a key" />
                        </SelectTrigger>
                        <SelectContent>
                          {apiKeys.map((k) => (
                            <SelectItem key={k.id} value={k.key}>
                              {k.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {scope === "model" && (
                    <div className="space-y-2">
                      <Label htmlFor="model-name">Model name</Label>
                      <Input
                        id="model-name"
                        className="rounded-xs"
                        placeholder="e.g. gpt-4o"
                        value={scopeValue}
                        onChange={(e) => setScopeValue(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Threshold ($)</Label>
                    <Input
                      id="threshold"
                      className="rounded-xs"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="10.00"
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Period</Label>
                    <Select
                      value={period}
                      onValueChange={(v) => setPeriod(v as typeof period)}
                    >
                      <SelectTrigger className="w-full rounded-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="rounded-xs"
                    onClick={handleCreate}
                    disabled={
                      creating ||
                      !name.trim() ||
                      !threshold ||
                      (scope !== "general" && !scopeValue)
                    }
                  >
                    {creating ? "Creating..." : "Create Alert"}
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-xs"
                    variant="ghost"
                    onClick={() => {
                      setShowCreate(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {alerts.length === 0 && !showCreate ? (
            <div className="mt-16 flex flex-col items-center justify-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <Bell className="size-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">
                No budget alerts yet
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Create your first budget alert to get notified when your
                spending exceeds a threshold.
              </p>
              <Button
                size="sm"
                className="mt-4 gap-1.5 rounded-xs p-2"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="size-3.5" />
                Create your first alert
              </Button>
            </div>
          ) : (
            <div className="mt-6 space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between gap-3 rounded-xs border bg-card p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {alert.name}
                      </p>
                      <Badge variant={scopeBadgeVariant(alert.scope)}>
                        {alert.scope === "api_key"
                          ? "API Key"
                          : alert.scope === "model"
                            ? "Model"
                            : "General"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      ${alert.threshold_usd.toFixed(2)} / {alert.period}
                      {alert.scope_value && ` · ${alert.scope_value}`}
                      {alert.last_triggered_at &&
                        ` · Last triggered ${new Date(alert.last_triggered_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant={alert.enabled ? "default" : "outline"}
                      size="sm"
                      className="h-7 rounded-xs px-2 text-xs"
                      onClick={() => handleToggle(alert)}
                    >
                      {alert.enabled ? "Enabled" : "Disabled"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-400 hover:text-red-400"
                      onClick={() => handleDelete(alert.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
