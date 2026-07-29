'use client'

import { useState, useTransition } from 'react'
import { InvoiceStatus } from '@prisma/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateInvoiceStatus } from './actions'
import { toast } from 'sonner'

export function StatusUpdater({ id, currentStatus }: { id: string, currentStatus: InvoiceStatus }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<InvoiceStatus>(currentStatus)

  const handleStatusChange = (val: string | null) => {
    if (!val) return
    const newStatus = val as InvoiceStatus
    setStatus(newStatus)
    startTransition(async () => {
      try {
        await updateInvoiceStatus(id, newStatus)
        toast.success('Invoice status updated successfully')
      } catch (error) {
        toast.error('Failed to update status')
        setStatus(currentStatus) // revert on error
      }
    })
  }

  const getStatusColor = (s: InvoiceStatus) => {
    switch (s) {
      case 'DRAFT': return 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
      case 'SENT': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'PARTIAL': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      case 'PAID': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-secondary text-secondary-foreground'
    }
  }

  return (
    <Select value={status} onValueChange={handleStatusChange} disabled={isPending}>
      <SelectTrigger className={`w-[140px] h-8 text-xs font-semibold border-none ${getStatusColor(status)}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(InvoiceStatus).map(s => (
          <SelectItem key={s} value={s} className="text-xs font-medium">
            {s.replace(/_/g, ' ')}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
