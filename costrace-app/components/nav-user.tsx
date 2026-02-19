"use client"

import { LogOut } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-zinc-900 focus:outline-none">
          <Avatar className="size-7 rounded-md">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-md bg-gradient-to-br from-emerald-400 to-cyan-400 font-mono text-[10px] font-bold text-zinc-950">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate font-mono text-[12px] font-medium text-zinc-300">
              {user.name}
            </p>
            <p className="truncate font-mono text-[10px] text-zinc-600">
              {user.email}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48 border-zinc-800 bg-zinc-950 font-mono"
        side="right"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuItem className="text-red-400 hover:bg-zinc-900 hover:text-red-400 focus:bg-zinc-900 focus:text-red-400">
          <LogOut className="size-3.5" />
          <span className="text-xs">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
