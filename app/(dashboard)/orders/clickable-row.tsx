'use client'

import { TableRow } from '@/components/ui/table'
import { useRouter } from 'next/navigation'
import React from 'react'

export function ClickableTableRow({ href, children, className, ...props }: { href: string, children: React.ReactNode, className?: string }) {
  const router = useRouter()
  return (
    <TableRow 
      onClick={() => router.push(href)} 
      className={`cursor-pointer hover:bg-muted/50 ${className || ''}`} 
      {...props}
    >
      {children}
    </TableRow>
  )
}
