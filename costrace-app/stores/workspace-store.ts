import type { Team } from "@/types/team"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface WorkspaceState {
  /** null means personal workspace */
  activeTeamId: number | null
  activeTeam: Team | null
  setActiveWorkspace: (team: Team | null) => void
  _hasHydrated: boolean
  setHasHydrated: (value: boolean) => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeTeamId: null,
      activeTeam: null,
      _hasHydrated: false,
      setActiveWorkspace: (team) =>
        set({
          activeTeamId: team?.id ?? null,
          activeTeam: team,
        }),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "costrace-workspace",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
