"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, User, FolderGit2, Sparkles, History, Kanban, Settings } from "lucide-react"
import { useCVStore } from "@/stores/cv-store"
import { useTrackerStore } from "@/stores/tracker-store"

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { cvHistory, loadAllCVs } = useCVStore()
  const { applications, loadApplications } = useTrackerStore()

  useEffect(() => {
    loadAllCVs();
    loadApplications();
  }, [loadAllCVs, loadApplications]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderGit2 },
    { name: 'Generate CV', href: '/dashboard/generate', icon: Sparkles },
    { name: 'History', href: '/dashboard/history', icon: History, count: cvHistory.length },
    { name: 'Job Tracker', href: '/dashboard/tracker', icon: Kanban, count: applications.length },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-lg font-bold tracking-tight">LazyCV</span>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => onNavigate?.()}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary font-semibold" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {item.count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
