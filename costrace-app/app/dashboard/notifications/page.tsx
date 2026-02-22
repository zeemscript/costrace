"use client";

import { Bell, Check, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  acceptInvitation,
  declineInvitation,
  getMyInvitations,
} from "@/api/teams";
import { getCurrentUser } from "@/api/user";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useUserStore } from "@/stores/user-store";
import type { TeamInvitation } from "@/types/team";

export default function NotificationsPage() {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const { updateUser } = useUserStore();

  useEffect(() => {
    fetchInvitations();
  }, []);

  async function fetchInvitations() {
    setLoading(true);
    try {
      const { data } = await getMyInvitations();
      setInvitations(data);
    } catch {
      toast.error("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(invitation: TeamInvitation) {
    setProcessingIds((prev) => new Set(prev).add(invitation.id));
    try {
      await acceptInvitation(invitation.token);
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id));
      // Refresh user to get updated teams list
      const { data: freshUser } = await getCurrentUser();
      updateUser(freshUser);
      toast.success(`Joined ${invitation.team?.name ?? "team"}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to accept invitation";
      toast.error(msg);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(invitation.id);
        return next;
      });
    }
  }

  async function handleDecline(invitation: TeamInvitation) {
    setProcessingIds((prev) => new Set(prev).add(invitation.id));
    try {
      await declineInvitation(invitation.token);
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id));
      toast.success("Invitation declined");
    } catch {
      toast.error("Failed to decline invitation");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(invitation.id);
        return next;
      });
    }
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur-sm">
        <SidebarTrigger className="-ml-2 md:hidden" />
        <h1 className="text-sm font-semibold">Notifications</h1>
      </header>

      <div className="flex-1 p-3">
        <div className="mx-auto max-w-9xl">
          <p className="text-sm text-muted-foreground">
            Team invitations and activity notifications.
          </p>

          {loading ? (
            <div className="mt-6 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 rounded-xs border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 animate-pulse rounded-full bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-28 animate-pulse rounded-sm bg-muted" />
                      <div className="h-3 w-44 animate-pulse rounded-sm bg-muted" />
                      <div className="h-3 w-24 animate-pulse rounded-sm bg-muted" />
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-8 w-20 animate-pulse rounded-xs bg-muted" />
                    <div className="h-8 w-20 animate-pulse rounded-xs bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : invitations.length === 0 ? (
            <div className="mt-16 flex flex-col items-center justify-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <Bell className="size-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">No notifications</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Team invitations and other notifications will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-2">
              {invitations.map((inv) => {
                const isProcessing = processingIds.has(inv.id);
                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between gap-4 rounded-xs border bg-card p-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                        <Users className="size-4 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Team invitation</p>
                        <p className="truncate text-xs text-muted-foreground">
                          You&apos;ve been invited to join{" "}
                          <span className="font-medium text-foreground">
                            {inv.team?.name ?? `Team #${inv.team_id}`}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Expires{" "}
                          {new Date(inv.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        size="sm"
                        className="h-8 gap-1.5 rounded-xs"
                        onClick={() => handleAccept(inv)}
                        disabled={isProcessing}
                      >
                        <Check className="size-3.5" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5 rounded-xs"
                        onClick={() => handleDecline(inv)}
                        disabled={isProcessing}
                      >
                        <X className="size-3.5" />
                        Decline
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
