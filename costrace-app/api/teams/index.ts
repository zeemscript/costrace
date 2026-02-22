import api from "@/lib/axios";
import type { CurrentTeamResponse, Team, TeamInvitation } from "@/types/team";

export function getCurrentTeam(teamId: number) {
  return api.get<CurrentTeamResponse>("/v1/teams/current", {
    params: { id: teamId },
  });
}

export function createTeam(name: string) {
  return api.post<Team>("/v1/teams", { name });
}

export function updateTeam(teamId: number, name: string) {
  return api.put<Team>("/v1/teams", { id: teamId, name });
}

export function deleteTeam(teamId: number) {
  return api.delete("/v1/teams", { data: { id: teamId } });
}

export function inviteMember(teamId: number, email: string) {
  return api.post<TeamInvitation>("/v1/teams/invite", {
    team_id: teamId,
    email,
  });
}

export function cancelInvitation(teamId: number, id: number) {
  return api.delete(`/v1/teams/invitations/${id}`, {
    data: { team_id: teamId },
  });
}

export function getMyInvitations() {
  return api.get<TeamInvitation[]>("/v1/teams/invitations/mine");
}

export function acceptInvitation(token: string) {
  return api.post(`/v1/teams/invitations/${token}/accept`);
}

export function declineInvitation(token: string) {
  return api.post(`/v1/teams/invitations/${token}/decline`);
}

export function removeMember(teamId: number, userId: number) {
  return api.delete(`/v1/teams/members/${userId}`, {
    data: { team_id: teamId },
  });
}

export function leaveTeam(teamId: number) {
  return api.post("/v1/teams/leave", { team_id: teamId });
}
