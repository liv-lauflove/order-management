import { getInvoice } from '../actions'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit } from 'lucide-react'
import { InvoicePDFViewer } from './pdf-viewer'
import { StatusUpdater } from '../status-updater'

export default async function InvoiceDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const [invoice, settings] = await Promise.all([
    getInvoice(id),
    prisma.settings.findFirst()
  ])

  if (!invoice) {
    notFound()
  }

  const serializedInvoice = JSON.parse(JSON.stringify(invoice))

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-heading">Invoice Preview</h1>
            <p className="text-muted-foreground mt-1">{invoice.invoiceNumber} • {invoice.customer.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            <StatusUpdater id={invoice.id} currentStatus={invoice.status} />
          </div>
          
          {invoice.status === 'DRAFT' && (
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Invoice
              </Button>
            </Link>
          )}
        </div>
      </div>

      <InvoicePDFViewer invoice={serializedInvoice} settings={settings} />
    </div>
  )
}
