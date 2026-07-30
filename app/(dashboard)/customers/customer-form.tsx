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
import { createCustomer, updateCustomer } from './actions'
import { toast } from 'sonner'
import { Customer } from '@prisma/client'

export function CustomerForm({ customer }: { customer?: Customer }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const isEdit = !!customer
  
  async function action(formData: FormData) {
    setLoading(true)
    try {
      if (isEdit && customer) {
        await updateCustomer(customer.id, formData)
        toast.success('Customer updated successfully')
      } else {
        await createCustomer(formData)
        toast.success('Customer added successfully')
      }
      setOpen(false)
    } catch (error) {
      toast.error('Failed to save customer data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={isEdit ? "outline" : "default"} size={isEdit ? "sm" : "default"} />}>
        {isEdit ? "Edit" : "Add New Customer"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
            <Input id="name" name="name" defaultValue={customer?.name} required placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" defaultValue={customer?.phone || ''} placeholder="+62..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={customer?.email || ''} placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={customer?.address || ''} placeholder="123 Street Name..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" defaultValue={customer?.notes || ''} placeholder="Any specific requirements..." />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
