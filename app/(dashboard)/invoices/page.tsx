import { getInvoices } from './actions'
import { StatusFilter } from './status-filter'
import { StatusUpdater } from './status-updater'
import { Button } from '@/components/ui/button'
import { Plus, Eye, FileEdit } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function InvoicesPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const invoices = await getInvoices(status)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-heading">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage customer invoices and billing.</p>
        </div>
        <Link href="/invoices/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>

      <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
          <StatusFilter />
          <p className="text-sm text-muted-foreground">
            Showing {invoices.length} invoices
          </p>
        </div>
        
        {invoices.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No invoices found. Try changing the filter or create a new one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-left">
                <tr>
                  <th className="font-medium p-4">Invoice No</th>
                  <th className="font-medium p-4">Date</th>
                  <th className="font-medium p-4">Customer</th>
                  <th className="font-medium p-4">Order Ref</th>
                  <th className="font-medium p-4">Total</th>
                  <th className="font-medium p-4">Status</th>
                  <th className="font-medium p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30">
                    <td className="p-4 font-medium text-heading">
                      <Link href={`/invoices/${inv.id}`} className="hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="p-4">{format(new Date(inv.createdAt), 'dd MMM yyyy')}</td>
                    <td className="p-4 font-medium">{inv.customer.name}</td>
                    <td className="p-4 text-muted-foreground">
                      {inv.order ? (
                        <Link href={`/orders/${inv.order.id}`} className="hover:underline text-blue-600 dark:text-blue-400">
                          {inv.order.orderNumber}
                        </Link>
                      ) : '-'}
                    </td>
                    <td className="p-4 font-semibold text-heading">Rp {Number(inv.total).toLocaleString('id-ID')}</td>
                    <td className="p-4">
                      <StatusUpdater id={inv.id} currentStatus={inv.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/invoices/${inv.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-heading">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {inv.status === 'DRAFT' && (
                          <Link href={`/invoices/${inv.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-heading">
                              <FileEdit className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
