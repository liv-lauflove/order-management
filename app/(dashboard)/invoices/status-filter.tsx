'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InvoiceStatus } from '@prisma/client'

export function StatusFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStatus = searchParams.get('status') || 'ALL'

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground font-medium">Filter:</span>
      <Select 
        value={currentStatus} 
        onValueChange={(val) => {
          if (val === 'ALL') {
            router.push('/invoices')
          } else {
            router.push(`/invoices?status=${val}`)
          }
        }}
      >
        <SelectTrigger className="w-[160px] bg-white dark:bg-zinc-950">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          {Object.values(InvoiceStatus).map(status => (
            <SelectItem key={status} value={status}>
              {status.replace(/_/g, ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
