"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  Bell,
  Key,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Settings,
  Zap,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useUserStore } from "@/stores/user-store"

const topNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Logs", href: "/dashboard/logs", icon: ScrollText },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
]

const bottomNav = [
  { label: "API Keys", href: "/dashboard/api-keys", icon: Key },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

function isActivePath(href: string, pathname: string) {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname.startsWith(href)
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useUserStore()

  const initials = (user?.username ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  function handleLogout() {
    logout()
    router.replace("/")
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader className="px-4 py-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/10">
            <Zap className="size-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            costrace
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 pt-2">
        <nav className="flex flex-col gap-0.5 cursor-pointer">
          {topNav.map((item) => {
            const active = isActivePath(item.href, pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "cursor-pointer flex items-center gap-3 rounded-xs px-3 py-2 text-[13px] font-medium transition-colors my-1",
                  active
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                )}
              >
                <item.icon
                  className={cn(
                    "size-4",
                    active ? "text-emerald-400" : "text-zinc-500"
                  )}
                  strokeWidth={1.75}
                />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="my-3 h-px bg-white/[0.06]" />

        <nav className="flex flex-col gap-0.5">
          {bottomNav.map((item) => {
            const active = isActivePath(item.href, pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "cursor-pointer flex items-center gap-3 rounded-xs px-3 py-2 text-[13px] font-medium transition-colors my-1",
                  active
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                )}
              >
                <item.icon
                  className={cn(
                    "size-4",
                    active ? "text-emerald-400" : "text-zinc-500"
                  )}
                  strokeWidth={1.75}
                />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/[0.06] p-3 gap-1">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
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
  )
}
