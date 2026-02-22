import { Team } from "./team";

export interface UserI {
  id: number;
  email: string;
  api_key: string;
  github_id: string;
  username: string;
  avatar_url: string;
  teams: Team[];
  created_at: number;
  country: string;
}

export interface UserLoginResponse {
  token: string;
  user: UserI;
}
