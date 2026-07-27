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
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6 transition-[width,height] ease-linear">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-2 h-9 w-9 text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="h-6 w-[1.5px] bg-border" />
        <div className="flex items-center text-lg font-semibold tracking-tight text-foreground ml-1">
          {currentPage}
        </div>
      </div>

      
    </header>
  )
}
