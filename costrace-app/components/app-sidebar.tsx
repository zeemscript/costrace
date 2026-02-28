"use client";

import {
  BarChart3,
  Bell,
  BellDot,
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  Crown,
  Key,
  LayoutDashboard,
  LogOut,
  Plus,
  ScrollText,
  Settings,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Team } from "@/types/team";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const topNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Logs", href: "/dashboard/logs", icon: ScrollText },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
];

const bottomNav = [
  { label: "API Keys", href: "/dashboard/api-keys", icon: Key },
  { label: "Notifications", href: "/dashboard/notifications", icon: BellDot },
  { label: "Team", href: "/dashboard/team", icon: Users },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function isActivePath(href: string, pathname: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUserStore();
  const { activeTeamId, activeTeam, setActiveWorkspace } = useWorkspaceStore();
  const { setOpenMobile, isMobile } = useSidebar();

  const initials = (user?.username ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const teams: Team[] = user?.teams ?? [];

  function handleLogout() {
    logout();
    router.replace("/auth");
  }

  function handleSelectPersonal() {
    setActiveWorkspace(null);
  }

  function handleSelectTeam(team: Team) {
    setActiveWorkspace(team);
  }

  function closeSidebarOnMobile() {
    if (isMobile) {
      setOpenMobile(false);
    }
  }

  const workspaceLabel = activeTeam ? activeTeam.name : "Personal";

  return (
    <Sidebar {...props}>
      <SidebarHeader className="px-4 py-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="group flex items-center gap-3">
            {/* Logo mark with extending lines */}
            <div className="relative">
              <span className="absolute left-[-4px] top-0 bottom-0 w-px bg-emerald-500/30" />
              <span className="absolute top-[-4px] left-0 right-0 h-px bg-emerald-500/30" />
              <div className="flex size-7 items-center justify-center bg-emerald-500/10">
                <span className="font-mono text-[11px] font-bold text-emerald-400">
                  C
                </span>
              </div>
            </div>
            <span className="font-mono text-[13px] tracking-tight text-white/60 transition-colors duration-300 group-hover:text-white/90">
              costrace
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <div className="px-4 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="rounded-xs">
            <Button variant="ghost" className="w-full justify-start">
              {activeTeam ? (
                <Building2 className="size-4" strokeWidth={1.75} />
              ) : (
                <User className="size-4" strokeWidth={1.75} />
              )}
              <span className="ml-2 truncate text-left text-sm font-medium">
                {workspaceLabel}
              </span>
              <ChevronDown className="ml-auto size-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-xs" align="start">
            <DropdownMenuItem
              onClick={handleSelectPersonal}
              className="rounded-xs"
            >
              <User className="size-4" strokeWidth={1.75} />
              <span className="ml-2 text-sm font-medium">Personal</span>
              {!activeTeamId && (
                <Check className="ml-auto size-4 text-emerald-400" />
              )}
            </DropdownMenuItem>

            {teams.length > 0 && <DropdownMenuSeparator />}

            {teams.map((team) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => handleSelectTeam(team)}
                className="rounded-xs"
              >
                <Building2 className="size-4" strokeWidth={1.75} />
                <span className="ml-2 truncate text-sm font-medium">
                  {team.name}
                </span>
                {activeTeamId === team.id && (
                  <Check className="ml-auto size-4 text-emerald-400" />
                )}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/dashboard/team")}
              className="rounded-xs"
            >
              <Plus className="size-4" strokeWidth={1.75} />
              <span className="ml-2 text-sm font-medium text-muted-foreground">
                Create or join team
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SidebarContent className="px-3 pt-2">
        <nav className="flex flex-col gap-0.5 cursor-pointer">
          {topNav.map((item) => {
            const active = isActivePath(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebarOnMobile}
                className={cn(
                  "cursor-pointer flex items-center gap-3 rounded-xs px-3 py-2 text-[13px] font-medium transition-colors my-1",
                  active
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
                )}
              >
                <item.icon
                  className={cn(
                    "size-4",
                    active ? "text-emerald-400" : "text-zinc-500",
                  )}
                  strokeWidth={1.75}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="my-3 h-px bg-white/[0.06]" />

        <nav className="flex flex-col gap-0.5">
          {bottomNav.map((item) => {
            const active = isActivePath(item.href, pathname);
            const isBillingWithPremium =
              item.label === "Billing" && user?.plan === "premium";
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebarOnMobile}
                className={cn(
                  "cursor-pointer flex items-center gap-3 rounded-xs px-3 py-2 text-[13px] font-medium transition-colors my-1",
                  active
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
                )}
              >
                <item.icon
                  className={cn(
                    "size-4",
                    active ? "text-emerald-400" : "text-zinc-500",
                  )}
                  strokeWidth={1.75}
                />
                <span>{item.label}</span>
                {isBillingWithPremium && (
                  <Crown
                    className="ml-auto size-3.5 text-amber-400"
                    strokeWidth={2}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/[0.06] p-3 gap-1">
        <button
          onClick={() => {
            closeSidebarOnMobile();
            handleLogout();
          }}
          className="flex w-full items-center gap-3 rounded-xs px-3 py-2 text-[13px] font-medium text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
        >
          <LogOut className="size-4 text-zinc-500" strokeWidth={1.75} />
          <span>Log out</span>
        </button>

        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="size-8 rounded-lg">
            <AvatarImage src={user?.avatar_url} alt={user?.username} />
            <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-[11px] font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <p className="truncate text-sm font-medium text-zinc-200">
            {user?.username}
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
