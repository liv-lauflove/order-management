'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { createOrder, updateOrder, CreateOrderInput } from './actions'
import { Plus, Trash2, ArrowLeft, CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function OrderForm({ 
  initialData, 
  customers 
}: { 
  initialData?: any, 
  customers: { id: string, name: string }[] 
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [orderNumber, setOrderNumber] = useState(initialData?.orderNumber || '')
  const [customerId, setCustomerId] = useState(initialData?.customerId || '')
  const [projectName, setProjectName] = useState(initialData?.projectName || '')
  const [orderDate, setOrderDate] = useState<Date>(initialData?.orderDate ? new Date(initialData.orderDate) : new Date())
  const [deadline, setDeadline] = useState<Date | undefined>(initialData?.deadline ? new Date(initialData.deadline) : undefined)
  const [status, setStatus] = useState<string>(initialData?.status || 'WAITING_SUPPLIER')
  const [notes, setNotes] = useState(initialData?.notes || '')
  
  const [items, setItems] = useState<{furnitureName: string, qty: number, notes: string}[]>(
    initialData?.items?.map((item: any) => ({
      furnitureName: item.furnitureName,
      qty: item.qty,
      notes: item.notes || ''
    })) || [{ furnitureName: '', qty: 1, notes: '' }]
  )

  const handleAddItem = () => {
    setItems([...items, { furnitureName: '', qty: 1, notes: '' }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customerId) {
      toast.error('Please select a customer')
      return
    }
    
    if (items.some(item => !item.furnitureName || item.qty < 1)) {
      toast.error('Please fill all furniture names and valid quantities')
      return
    }

    setLoading(true)
    
    const payload: any = {
      orderNumber,
      customerId,
      projectName,
      orderDate,
      deadline: deadline || null,
      status,
      notes,
      items
    }

    try {
      if (initialData) {
        await updateOrder(initialData.id, payload)
        toast.success('Order updated successfully')
      } else {
        await createOrder(payload)
        toast.success('Order created successfully')
      }
      router.push('/orders')
    } catch (error) {
      toast.error('Failed to save order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/orders">
            <Button variant="outline" size="icon" type="button">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-heading">
            {initialData ? 'Edit Order' : 'New Order'}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Basic information for this order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">Order Number <span className="text-destructive">*</span></Label>
              <Input 
                id="orderNumber" 
                value={orderNumber} 
                readOnly
                className="bg-muted/50 cursor-not-allowed"
                required 
                placeholder="e.g. ORD-0001"
              />
            </div>
            
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="customerId">Customer <span className="text-destructive">*</span></Label>
              <select 
                id="customerId"
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                required
              >
                <option value="" disabled>Select a customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name <span className="text-destructive">*</span></Label>
              <Input 
                id="projectName" 
                value={projectName} 
                onChange={e => setProjectName(e.target.value)} 
                required 
                placeholder="Living Room Set"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Order Status <span className="text-destructive">*</span></Label>
              <select 
                id="status"
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                value={status}
                onChange={e => setStatus(e.target.value)}
                required
              >
                <option value="WAITING_SUPPLIER">Waiting Supplier</option>
                <option value="WAITING_FABRIC">Waiting Fabric</option>
                <option value="IN_PRODUCTION">In Production</option>
                <option value="READY_TO_SHIP">Ready to Ship</option>
                <option value="DELIVERED">Delivered</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input 
                id="notes" 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="Additional instructions..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Dates related to production.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 flex flex-col">
              <Label>Order Date <span className="text-destructive">*</span></Label>
              <Popover>
                <PopoverTrigger render={
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !orderDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {orderDate ? format(orderDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                } />
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={orderDate}
                    onSelect={(date) => date && setOrderDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 flex flex-col">
              <Label>Deadline</Label>
              <Popover>
                <PopoverTrigger render={
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : <span>Pick a deadline</span>}
                  </Button>
                } />
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>Add furniture pieces to this order.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-4 bg-muted/30 p-4 rounded-lg relative border border-border/50">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Furniture Name <span className="text-destructive">*</span></Label>
                    <Input 
                      value={item.furnitureName} 
                      onChange={e => handleItemChange(index, 'furnitureName', e.target.value)} 
                      required 
                      placeholder="e.g. Sofa 3 Seater"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Qty <span className="text-destructive">*</span></Label>
                    <Input 
                      type="number"
                      min={1}
                      value={item.qty} 
                      onChange={e => handleItemChange(index, 'qty', parseInt(e.target.value) || 1)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input 
                      value={item.notes} 
                      onChange={e => handleItemChange(index, 'notes', e.target.value)} 
                      placeholder="Fabric: Velvet..."
                    />
                  </div>
                </div>
              </div>
              <Button 
                type="button" 
                variant="destructive" 
                size="icon"
                disabled={items.length === 1}
                onClick={() => handleRemoveItem(index)}
                className="mt-8 shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={handleAddItem} className="w-full border-dashed mt-2">
            <Plus className="mr-2 h-4 w-4" />
            Add Another Item
          </Button>
        </CardContent>
      </Card>
      
      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? 'Saving...' : 'Save Order'}
        </Button>
      </div>
    </form>
  )
}
