'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PaymentType } from '@prisma/client'
import { createPayment, CreatePaymentInput } from './actions'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

type PaymentFormProps = {
  invoices: any[]
  supplierOrders: any[]
}

export function PaymentForm({ invoices, supplierOrders }: PaymentFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [type, setType] = useState<PaymentType>('CUSTOMER')
  const [invoiceId, setInvoiceId] = useState<string>('')
  const [supplierOrderId, setSupplierOrderId] = useState<string>('')
  const [amount, setAmount] = useState<number | string>('')
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [method, setMethod] = useState('BANK_TRANSFER')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (type === 'CUSTOMER' && !invoiceId) {
      toast.error('Please select an invoice')
      return
    }
    
    if (type === 'SUPPLIER' && !supplierOrderId) {
      toast.error('Please select a supplier order')
      return
    }

    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      setLoading(true)
      toast.loading('Recording payment...', { id: 'payment-form' })
      
      const payload: CreatePaymentInput = {
        type,
        invoiceId: type === 'CUSTOMER' ? invoiceId : undefined,
        supplierOrderId: type === 'SUPPLIER' ? supplierOrderId : undefined,
        amount: Number(amount),
        paymentDate,
        method,
        notes
      }

      await createPayment(payload)
      toast.success('Payment recorded successfully', { id: 'payment-form' })
      setOpen(false)
      
      // Reset form
      setAmount('')
      setNotes('')
      setInvoiceId('')
      setSupplierOrderId('')
      
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to record payment', { id: 'payment-form' })
    } finally {
      setLoading(false)
    }
  }

  const selectedInvoice = invoices.find(i => i.id === invoiceId)
  const selectedSupplierOrder = supplierOrders.find(s => s.id === supplierOrderId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants({ variant: 'default' })}>
        <Plus className="mr-2 h-4 w-4" />
        Record Payment
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record an incoming payment from a customer or an outgoing payment to a supplier.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Payment Type</Label>
            <Select value={type} onValueChange={(v: any) => {
              if (!v) return;
              setType(v)
              setInvoiceId('')
              setSupplierOrderId('')
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">Incoming (Customer)</SelectItem>
                <SelectItem value="SUPPLIER">Outgoing (Supplier)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'CUSTOMER' ? (
            <div className="space-y-2">
              <Label>Select Invoice</Label>
              <Select value={invoiceId} onValueChange={(v) => v && setInvoiceId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an unpaid invoice" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.length === 0 ? (
                    <SelectItem value="none" disabled>No unpaid invoices</SelectItem>
                  ) : (
                    invoices.map(inv => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} • {inv.customer.name} (Rp {Number(inv.remainingBalance).toLocaleString('id-ID')})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Select Supplier Order</Label>
              <Select value={supplierOrderId} onValueChange={(v) => v && setSupplierOrderId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an unpaid supplier order" />
                </SelectTrigger>
                <SelectContent>
                  {supplierOrders.length === 0 ? (
                    <SelectItem value="none" disabled>No unpaid orders</SelectItem>
                  ) : (
                    supplierOrders.map(order => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.supplier.name} • {order.orderItem.furnitureName} (Rp {Number(order.supplierPrice).toLocaleString('id-ID')})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Amount (Rp)</Label>
            <Input 
              type="number" 
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 5000000"
              required
            />
            {type === 'CUSTOMER' && selectedInvoice && (
              <p className="text-xs text-muted-foreground">
                Remaining: Rp {Number(selectedInvoice.remainingBalance).toLocaleString('id-ID')}
              </p>
            )}
            {type === 'SUPPLIER' && selectedSupplierOrder && (
              <p className="text-xs text-muted-foreground">
                Owed: Rp {Number(selectedSupplierOrder.supplierPrice).toLocaleString('id-ID')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Payment Date</Label>
            <Input 
              type="date" 
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Method</Label>
            <Select value={method} onValueChange={(v) => v && setMethod(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                <SelectItem value="CHECK">Check</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Input 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. DP 50%"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Save Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
