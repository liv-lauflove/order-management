'use client'

import { useState } from 'react'
import { updateFabricStatus } from './fabric-actions'
import { toast } from 'sonner'
import { FabricStatus } from '@prisma/client'

export function FabricStatusUpdater({ id, currentStatus }: { id: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as FabricStatus
    setStatus(newStatus)
    setLoading(true)
    
    try {
      await updateFabricStatus(id, newStatus)
      toast.success('Fabric status updated successfully')
    } catch (error) {
      toast.error('Failed to update status')
      setStatus(currentStatus)
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
      <option value="NOT_ORDERED">Not Ordered</option>
      <option value="ORDERED">Ordered</option>
      <option value="ARRIVED">Arrived</option>
    </select>
  )
}
