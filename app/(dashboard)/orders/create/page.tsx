import { getCustomersForDropdown } from '../actions'
import { OrderForm } from '../order-form'

export default async function CreateOrderPage() {
  const customers = await getCustomersForDropdown()

  return (
    <div className="w-full h-full">
      <OrderForm customers={customers} />
    </div>
  )
}
