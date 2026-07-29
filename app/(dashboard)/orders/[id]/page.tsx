import { getOrder } from '../actions'
import { getSuppliersForDropdown } from '../supplier-actions'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Edit, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { AssignSupplierDialog } from './assign-supplier-dialog'
import { AssignFabricDialog } from './assign-fabric-dialog'
import { OrderStatusUpdater } from '../status-updater'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [orderRaw, suppliers] = await Promise.all([
    getOrder(id),
    getSuppliersForDropdown()
  ])
  
  const order = orderRaw as any

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
              <div className="mt-1">
                <OrderStatusUpdater id={order.id} currentStatus={order.status} />
              </div>
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
        
        <div className="border border-border rounded-xl p-6 bg-card shadow-sm space-y-4 opacity-50 relative hidden">
          <div className="absolute inset-0 bg-background/50 flex flex-col items-center justify-center z-10 backdrop-blur-[1px] rounded-xl border border-dashed">
            <p className="text-sm font-medium mb-2">Phase 4 Modules</p>
            <p className="text-xs text-muted-foreground text-center px-6">
              Fabric and Invoice tracking will be added here in the upcoming phases.
            </p>
          </div>
          <h2 className="text-xl font-semibold mb-4 text-heading">Related Data</h2>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden mt-2">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-heading">Order Items & Suppliers</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left">
              <tr>
                <th className="font-medium p-4">Furniture Name</th>
                <th className="font-medium p-4">Qty</th>
                <th className="font-medium p-4">Supplier Assignments</th>
                <th className="font-medium p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {order.items.map((item: any) => (
                <tr key={item.id} className="hover:bg-muted/30 align-top">
                  <td className="p-4 font-medium">
                    {item.furnitureName}
                    {item.notes && <p className="text-xs text-muted-foreground font-normal mt-1">{item.notes}</p>}
                  </td>
                  <td className="p-4">{item.qty}</td>
                  <td className="p-4">
                    {item.supplierOrders && item.supplierOrders.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {item.supplierOrders.map((so: any) => (
                          <div key={so.id} className="bg-muted/30 border border-border rounded-md p-2 text-xs flex justify-between items-center">
                            <div>
                              <span className="font-medium text-blue-700 dark:text-blue-400">Supplier: {so.supplier.name}</span>
                              <span className="mx-2 text-muted-foreground">•</span>
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-semibold bg-secondary text-secondary-foreground`}>
                                {so.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <span className="text-muted-foreground">Rp {Number(so.supplierPrice).toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs italic block mb-2">No supplier assigned yet.</span>
                    )}

                    {item.fabrics && item.fabrics.length > 0 && (
                      <div className="flex flex-col gap-2 mt-2">
                        {item.fabrics.map((fab: any) => (
                          <div key={fab.id} className="bg-muted/30 border border-border rounded-md p-2 text-xs flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {fab.fabricPhotoUrl && (
                                <img src={fab.fabricPhotoUrl} alt="Fabric" className="w-8 h-8 object-cover rounded-sm border" />
                              )}
                              <div>
                                <span className="font-medium text-pink-700 dark:text-pink-400">Fabric: {fab.brand}</span>
                                <p className="text-muted-foreground mt-0.5">{fab.colorCode} • {Number(fab.metersNeeded)}m</p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-semibold bg-secondary text-secondary-foreground`}>
                              {fab.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right flex flex-col gap-2 items-end">
                    <AssignSupplierDialog orderId={order.id} orderItemId={item.id} furnitureName={item.furnitureName} suppliers={suppliers} />
                    <AssignFabricDialog orderId={order.id} orderItemId={item.id} furnitureName={item.furnitureName} suppliers={suppliers} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
