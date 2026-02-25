"use client";

import { Crown, LogOut, Mail, Trash2, UserMinus, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  cancelInvitation,
  createTeam,
  deleteTeam,
  getCurrentTeam,
  inviteMember,
  leaveTeam,
  removeMember,
  updateTeam,
} from "@/api/teams";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useUserStore } from "@/stores/user-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { CurrentTeamResponse } from "@/types/team";
import Link from "next/link";

export default function TeamPage() {
  const [teamData, setTeamData] = useState<CurrentTeamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const { user, updateUser } = useUserStore();
  const { activeTeamId, setActiveWorkspace } = useWorkspaceStore();

  useEffect(() => {
    fetchTeam();
  }, [activeTeamId]);

  async function fetchTeam() {
    if (!activeTeamId) {
      setTeamData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await getCurrentTeam(activeTeamId);
      setTeamData(data);
    } catch {
      toast.error("Failed to fetch team details");
      setTeamData(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTeam() {
    if (!teamName.trim()) return;
    setCreating(true);
    try {
      const { data: newTeam } = await createTeam(teamName.trim());
      if (user) {
        updateUser({ ...user, teams: [...(user.teams ?? []), newTeam] });
      }
      // Switch to the new team so the team page shows its details
      setActiveWorkspace(newTeam);
      setTeamName("");
      toast.success("Team created");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to create team";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !activeTeamId) return;
    setInviting(true);
    try {
      await inviteMember(activeTeamId, inviteEmail.trim());
      setInviteEmail("");
      toast.success("Invitation sent");
      await fetchTeam();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to send invitation";
      toast.error(msg);
    } finally {
      setInviting(false);
    }
  }

  async function handleCancelInvitation(id: number) {
    if (!activeTeamId) return;
    try {
      await cancelInvitation(activeTeamId, id);
      toast.success("Invitation cancelled");
      await fetchTeam();
    } catch {
      toast.error("Failed to cancel invitation");
    }
  }

  async function handleRemoveMember(userId: number) {
    if (!activeTeamId) return;
    try {
      await removeMember(activeTeamId, userId);
      toast.success("Member removed");
      await fetchTeam();
    } catch {
      toast.error("Failed to remove member");
    }
  }

  async function handleLeaveTeam() {
    if (!activeTeamId) return;
    try {
      await leaveTeam(activeTeamId);
      if (user) {
        updateUser({
          ...user,
          teams: (user.teams ?? []).filter((t) => t.id !== activeTeamId),
        });
      }
      setActiveWorkspace(null);
      setTeamData(null);
      toast.success("You left the team");
    } catch {
      toast.error("Failed to leave team");
    }
  }

  async function handleDeleteTeam() {
    if (!activeTeamId) return;
    try {
      await deleteTeam(activeTeamId);
      if (user) {
        updateUser({
          ...user,
          teams: (user.teams ?? []).filter((t) => t.id !== activeTeamId),
        });
      }
      setActiveWorkspace(null);
      setTeamData(null);
      toast.success("Team deleted");
    } catch {
      toast.error("Failed to delete team");
    }
  }

  async function handleUpdateName() {
    if (!newName.trim() || !activeTeamId) return;
    try {
      const { data: updated } = await updateTeam(activeTeamId, newName.trim());
      setEditingName(false);
      setActiveWorkspace(updated);
      if (user) {
        updateUser({
          ...user,
          teams: (user.teams ?? []).map((t) =>
            t.id === updated.id ? updated : t,
          ),
        });
      }
      toast.success("Team name updated");
      await fetchTeam();
    } catch {
      toast.error("Failed to update team name");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur-sm">
          <SidebarTrigger className="-ml-2 md:hidden" />
          <h1 className="text-sm font-semibold">Team</h1>
        </header>
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // No team selected or personal workspace — show create form or upgrade prompt
  if (!activeTeamId || !teamData) {
    const isFree = user?.plan === "free" || !user?.plan;

    return (
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur-sm">
          <SidebarTrigger className="-ml-2 md:hidden" />
          <h1 className="text-sm font-semibold">Team</h1>
        </header>
        <div className="flex-1 p-3">
          <div className="mx-auto max-w-9xl">
            <div className="mt-16 flex flex-col items-center justify-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <Users className="size-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">
                {activeTeamId ? "Team not found" : "No team selected"}
              </h3>
              {isFree ? (
                <>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Team creation requires a Pro plan. You can join a team via
                    invitation.
                  </p>
                  <Button size="sm" className="mt-6 rounded-xs" asChild>
                    <Link href="/dashboard/billing">Upgrade to Pro</Link>
                  </Button>
                </>
              ) : (
                <>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Create a team to share API keys, traces, analytics, and
                    budget alerts with your teammates. Or select a team from the
                    sidebar.
                  </p>
                  <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="team-name">Team name</Label>
                      <Input
                        id="team-name"
                        className="rounded-xs"
                        placeholder="e.g. My Company"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleCreateTeam()
                        }
                      />
                    </div>
                    <Button
                      size="sm"
                      className="rounded-xs"
                      onClick={handleCreateTeam}
                      disabled={creating || !teamName.trim()}
                    >
                      {creating ? "Creating..." : "Create Team"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = teamData.role === "owner";

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b bg-background/80 px-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-2 md:hidden" />
          <h1 className="text-sm font-semibold">Team</h1>
        </div>
        {isOwner ? (
          <Button
            size="sm"
            variant="destructive"
            className="gap-1.5 rounded-xs"
            onClick={handleDeleteTeam}
          >
            <Trash2 className="size-3.5" />
            Delete Team
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 rounded-xs"
            onClick={handleLeaveTeam}
          >
            <LogOut className="size-3.5" />
            Leave Team
          </Button>
        )}
      </header>

      <div className="flex-1 p-3">
        <div className="mx-auto max-w-9xl space-y-6">
          {/* Team Name */}
          <div className="rounded-xs border bg-card p-5">
            <div className="flex items-center justify-between">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    className="h-8 w-48 rounded-xs"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUpdateName()}
                  />
                  <Button
                    size="sm"
                    className="h-8 rounded-xs"
                    onClick={handleUpdateName}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-xs"
                    onClick={() => setEditingName(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">
                    {teamData.team.name}
                  </h2>
                  <Badge variant="secondary">{teamData.role}</Badge>
                </div>
              )}
              {isOwner && !editingName && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-xs text-xs"
                  onClick={() => {
                    setNewName(teamData.team.name);
                    setEditingName(true);
                  }}
                >
                  Rename
                </Button>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {teamData.members.length} member
              {teamData.members.length !== 1 ? "s" : ""}
              {teamData.invitations.length > 0 &&
                ` · ${teamData.invitations.length} pending invite${teamData.invitations.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Invite Form (owner only) */}
          {isOwner && (
            <div className="rounded-xs border bg-card p-5">
              <h3 className="text-sm font-semibold">Invite a member</h3>
              <div className="mt-3 flex gap-2">
                <Input
                  className="rounded-xs"
                  placeholder="colleague@company.com"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                />
                <Button
                  size="sm"
                  className="gap-1.5 rounded-xs"
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                >
                  <Mail className="size-3.5" />
                  {inviting ? "Sending..." : "Send Invite"}
                </Button>
              </div>
            </div>
          )}

          {/* Members */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Members</h3>
            <div className="space-y-2">
              {teamData.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-xs border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    {member.user.avatar_url ? (
                      <img
                        src={member.user.avatar_url}
                        alt={member.user.username}
                        className="size-8 rounded-full"
                      />
                    ) : (
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {member.user.username?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {member.user.username}
                        </p>
                        {member.role === "owner" && (
                          <Crown className="size-3.5 text-amber-400" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  {isOwner && member.user_id !== user?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-400 hover:text-red-400"
                      onClick={() => handleRemoveMember(member.user_id)}
                    >
                      <UserMinus className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pending Invitations */}
          {isOwner && teamData.invitations.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold">
                Pending Invitations
              </h3>
              <div className="space-y-2">
                {teamData.invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between gap-3 rounded-xs border bg-card p-4"
                  >
                    <div>
                      <p className="text-sm font-medium">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Expires {new Date(inv.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-400 hover:text-red-400"
                      onClick={() => handleCancelInvitation(inv.id)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
