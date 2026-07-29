import { getGlobalFabrics } from './fabric-actions'
import { FabricStatusUpdater } from './status-updater'
import { format } from 'date-fns'

export default async function FabricsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams
  const statusFilter = params.status
  const fabrics = await getGlobalFabrics(statusFilter)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-heading">Fabric Management</h1>
          <p className="text-muted-foreground mt-1">Track fabric orders for custom furniture across all projects.</p>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left">
              <tr>
                <th className="font-medium p-4">Images</th>
                <th className="font-medium p-4">Fabric Info</th>
                <th className="font-medium p-4">For Order Item</th>
                <th className="font-medium p-4">Customer & Project</th>
                <th className="font-medium p-4">Supplier</th>
                <th className="font-medium p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fabrics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No fabrics found. Assign fabric inside an Order Detail page.
                  </td>
                </tr>
              ) : (
                fabrics.map((fab: any) => (
                  <tr key={fab.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex gap-2">
                        {fab.fabricPhotoUrl ? (
                          <img src={fab.fabricPhotoUrl} alt="Fabric" className="w-12 h-12 rounded object-cover border" title="Fabric Photo" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground border">No Fab</div>
                        )}
                        {fab.itemImageUrl ? (
                          <img src={fab.itemImageUrl} alt="Item Sketch" className="w-12 h-12 rounded object-cover border" title="Item Sketch" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground border">No Item</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-heading">{fab.brand}</p>
                      <p className="text-muted-foreground">{fab.colorCode}</p>
                      <p className="font-medium mt-1">{Number(fab.metersNeeded)}m <span className="text-muted-foreground font-normal">@ Rp{Number(fab.price).toLocaleString('id-ID')}</span></p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{fab.orderItem.furnitureName}</p>
                      <p className="text-xs text-muted-foreground mt-1">Order: {fab.orderItem.order.orderNumber}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{fab.orderItem.order.customer.name}</p>
                      <p className="text-muted-foreground">{fab.orderItem.order.projectName}</p>
                    </td>
                    <td className="p-4">
                      {fab.supplier ? (
                        <p className="font-medium text-blue-700 dark:text-blue-400">{fab.supplier.name}</p>
                      ) : (
                        <p className="text-muted-foreground italic text-xs">No vendor selected</p>
                      )}
                    </td>
                    <td className="p-4">
                      <FabricStatusUpdater id={fab.id} currentStatus={fab.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
