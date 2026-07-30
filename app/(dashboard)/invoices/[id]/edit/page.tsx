import { InvoiceForm } from '../../invoice-form'
import { getCustomersForDropdown, getOrdersForDropdown, getNextInvoiceNumber, getInvoice } from '../../actions'
import { notFound } from 'next/navigation'

export default async function EditInvoicePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const [invoice, customers, orders, nextInvoiceNo] = await Promise.all([
    getInvoice(id),
    getCustomersForDropdown(),
    getOrdersForDropdown(),
    getNextInvoiceNumber()
  ])

  if (!invoice) {
    notFound()
  }

  const serializedInvoice = JSON.parse(JSON.stringify(invoice))

  return <InvoiceForm initialData={serializedInvoice} customers={customers} orders={orders} nextInvoiceNo={nextInvoiceNo} />
}
