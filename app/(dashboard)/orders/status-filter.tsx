'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function StatusFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStatus = searchParams.get('status') || 'ALL'

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value
    if (status === 'ALL') {
      router.push('/orders')
    } else {
      router.push(`/orders?status=${status}`)
    }
  }

  return (
    <select
      className="flex h-9 w-[180px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
      value={currentStatus}
      onChange={handleChange}
    >
      <option value="ALL">All Status</option>
      <option value="WAITING_SUPPLIER">Waiting Supplier</option>
      <option value="WAITING_FABRIC">Waiting Fabric</option>
      <option value="IN_PRODUCTION">In Production</option>
      <option value="READY_TO_SHIP">Ready to Ship</option>
      <option value="DELIVERED">Delivered</option>
      <option value="COMPLETED">Completed</option>
    </select>
  )
}
