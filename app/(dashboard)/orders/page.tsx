import { ClickableTableRow } from './clickable-row'
import { getOrders } from './actions'
import { DeleteButton } from './delete-button'
import { StatusFilter } from './status-filter'
import { OrderStatusUpdater } from './status-updater'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle, Edit, Eye } from 'lucide-react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { format } from 'date-fns'

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams
  const statusFilter = params.status
  const orders = await getOrders(statusFilter)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-heading">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage customer orders and projects.</p>
        </div>
        <div className="flex items-center gap-4">
          <StatusFilter />
          <Link href="/orders/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                    No orders found. Click "New Order" to start.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <ClickableTableRow key={order.id} href={`/orders/${order.id}`}>
                    <TableCell className="font-medium text-foreground">{order.orderNumber}</TableCell>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell>{order.projectName}</TableCell>
                    <TableCell>{format(new Date(order.orderDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <OrderStatusUpdater id={order.id} currentStatus={order.status} />
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={order.items.map((i: any) => i.furnitureName).join(', ')}>
                      {order.items.length > 0 ? order.items.map((i: any) => i.furnitureName).join(', ') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/orders/${order.id}/edit`}>
                          <Button variant="outline" size="icon" className="h-8 w-8" title="Edit Order">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteButton id={order.id} />
                      </div>
                    </TableCell>
                  </ClickableTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
