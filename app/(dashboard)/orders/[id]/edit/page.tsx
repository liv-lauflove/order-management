import { getOrder, getCustomersForDropdown } from '../../actions'
import { OrderForm } from '../../order-form'
import { notFound } from 'next/navigation'

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const [order, customers] = await Promise.all([
    getOrder(id),
    getCustomersForDropdown()
  ])

  if (!order) {
    notFound()
  }

  const safeOrder = JSON.parse(JSON.stringify(order))

  return (
    <div className="w-full h-full">
      <OrderForm initialData={safeOrder} customers={customers} />
    </div>
  )
}
