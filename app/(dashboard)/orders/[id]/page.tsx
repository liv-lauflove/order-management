import { getOrder } from '../actions'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Edit, Plus } from 'lucide-react'
import { format } from 'date-fns'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-heading">Order Detail</h1>
            <p className="text-muted-foreground mt-1">{order.orderNumber} • {order.projectName}</p>
          </div>
        </div>
        <Link href={`/orders/${order.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Order
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-border rounded-xl p-6 bg-card shadow-sm space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-heading">General Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Order Date</p>
              <p className="font-medium">{format(new Date(order.orderDate), 'dd MMM yyyy')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Deadline</p>
              <p className="font-medium">{order.deadline ? format(new Date(order.deadline), 'dd MMM yyyy') : '-'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 mt-1 text-xs font-semibold bg-secondary text-secondary-foreground">
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <p className="text-muted-foreground">Customer</p>
              <p className="font-medium">{order.customer.name}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Notes</p>
              <p className="font-medium">{order.notes || '-'}</p>
            </div>
          </div>
        </div>
        
        <div className="border border-border rounded-xl p-6 bg-card shadow-sm space-y-4 opacity-50 relative">
          <div className="absolute inset-0 bg-background/50 flex flex-col items-center justify-center z-10 backdrop-blur-[1px] rounded-xl border border-dashed">
            <p className="text-sm font-medium mb-2">Phase 3 & 4 Modules</p>
            <p className="text-xs text-muted-foreground text-center px-6">
              Supplier, Fabric, and Invoice tracking will be added here in the upcoming phases.
            </p>
          </div>
          <h2 className="text-xl font-semibold mb-4 text-heading">Related Data</h2>
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded w-full"></div>
            <div className="h-10 bg-muted rounded w-3/4"></div>
            <div className="h-10 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden mt-2">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-heading">Order Items</h2>
        </div>
        <div className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left">
              <tr>
                <th className="font-medium p-4">Furniture Name</th>
                <th className="font-medium p-4">Qty</th>
                <th className="font-medium p-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {order.items.map((item: any) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="p-4 font-medium">{item.furnitureName}</td>
                  <td className="p-4">{item.qty}</td>
                  <td className="p-4 text-muted-foreground">{item.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
