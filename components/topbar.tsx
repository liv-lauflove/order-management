"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { usePathname } from "next/navigation"

export function Topbar() {
  const pathname = usePathname()
  
  // Simple breadcrumb logic from pathname
  const pathSegments = pathname.split('/').filter(Boolean)
  const currentPage = pathSegments.length > 0 
    ? pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1)
    : "Dashboard"

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card px-6 transition-[width,height] ease-linear">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="text-foreground">{currentPage}</span>
        </div>
      </div>
      
      <div className="ml-auto flex items-center gap-4">
        {/* Placeholder for User Profile / Avatar */}
        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs border border-primary/30">
          U
        </div>
      </div>
    </header>
  )
}
