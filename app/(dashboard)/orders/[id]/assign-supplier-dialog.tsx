'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createSupplierOrder } from '../supplier-actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'

export function AssignSupplierDialog({ 
  orderId, 
  orderItemId, 
  furnitureName, 
  suppliers 
}: { 
  orderId: string, 
  orderItemId: string, 
  furnitureName: string, 
  suppliers: { id: string, name: string }[] 
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formRef.current) return
    
    setLoading(true)
    const formData = new FormData(formRef.current)
    
    try {
      await createSupplierOrder(orderItemId, orderId, formData)
      toast.success('Supplier assigned successfully')
      setOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign supplier')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button size="sm" variant="outline" className="h-8">
          <Plus className="mr-2 h-3 w-3" />
          Assign Supplier
        </Button>
      } />
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Assign Supplier for {furnitureName}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierId">Supplier <span className="text-destructive">*</span></Label>
              <select 
                id="supplierId"
                name="supplierId"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                required
                defaultValue=""
              >
                <option value="" disabled>Select supplier...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierPrice">Supplier Price</Label>
              <Input id="supplierPrice" name="supplierPrice" type="number" min="0" step="0.01" placeholder="0.00" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" name="deadline" type="date" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select 
                id="status"
                name="status"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="WAITING">Waiting</option>
                <option value="ORDERED">Ordered</option>
                <option value="IN_PRODUCTION">In Production</option>
                <option value="READY">Ready</option>
                <option value="SHIPPED">Shipped</option>
                <option value="ARRIVED">Arrived</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <select 
                id="paymentStatus"
                name="paymentStatus"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="UNPAID">Unpaid</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label htmlFor="photoFile">Product Photo (Supabase Storage)</Label>
              <Input id="photoFile" name="photoFile" type="file" accept="image/*" />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" name="notes" placeholder="Optional notes..." />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="mr-2">Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Supplier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
