import { UserI } from "./user";

export interface Team {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
}

export interface TeamMember {
  id: number;
  team_id: number;
  user_id: number;
  role: "owner" | "member";
  joined_at: string;
  user: UserI;
}

export interface TeamInvitation {
  id: number;
  team_id: number;
  email: string;
  token: string;
  status: "pending" | "accepted" | "declined";
  invited_by: number;
  expires_at: string;
  created_at: string;
  team?: Team;
}

export interface CurrentTeamResponse {
  team: Team;
  members: TeamMember[];
  invitations: TeamInvitation[];
  role: "owner" | "member";
}
