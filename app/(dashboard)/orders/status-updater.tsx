'use client'

import { useState } from 'react'
import { updateOrderStatus } from './actions'
import { toast } from 'sonner'
import { OrderStatus } from '@prisma/client'

export function OrderStatusUpdater({ id, currentStatus }: { id: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus
    setStatus(newStatus)
    setLoading(true)
    
    try {
      await updateOrderStatus(id, newStatus)
      toast.success('Order status updated successfully')
    } catch (error) {
      toast.error('Failed to update status')
      setStatus(currentStatus) // revert
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'WAITING_SUPPLIER': return 'bg-yellow-100 text-yellow-800'
      case 'WAITING_FABRIC': return 'bg-orange-100 text-orange-800'
      case 'IN_PRODUCTION': return 'bg-blue-100 text-blue-800'
      case 'READY_TO_SHIP': return 'bg-purple-100 text-purple-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <select
      className={`flex h-8 w-[150px] rounded-full border px-2 py-1 text-xs font-semibold shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 ${loading ? 'opacity-50' : ''} ${getStatusColor(status)}`}
      value={status}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      disabled={loading}
    >
      <option value="WAITING_SUPPLIER">Waiting Supplier</option>
      <option value="WAITING_FABRIC">Waiting Fabric</option>
      <option value="IN_PRODUCTION">In Production</option>
      <option value="READY_TO_SHIP">Ready to Ship</option>
      <option value="DELIVERED">Delivered</option>
      <option value="COMPLETED">Completed</option>
    </select>
  )
}
