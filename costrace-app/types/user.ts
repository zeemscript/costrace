import { Team } from "./team";

export type PlanType = "free" | "premium";

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
  plan: PlanType;
  polar_customer_id: string;
  polar_subscription_id: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
}

export interface UserLoginResponse {
  token: string;
  user: UserI;
}
