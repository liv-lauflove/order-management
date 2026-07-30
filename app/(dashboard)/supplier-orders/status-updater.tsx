'use client'

import { useState } from 'react'
import { updateSupplierOrderStatus } from './actions'
import { toast } from 'sonner'
import { SupplierOrderStatus } from '@prisma/client'

export function StatusUpdater({ id, currentStatus }: { id: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as SupplierOrderStatus
    setStatus(newStatus)
    setLoading(true)
    
    try {
      await updateSupplierOrderStatus(id, newStatus)
      toast.success('Status updated successfully')
    } catch (error) {
      toast.error('Failed to update status')
      setStatus(currentStatus) // revert
    } finally {
      setLoading(false)
    }
  }

  return (
    <select
      className={`flex h-8 w-[140px] rounded-md border px-2 py-1 text-xs font-medium shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 ${loading ? 'opacity-50' : ''}`}
      value={status}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      disabled={loading}
    >
      <option value="WAITING">Waiting</option>
      <option value="ORDERED">Ordered</option>
      <option value="IN_PRODUCTION">In Production</option>
      <option value="READY">Ready</option>
      <option value="SHIPPED">Shipped</option>
      <option value="ARRIVED">Arrived</option>
    </select>
  )
}
