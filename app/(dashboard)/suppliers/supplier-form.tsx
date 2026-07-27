'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { createSupplier, updateSupplier } from './actions'
import { toast } from 'sonner'
import { Supplier } from '@prisma/client'

export function SupplierForm({ supplier }: { supplier?: Supplier }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const isEdit = !!supplier
  
  async function action(formData: FormData) {
    setLoading(true)
    try {
      if (isEdit && supplier) {
        await updateSupplier(supplier.id, formData)
        toast.success('Supplier updated successfully')
      } else {
        await createSupplier(formData)
        toast.success('Supplier added successfully')
      }
      setOpen(false)
    } catch (error) {
      toast.error('Failed to save supplier data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={isEdit ? "outline" : "default"} size={isEdit ? "sm" : "default"} />}>
        {isEdit ? "Edit" : "Add New Supplier"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Supplier Name <span className="text-destructive">*</span></Label>
            <Input id="name" name="name" defaultValue={supplier?.name} required placeholder="PT Furniture Supplier" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" defaultValue={supplier?.phone || ''} placeholder="+62..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={supplier?.address || ''} placeholder="Warehouse address..." />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Supplier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
