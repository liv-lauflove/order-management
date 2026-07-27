import { getSuppliers } from './actions'
import { SupplierForm } from './supplier-form'
import { DeleteButton } from './delete-button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'

export default async function SuppliersPage() {
  const suppliers = await getSuppliers()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-heading">Suppliers</h1>
          <p className="text-muted-foreground mt-1">Manage your suppliers and vendors.</p>
        </div>
        <SupplierForm />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Supplier Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-32 text-muted-foreground">
                    No suppliers found. Click "Add New Supplier" to start.
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium text-foreground">{supplier.name}</TableCell>
                    <TableCell>{supplier.phone || '-'}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{supplier.address || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <SupplierForm supplier={supplier} />
                        <DeleteButton id={supplier.id} />
                      </div>
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
