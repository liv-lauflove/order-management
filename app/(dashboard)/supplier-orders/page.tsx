import { getGlobalSupplierOrders } from './actions'
import { StatusUpdater } from './status-updater'
import { GlobalStatusFilter } from './status-filter'
import { Image as ImageIcon, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'

export default async function SupplierOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams
  const statusFilter = params.status
  const supplierOrders = await getGlobalSupplierOrders(statusFilter)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-heading">Production Monitor</h1>
          <p className="text-muted-foreground mt-1">Track global supplier progress across all orders.</p>
        </div>
        <GlobalStatusFilter />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Customer / Order</TableHead>
                <TableHead>Furniture Item</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-center">Photo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                    No supplier orders found.
                  </TableCell>
                </TableRow>
              ) : (
                supplierOrders.map((so: any) => (
                  <TableRow key={so.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{so.orderItem.order.customer.name}</div>
                      <Link href={`/orders/${so.orderItem.order.id}`} className="text-xs text-primary hover:underline flex items-center mt-1">
                        {so.orderItem.order.orderNumber}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{so.orderItem.furnitureName}</TableCell>
                    <TableCell>{so.supplier.name}</TableCell>
                    <TableCell>{so.deadline ? format(new Date(so.deadline), 'MMM dd, yyyy') : '-'}</TableCell>
                    <TableCell>
                      <StatusUpdater id={so.id} currentStatus={so.status} />
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${so.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                        {so.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {so.photoUrl ? (
                        <a href={so.photoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-muted hover:bg-muted/80">
                          <ImageIcon className="w-4 h-4 text-primary" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
