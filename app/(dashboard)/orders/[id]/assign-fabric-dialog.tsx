'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Scissors } from 'lucide-react'
import { toast } from 'sonner'
import { createFabric } from '../fabric-actions'

export function AssignFabricDialog({ orderId, orderItemId, furnitureName, suppliers }: { 
  orderId: string, 
  orderItemId: string, 
  furnitureName: string,
  suppliers: {id: string, name: string}[]
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      await createFabric(orderItemId, orderId, formData)
      toast.success('Fabric added successfully')
      setOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to add fabric')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(props: any) => (
        <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 mt-2" {...props}>
          <Scissors className="mr-2 h-3 w-3" />
          Assign Fabric
        </Button>
      )} />
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Fabric for {furnitureName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand / Supplier Name</Label>
              <Input id="brand" name="brand" placeholder="e.g. Ateja" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="colorCode">Color / Code</Label>
              <Input id="colorCode" name="colorCode" placeholder="e.g. Navy Blue #123" required />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="supplierId">Fabric Vendor (Optional)</Label>
              <select 
                id="supplierId" 
                name="supplierId" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">-- Select Vendor --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metersNeeded">Meters Needed</Label>
              <Input id="metersNeeded" name="metersNeeded" type="number" min="0" step="0.1" required placeholder="0.0" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price per meter</Label>
              <Input id="price" name="price" type="number" min="0" step="0.01" placeholder="0.00" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select 
                id="status" 
                name="status" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="NOT_ORDERED">Not Ordered</option>
                <option value="ORDERED">Ordered</option>
                <option value="ARRIVED">Arrived</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fabricPhotoFile">Fabric Photo (JPG, PNG)</Label>
            <Input id="fabricPhotoFile" name="fabricPhotoFile" type="file" accept="image/png, image/jpeg, image/jpg" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemImageFile">Item Sketch/Photo (Optional)</Label>
            <Input id="itemImageFile" name="itemImageFile" type="file" accept="image/png, image/jpeg, image/jpg" />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Fabric'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
