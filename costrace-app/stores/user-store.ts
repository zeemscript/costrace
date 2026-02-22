import { UserI } from "@/types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useWorkspaceStore } from "./workspace-store";

interface UserState {
  user: UserI | null;
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setAuth: (user: UserI, token: string) => void;
  updateUser: (user: UserI) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      updateUser: (user) => set({ user }),
      logout: () => {
        useWorkspaceStore.getState().setActiveWorkspace(null);
        set({ user: null, token: null, isAuthenticated: false });
      },
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "costrace-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
