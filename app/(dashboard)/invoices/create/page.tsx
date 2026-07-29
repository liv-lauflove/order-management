import { InvoiceForm } from '../invoice-form'
import { getCustomersForDropdown, getOrdersForDropdown, getNextInvoiceNumber } from '../actions'

export default async function CreateInvoicePage() {
  const [customers, orders, nextInvoiceNo] = await Promise.all([
    getCustomersForDropdown(),
    getOrdersForDropdown(),
    getNextInvoiceNumber()
  ])

  return <InvoiceForm customers={customers} orders={orders} nextInvoiceNo={nextInvoiceNo} />
}
