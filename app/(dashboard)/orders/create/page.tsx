import { getCustomersForDropdown, getNextOrderNumber } from '../actions'
import { OrderForm } from '../order-form'

export default async function CreateOrderPage() {
  const [customers, nextOrderNumber] = await Promise.all([
    getCustomersForDropdown(),
    getNextOrderNumber()
  ])

  return (
    <div className="w-full h-full">
      <OrderForm customers={customers} initialData={{ orderNumber: nextOrderNumber }} />
    </div>
  )
}
