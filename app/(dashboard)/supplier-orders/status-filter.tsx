'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function GlobalStatusFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStatus = searchParams.get('status') || 'ALL'

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value
    if (status === 'ALL') {
      router.push('/supplier-orders')
    } else {
      router.push(`/supplier-orders?status=${status}`)
    }
  }

  return (
    <select
      className="flex h-9 w-[180px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
      value={currentStatus}
      onChange={handleChange}
    >
      <option value="ALL">All Status</option>
      <option value="WAITING">Waiting</option>
      <option value="ORDERED">Ordered</option>
      <option value="IN_PRODUCTION">In Production</option>
      <option value="READY">Ready</option>
      <option value="SHIPPED">Shipped</option>
      <option value="ARRIVED">Arrived</option>
    </select>
  )
}
